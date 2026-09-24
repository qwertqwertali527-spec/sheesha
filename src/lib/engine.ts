import { randomUUID } from 'node:crypto';
import { isPublicApproved } from './config';
import { dubaiDate, extractLocally, extractMessage } from './extractor';
import { notifyStaff } from './notify';
import type { Store } from './store';
import type { Channel, ChatMessage, Inquiry, InquiryFields, SiteSettings } from './types';

const prompts: Record<'name' | 'date' | 'time' | 'address' | 'quantity' | 'contact', string> = {
  name: 'May I have your name?',
  date: 'Which date would you prefer? You can say today, tomorrow, or use a date like 2026-09-25.',
  time: 'What time would you prefer in Dubai time? For example, 9 PM.',
  address: 'What is the exact delivery location? Please include the building or street and area.',
  quantity: 'How many equipment units would you like to discuss?',
  contact: 'What phone number or email should the team use to reach you?',
};

export function nextMissingField(inquiry: Inquiry): keyof typeof prompts | null {
  const fields = inquiry.fields;
  const order = (Object.keys(prompts) as Array<keyof typeof prompts>);
  for (const field of order) {
    if (field === 'contact' && inquiry.channel === 'whatsapp') continue;
    if (fields[field] == null) return field;
  }
  return null;
}

export function summary(inquiry: Inquiry): string {
  const f = inquiry.fields;
  return [
    `Name: ${f.name ?? 'Not supplied'}`,
    `Date: ${f.date ?? 'Not supplied'}`,
    `Time (Dubai): ${f.time ?? 'Not supplied'}`,
    `Area: ${f.area ?? 'Not supplied'}`,
    `Exact address: ${f.address ?? 'Not supplied'}`,
    `Quantity: ${f.quantity ?? 'Not supplied'}`,
    `Service/package: ${f.service ?? 'Not specified'}`,
    `Options: ${f.options ?? 'Not specified'}`,
    `Special requirements: ${f.specialRequirements ?? 'None supplied'}`,
    `Contact: ${f.contact ?? (inquiry.channel === 'whatsapp' ? inquiry.channelId : 'Not supplied')}`,
    `Status: ${inquiry.status}`,
    `Handover: ${inquiry.handoffReason ?? 'Not yet'}`,
  ].join('\n');
}

function mergeFields(current: InquiryFields, extracted: Partial<InquiryFields>): InquiryFields {
  const merged = { ...current };
  for (const [key, value] of Object.entries(extracted)) {
    if (value !== null && value !== undefined && value !== '') {
      (merged as unknown as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

function nowDubaiTime(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('hour')}:${part('minute')}`;
}

function normalizeTokens(input: string): Set<string> {
  const ignored = new Set(['the', 'and', 'for', 'you', 'your', 'can', 'how', 'what', 'where', 'when', 'are', 'is', 'do', 'does', 'this', 'with', 'about']);
  return new Set(input.toLowerCase().match(/[a-z]{3,}/g)?.filter((word) => !ignored.has(word)) ?? []);
}

function matchedFAQ(message: string, settings: SiteSettings): string | null {
  const words = normalizeTokens(message);
  let best: { score: number; answer: string } | null = null;
  for (const faq of settings.faqs) {
    const question = normalizeTokens(faq.question);
    const overlap = [...words].filter((word) => question.has(word)).length;
    const score = question.size > 0 ? overlap / question.size : 0;
    if (overlap >= 2 && score >= 0.45 && (!best || score > best.score)) best = { score, answer: faq.answer };
  }
  return best?.answer ?? null;
}

function groundedAnswer(message: string, settings: SiteSettings): string | null {
  const faq = matchedFAQ(message, settings);
  if (faq) return faq;
  const lower = message.toLowerCase();
  if (/\b(hours|opening|closing|open|close|business hours)\b|ساعات العمل|متى تفتح/.test(lower)) {
    return `The published hours are: ${settings.hours}. A person will confirm any specific request.`;
  }
  if (/\b(services|packages|offer|experiences|types of service)\b|الباقات|الخدمات/.test(lower)) {
    const names = settings.services.map((service) => service.title).join(', ');
    return isPublicApproved()
      ? `The listed service formats are: ${names}. A person will confirm the exact details, availability and quote.`
      : `This concept preview shows illustrative formats: ${names}. Actual services have not been confirmed.`;
  }
  if (/\b(areas|locations|coverage|where do you deliver|deliver to)\b|مناطق التوصيل|أي مناطق/.test(lower)) {
    return isPublicApproved()
      ? `The currently listed areas are: ${settings.areas.join(', ') || 'none specified'}. A person will confirm whether your exact location can be accommodated.`
      : 'Coverage is not confirmed in this concept preview. The areas on the page are illustrative; a person must confirm your location.';
  }
  return null;
}

function reasonFor(intent: string): string {
  const reasons: Record<string, string> = {
    human: 'Customer requested a person', pricing: 'Price or quote requested',
    availability: 'Availability or delivery timing needs staff confirmation',
    confirmation: 'Confirmation requires staff', payment: 'Payment requires staff',
    question: 'No approved answer found',
  };
  return reasons[intent] ?? 'Staff review required';
}

async function record(store: Store, inquiryId: string, role: ChatMessage['role'], text: string, providerMessageId: string | null = null): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: randomUUID(), inquiryId, role, text,
    createdAt: new Date().toISOString(), providerMessageId,
  };
  await store.addMessage(message);
  return message;
}

export interface ProcessResult { inquiry: Inquiry; replies: ChatMessage[] }

/** All channels share one conservative inquiry state machine. */
export async function processIncoming(
  store: Store,
  channel: Channel,
  channelId: string,
  message: string,
  settings: SiteSettings,
  options: { ageConfirmed?: boolean; consent?: boolean; providerMessageId?: string } = {},
): Promise<ProcessResult> {
  let inquiry = await store.findInquiry(channel, channelId);
  if (!inquiry) {
    inquiry = await store.createInquiry(channel, channelId, Boolean(options.ageConfirmed), Boolean(options.consent));
  }
  const inquiryId = inquiry.id;
  const existing = await store.listMessages(inquiryId);
  await record(store, inquiryId, 'customer', message, options.providerMessageId ?? null);
  const replies: ChatMessage[] = [];
  const reply = async (text: string) => { replies.push(await record(store, inquiryId, 'assistant', text)); };

  // A Platform user must explicitly accept this approved non-regulated flow
  // before any message is sent to an external AI provider.
  if (channel === 'whatsapp' && !inquiry.consentAt) {
    const normalized = message.trim().toLowerCase();
    const privacyNotice = process.env.PRIVACY_POLICY_URL ?? 'the privacy page on our website';
    if (/^(yes|i agree|agree|أوافق)$/.test(normalized)) {
      inquiry = await store.updateInquiry(inquiry.id, {
        consentAt: new Date().toISOString(), ageConfirmedAt: new Date().toISOString(),
      });
      const firstRequest = existing.find((entry) => entry.role === 'customer' && !/^(yes|i agree|agree|أوافق)$/i.test(entry.text))?.text;
      if (!firstRequest) {
        await reply('Thank you. Tell us your preferred date, time, exact location and number of units. A person will confirm any arrangement.');
        return { inquiry, replies };
      }
      // Process the initial request only after consent; the YES message is not a request.
      message = firstRequest;
    } else if (/^(no|stop|لا)$/.test(normalized) || extractLocally(message).intent === 'underage') {
      inquiry = await store.updateInquiry(inquiry.id, { status: 'closed', handoffReason: 'Consent/eligibility not provided' });
      await reply('We cannot process this inquiry. No arrangement has been made.');
      return { inquiry, replies };
    } else if (extractLocally(message).intent === 'human') {
      inquiry = await store.updateInquiry(inquiry.id, { status: 'needs_human', handoffReason: 'Customer requested a person' });
      await notifyStaff(inquiry);
      await reply(`A person will review your message. Privacy notice: ${privacyNotice}. No booking has been confirmed.`);
      return { inquiry, replies };
    } else {
      await reply(`Before we process your inquiry, please confirm you are 18 or older and agree to our privacy notice (${privacyNotice}) and AI-assisted processing by replying YES. Reply NO to stop, or ask for a person. No booking is confirmed.`);
      return { inquiry, replies };
    }
  }

  if (inquiry.status === 'needs_human' || inquiry.status === 'in_progress') {
    // The human owns this thread now. Never let an AI interrupt.
    return { inquiry, replies };
  }
  if (inquiry.status === 'closed') {
    inquiry = await store.updateInquiry(inquiry.id, { status: 'needs_human', handoffReason: 'Customer replied to a closed inquiry' });
    await notifyStaff(inquiry);
    await reply('Your message has been passed to the team for review. No booking has been confirmed.');
    return { inquiry, replies };
  }

  const quickCheck = extractLocally(message);
  if (quickCheck.intent === 'underage') {
    inquiry = await store.updateInquiry(inquiry.id, { status: 'closed', handoffReason: 'Customer indicated they are under 18' });
    await reply('We cannot process an inquiry from someone under 18. No arrangement has been made.');
    return { inquiry, replies };
  }

  const previousPrompt = [...existing].reverse().find((entry) => entry.role === 'assistant')?.text ?? '';
  const extracted = await extractMessage(message, previousPrompt, settings);
  const fields = mergeFields(inquiry.fields, extracted.fields);
  if (channel === 'whatsapp') fields.contact = channelId;
  // Never silently accept a requested time that has already passed today.
  if (fields.date === dubaiDate() && fields.time && fields.time <= nowDubaiTime()) fields.time = null;
  inquiry = await store.updateInquiry(inquiry.id, { fields });

  if (['human', 'pricing', 'availability', 'confirmation', 'payment'].includes(extracted.intent)) {
    inquiry = await store.updateInquiry(inquiry.id, { status: 'needs_human', handoffReason: reasonFor(extracted.intent) });
    await notifyStaff(inquiry);
    await reply('I’ve shared your request with the team. A person will review it and confirm any details, price or availability. This is not a booking.');
    return { inquiry, replies };
  }

  if (extracted.intent === 'question') {
    const approvedAnswer = groundedAnswer(message, settings);
    if (!approvedAnswer) {
      inquiry = await store.updateInquiry(inquiry.id, { status: 'needs_human', handoffReason: reasonFor('question') });
      await notifyStaff(inquiry);
      await reply('I don’t have an approved answer to that question, so I’ve passed it to a person.');
      return { inquiry, replies };
    }
    await reply(approvedAnswer);
    return { inquiry, replies };
  }

  const missing = nextMissingField(inquiry);
  if (missing) {
    await reply(prompts[missing]);
    return { inquiry, replies };
  }

  inquiry = await store.updateInquiry(inquiry.id, { status: 'needs_human', handoffReason: 'Information collected; confirmation required' });
  await notifyStaff(inquiry);
  await reply(`Thank you, ${fields.name}. I’ve noted your request for ${fields.quantity} unit${fields.quantity === 1 ? '' : 's'} on ${fields.date} at ${fields.time} (Dubai time). The team will review the details and contact you. No price, availability or booking has been confirmed.`);
  return { inquiry, replies };
}
