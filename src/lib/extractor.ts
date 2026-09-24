import type { InquiryFields, SiteSettings } from './types';

export type Intent = 'inquiry' | 'question' | 'human' | 'pricing' | 'availability' | 'confirmation' | 'payment' | 'underage';
export type Extraction = { intent: Intent; fields: Partial<InquiryFields> };

export function dubaiDate(offset = 0, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  const base = new Date(`${part('year')}-${part('month')}-${part('day')}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + offset);
  return base.toISOString().slice(0, 10);
}

function text(value: unknown, max = 180): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed && trimmed.length <= max ? trimmed : null;
}

function validDate(value: string | null, now = new Date()): string | null {
  if (!value || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null;
  return value >= dubaiDate(0, now) ? value : null;
}

function validTime(value: string | null): string | null {
  if (!value || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  return value;
}

function intentFromText(message: string): Intent {
  const lower = message.toLowerCase();
  if (/\b(under 18|i am 17|i'm 17|i am 16|i'm 16|minor|underage)\b|عمري\s*(?:١[0-7]|1[0-7])/.test(lower)) return 'underage';
  if (/\b(human|real person|someone from (?:your |the )?team|speak to (?:an? )?(?:agent|person|someone|manager|staff)|talk to (?:an? )?(?:agent|person|someone|manager)|call me|representative|complex request|custom event|corporate event|wedding)\b|موظف|شخص حقيقي|اكلم/.test(lower)) return 'human';
  if (/\b(pay(?:ment)?|card|checkout|deposit)\b|دفع|ادفع/.test(lower)) return 'payment';
  if (/\b(confirm(?:ation)?|book it|place (?:the |my )?order)\b|تأكيد|أكد/.test(lower)) return 'confirmation';
  if (/\b(price|pricing|cost|how much|quote|rate)\b|السعر|الاسعار|كم يكلف/.test(lower)) return 'pricing';
  if (/\b(available|availability|can you deliver|guarantee|how fast|delivery time)\b|متوفر|توصيل سريع/.test(lower)) return 'availability';
  if (/\?|\b(what|where|when|why|how|do you|can i)\b|هل|كيف|متى|أين/.test(lower)) return 'question';
  return 'inquiry';
}

/** Deterministic fallback when no AI key is configured, also a safe fallback on API errors. */
export function extractLocally(message: string, previousPrompt = '', now = new Date()): Extraction {
  const lower = message.toLowerCase();
  const fields: Partial<InquiryFields> = {};
  const nameMatch = message.match(/(?:my name is|i am called|i'm called|اسمي)\s+([\p{L}][\p{L}\s'-]{1,60})/iu);
  if (nameMatch) fields.name = text(nameMatch[1].split(/\s+(?:and|but|because|so)\s+/i)[0], 70);
  else if (/\b(?:your )?name\b|اسمك/.test(previousPrompt.toLowerCase()) && /^[\p{L}][\p{L}\s'-]{1,55}$/u.test(message.trim())) {
    fields.name = text(message, 70);
  }

  const mail = message.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0];
  const phone = message.match(/(?:\+971[\s-]?[0-9][0-9\s-]{7,12}|\b05\d[\s-]?\d{3}[\s-]?\d{4}\b|(?:number|phone|contact|رقمي)\s*(?:is|:|هو)?\s*(\+?\d[\d\s-]{7,14}))/i);
  if (mail) fields.contact = mail;
  else if (phone) fields.contact = (phone[1] || phone[0]).replace(/^(?:number|phone|contact|رقمي)\s*(?:is|:|هو)?\s*/i, '').trim();

  const numberMatch = lower.match(/\b(\d{1,2})\s*(?:equipment\s+)?(?:shishas?|sheeshas?|hookahs?|devices?|units?|sets?)\b/)
    || lower.match(/\b(?:need|want|for)\s+(one|two|three|four|five)\s*(?:equipment\s+)?(?:shishas?|sheeshas?|hookahs?|devices?|units?|sets?)\b/);
  const numberWords: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  if (numberMatch) {
    const qty = numberWords[numberMatch[1]] ?? Number(numberMatch[1]);
    if (Number.isInteger(qty) && qty > 0 && qty <= 30) fields.quantity = qty;
  } else if (/\bhow many\b|العدد/.test(previousPrompt.toLowerCase()) && /^\d{1,2}$/.test(message.trim())) {
    const qty = Number(message.trim());
    if (qty > 0 && qty <= 30) fields.quantity = qty;
  }

  const explicitDate = message.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0] ?? null;
  if (explicitDate) fields.date = validDate(explicitDate, now);
  else if (/\b(tomorrow)\b|غد[ًاا]/i.test(lower)) fields.date = dubaiDate(1, now);
  else if (/\b(today|tonight)\b|اليوم|الليلة/i.test(lower)) fields.date = dubaiDate(0, now);

  const clock = lower.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  const meridiem = lower.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b/);
  if (meridiem) {
    let hour = Number(meridiem[1]) % 12;
    if (meridiem[3].startsWith('p')) hour += 12;
    fields.time = `${String(hour).padStart(2, '0')}:${meridiem[2] ?? '00'}`;
  } else if (clock) fields.time = `${clock[1].padStart(2, '0')}:${clock[2]}`;

  const areas: Array<[RegExp, string]> = [
    [/\b(dubai marina|marina)\b|مرسى دبي|المارينا/i, 'Dubai Marina'],
    [/\b(downtown dubai|downtown)\b|داون تاون/i, 'Downtown Dubai'],
    [/\b(palm jumeirah|the palm)\b|نخلة جميرا/i, 'Palm Jumeirah'],
    [/\b(jumeirah|jbr)\b|جميرا/i, 'Jumeirah'],
    [/\b(business bay)\b/i, 'Business Bay'],
    [/\b(jvc|jumeirah village circle)\b/i, 'JVC'],
    [/\b(al barsha)\b/i, 'Al Barsha'],
    [/\b(deira)\b/i, 'Deira'],
  ];
  for (const [pattern, area] of areas) {
    if (pattern.test(message)) { fields.area = area; break; }
  }

  const explicitAddress = message.match(/(?:my address is|address is|delivery address(?: is)?|location is)\s+(.+)/i)?.[1];
  const detailPattern = /\b(tower|building|street|villa|apartment|apt\.?|flat|unit|floor)\b|برج|مبنى|شارع|فيلا|شقة/i;
  if (explicitAddress) fields.address = text(explicitAddress.split(/[.!?]/)[0], 180);
  else if (detailPattern.test(message) && !/\b(?:need|want|units?|shishas?|sheeshas?|tonight|tomorrow|my name)\b/i.test(message)) {
    fields.address = text(message, 180);
  }
  else if (/exact (?:delivery )?(?:address|location)|building|street/.test(previousPrompt.toLowerCase()) &&
    message.trim().length >= 7 && !areas.some(([pattern]) => pattern.test(message.trim()) && message.trim().length < 28)) {
    fields.address = text(message, 180);
  }

  if (/\b(private evening|the gathering|the occasion)\b/i.test(lower)) {
    fields.service = text(message.match(/\b(private evening|the gathering|the occasion)\b/i)?.[0], 80);
  }
  const options = message.match(/(?:flavou?r|option|preference)\s*(?:is|:|would be)?\s+([^,.!?]+)/i)?.[1];
  if (options) fields.options = text(options, 120);
  const special = message.match(/(?:special request|please note|requirement)\s*(?:is|:)?\s+(.+)/i)?.[1];
  if (special) fields.specialRequirements = text(special, 180);

  return { intent: intentFromText(message), fields };
}

const schemaProperties = {
  intent: { type: 'string', enum: ['inquiry', 'question', 'human', 'pricing', 'availability', 'confirmation', 'payment', 'underage'] },
  name: { type: ['string', 'null'] }, contact: { type: ['string', 'null'] },
  date: { type: ['string', 'null'] }, time: { type: ['string', 'null'] },
  area: { type: ['string', 'null'] }, address: { type: ['string', 'null'] },
  quantity: { type: ['integer', 'null'] }, service: { type: ['string', 'null'] },
  options: { type: ['string', 'null'] }, specialRequirements: { type: ['string', 'null'] },
};

/** The model extracts only; it is never allowed to quote, confirm, or write policy answers. */
export async function extractMessage(
  message: string, previousPrompt: string, settings: SiteSettings, now = new Date(),
): Promise<Extraction> {
  const fallback = extractLocally(message, previousPrompt, now);
  // Escalation and eligibility requests need no third-party AI processing.
  if (['human', 'underage', 'pricing', 'availability', 'confirmation', 'payment'].includes(fallback.intent)) return fallback;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallback;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(9000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', store: false,
        max_output_tokens: 500,
        input: [
          { role: 'system', content: `Extract ONLY facts the customer explicitly provides in this one message. Current Dubai date: ${dubaiDate(0, now)}. Dates must be YYYY-MM-DD and times 24-hour HH:mm in Asia/Dubai. Resolve today/tonight/tomorrow; leave other ambiguous dates null. An area such as Dubai Marina is NOT an exact address. Never invent name, exact address, price, availability or business facts. Allowed service titles: ${settings.services.map((service) => service.title).join(', ')}. If the user asks for a person, quote, availability, confirmation or payment, classify accordingly. A question without a stated inquiry is question. Use null for absent fields.` },
          { role: 'user', content: message },
        ],
        text: { format: {
          type: 'json_schema', name: 'inquiry_extraction', strict: true,
          schema: { type: 'object', properties: schemaProperties, required: Object.keys(schemaProperties), additionalProperties: false },
        } },
      }),
    });
    if (!response.ok) throw new Error(`AI provider ${response.status}`);
    const data = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const output = data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text;
    if (!output) throw new Error('AI output missing');
    const raw = JSON.parse(output) as Record<string, unknown>;
    const intents: Intent[] = ['inquiry', 'question', 'human', 'pricing', 'availability', 'confirmation', 'payment', 'underage'];
    const parsed: Extraction = { intent: intents.includes(raw.intent as Intent) ? raw.intent as Intent : fallback.intent, fields: {} };
    for (const key of ['name', 'contact', 'area', 'address', 'service', 'options', 'specialRequirements'] as const) {
      const value = text(raw[key], key === 'address' ? 180 : 120);
      if (value) parsed.fields[key] = value;
    }
    const date = validDate(text(raw.date, 10), now);
    const time = validTime(text(raw.time, 5));
    if (date) parsed.fields.date = date;
    if (time) parsed.fields.time = time;
    if (typeof raw.quantity === 'number' && Number.isInteger(raw.quantity) && raw.quantity > 0 && raw.quantity <= 30) {
      parsed.fields.quantity = raw.quantity;
    }
    // Explicit safety/operational intents always override a model's classification.
    if (['human', 'pricing', 'availability', 'confirmation', 'payment', 'underage'].includes(fallback.intent)) {
      parsed.intent = fallback.intent;
    }
    // Follow-up answers such as "Ali" have no context in a single-turn LLM call.
    for (const [key, value] of Object.entries(fallback.fields)) {
      if (parsed.fields[key as keyof InquiryFields] == null && value != null) {
        (parsed.fields as Record<string, unknown>)[key] = value;
      }
    }
    return parsed;
  } catch (error) {
    console.error('AI extraction failed; falling back to rules:', error instanceof Error ? error.message : 'unknown');
    return fallback;
  }
}
