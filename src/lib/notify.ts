import type { Inquiry } from './types';

/** Internal alert only; no customer campaigns. Dashboard remains source of truth. */
export async function notifyStaff(inquiry: Inquiry): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.TEAM_EMAIL;
  const from = process.env.NOTIFICATION_FROM_EMAIL;
  if (!key || !to || !from) return;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        from, to: [to], subject: `Inquiry needs review · ${inquiry.id.slice(0, 8)}`,
        text: `A ${inquiry.channel} inquiry needs a human review. Log in to the staff dashboard to see its details. Reference: ${inquiry.id}. No booking has been confirmed.`,
      }),
    });
    if (!response.ok) console.error('Internal notification failed:', response.status);
  } catch (error) {
    console.error('Internal notification unavailable:', error instanceof Error ? error.message : 'unknown');
  }
}
