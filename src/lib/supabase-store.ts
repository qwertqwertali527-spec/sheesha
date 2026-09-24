import { randomUUID } from 'node:crypto';
import { defaultSettings, emptyFields } from './defaults';
import type { Store } from './store';
import type { Channel, ChatMessage, Inquiry, SiteSettings } from './types';

/** Server-side PostgREST adapter. The service-role key must NEVER reach client code. */
export class SupabaseStore implements Store {
  private base: string;
  private key: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase environment is incomplete');
    this.base = `${url.replace(/\/$/, '')}/rest/v1`;
    this.key = key;
  }

  private async request<T>(table: string, query = '', options: { method?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
    const response = await fetch(`${this.base}/${table}${query}`, {
      method: options.method ?? 'GET',
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        Prefer: options.prefer ?? 'return=representation',
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Database error ${response.status}: ${detail}`);
    }
    if (response.status === 204) return [] as T;
    return await response.json() as T;
  }

  async getSettings(): Promise<SiteSettings> {
    const rows = await this.request<Array<{ payload: SiteSettings }>>('content', '?id=eq.main&select=payload&limit=1');
    return rows[0]?.payload ?? structuredClone(defaultSettings);
  }

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    await this.request('content', '?on_conflict=id', {
      method: 'POST', body: { id: 'main', payload: settings },
      prefer: 'resolution=merge-duplicates,return=representation',
    });
    return settings;
  }

  async findInquiry(channel: Channel, channelId: string): Promise<Inquiry | null> {
    const query = `?channel=eq.${channel}&channel_id=eq.${encodeURIComponent(channelId)}&select=*&limit=1`;
    const rows = await this.request<Record<string, unknown>[]>('inquiries', query);
    return rows[0] ? this.toInquiry(rows[0]) : null;
  }

  async getInquiry(id: string): Promise<Inquiry | null> {
    const rows = await this.request<Record<string, unknown>[]>('inquiries', `?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
    return rows[0] ? this.toInquiry(rows[0]) : null;
  }

  async createInquiry(channel: Channel, channelId: string, ageConfirmed: boolean, consent: boolean): Promise<Inquiry> {
    const now = new Date().toISOString();
    const inquiry: Inquiry = {
      id: randomUUID(), channel, channelId, status: 'collecting', fields: emptyFields(),
      handoffReason: null, staffNote: '', ageConfirmedAt: ageConfirmed ? now : null,
      consentAt: consent ? now : null, createdAt: now, updatedAt: now,
    };
    await this.request('inquiries', '', { method: 'POST', body: this.fromInquiry(inquiry) });
    return inquiry;
  }

  async updateInquiry(id: string, patch: Partial<Pick<Inquiry, 'status' | 'fields' | 'handoffReason' | 'staffNote' | 'consentAt' | 'ageConfirmedAt'>>): Promise<Inquiry> {
    const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.status !== undefined) body.status = patch.status;
    if (patch.fields !== undefined) body.fields = patch.fields;
    if (patch.handoffReason !== undefined) body.handoff_reason = patch.handoffReason;
    if (patch.staffNote !== undefined) body.staff_note = patch.staffNote;
    if (patch.consentAt !== undefined) body.consent_at = patch.consentAt;
    if (patch.ageConfirmedAt !== undefined) body.age_confirmed_at = patch.ageConfirmedAt;
    const rows = await this.request<Record<string, unknown>[]>('inquiries', `?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', body,
    });
    if (!rows[0]) throw new Error('Inquiry not found');
    return this.toInquiry(rows[0]);
  }

  async listInquiries(): Promise<Inquiry[]> {
    const rows = await this.request<Record<string, unknown>[]>('inquiries', '?select=*&order=updated_at.desc&limit=150');
    return rows.map((row) => this.toInquiry(row));
  }

  async addMessage(message: ChatMessage): Promise<void> {
    await this.request('messages', '', { method: 'POST', body: {
      id: message.id, inquiry_id: message.inquiryId, role: message.role,
      text: message.text, created_at: message.createdAt, provider_message_id: message.providerMessageId,
    } });
  }

  async listMessages(inquiryId: string): Promise<ChatMessage[]> {
    const rows = await this.request<Record<string, unknown>[]>('messages',
      `?inquiry_id=eq.${encodeURIComponent(inquiryId)}&select=*&order=created_at.asc&limit=250`);
    return rows.map((row) => ({
      id: row.id as string, inquiryId: row.inquiry_id as string,
      role: row.role as ChatMessage['role'], text: row.text as string,
      createdAt: row.created_at as string, providerMessageId: row.provider_message_id as string | null,
    }));
  }

  async deleteInquiry(id: string): Promise<void> {
    await this.request('inquiries', `?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async markEvent(id: string): Promise<boolean> {
    const rows = await this.request<Record<string, unknown>[]>('webhook_events', '?on_conflict=id', {
      method: 'POST', body: { id, created_at: new Date().toISOString() },
      prefer: 'resolution=ignore-duplicates,return=representation',
    });
    return rows.length > 0;
  }

  private toInquiry(row: Record<string, unknown>): Inquiry {
    return {
      id: row.id as string, channel: row.channel as Channel,
      channelId: row.channel_id as string, status: row.status as Inquiry['status'],
      fields: row.fields as Inquiry['fields'], handoffReason: row.handoff_reason as string | null,
      staffNote: row.staff_note as string, consentAt: row.consent_at as string | null,
      ageConfirmedAt: row.age_confirmed_at as string | null,
      createdAt: row.created_at as string, updatedAt: row.updated_at as string,
    };
  }

  private fromInquiry(inquiry: Inquiry): Record<string, unknown> {
    return {
      id: inquiry.id, channel: inquiry.channel, channel_id: inquiry.channelId,
      status: inquiry.status, fields: inquiry.fields, handoff_reason: inquiry.handoffReason,
      staff_note: inquiry.staffNote, consent_at: inquiry.consentAt,
      age_confirmed_at: inquiry.ageConfirmedAt,
      created_at: inquiry.createdAt, updated_at: inquiry.updatedAt,
    };
  }
}
