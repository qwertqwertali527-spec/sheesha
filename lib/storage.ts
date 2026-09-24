import fs from 'fs'
import path from 'path'
import { InquiryData, ConversationMessage } from './ai-assistant'

const conversationsPath = path.join(process.cwd(), 'data', 'conversations.json')
const inquiriesPath = path.join(process.cwd(), 'data', 'inquiries.json')

export function getConversations(): Record<string, ConversationMessage[]> {
  try {
    if (!fs.existsSync(conversationsPath)) return {}
    const raw = fs.readFileSync(conversationsPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveConversations(data: Record<string, ConversationMessage[]>) {
  fs.writeFileSync(conversationsPath, JSON.stringify(data, null, 2))
}

export function getConversation(phone: string): ConversationMessage[] {
  const all = getConversations()
  return all[phone] || []
}

export function addMessageToConversation(phone: string, message: ConversationMessage) {
  const all = getConversations()
  if (!all[phone]) all[phone] = []
  all[phone].push(message)
  // Keep last 50 messages
  if (all[phone].length > 50) {
    all[phone] = all[phone].slice(-50)
  }
  saveConversations(all)
}

export function getInquiries(): InquiryData[] {
  try {
    if (!fs.existsSync(inquiriesPath)) return []
    const raw = fs.readFileSync(inquiriesPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveInquiries(data: InquiryData[]) {
  fs.writeFileSync(inquiriesPath, JSON.stringify(data, null, 2))
}

export function upsertInquiry(inquiry: InquiryData) {
  const all = getInquiries()
  const idx = all.findIndex(i => i.id === inquiry.id || (i.phoneNumber && inquiry.phoneNumber && i.phoneNumber === inquiry.phoneNumber && i.status === 'collecting'))
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...inquiry, updatedAt: new Date().toISOString() }
  } else {
    all.unshift(inquiry)
  }
  // Keep last 500
  saveInquiries(all.slice(0, 500))
}

export function getInquiryByPhone(phone: string): InquiryData | undefined {
  const all = getInquiries()
  return all.find(i => i.phoneNumber === phone && i.status === 'collecting')
}
