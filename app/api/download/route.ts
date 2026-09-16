import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Proxies a remote file so the browser download isn't blocked by CORS/hotlinking.
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('url');
  const filename = req.nextUrl.searchParams.get('filename') || 'instagram-media';
  if (!file || !/^https?:\/\//i.test(file)) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  try {
    const upstream = await fetch(file, { redirect: 'follow' });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
    }
    const ct = upstream.headers.get('content-type') || 'application/octet-stream';
    const ext = ct.includes('mp4') ? 'mp4' : ct.includes('png') ? 'png' : ct.includes('jpeg') || ct.includes('jpg') ? 'jpg' : 'bin';
    return new NextResponse(upstream.body, {
      headers: {
        'content-type': ct,
        'content-disposition': `attachment; filename="${filename}.${ext}"`,
        'cache-control': 'private, max-age=60'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Download failed' }, { status: 500 });
  }
}
