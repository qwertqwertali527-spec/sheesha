import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import test from 'node:test';
import { defaultSettings, emptyFields } from '../src/lib/defaults';
import { nextMissingField, processIncoming, summary } from '../src/lib/engine';
import { dubaiDate, extractLocally } from '../src/lib/extractor';
import type { Store } from '../src/lib/store';
import type { Channel, ChatMessage, Inquiry, SiteSettings } from '../src/lib/types';
import { verifyWhatsAppSignature } from '../src/lib/whatsapp';

class MemoryStore implements Store {
  settings = structuredClone(defaultSettings);
  inquiries: Inquiry[] = [];
  messages: ChatMessage[] = [];
  events = new Set<string>();
  async getSettings(): Promise<SiteSettings> { return this.settings; }
  async saveSettings(value: SiteSettings): Promise<SiteSettings> { this.settings = value; return value; }
  async findInquiry(channel: Channel, channelId: string): Promise<Inquiry | null> {
    return this.inquiries.find((item) => item.channel === channel && item.channelId === channelId) ?? null;
  }
  async getInquiry(id: string): Promise<Inquiry | null> { return this.inquiries.find((item) => item.id === id) ?? null; }
  async createInquiry(channel: Channel, channelId: string, ageConfirmed: boolean, consent: boolean): Promise<Inquiry> {
    const now = new Date().toISOString();
    const inquiry: Inquiry = { id: randomUUID(), channel, channelId, status: 'collecting', fields: emptyFields(),
      handoffReason: null, staffNote: '', consentAt: consent ? now : null,
      ageConfirmedAt: ageConfirmed ? now : null, createdAt: now, updatedAt: now };
    this.inquiries.push(inquiry); return inquiry;
  }
  async updateInquiry(id: string, patch: Partial<Pick<Inquiry, 'status' | 'fields' | 'handoffReason' | 'staffNote' | 'consentAt' | 'ageConfirmedAt'>>): Promise<Inquiry> {
    const inquiry = this.inquiries.find((item) => item.id === id);
    if (!inquiry) throw new Error('Not found');
    Object.assign(inquiry, patch, { updatedAt: new Date().toISOString() });
    return inquiry;
  }
  async listInquiries(): Promise<Inquiry[]> { return this.inquiries; }
  async addMessage(message: ChatMessage): Promise<void> { this.messages.push(message); }
  async listMessages(inquiryId: string): Promise<ChatMessage[]> { return this.messages.filter((item) => item.inquiryId === inquiryId); }
  async deleteInquiry(id: string): Promise<void> { this.inquiries = this.inquiries.filter((item) => item.id !== id); this.messages = this.messages.filter((item) => item.inquiryId !== id); }
  async markEvent(id: string): Promise<boolean> { if (this.events.has(id)) return false; this.events.add(id); return true; }
}

test('extracts the example without inventing name or exact address', () => {
  const now = new Date('2026-09-24T15:00:00Z'); // 7 PM Dubai
  const result = extractLocally('Hi, I need 2 equipment units tonight in Dubai Marina around 9 PM.', '', now);
  assert.equal(result.fields.quantity, 2);
  assert.equal(result.fields.date, dubaiDate(0, now));
  assert.equal(result.fields.time, '21:00');
  assert.equal(result.fields.area, 'Dubai Marina');
  assert.equal(result.fields.name, undefined);
  assert.equal(result.fields.address, undefined);
});

test('guided parser does not mistake an entire multi-field message for an exact address', () => {
  const result = extractLocally('My name is Maya Demo. I need 2 units tomorrow in Dubai Marina, Demo Tower, apartment 1204.');
  assert.equal(result.fields.name, 'Maya Demo');
  assert.equal(result.fields.quantity, 2);
  assert.equal(result.fields.address, undefined);
});

test('slot filling asks only for missing required details, then hands off', async () => {
  const store = new MemoryStore();
  const id = 'visitor-1';
  const first = await processIncoming(store, 'web', id,
    'I need 2 equipment units tomorrow in Dubai Marina at 9 PM.', store.settings,
    { consent: true, ageConfirmed: true });
  assert.equal(first.replies[0].text, 'May I have your name?');
  assert.equal(first.inquiry.fields.quantity, 2);
  assert.equal(first.inquiry.fields.date, dubaiDate(1));
  assert.equal(nextMissingField(first.inquiry), 'name');
  const second = await processIncoming(store, 'web', id, 'Ali', store.settings);
  assert.match(second.replies[0].text, /exact delivery location/i);
  const third = await processIncoming(store, 'web', id, 'Marina Gate Tower 2, Apartment 1402, Dubai Marina', store.settings);
  assert.match(third.replies[0].text, /phone number or email/i);
  const fourth = await processIncoming(store, 'web', id, 'test@example.com', store.settings);
  assert.equal(fourth.inquiry.status, 'needs_human');
  assert.match(fourth.replies[0].text, /no price, availability or booking/i);
  assert.match(summary(fourth.inquiry), /Marina Gate Tower 2/);
  assert.equal(fourth.inquiry.fields.contact, 'test@example.com');
});

test('price requests trigger immediate human handover and stop bot replies', async () => {
  const store = new MemoryStore();
  const first = await processIncoming(store, 'web', 'price', 'How much does it cost?', store.settings,
    { consent: true, ageConfirmed: true });
  assert.equal(first.inquiry.status, 'needs_human');
  assert.equal(first.inquiry.handoffReason, 'Price or quote requested');
  assert.doesNotMatch(first.replies[0].text, /AED\s*\d+/i);
  const next = await processIncoming(store, 'web', 'price', 'Any update?', store.settings);
  assert.equal(next.replies.length, 0);
});

test('explicit human and complex requests bypass automated collection', async () => {
  const store = new MemoryStore();
  const first = await processIncoming(store, 'web', 'human', 'Can I speak to someone?', store.settings,
    { consent: true, ageConfirmed: true });
  assert.equal(first.inquiry.status, 'needs_human');
  assert.equal(first.inquiry.handoffReason, 'Customer requested a person');
  const complex = await processIncoming(store, 'web', 'complex', 'I have a custom event request for a wedding.', store.settings,
    { consent: true, ageConfirmed: true });
  assert.equal(complex.inquiry.status, 'needs_human');
});

test('unknown questions escalate; approved FAQ is repeated verbatim', async () => {
  const store = new MemoryStore();
  const known = await processIncoming(store, 'web', 'faq', 'Is an inquiry a confirmed booking?', store.settings,
    { consent: true, ageConfirmed: true });
  assert.equal(known.replies[0].text, store.settings.faqs[0].answer);
  const unknown = await processIncoming(store, 'web', 'unknown', 'Do you have a moon base?', store.settings,
    { consent: true, ageConfirmed: true });
  assert.equal(unknown.inquiry.status, 'needs_human');
  assert.match(unknown.replies[0].text, /approved answer/i);
});

test('questions about hours and packages use only curated content', async () => {
  const store = new MemoryStore();
  const hours = await processIncoming(store, 'web', 'hours', 'What are your opening hours?', store.settings,
    { consent: true, ageConfirmed: true });
  assert.match(hours.replies[0].text, /Hours to be confirmed/);
  const packages = await processIncoming(store, 'web', 'packages', 'Which packages do you offer?', store.settings,
    { consent: true, ageConfirmed: true });
  assert.match(packages.replies[0].text, /illustrative formats/i);
  assert.doesNotMatch(packages.replies[0].text, /AED\s*\d+/i);
});

test('WhatsApp-channel simulator requires consent before processing the first request', async () => {
  const store = new MemoryStore();
  const first = await processIncoming(store, 'whatsapp', '971501234567',
    'I need 2 units tomorrow in Dubai Marina at 9 PM.', store.settings);
  assert.match(first.replies[0].text, /replying YES/i);
  assert.equal(first.inquiry.fields.quantity, null);
  const second = await processIncoming(store, 'whatsapp', '971501234567', 'YES', store.settings);
  assert.equal(second.inquiry.fields.quantity, 2);
  assert.equal(second.inquiry.fields.contact, '971501234567');
  assert.equal(second.replies[0].text, 'May I have your name?');
});

test('WhatsApp-channel simulator hands a person request to staff before AI consent', async () => {
  const store = new MemoryStore();
  const result = await processIncoming(store, 'whatsapp', '971501234567', 'Can I speak to someone?', store.settings);
  assert.equal(result.inquiry.status, 'needs_human');
  assert.equal(result.inquiry.consentAt, null);
  assert.equal(result.inquiry.handoffReason, 'Customer requested a person');
  assert.match(result.replies[0].text, /Privacy notice/);
});

test('Meta webhook signatures use exact raw-body HMAC and reject tampering', () => {
  const raw = '{"test":true}';
  const header = `sha256=${createHmac('sha256', 'test-secret').update(raw).digest('hex')}`;
  assert.equal(verifyWhatsAppSignature(raw, header, 'test-secret'), true);
  assert.equal(verifyWhatsAppSignature(raw + ' ', header, 'test-secret'), false);
  assert.equal(verifyWhatsAppSignature(raw, 'sha256=xyz', 'test-secret'), false);
});
