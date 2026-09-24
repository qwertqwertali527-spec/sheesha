import { createHmac, timingSafeEqual } from 'node:crypto';
import { isWhatsAppEnabled } from './config';

export function verifyWhatsAppSignature(raw: string, header: string | null, secret: string): boolean {
  if (!header?.startsWith('sha256=') || !secret) return false;
  const provided = Buffer.from(header.slice(7), 'hex');
  const expected = createHmac('sha256', secret).update(raw).digest();
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

/** For an explicitly approved NON-REGULATED use case only. */
export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  if (!isWhatsAppEnabled()) throw new Error('WhatsApp is disabled pending legal and platform approval');
  if (!/^\d{8,15}$/.test(to) || !text || text.length > 4096) throw new Error('Invalid WhatsApp recipient or message');
  const version = process.env.WHATSAPP_API_VERSION || 'v24.0';
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      messaging_product: 'whatsapp', recipient_type: 'individual', to,
      type: 'text', text: { preview_url: false, body: text },
    }),
  });
  if (!response.ok) throw new Error(`WhatsApp send failed (${response.status})`);
}
