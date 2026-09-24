import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { isWhatsAppEnabled } from '@/lib/config';
import { isSameOrigin } from '@/lib/security';
import { getStore } from '@/lib/store';
import { adminReplySchema } from '@/lib/validation';
import { sendWhatsAppText } from '@/lib/whatsapp';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const { id } = await context.params;
  try {
    const parsed = adminReplySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Enter a reply under 1200 characters.' }, { status: 400 });
    const store = getStore();
    const inquiry = await store.getInquiry(id);
    if (!inquiry) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    if (inquiry.channel === 'whatsapp') {
      if (!isWhatsAppEnabled()) return NextResponse.json({ error: 'WhatsApp is disabled pending approval.' }, { status: 403 });
      if (!inquiry.consentAt && inquiry.handoffReason !== 'Customer requested a person') {
        return NextResponse.json({ error: 'The customer has not accepted the messaging/privacy notice.' }, { status: 403 });
      }
      const lastInbound = (await store.listMessages(id)).filter((item) => item.role === 'customer').at(-1);
      if (!lastInbound || Date.now() - new Date(lastInbound.createdAt).getTime() >= 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: 'The 24-hour reply window has closed. No outbound template flow is configured.' }, { status: 403 });
      }
      await sendWhatsAppText(inquiry.channelId, parsed.data.text);
    }
    await store.addMessage({
      id: randomUUID(), inquiryId: id, role: 'human', text: parsed.data.text,
      createdAt: new Date().toISOString(), providerMessageId: null,
    });
    await store.updateInquiry(id, { status: 'in_progress' });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Human reply failed:', error);
    return NextResponse.json({ error: 'Reply was not sent. Please try again.' }, { status: 503 });
  }
}
