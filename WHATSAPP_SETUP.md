# WhatsApp Cloud API Setup Guide

This guide explains how to setup official WhatsApp Business Cloud API for the Sheesha Delivery website.

## Overview

The website has two WhatsApp modes:

1. **Website → wa.me links (No API needed)** - Works immediately. Customer clicks button, opens WhatsApp with prefilled message to your number. You reply manually.
2. **AI Automation (Needs Cloud API)** - Customer messages your business number, AI auto-replies, collects order details, notifies you. Requires Meta setup.

MVP works with mode 1 instantly. Mode 2 adds AI magic.

## Mode 1: Instant Setup (No Code, 5 minutes)

1. Get a WhatsApp Business number (your existing number can be converted)
2. Set env var `NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567` (without +)
3. Deploy website
4. All "Order on WhatsApp" buttons will open `https://wa.me/971501234567?text=Hi%20I%20need%20...`
5. You receive messages in regular WhatsApp Business app and reply manually

**That's it for MVP launch!** AI widget on website still works with OpenAI even without WhatsApp API.

## Mode 2: Full AI Automation (30-60 minutes setup)

### Step 1: Create Meta Developer Account

1. Go to https://developers.facebook.com/
2. Login with Facebook account
3. Create App: Type = Business, Name = "Sheesha Delivery"

### Step 2: Add WhatsApp Product

1. In app dashboard, left sidebar → Add Product → WhatsApp → Set up
2. You'll get temporary access token and phone number ID for testing

### Step 3: Get Credentials

In WhatsApp → API Setup:

- **Phone Number ID**: e.g., `123456789012345` (copy)
- **WhatsApp Business Account ID**: e.g., `987654321098765`
- **Access Token**: Temporary token (valid 24h) - for production, create System User token (permanent)

For permanent token:
1. Business Settings → System Users → Create System User (Admin)
2. Add Assets → Assign WhatsApp Business Account
3. Generate Token → Select `whatsapp_business_messaging`, `whatsapp_business_management`
4. Copy token (starts with EAA...)

### Step 4: Setup Webhook

1. In WhatsApp → Configuration → Webhook → Edit
2. Callback URL: `https://yourdomain.com/api/webhook/whatsapp`
   - For testing locally: Use ngrok `ngrok http 3000` → https URL
3. Verify Token: `sheesha_verify_2024` (or your custom from .env)
4. Click Verify and Save (our GET endpoint will respond with challenge)
5. Subscribe to webhook fields: `messages`

### Step 5: Set Environment Variables

In Vercel or .env.local:

```
WHATSAPP_TOKEN=EAA... (your permanent token)
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=sheesha_verify_2024
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765
BUSINESS_WHATSAPP_NUMBER=9715XXXXXXXX (your personal number to receive order summaries)
OPENAI_API_KEY=sk-...
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567 (public business number)
```

### Step 6: Test

1. Send WhatsApp message to your business number from personal phone
2. Check Vercel logs: should see "Incoming WhatsApp from ..."
3. AI should auto-reply
4. Check admin panel `/admin` → inquiries should appear
5. Business number should receive summary if order complete

### Step 7: Go Live (Production)

- For testing, Meta allows 5 numbers. To go live:
1. Business Verification: Business Settings → Business Info → Verification (may need trade license)
2. Add real phone number: WhatsApp → Phone Numbers → Add phone number (you'll need to verify via OTP)
3. Once verified, webhook will work for all customers

## Webhook Details

### Verification (GET)

Meta sends:
```
GET /api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=sheesha_verify_2024&hub.challenge=12345
```

Our code checks token and returns challenge.

### Receiving Messages (POST)

Meta sends:
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "9715xxxxxxx",
          "text": { "body": "Hi I need 2 sheeshas" },
          "id": "wamid.xxx"
        }],
        "contacts": [{ "profile": { "name": "Ahmed" } }]
      }
    }]
  }]
}
```

Our code parses, processes with AI, replies via Graph API.

### Sending Messages

```js
POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
Headers: Authorization: Bearer {TOKEN}
Body: { messaging_product: "whatsapp", to: "9715xxx", type: "text", text: { body: "Hello!" } }
```

## Troubleshooting

- **Webhook not verifying**: Check VERIFY_TOKEN matches env, URL is https and publicly accessible
- **Messages not received**: Check subscribed to `messages` field, phone number is in allowed list (if not verified business)
- **AI not replying**: Check OPENAI_API_KEY set, check logs for errors, fallback rule-based should still work
- **Token expired**: Temporary tokens expire in 24h, use System User token
- **Free tier limits**: 1000 conversations/month free, then pay per conversation

## Costs

- WhatsApp Cloud API: Free 1000 conversations/month, then ~$0.05 per conversation (Dubai pricing)
- No monthly fee from Meta
- Only pay for conversations beyond free tier

## Alternative: Use Third-Party (If Meta setup too complex)

If you want faster setup without Meta Business Manager:

- **Twilio WhatsApp API**: $0.005 per message, easy setup, but monthly cost
- **WATI, Interakt, Respond.io**: WhatsApp inbox + API, $40-100/month, includes dashboard
- **Our code supports any**: Just change `sendWhatsAppMessage` function to use their API

But official Cloud API is recommended for compliance and cost.

## Security

- Never commit token to git (use env)
- Use strong VERIFY_TOKEN (random string)
- Validate webhook signature (optional enhancement - check Meta docs for X-Hub-Signature)
- Rate limit webhook (add in future)

## Testing Without Real WhatsApp

Use website widget at bottom-right corner:

- Same AI backend as WhatsApp
- No Meta setup needed
- Test order flow: "Hi I need 2 sheeshas in Marina tonight 9pm"
- See if AI collects all fields
- Check /admin for inquiry

This widget can be used as primary chat if you prefer website chat over WhatsApp initially.

## Compliance

- Only send messages to users who messaged you first (24h window)
- For notifications outside 24h, use template messages (need approval from Meta)
- Don't spam, don't send promotional without opt-in
- Include opt-out option
- Our AI never sends unsolicited messages, only replies

## Next Steps After Setup

1. Create template messages for order confirmation (optional)
2. Setup automated summary to your personal WhatsApp (BUSINESS_WHATSAPP_NUMBER)
3. Train staff to check /admin panel
4. Test handover: type "human" in WhatsApp, should notify team
