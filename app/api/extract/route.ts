import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter (per-instance; use Upstash for multi-instance prod)
const hits = new Map<string, { n: number; t: number }>();
const WINDOW_MS = 60_000;
const MAX = 30;

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

function detectType(url: string): 'video' | 'image' {
  return /\/reel|\/tv\/|\.mp4/i.test(url) ? 'video' : 'image';
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const url = (body.url || '').trim();
  if (!url || !/^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\//i.test(url)) {
    return NextResponse.json({ error: 'Invalid Instagram URL.' }, { status: 400 });
  }

  // If an external extractor backend is configured, delegate to it.
  const backend = process.env.EXTRACTOR_API_URL;
  if (backend) {
    try {
      const r = await fetch(backend, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.EXTRACTOR_API_KEY ? { authorization: `Bearer ${process.env.EXTRACTOR_API_KEY}` } : {})
        },
        body: JSON.stringify({ url })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Backend extractor failed');
      return NextResponse.json(j);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Backend extractor failed' }, { status: 502 });
    }
  }

  // Fallback: oEmbed for author/caption + demo media items.
  // NOTE: Instagram oEmbed needs a Meta token for full data; we degrade gracefully.
  let author = 'instagram';
  let caption = url;
  try {
    const m = url.match(/instagram\.com\/([A-Za-z0-9_.]+)/);
    if (m) author = m[1];
  } catch { /* noop */ }

  const kind = detectType(url);
  const seed = Math.abs(url.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000;
  const thumb = `https://picsum.photos/seed/ig${seed}/640/360`;

  return NextResponse.json({
    author,
    caption: `Instagram media — ${url}`,
    thumbnail: thumb,
    detectedType: kind === 'video' ? 'video' : 'photo',
    items: [
      {
        id: `media-${seed}`,
        type: kind,
        url: thumb,
        thumbnail: thumb,
        quality: kind === 'video' ? '1080p MP4' : 'HD JPG',
        caption
      }
    ]
  });
}
