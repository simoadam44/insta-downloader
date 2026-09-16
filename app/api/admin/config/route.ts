import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ADMIN_COOKIE } from '@/lib/site';
import { getRuntimeConfig, setRuntimeConfig } from '@/lib/runtime-config';

export const runtime = 'nodejs';

async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'dev-secret-change-me-please-32chars'));
    return true;
  } catch {
    return false;
  }
}

// In-memory store (replace with Vercel KV/DB in prod). Survives per-instance.
const store: {
  stats: { requests: number; success: number; fail: number; bytes: number };
  seo: Record<string, { title: string; description: string; faqs: string }>;
  ads: Record<string, { enabled: boolean; code: string }>;
  api: { endpoint: string; apiKey: string; proxies: string; rateLimit: string };
} = {
  stats: { requests: 12840, success: 12190, fail: 650, bytes: 482 * 1024 ** 3 },
  seo: {},
  ads: {
    header: { enabled: false, code: '' },
    'below-input': { enabled: false, code: '' },
    'above-result': { enabled: false, code: '' },
    footer: { enabled: false, code: '' }
  },
  api: { endpoint: '', apiKey: '', proxies: '', rateLimit: '30' }};

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(store);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.seo) store.seo = { ...store.seo, ...body.seo };
  if (body.ads) store.ads = { ...store.ads, ...body.ads };
  if (body.api) {
    store.api = { ...store.api, ...body.api };
    // Make the extractor effective immediately on this instance.
    setRuntimeConfig({
      endpoint: store.api.endpoint || '',
      apiKey: store.api.apiKey || '',
      rateLimit: store.api.rateLimit || '30'
    });
  }
  if (body.stats) store.stats = { ...store.stats, ...body.stats };
  return NextResponse.json({ ok: true, store, runtime: getRuntimeConfig() });
}
