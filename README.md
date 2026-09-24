# Dubai Sheesha Delivery - Premium Website + WhatsApp AI Automation

> Dubai's most trusted luxury sheesha home delivery - Website + WhatsApp AI Assistant that collects orders automatically

Reference: https://shishadelivery.ae - Modern AI version built in 1 day

## 🌟 Live Features

- **Premium Website** - Luxury dark + gold design, fully responsive, inspired by Dubai luxury market
- **WhatsApp Integration** - wa.me links + official WhatsApp Cloud API webhook
- **AI Assistant** - GPT-4o-mini that collects: name, date, time, location, number of sheeshas, package, flavors, special requirements
- **Human Handover** - Auto transfer when customer asks human, complex request, payment issue
- **Admin Panel** - /admin to view inquiries, edit packages, prices, FAQs, business info
- **Compliance** - 18+ only, licensed, UAE regulations, WhatsApp policy compliant

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run dev
# Open http://localhost:3000
# Admin: http://localhost:3000/admin (default password: admin123)
```

## 🔧 Environment Variables

```env
OPENAI_API_KEY=sk-...
WHATSAPP_TOKEN=EAA...
WHATSAPP_PHONE_NUMBER_ID=123...
WHATSAPP_VERIFY_TOKEN=sheesha_verify_2024
BUSINESS_WHATSAPP_NUMBER=9715XXXXXXXX
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567
```

See `.env.example` for full list.

## 📱 WhatsApp Setup

See `WHATSAPP_SETUP.md` for detailed guide.

**Quick MVP (No API needed):**
- Just set `NEXT_PUBLIC_WHATSAPP_NUMBER` - website will use wa.me links
- AI widget on website works with only OpenAI key

**Full AI Automation:**
- Setup Meta Developer App → WhatsApp Cloud API → Webhook
- Webhook URL: `https://yourdomain.com/api/webhook/whatsapp`
- Verify Token: `sheesha_verify_2024`

## 📂 Project Structure

```
app/
  page.tsx - Main website
  globals.css - Tailwind + custom styles
  layout.tsx - Metadata, fonts
  admin/page.tsx - Admin panel
  api/
    chat/route.ts - Website widget AI chat
    webhook/whatsapp/route.ts - WhatsApp Cloud API webhook
    inquiries/route.ts - Inquiries & knowledge API
    admin/route.ts - Admin auth & save

components/
  Header.tsx, Hero.tsx, Packages.tsx, FlavorsAreas.tsx, HowItWorksFAQ.tsx, Footer.tsx, WhatsAppWidget.tsx

lib/
  knowledge.ts - Knowledge base loader + system prompt
  ai-assistant.ts - OpenAI integration + rule-based fallback
  whatsapp.ts - WhatsApp sending + webhook parsing
  storage.ts - JSON file storage (conversations, inquiries)
  utils.ts - Helpers

data/
  knowledge.json - Editable business knowledge (packages, flavors, FAQs, etc.)
  inquiries.json - All customer inquiries
  conversations.json - WhatsApp conversation history

Documentation:
  PLAN.md - Full project plan with phases
  TECH_STACK.md - Tech stack explanation
  WHATSAPP_SETUP.md - WhatsApp Cloud API setup guide
  REPORT.md - What was done + what's missing (Arabic + English)
```

## 🎨 Design

- **Colors:** Black #0a0a0a, Zinc 900, Gold #d4af14 gradient, White
- **Fonts:** Inter (sans), Playfair Display (display)
- **Style:** Luxury, glass morphism, gold gradients, shimmer effects
- **Inspired by:** Dubai luxury, shishadelivery.ae but modern AI version

## 🤖 AI Assistant Flow

```
Customer: "Hi, I need 2 sheeshas tonight in Marina 9 PM"
→ AI extracts missing info
→ Asks name + exact location
→ Asks package + flavors
→ Confirms summary
→ Sends summary to business + saves to admin
→ Human handover if needed
```

## 📊 Admin Panel

- `/admin` - Password protected
- Tabs: Inquiries, Packages, Business Info, FAQs
- View/delete inquiries, reply on WhatsApp, edit knowledge base

## 🚢 Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add env vars
4. Deploy
5. Add custom domain
6. Setup WhatsApp webhook

## 📖 Documentation

- `PLAN.md` - Detailed plan, phases, deliverables
- `TECH_STACK.md` - Why this stack, costs, scalability
- `WHATSAPP_SETUP.md` - Step-by-step WhatsApp Cloud API setup
- `REPORT.md` - Completion report in Arabic + English

## 💰 Costs

- Domain: ~$10/year
- Vercel: $0-20/mo
- WhatsApp: Free 1000 convos, then ~$0.05/convo
- OpenAI: $10-30/mo for 1000 convos (gpt-4o-mini)
- Total: ~$20-50/mo

## ✅ Compliance

- 18+ only disclaimer
- Licensed service
- UAE tobacco regulations
- WhatsApp Business Policy (no spam, user-initiated only)
- Hygiene & sanitization mention

## 🔮 Phase 2 Ideas

- Prisma + Supabase PostgreSQL
- Payment integration (Stripe, PayTabs)
- Online booking calendar
- CRM & Analytics
- Promotions & follow-ups
- Multi-language (Arabic/English)
- Voice notes & location sharing

## 📞 Support

For setup help, see WHATSAPP_SETUP.md or check REPORT.md

---

Built with ❤️ for Dubai - Premium Sheesha Delivery in 45 mins
