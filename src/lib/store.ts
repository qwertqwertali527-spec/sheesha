import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { defaultSettings, emptyFields } from './defaults';
import type { Channel, ChatMessage, Inquiry, SiteSettings } from './types';

export interface Store {
  getSettings(): Promise<SiteSettings>;
  saveSettings(settings: SiteSettings): Promise<SiteSettings>;
  findInquiry(channel: Channel, channelId: string): Promise<Inquiry | null>;
  getInquiry(id: string): Promise<Inquiry | null>;
  createInquiry(channel: Channel, channelId: string, ageConfirmed: boolean, consent: boolean): Promise<Inquiry>;
  updateInquiry(id: string, patch: Partial<Pick<Inquiry, 'status' | 'fields' | 'handoffReason' | 'staffNote' | 'consentAt' | 'ageConfirmedAt'>>): Promise<Inquiry>;
  listInquiries(): Promise<Inquiry[]>;
  addMessage(message: ChatMessage): Promise<void>;
  listMessages(inquiryId: string): Promise<ChatMessage[]>;
  deleteInquiry(id: string): Promise<void>;
  markEvent(id: string): Promise<boolean>;
}

type InquiryRow = {
  id: string; channel: Channel; channel_id: string; status: Inquiry['status'];
  fields_json: string; handoff_reason: string | null; staff_note: string;
  consent_at: string | null; age_confirmed_at: string | null;
  created_at: string; updated_at: string;
};
type MessageRow = {
  id: string; inquiry_id: string; role: ChatMessage['role']; text: string;
  created_at: string; provider_message_id: string | null;
};

function toInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id, channel: row.channel, channelId: row.channel_id,
    status: row.status, fields: JSON.parse(row.fields_json) as Inquiry['fields'],
    handoffReason: row.handoff_reason, staffNote: row.staff_note,
    consentAt: row.consent_at, ageConfirmedAt: row.age_confirmed_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id, inquiryId: row.inquiry_id, role: row.role, text: row.text,
    createdAt: row.created_at, providerMessageId: row.provider_message_id,
  };
}

class LocalStore implements Store {
  private db: DatabaseSync;

  constructor() {
    const file = path.join(process.cwd(), '.data', 'layali.sqlite');
    mkdirSync(path.dirname(file), { recursive: true });
    this.db = new DatabaseSync(file);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY, payload TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY, channel TEXT NOT NULL, channel_id TEXT NOT NULL,
        status TEXT NOT NULL, fields_json TEXT NOT NULL, handoff_reason TEXT,
        staff_note TEXT NOT NULL DEFAULT '', consent_at TEXT, age_confirmed_at TEXT,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        UNIQUE(channel, channel_id)
      );
      CREATE INDEX IF NOT EXISTS inquiries_updated ON inquiries(updated_at DESC);
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY, inquiry_id TEXT NOT NULL, role TEXT NOT NULL,
        text TEXT NOT NULL, created_at TEXT NOT NULL, provider_message_id TEXT UNIQUE,
        FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
      );
      CREATE INDEX IF NOT EXISTS messages_inquiry ON messages(inquiry_id, created_at);
      CREATE TABLE IF NOT EXISTS webhook_events (
        id TEXT PRIMARY KEY, created_at TEXT NOT NULL
      );
    `);
  }

  async getSettings(): Promise<SiteSettings> {
    const row = this.db.prepare("SELECT payload FROM content WHERE id = 'main'").get() as { payload: string } | undefined;
    return row ? JSON.parse(row.payload) as SiteSettings : structuredClone(defaultSettings);
  }

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    this.db.prepare("INSERT INTO content (id, payload) VALUES ('main', ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload")
      .run(JSON.stringify(settings));
    return settings;
  }

  async findInquiry(channel: Channel, channelId: string): Promise<Inquiry | null> {
    const row = this.db.prepare('SELECT * FROM inquiries WHERE channel = ? AND channel_id = ?')
      .get(channel, channelId) as InquiryRow | undefined;
    return row ? toInquiry(row) : null;
  }

  async getInquiry(id: string): Promise<Inquiry | null> {
    const row = this.db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as InquiryRow | undefined;
    return row ? toInquiry(row) : null;
  }

  async createInquiry(channel: Channel, channelId: string, ageConfirmed: boolean, consent: boolean): Promise<Inquiry> {
    const now = new Date().toISOString();
    const inquiry: Inquiry = {
      id: randomUUID(), channel, channelId, status: 'collecting', fields: emptyFields(),
      handoffReason: null, staffNote: '', ageConfirmedAt: ageConfirmed ? now : null,
      consentAt: consent ? now : null, createdAt: now, updatedAt: now,
    };
    this.db.prepare(`INSERT INTO inquiries
      (id, channel, channel_id, status, fields_json, handoff_reason, staff_note,
       consent_at, age_confirmed_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      inquiry.id, inquiry.channel, inquiry.channelId, inquiry.status,
      JSON.stringify(inquiry.fields), inquiry.handoffReason, inquiry.staffNote,
      inquiry.consentAt, inquiry.ageConfirmedAt, inquiry.createdAt, inquiry.updatedAt,
    );
    return inquiry;
  }

  async updateInquiry(id: string, patch: Partial<Pick<Inquiry, 'status' | 'fields' | 'handoffReason' | 'staffNote' | 'consentAt' | 'ageConfirmedAt'>>): Promise<Inquiry> {
    const current = await this.getInquiry(id);
    if (!current) throw new Error('Inquiry not found');
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.db.prepare(`UPDATE inquiries SET status = ?, fields_json = ?, handoff_reason = ?,
      staff_note = ?, consent_at = ?, age_confirmed_at = ?, updated_at = ? WHERE id = ?`).run(
      updated.status, JSON.stringify(updated.fields), updated.handoffReason,
      updated.staffNote, updated.consentAt, updated.ageConfirmedAt, updated.updatedAt, id,
    );
    return updated;
  }

  async listInquiries(): Promise<Inquiry[]> {
    const rows = this.db.prepare('SELECT * FROM inquiries ORDER BY updated_at DESC LIMIT 150').all() as InquiryRow[];
    return rows.map(toInquiry);
  }

  async addMessage(message: ChatMessage): Promise<void> {
    this.db.prepare(`INSERT INTO messages
      (id, inquiry_id, role, text, created_at, provider_message_id) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(message.id, message.inquiryId, message.role, message.text, message.createdAt, message.providerMessageId);
  }

  async listMessages(inquiryId: string): Promise<ChatMessage[]> {
    const rows = this.db.prepare('SELECT * FROM messages WHERE inquiry_id = ? ORDER BY created_at ASC, rowid ASC')
      .all(inquiryId) as MessageRow[];
    return rows.map(toMessage);
  }

  async deleteInquiry(id: string): Promise<void> {
    this.db.prepare('DELETE FROM messages WHERE inquiry_id = ?').run(id);
    this.db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
  }

  async markEvent(id: string): Promise<boolean> {
    const result = this.db.prepare('INSERT OR IGNORE INTO webhook_events (id, created_at) VALUES (?, ?)')
      .run(id, new Date().toISOString());
    return result.changes === 1;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __layaliStore: Store | undefined;
}

export function getStore(): Store {
  if (globalThis.__layaliStore) return globalThis.__layaliStore;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Loaded only when configured. No service-role key is ever sent to the browser.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseStore } = require('./supabase-store') as typeof import('./supabase-store');
    globalThis.__layaliStore = new SupabaseStore();
  } else if (process.env.NODE_ENV !== 'production') {
    globalThis.__layaliStore = new LocalStore();
  } else {
    throw new Error('Production requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; local SQLite is development-only.');
  }
  return globalThis.__layaliStore;
}
