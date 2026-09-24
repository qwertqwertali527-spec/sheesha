export type Channel = 'web' | 'whatsapp';
export type InquiryStatus = 'collecting' | 'needs_human' | 'in_progress' | 'closed';
export type MessageRole = 'customer' | 'assistant' | 'human';

export interface Service {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface SiteSettings {
  brandName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  aboutTitle: string;
  aboutDescription: string;
  hours: string;
  contactEmail: string;
  contactPhone: string;
  areas: string[];
  services: Service[];
  faqs: FAQ[];
}

export interface InquiryFields {
  name: string | null;
  contact: string | null;
  date: string | null;
  time: string | null;
  area: string | null;
  address: string | null;
  quantity: number | null;
  service: string | null;
  options: string | null;
  specialRequirements: string | null;
}

export interface Inquiry {
  id: string;
  channel: Channel;
  channelId: string;
  status: InquiryStatus;
  fields: InquiryFields;
  handoffReason: string | null;
  staffNote: string;
  consentAt: string | null;
  ageConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  inquiryId: string;
  role: MessageRole;
  text: string;
  createdAt: string;
  providerMessageId: string | null;
}

export interface InquiryWithMessages {
  inquiry: Inquiry;
  messages: ChatMessage[];
}
