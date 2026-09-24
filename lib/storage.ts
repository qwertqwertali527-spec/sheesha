import fs from 'fs'
import path from 'path'
import { InquiryData, ConversationMessage } from './ai-assistant'
import { getCustomers, saveCustomers, trackEvent } from './db'

const conversationsPath = path.join(process.cwd(), 'data', 'conversations.json')
const inquiriesPath = path.join(process.cwd(), 'data', 'inquiries.json')

function ensureFiles() {
  try {
    if (!fs.existsSync(path.dirname(conversationsPath))) {
      fs.mkdirSync(path.dirname(conversationsPath), { recursive: true })
    }
    if (!fs.existsSync(conversationsPath)) {
      fs.writeFileSync(conversationsPath, '{}')
    }
    if (!fs.existsSync(inquiriesPath)) {
      fs.writeFileSync(inquiriesPath, '[]')
    }
  } catch {}
}
ensureFiles()

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
  
  const isNew = idx < 0
  
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...inquiry, updatedAt: new Date().toISOString() }
  } else {
    all.unshift(inquiry)
  }
  saveInquiries(all.slice(0, 500))

  try {
    if (inquiry.phoneNumber) {
      const customers = getCustomers()
      let customer = customers.find(c => c.phone === inquiry.phoneNumber)
      if (!customer && isNew) {
        customer = {
          id: `CUST-${Date.now().toString(36).toUpperCase()}`,
          phone: inquiry.phoneNumber!,
          name: (inquiry as any).name || inquiry.phoneNumber,
          email: "",
          totalOrders: 1,
          totalSpent: 0,
          lastOrderAt: new Date().toISOString(),
          tags: "new",
          notes: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        customers.unshift(customer)
        saveCustomers(customers)
        trackEvent("customer_created", { phone: inquiry.phoneNumber, source: inquiry.source })
      } else if (customer) {
        customer.totalOrders += isNew ? 1 : 0
        customer.lastOrderAt = new Date().toISOString()
        customer.updatedAt = new Date().toISOString()
        if ((inquiry as any).name) customer.name = (inquiry as any).name
        saveCustomers(customers)
      }
    }

    if (isNew) {
      trackEvent("inquiry_created", { 
        package: (inquiry as any).package, 
        area: (inquiry as any).area,
        source: inquiry.source,
        isComplete: inquiry.isComplete
      })
    }
    if (inquiry.isComplete) {
      trackEvent("inquiry_completed", { id: inquiry.id, package: (inquiry as any).package })
    }
    if ((inquiry as any).needsHuman) {
      trackEvent("handover_requested", { id: inquiry.id, phone: inquiry.phoneNumber })
    }
  } catch (e) {
    console.error("CRM update failed:", e)
  }
}

export function getInquiryByPhone(phone: string): InquiryData | undefined {
  const all = getInquiries()
  return all.find(i => i.phoneNumber === phone && i.status === 'collecting')
}
