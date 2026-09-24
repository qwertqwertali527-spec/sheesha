import { NextRequest, NextResponse } from 'next/server';
import { adminCookieOptions, ADMIN_COOKIE, createSession, verifyCredentials } from '@/lib/auth';
import { allowedRequest, isSameOrigin, requestIP } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const ip = requestIP(request);
  if (!allowedRequest(`login:${ip}`, 8, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }
  try {
    const body = await request.json() as { username?: unknown; password?: unknown };
    if (typeof body.username !== 'string' || typeof body.password !== 'string' ||
        body.username.length > 80 || body.password.length > 256 ||
        !verifyCredentials(body.username, body.password)) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createSession(), adminCookieOptions);
    return response;
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Login is not configured.' }, { status: 503 });
  }
}
