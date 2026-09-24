import { NextRequest, NextResponse } from 'next/server';
import { isSameOrigin } from '@/lib/security';

/** Starts a new browser conversation without deleting the staff's prior inquiry. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set('layali_visitor', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
