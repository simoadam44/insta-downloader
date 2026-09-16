import { NextRequest, NextResponse } from 'next/server';
import { extractAuthor } from '@/lib/instagram';
import { effectiveExtractor, effectiveRateLimit } from '@/lib/runtime-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Real extraction pipeline (no fake/mock media — ever).
 *
 * Candidate backends (env vars win; Admin → API Config in-memory fallback):
 *  - EXTRACTOR_API_URL (+ EXTRACTOR_API_KEY): your own backend. Accepts the
 *    legacy `{ items: [...] }` shape, the Cobalt schema, or common
 *    downloader-API shapes (`links[]`, `data.links[]`, `medias[]`, `videoUrl`,
 *    ...). Works with RapidAPI hosts too: paste the full endpoint URL and put
 *    your RapidAPI key in EXTRACTOR_API_KEY (sent as `x-rapidapi-key` +
 *    `x-rapidapi-host` as well as `Authorization: Bearer`).
 *  - COBALT_API_URL (+ COBALT_API_KEY): your own self-hosted Cobalt API
 *    instance (`.../api/json`). Public api.cobalt.tools needs keys/permission.
 *
 *  POST is tried first (Cobalt/legacy style); if the response isn't
 *  recognized, a GET `?url=` fallback is tried (RapidAPI style).
 */

const WINDOW_MS = 60_000;
const hits = new Map<string, { n: number; t: number }>();

function rateLimited(ip: string): boolean {
  const max = effectiveRateLimit();
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > WINDOW_MS) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > max;
}

type MediaItem = {
  id: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  quality: string;
  caption?: string;
};

function extOf(u: string): string {
  const m = u.split('?')[0].match(/\.([a-z0-9]{2,4})$/i);
  return (m?.[1] || '').toLowerCase();
}

function typeFromUrl(u: string): 'video' | 'image' {
  const e = extOf(u);
  if (['mp4', 'mov', 'm3u8', 'webm'].includes(e)) return 'video';
  return 'image';
}

function qualityFromUrl(u: string): string {
  return typeFromUrl(u) === 'video' ? 'MP4 video' : 'HD image';
}

function rapidHeaders(endpoint: string, apiKey?: string): Record<string, string> {
  let host = '';
  try {
    host = new URL(endpoint).hostname;
  } catch {
    /* ignore */
  }
  return {
    accept: 'application/json',
    ...(apiKey
      ? {
          Authorization: `Bearer ${apiKey}`,
          'x-rapidapi-key': apiKey,
          ...(host ? { 'x-rapidapi-host': host } : {})
        }
      : {})
  };
}

async function fetchJson(
  url: string,
  init: RequestInit,
  ms = 20000
): Promise<{ ok: boolean; status: number; json: any; text: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await r.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* non-JSON upstream */
    }
    return { ok: r.ok, status: r.status, json, text: text.slice(0, 300) };
  } finally {
    clearTimeout(t);
  }
}

/** Map a Cobalt-API-schema response to MediaItems. Returns null if not Cobalt-shaped. */
function mapCobalt(j: any, igUrl: string, thumb: string): MediaItem[] | null {
  if (!j || typeof j !== 'object' || typeof j.status !== 'string') return null;
  if (j.status === 'redirect' || j.status === 'tunnel') {
    if (typeof j.url !== 'string') return null;
    const type = typeFromUrl(j.url);
    return [
      {
        id: 'cobalt-0',
        type,
        url: j.url,
        thumbnail: thumb || j.url,
        quality: j.filename?.includes('1080') ? '1080p MP4' : qualityFromUrl(j.url),
        caption: igUrl
      }
    ];
  }
  if (j.status === 'picker' && Array.isArray(j.picker)) {
    return j.picker
      .filter((p: any) => typeof p?.url === 'string')
      .map((p: any, i: number) => {
        const type: 'video' | 'image' =
          p.type === 'video' || p.type === 'gif' ? 'video' : typeFromUrl(p.url);
        return {
          id: `cobalt-${i}`,
          type,
          url: p.url,
          thumbnail: p.thumb || thumb || p.url,
          quality: qualityFromUrl(p.url),
          caption: igUrl
        } as MediaItem;
      });
  }
  if (j.status === 'error') {
    throw new Error(
      typeof j.error === 'string' ? `Extractor: ${j.error}` : 'Extractor reported an error.'
    );
  }
  return null;
}

/** Legacy shape: upstream already returns { items, author?, caption?, ... }. */
function mapLegacy(j: any): { items: MediaItem[]; author?: string; caption?: string } | null {
  if (j && Array.isArray(j.items) && j.items.length > 0) {
    return {
      items: j.items,
      author: typeof j.author === 'string' ? j.author : undefined,
      caption: typeof j.caption === 'string' ? j.caption : undefined
    };
  }
  return null;
}

function pickUrl(o: any): string | null {
  if (!o || typeof o !== 'object') return null;
  for (const k of ['link', 'url', 'download_url', 'downloadUrl', 'src', 'file']) {
    if (typeof o[k] === 'string' && /^https?:\/\//i.test(o[k])) return o[k];
  }
  return null;
}

function pickThumb(o: any): string {
  if (!o || typeof o !== 'object') return '';
  for (const k of ['thumb', 'thumbnail', 'thumbnail_url', 'thumbnailUrl', 'poster', 'cover']) {
    if (typeof o[k] === 'string' && /^https?:\/\//i.test(o[k])) return o[k];
  }
  return '';
}

/**
 * Generic downloader-API shapes (incl. RapidAPI-style):
 * { links: [{link|url, quality}] }, { data: { links|medias|videoUrl } },
 * { medias: [...] }, { result: [...] }, { videoUrl|video_url|download_url },
 * { data: "https://..." }, "https://..."
 */
function mapGeneric(j: any, igUrl: string, thumb: string): MediaItem[] | null {
  if (!j) return null;
  if (typeof j === 'string' && /^https?:\/\//i.test(j)) {
    return [
      { id: 'api-0', type: typeFromUrl(j), url: j, thumbnail: thumb || j, quality: qualityFromUrl(j), caption: igUrl }
    ];
  }
  if (typeof j !== 'object') return null;
  const pools: any[][] = [];
  for (const path of ['links', 'medias', 'media', 'result', 'results', 'data.links', 'data.medias', 'data.result', 'data.results']) {
    const parts = path.split('.');
    let cur: any = j;
    for (const p of parts) cur = cur?.[p];
    if (Array.isArray(cur) && cur.length > 0) pools.push(cur);
  }
  for (const key of ['videoUrl', 'video_url', 'download_url', 'downloadUrl', 'url', 'data']) {
    const v = key === 'data' ? j.data : j[key];
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) {
      return [
        { id: 'api-0', type: typeFromUrl(v), url: v, thumbnail: thumb || v, quality: qualityFromUrl(v), caption: igUrl }
      ];
    }
  }
  if (pools.length === 0) return null;
  const items: MediaItem[] = [];
  pools[0].slice(0, 10).forEach((o: any, i: number) => {
    const u = typeof o === 'string' ? o : pickUrl(o);
    if (!u) return;
    items.push({
      id: `api-${i}`,
      type: typeof o?.type === 'string' && /video/i.test(o.type) ? 'video' : typeFromUrl(u),
      url: u,
      thumbnail: (typeof o === 'object' && pickThumb(o)) || thumb || u,
      quality:
        (typeof o?.quality === 'string' && o.quality) ||
        (typeof o?.label === 'string' && o.label) ||
        qualityFromUrl(u),
      caption: igUrl
    });
  });
  return items.length > 0 ? items : null;
}

async function tryOEmbed(igUrl: string): Promise<{ author: string | null; thumb: string; title: string | null }> {
  const out = { author: extractAuthor(igUrl), thumb: '', title: null as string | null };
  // Official oEmbed needs a Meta token; try the no-auth legacy endpoint best-effort.
  const endpoints = [
    `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(igUrl)}`,
    `https://publish.twitter.com/oembed?url=${encodeURIComponent(igUrl)}`
  ];
  for (const ep of endpoints) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(ep, { signal: ctrl.signal, headers: { accept: 'application/json' } });
      clearTimeout(t);
      if (!r.ok) continue;
      const j = await r.json().catch(() => null);
      if (j && typeof j === 'object') {
        if (typeof j.author_name === 'string') out.author = j.author_name;
        if (typeof j.thumbnail_url === 'string') out.thumb = j.thumbnail_url;
        if (typeof j.title === 'string') out.title = j.title;
        break;
      }
    } catch {
      /* try next */
    }
  }
  return out;
}

function respond(j: any, url: string, meta: { author: string | null; thumb: string; title: string | null }) {
  const legacy = mapLegacy(j);
  if (legacy) {
    return NextResponse.json({
      author: legacy.author || extractAuthor(url) || 'instagram',
      caption: legacy.caption || url,
      thumbnail: legacy.items[0]?.thumbnail || '',
      detectedType: legacy.items[0]?.type === 'video' ? 'video' : 'photo',
      items: legacy.items
    });
  }
  const items = mapCobalt(j, url, meta.thumb) || mapGeneric(j, url, meta.thumb);
  if (items && items.length > 0) {
    return NextResponse.json({
      author: meta.author || 'instagram',
      caption: meta.title || url,
      thumbnail: items[0].thumbnail,
      detectedType: items[0].type === 'video' ? 'video' : 'photo',
      items
    });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const url = (body.url || '').trim();
  if (!url || !/^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\//i.test(url)) {
    return NextResponse.json({ error: 'Invalid Instagram URL.' }, { status: 400 });
  }

  const errors: string[] = [];
  const meta = await tryOEmbed(url);

  // Custom backend / self-hosted Cobalt / RapidAPI-compatible endpoint.
  const candidates: { endpoint: string; key?: string; cobalt: boolean }[] = [];
  const custom = effectiveExtractor();
  if (custom.endpoint) {
    candidates.push({ endpoint: custom.endpoint, key: custom.key || undefined, cobalt: false });
  }
  if (process.env.COBALT_API_URL) {
    candidates.push({
      endpoint: process.env.COBALT_API_URL,
      key: process.env.COBALT_API_KEY || undefined,
      cobalt: true
    });
  }

  for (const c of candidates) {
    try {
      // Attempt 1: POST (Cobalt / legacy style).
      const headers: Record<string, string> = c.cobalt
        ? {
            'content-type': 'application/json',
            accept: 'application/json',
            ...(c.key ? { Authorization: `Api-Key ${c.key}` } : {})
          }
        : {
            'content-type': 'application/json',
            ...rapidHeaders(c.endpoint, c.key)
          };
      const r = await fetchJson(
        c.endpoint,
        { method: 'POST', headers, body: JSON.stringify({ url, videoQuality: '1080', filenameStyle: 'basic' }) }
      );
      if (r.ok && r.json) {
        const hit = respond(r.json, url, meta);
        if (hit) return hit;
      }
      // Attempt 2: GET ?url= (RapidAPI style).
      const sep = c.endpoint.includes('?') ? '&' : '?';
      const g = await fetchJson(`${c.endpoint}${sep}url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: rapidHeaders(c.endpoint, c.key)
      });
      if (g.ok && g.json) {
        const hit = respond(g.json, url, meta);
        if (hit) return hit;
        errors.push(`${c.endpoint} → unrecognized response shape`);
      } else {
        errors.push(`${c.endpoint} → HTTP ${r.status} ${r.text} / GET ${g.status}`);
      }
    } catch (e: any) {
      errors.push(`${c.endpoint} → ${e.message || 'fetch failed'}`);
    }
  }

  // oEmbed alone gives metadata but no downloadable file — not enough for a result.
  // Honest failure: never return placeholder media as if it were real.
  return NextResponse.json(
    {
      error:
        'Could not fetch this post. Connect an extractor backend (one-time, ~2 min): open Admin → API Config, ' +
        'paste an extractor endpoint + key (e.g. a free RapidAPI Instagram-downloader key, or your own Cobalt instance), ' +
        'press Save, then retry. For production, set EXTRACTOR_API_URL / EXTRACTOR_API_KEY as Vercel env vars.',
      details: errors.length > 0 ? errors : undefined
    },
    { status: 502 }
  );
}
