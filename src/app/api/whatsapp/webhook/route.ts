import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isWhatsAppEnabled } from '@/lib/config';
import { processIncoming } from '@/lib/engine';
import { notifyStaff } from '@/lib/notify';
import { getStore } from '@/lib/store';
import { sendWhatsAppText, verifyWhatsAppSignature } from '@/lib/whatsapp';

export const runtime = 'nodejs';

type WebhookMessage = { id?: string; from?: string; type?: string; text?: { body?: string } };
type WebhookPayload = {
  object?: string;
  entry?: Array<{ changes?: Array<{ value?: {
    metadata?: { phone_number_id?: string }; messages?: WebhookMessage[];
  } }> }>;
};

export async function GET(request: NextRequest) {
  if (!isWhatsAppEnabled()) return new NextResponse('Not available', { status: 404 });
  const params = request.nextUrl.searchParams;
  if (params.get('hub.mode') !== 'subscribe' ||
      params.get('hub.verify_token') !== process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse('Verification failed', { status: 403 });
  }
  return new NextResponse(params.get('hub.challenge') ?? '', { headers: { 'Content-Type': 'text/plain' } });
}

export async function POST(request: NextRequest) {
  if (!isWhatsAppEnabled()) return new NextResponse('Not available', { status: 404 });
  const raw = await request.text();
  if (!verifyWhatsAppSignature(raw, request.headers.get('x-hub-signature-256'), process.env.WHATSAPP_APP_SECRET ?? '')) {
    return new NextResponse('Invalid signature', { status: 403 });
  }
  try {
    const payload = JSON.parse(raw) as WebhookPayload;
    if (payload.object !== 'whatsapp_business_account') return NextResponse.json({ ok: true });
    const store = getStore();
    const settings = await store.getSettings();
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.value?.metadata?.phone_number_id !== process.env.WHATSAPP_PHONE_NUMBER_ID) continue;
        for (const incoming of change.value?.messages ?? []) {
          if (!incoming.id || !incoming.from || !/^\d{8,15}$/.test(incoming.from)) continue;
          if (!await store.markEvent(incoming.id)) continue; // Meta may retry a webhook.
          if (incoming.type !== 'text' || !incoming.text?.body || incoming.text.body.length > 900) {
            let inquiry = await store.findInquiry('whatsapp', incoming.from);
            if (!inquiry) inquiry = await store.createInquiry('whatsapp', incoming.from, false, false);
            await store.addMessage({
              id: randomUUID(), inquiryId: inquiry.id, role: 'customer',
              text: '[Unsupported media or long message — staff review required]',
              createdAt: new Date().toISOString(), providerMessageId: incoming.id,
            });
            inquiry = await store.updateInquiry(inquiry.id, { status: 'needs_human', handoffReason: 'Unsupported message type' });
            await notifyStaff(inquiry);
            await sendWhatsAppText(incoming.from, 'A person will review your message. No booking has been confirmed.');
            continue;
          }
          const result = await processIncoming(store, 'whatsapp', incoming.from, incoming.text.body, settings, {
            providerMessageId: incoming.id,
          });
          for (const reply of result.replies) await sendWhatsAppText(incoming.from, reply.text);
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    // An event may already be recorded before a downstream failure. Review the
    // staff inbox; production scale requires a durable retry queue.
    console.error('Approved WhatsApp webhook failed:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
