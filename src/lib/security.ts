import type { NextRequest } from 'next/server';

/** Browser POST requests must originate from this host. Do not use permissive CORS. */
export function isSameOrigin(request: NextRequest): boolean {
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true; // CLI/webhooks use separate authentication.
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
    return new URL(origin).host === host;
  } catch { return false; }
}

const attempts = new Map<string, { count: number; until: number }>();
/** Preview-level abuse control; deploy a shared WAF/rate limit for a scaled production app. */
export function allowedRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.until < now) {
    attempts.set(key, { count: 1, until: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

export function requestIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
