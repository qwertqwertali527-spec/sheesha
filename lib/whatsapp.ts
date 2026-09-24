interface WhatsAppMessage {
  to: string
  text: string
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneId) {
    console.log(`[MOCK WhatsApp] To ${to}: ${text}`)
    return true // mock success in dev
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('WhatsApp API error:', data)
      return false
    }
    console.log('WhatsApp sent:', data)
    return true
  } catch (error) {
    console.error('WhatsApp send failed:', error)
    return false
  }
}

export async function sendBusinessNotification(summary: string): Promise<boolean> {
  const businessNumber = process.env.BUSINESS_WHATSAPP_NUMBER
  if (!businessNumber) {
    console.log('[MOCK Business Notification]:', summary)
    return true
  }
  return sendWhatsAppMessage(businessNumber, summary)
}

export function parseWhatsAppWebhook(body: any) {
  try {
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (!messages || messages.length === 0) return null

    const message = messages[0]
    const from = message.from
    const text = message.text?.body || ''
    const id = message.id
    const timestamp = message.timestamp

    const contact = value.contacts?.[0]
    const name = contact?.profile?.name || 'Customer'

    return {
      from,
      text,
      id,
      timestamp,
      name,
      raw: message
    }
  } catch (e) {
    console.error('Parse webhook error', e)
    return null
  }
}
