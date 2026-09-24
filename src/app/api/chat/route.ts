import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { assistantMode } from '@/lib/config';
import { processIncoming } from '@/lib/engine';
import { allowedRequest, isSameOrigin, requestIP } from '@/lib/security';
import { getStore } from '@/lib/store';
import { chatInputSchema } from '@/lib/validation';

export const runtime = 'nodejs';
const COOKIE = 'layali_visitor';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const id = request.cookies.get(COOKIE)?.value;
    if (!id || !uuidPattern.test(id)) return NextResponse.json({ inquiry: null, messages: [], mode: assistantMode() });
    const store = getStore();
    const inquiry = await store.findInquiry('web', id);
    if (!inquiry) return NextResponse.json({ inquiry: null, messages: [], mode: assistantMode() });
    const messages = await store.listMessages(inquiry.id);
    return NextResponse.json({ inquiry, messages, mode: assistantMode() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Chat read failed:', error);
    return NextResponse.json({ error: 'Chat is temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!allowedRequest(`chat:${requestIP(request)}`, 35, 60_000)) {
    return NextResponse.json({ error: 'Please wait a moment before sending another message.' }, { status: 429 });
  }
  try {
    const body = chatInputSchema.safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error: 'Please enter a message (up to 900 characters).' }, { status: 400 });
    const store = getStore();
    const oldId = request.cookies.get(COOKIE)?.value;
    const id = oldId && uuidPattern.test(oldId) ? oldId : randomUUID();
    const existing = await store.findInquiry('web', id);
    if (!existing && (!body.data.consent || !body.data.ageConfirmed)) {
      return NextResponse.json({ error: 'Please confirm you are 18+ and accept the privacy notice before starting.' }, { status: 400 });
    }
    const result = await processIncoming(store, 'web', id, body.data.message, await store.getSettings(), {
      ageConfirmed: body.data.ageConfirmed, consent: body.data.consent,
    });
    const messages = await store.listMessages(result.inquiry.id);
    const response = NextResponse.json({ inquiry: result.inquiry, messages, mode: assistantMode() });
    response.cookies.set(COOKIE, id, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: 60 * 60 * 24 * 7,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Chat write failed:', error);
    return NextResponse.json({ error: 'We could not save your message. Please try again.' }, { status: 503 });
  }
}
