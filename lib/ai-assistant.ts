import OpenAI from 'openai'
import { getSystemPrompt } from './knowledge'
import { getEnhancedSystemPrompt } from './knowledge-advanced'

const openai = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('test-key') ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface InquiryData {
  id: string
  name?: string
  date?: string
  time?: string
  location?: string
  area?: string
  numberOfSheeshas?: number
  package?: string
  flavors?: string[]
  specialRequirements?: string
  isComplete: boolean
  needsHuman: boolean
  summary?: string
  rawMessages: ConversationMessage[]
  status: 'collecting' | 'completed' | 'handover' | 'cancelled'
  createdAt: string
  updatedAt: string
  phoneNumber?: string
  source: 'whatsapp' | 'website'
}

export async function processMessage(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  phoneNumber?: string
): Promise<{
  reply: string,
  inquiry: Partial<InquiryData>,
  needsHuman: boolean,
  isComplete: boolean
}> {
  let systemPrompt: string
  try {
    systemPrompt = await getEnhancedSystemPrompt(userMessage)
  } catch {
    systemPrompt = getSystemPrompt()
  }

  if (!openai) {
    return ruleBasedAssistant(userMessage, conversationHistory)
  }

  try {
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ]

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const reply = completion.choices[0]?.message?.content || "Thanks for your message! Our team will assist you shortly."

    // Try to extract structured data from reply + conversation using second call or parsing
    const extraction = await extractInquiryData(userMessage, conversationHistory, reply)

    return {
      reply: cleanReply(reply),
      inquiry: extraction,
      needsHuman: extraction.needsHuman || false,
      isComplete: extraction.isComplete || false
    }
  } catch (error) {
    console.error('OpenAI error:', error)
    return ruleBasedAssistant(userMessage, conversationHistory)
  }
}

function cleanReply(reply: string): string {
  // Remove any JSON that might have leaked
  return reply.replace(/```json[\s\S]*?```/g, '').replace(/\{[\s\S]*"isComplete"[\s\S]*\}/g, '').trim()
}

async function extractInquiryData(
  userMessage: string,
  history: ConversationMessage[],
  lastReply: string
): Promise<Partial<InquiryData>> {
  if (!openai) return {}

  try {
    const conversationText = [...history, { role: 'user', content: userMessage } as ConversationMessage]
      .map(m => `${m.role}: ${m.content}`).join('\n')

    const extractionPrompt = `
Extract order info from this conversation. Return ONLY valid JSON with fields:
{
  "name": "string or null",
  "date": "string or null (e.g., today, tonight, 2024-09-25)",
  "time": "string or null (e.g., 9 PM)",
  "location": "string or null (full address)",
  "area": "string or null (Dubai area)",
  "numberOfSheeshas": number or null,
  "package": "string or null",
  "flavors": ["array"] or null,
  "specialRequirements": "string or null",
  "isComplete": boolean (true if has name, date, time, location, number, package),
  "needsHuman": boolean (true if customer asks human, complaint, payment, complex),
  "summary": "brief summary"
}

Conversation:
${conversationText}

Last assistant reply:
${lastReply}

Return JSON only, no markdown.
`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: extractionPrompt }],
      temperature: 0.1,
      max_tokens: 400,
    })

    const jsonStr = completion.choices[0]?.message?.content?.replace(/```json|```/g, '').trim() || '{}'
    return JSON.parse(jsonStr)
  } catch (e) {
    console.error('Extraction failed', e)
    return {}
  }
}

function ruleBasedAssistant(
  userMessage: string,
  history: ConversationMessage[]
): {
  reply: string,
  inquiry: Partial<InquiryData>,
  needsHuman: boolean,
  isComplete: boolean
} {
  const lower = userMessage.toLowerCase()
  const hasHistory = history.length > 0

  // Simple intent detection
  const inquiry: Partial<InquiryData> = {}
  let needsHuman = false
  let isComplete = false

  // Detect human handover triggers
  if (lower.includes('human') || lower.includes('agent') || lower.includes('speak to someone') || lower.includes('call me') || lower.includes('manager')) {
    needsHuman = true
    return {
      reply: "Of course! Let me connect you with our team member who will assist you shortly 🤝\n\nOur team usually responds within 2-3 minutes. Is there anything specific you'd like them to know?",
      inquiry: { needsHuman: true },
      needsHuman: true,
      isComplete: false
    }
  }

  // Extract number of sheeshas
  const numMatch = lower.match(/(\d+)\s*sheesha/)
  if (numMatch) {
    inquiry.numberOfSheeshas = parseInt(numMatch[1])
  }

  // Extract area
  const areas = ["marina", "jlt", "jbr", "downtown", "business bay", "difc", "palm", "jumeirah", "barsha", "hills", "ranches", "sports city", "motor city", "jvc", "jvt", "silicon", "deira"]
  for (const area of areas) {
    if (lower.includes(area)) {
      inquiry.area = area
      break
    }
  }

  // Extract time
  const timeMatch = lower.match(/(\d{1,2})\s*(pm|am|tonight)/i)
  if (timeMatch) {
    inquiry.time = timeMatch[0]
  }
  if (lower.includes('tonight') || lower.includes('now') || lower.includes('asap')) {
    inquiry.date = 'today'
    if (!inquiry.time) inquiry.time = 'ASAP'
  }

  if (!hasHistory) {
    // First message
    if (inquiry.numberOfSheeshas || inquiry.area || inquiry.time) {
      return {
        reply: `Great! Thanks for reaching out 😊\n\nI can help you with ${inquiry.numberOfSheeshas ? inquiry.numberOfSheeshas + ' sheesha(s)' : 'sheesha delivery'} ${inquiry.area ? 'in ' + inquiry.area : ''} ${inquiry.time ? 'at ' + inquiry.time : ''}.\n\nMay I have your name and exact delivery location (building, apartment/villa number) to confirm availability?`,
        inquiry,
        needsHuman: false,
        isComplete: false
      }
    }
    return {
      reply: `Welcome to Dubai Sheesha Delivery! 🌟\n\nWe deliver premium sheesha to your door in 30-60 mins across Dubai.\n\nOur packages start from AED 99:\n• Classic - AED 99 (1 sheesha, 3-4 hrs)\n• Premium ⭐ Most Popular - AED 149\n• Double - AED 249 (2 sheeshas)\n• Party - AED 399 (4 sheeshas + attendant)\n\nHow can I help you today? Just tell me:\n- How many sheeshas you need\n- Your area in Dubai\n- Date & time`,
      inquiry: {},
      needsHuman: false,
      isComplete: false
    }
  }

  // Follow-up logic - check what's missing
  const lastUserMessages = history.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase() + ' ' + lower

  // Try to build reply based on missing info
  if (!lastUserMessages.includes('name') && !inquiry.name) {
    // Assume if message has 2 words and no numbers, might be name? Simplified
    if (userMessage.split(' ').length <= 3 && !/\d/.test(userMessage) && userMessage.length < 30) {
      inquiry.name = userMessage
    }
  }

  return {
    reply: `Thanks! 😊\n\nTo confirm your order, I still need:\n${!inquiry.name ? '• Your name\n' : ''}${!inquiry.location && !inquiry.area ? '• Exact delivery location\n' : ''}${!inquiry.date ? '• Date (today/tomorrow?)\n' : ''}${!inquiry.time ? '• Time\n' : ''}${!inquiry.package ? '• Package preference (Classic/Premium/Double/Party)\n' : ''}\nCould you please share the missing details? Or type 'human' to speak with our team directly.`,
    inquiry,
    needsHuman: false,
    isComplete: false
  }
}

export function generateSummary(data: Partial<InquiryData>): string {
  return `
🔥 NEW SHEESHA ORDER INQUIRY 🔥
ID: ${data.id || 'N/A'}
Name: ${data.name || 'Not provided'}
Date: ${data.date || 'Not provided'}
Time: ${data.time || 'Not provided'}
Location: ${data.location || data.area || 'Not provided'}
Area: ${data.area || 'Not provided'}
Sheeshas: ${data.numberOfSheeshas || 'Not specified'}
Package: ${data.package || 'Not specified'}
Flavors: ${data.flavors?.join(', ') || 'Not specified'}
Special: ${data.specialRequirements || 'None'}
Status: ${data.isComplete ? '✅ Complete - Ready for confirmation' : '⏳ Collecting info'}
${data.needsHuman ? '⚠️ NEEDS HUMAN HANDOVER' : ''}
`.trim()
}
