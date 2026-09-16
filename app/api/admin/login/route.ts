import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { ADMIN_COOKIE } from '@/lib/site';

export const runtime = 'nodejs';

function secret(): Uint8Array {
  const s = process.env.ADMIN_JWT_SECRET || 'dev-secret-change-me-please-32chars';
  return new TextEncoder().encode(s);
}

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  if (!password || password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(secret());
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
