import { NextRequest, NextResponse } from 'next/server';
import { extractAuthor } from '@/lib/instagram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Real extraction pipeline (no fake/mock media — ever).
 *
 * Cascade:
 *  1. EXTRACTOR_API_URL — your own extractor backend.
 *     Accepts EITHER the legacy `{ items: [...] }` shape OR the Cobalt API
 *     schema (`{ status: 'redirect'|'tunnel'|'picker', url, picker, ... }`).
 *  2. COBALT_API_URL — your own self-hosted Cobalt API instance
 *     (public api.cobalt.tools requires keys/permission — self-host:
 *      `docker run -d --name cobalt -p 9000:9000 --restart unless-stopped
 *        ghcr.io/imputnet/cobalt:latest`
 *      then set COBALT_API_URL=https://your-instance/api/json).
 *  3. Instagram oEmbed (best-effort metadata only, no direct file).
 *  4. Honest 502 error — the UI shows what to do next.
 */

const WINDOW_MS = 60_000;
const MAX = 30;
const hits = new Map<string, { n: number; t: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > WINDOW_MS) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > MAX;
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

async function postJson(endpoint: string, payload: unknown, apiKey?: string, ms = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        ...(apiKey ? { Authorization: `Api-Key ${apiKey}` } : {})
      },
      body: JSON.stringify(payload)
    });
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

  // 1 + 2. Custom backend / self-hosted Cobalt instance.
  const candidates: { endpoint: string; key?: string }[] = [];
  if (process.env.EXTRACTOR_API_URL) {
    candidates.push({ endpoint: process.env.EXTRACTOR_API_URL, key: process.env.EXTRACTOR_API_KEY });
  }
  if (process.env.COBALT_API_URL) {
    candidates.push({ endpoint: process.env.COBALT_API_URL, key: process.env.COBALT_API_KEY });
  }

  for (const c of candidates) {
    try {
      // Cobalt schema request; legacy backends can ignore unknown fields.
      const r = await postJson(c.endpoint, { url, videoQuality: '1080', filenameStyle: 'basic' }, c.key);
      if (!r.ok || !r.json) {
        errors.push(`${c.endpoint} → HTTP ${r.status} ${r.text}`);
        continue;
      }
      const legacy = mapLegacy(r.json);
      if (legacy) {
        return NextResponse.json({
          author: legacy.author || extractAuthor(url) || 'instagram',
          caption: legacy.caption || url,
          thumbnail: legacy.items[0]?.thumbnail || '',
          detectedType: legacy.items[0]?.type === 'video' ? 'video' : 'photo',
          items: legacy.items
        });
      }
      const meta = await tryOEmbed(url);
      const items = mapCobalt(r.json, url, meta.thumb);
      if (items && items.length > 0) {
        return NextResponse.json({
          author: meta.author || 'instagram',
          caption: meta.title || url,
          thumbnail: items[0].thumbnail,
          detectedType: items[0].type === 'video' ? 'video' : 'photo',
          items
        });
      }
      errors.push(`${c.endpoint} → unrecognized response shape`);
    } catch (e: any) {
      errors.push(`${c.endpoint} → ${e.message || 'fetch failed'}`);
    }
  }

  // 3. oEmbed alone gives metadata but no downloadable file — not enough for a result.
  // 4. Honest failure: never return placeholder media as if it were real.
  return NextResponse.json(
    {
      error:
        'Could not fetch this post. Instagram blocks direct server-side fetching, and no extractor backend is configured. ' +
        'Fix: deploy your own free Cobalt instance and set COBALT_API_URL (see Admin → API Config), or set EXTRACTOR_API_URL to your backend.',
      details: errors.length > 0 ? errors : undefined
    },
    { status: 502 }
  );
}
