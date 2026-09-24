import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'layali_admin';
const SESSION_SECONDS = 8 * 60 * 60;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters');
  return value;
}

export function verifyCredentials(username: string, password: string): boolean {
  if (!username || username !== (process.env.ADMIN_USERNAME || 'owner') || !password) return false;
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (stored) {
    const [salt, expectedHex] = stored.split(':');
    if (!salt || !expectedHex || !/^[a-f\d]{128}$/i.test(expectedHex)) return false;
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    return timingSafeEqual(actual, expected);
  }
  // A plaintext password is permitted for the local demo ONLY.
  if (process.env.NODE_ENV !== 'development' || !process.env.ADMIN_PASSWORD) return false;
  const actual = Buffer.from(password);
  const expected = Buffer.from(process.env.ADMIN_PASSWORD);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSession(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_SECONDS * 1000, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySession(token: string | undefined): boolean {
  if (!token || token.length > 400) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  try {
    const expected = createHmac('sha256', secret()).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp?: number };
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch { return false; }
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(ADMIN_COOKIE)?.value);
}

export const adminCookieOptions = {
  httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production',
  path: '/', maxAge: SESSION_SECONDS,
};
