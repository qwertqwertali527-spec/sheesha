import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/auth';
import { isSameOrigin } from '@/lib/security';

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
