# Dubai Sheesha Delivery - Project Plan

## Reference
- Original: https://shishadelivery.ae / https://sheeshadelivery.ae
- Goal: Modern AI-powered version with WhatsApp automation
- Timeline: MVP in 2 days

## Phase 1 - MVP (Within 2 Days) - ✅ COMPLETED

### 1.1 Professional Website
- [x] Clean, mobile-friendly, luxury dark theme with gold accents
- [x] Sections: Hero, Packages, Flavors, Delivery Areas, How It Works, FAQs, Contact
- [x] Strong WhatsApp / Order Now buttons (floating + header + hero + all packages)
- [x] iPhone, Android, tablet, desktop responsive
- [x] Premium design inspired by Dubai luxury market

**Tech:**
- Next.js 14 App Router
- Tailwind CSS with custom gold/charcoal palette
- Lucide Icons
- Fully responsive

### 1.2 WhatsApp Integration
- [x] WhatsApp Cloud API webhook implementation
- [x] wa.me deep links with prefilled messages
- [x] Website widget that mimics WhatsApp chat
- [x] Business notification for new inquiries

**Endpoints:**
- `GET /api/webhook/whatsapp` - Verification (hub.challenge)
- `POST /api/webhook/whatsapp` - Receive messages, process AI, reply
- `POST /api/chat` - Website widget chat API

### 1.3 AI WhatsApp Assistant
- [x] OpenAI GPT-4o-mini integration with fallback rule-based
- [x] System prompt with full knowledge base (services, packages, prices, areas, hours, FAQs, policies)
- [x] Collects: name, date, time, location, number of sheeshas, package/service, flavour, special requirements
- [x] Asks only missing info, conversational
- [x] Creates clear inquiry summary for business team
- [x] Knowledge base in `data/knowledge.json` editable via admin

**AI Flow:**
```
Customer: "Hi, I need 2 sheeshas tonight in Marina 9 PM"
→ AI extracts: number=2, date=today, time=9 PM, area=Marina
→ AI asks: name + exact location
→ Customer provides
→ AI asks: package + flavor
→ Customer provides
→ AI confirms summary + asks confirmation
→ On complete: summary sent to business WhatsApp + saved to inquiries
```

### 1.4 Human Handover
- [x] Triggers: "human", "agent", "speak to someone", "call me", complex request, payment issue, complaint, AI cannot answer
- [x] Message: "Let me connect you with our team member..."
- [x] Status = handover, notification to business with ⚠️ flag
- [x] Admin panel shows handover needed

### 1.5 AI Knowledge
- [x] `data/knowledge.json` contains:
  - Business info (name, tagline, hours, phone, areas, delivery fee)
  - Services (4 types)
  - Packages (5 packages with pricing)
  - Flavors (15 flavors)
  - FAQs (8 Q&A)
  - Policies (age, cancellation, hygiene, legal)
  - How it works (4 steps)
- [x] `lib/knowledge.ts` loads and provides system prompt
- [x] Admin can update via /admin panel

### 1.6 Simple Admin / Management
- [x] `/admin` page with password protection (env ADMIN_PASSWORD)
- [x] Tabs: Inquiries, Packages & Pricing, Business Info, FAQs
- [x] View all inquiries with status, delete, reply on WhatsApp link
- [x] Edit packages, business info, FAQs, save to knowledge.json
- [x] No complex enterprise system - fast and reliable

### 1.7 Today's AI Approach
- [x] OpenAI GPT-4o-mini (cheap, fast, good)
- [x] WhatsApp Cloud API (official, compliant)
- [x] Webhooks
- [x] Backend APIs (Next.js API routes)
- [x] File-based storage for MVP (data/conversations.json, data/inquiries.json)
- [x] RAG-like knowledge injection via system prompt

**Architecture:**
```
Website (Next.js) → WhatsApp Button → wa.me or Widget
Widget → /api/chat → lib/ai-assistant.ts → OpenAI + knowledge → reply
WhatsApp Cloud → /api/webhook/whatsapp → parse → processMessage → send reply via Graph API → notify business
Admin → /admin → /api/admin + /api/inquiries → edit knowledge.json + view inquiries
```

## Phase 2 - After Launch (Future)

### 2.1 Advanced Features
- [ ] Database migration: Prisma + PostgreSQL (Supabase) instead of JSON files
- [ ] User authentication for admin (NextAuth)
- [ ] Advanced AI knowledge base with embeddings (RAG)
- [ ] Online booking calendar
- [ ] Payment integration (Stripe, PayTabs, Telr for UAE)
- [ ] Customer database & CRM
- [ ] Analytics dashboard (orders, conversion, peak hours)
- [ ] Promotions & coupon system
- [ ] Automated follow-ups (24h later "How was your experience?")
- [ ] Multi-language (Arabic + English toggle)
- [ ] Voice notes support on WhatsApp
- [ ] Image support (customer sends location pin, menu)
- [ ] Staff dashboard with assignment

### 2.2 WhatsApp Enhancements
- [ ] Template messages (order confirmation, delivery tracking)
- [ ] Interactive buttons (Quick reply: "Classic", "Premium", "Double")
- [ ] List messages for packages/flavors
- [ ] Location sharing handling
- [ ] Typing indicators

### 2.3 Marketing
- [ ] SEO optimization
- [ ] Google My Business integration
- [ ] Instagram feed
- [ ] Referral system

## Tech Stack - Final

**Frontend:**
- Next.js 14.2.5 (App Router)
- React 18.3
- Tailwind CSS 3.4
- Lucide React icons
- TypeScript

**Backend:**
- Next.js API Routes
- OpenAI SDK 4.52 (GPT-4o-mini)
- File storage (JSON) for MVP → Prisma + PostgreSQL for production

**WhatsApp:**
- WhatsApp Cloud API (Meta Graph API v18.0)
- Webhook verification
- Message sending via Graph API

**AI:**
- OpenAI GPT-4o-mini (or GPT-4o for better quality)
- System prompt with full business context
- Rule-based fallback if no API key

**Hosting:**
- Vercel (recommended) or any Node.js hosting
- Environment variables for secrets

**Domain & Prerequisites (Client to Buy):**
1. Domain: e.g., sheeshadelivery.ae (AED 50-100/year)
2. Hosting: Vercel Pro ($20/mo) or Hostinger VPS
3. WhatsApp Cloud API: Free (Meta) - need Facebook Business Manager
4. OpenAI API: ~$10-30/month for 1000 conversations (GPT-4o-mini)
5. Phone number for WhatsApp Business (can use existing)

## Compliance

- UAE tobacco law: 18+ only, disclaimer in footer
- WhatsApp Business Policy: No spam, only user-initiated, template for notifications
- Dubai Municipality hygiene: Mention sanitized equipment
- Privacy: No personal data shared, GDPR-like minimal storage

## Deliverables Checklist

- [x] Website live-ready (npm run build)
- [x] WhatsApp webhook working
- [x] AI assistant working (website widget + WhatsApp)
- [x] Admin panel working
- [x] Documentation (PLAN.md, REPORT.md, TECH_STACK.md, WHATSAPP_SETUP.md)
- [x] .env.example
- [x] Responsive design
- [x] Git repo pushed

## How to Run Locally

```bash
npm install
cp .env.example .env.local
# Fill OPENAI_API_KEY, WHATSAPP_*, ADMIN_PASSWORD
npm run dev
# Open http://localhost:3000
# Admin: http://localhost:3000/admin
```

## Deployment Steps (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add env vars
4. Deploy
5. Setup WhatsApp webhook URL: https://yourdomain.com/api/webhook/whatsapp
6. Verify token: sheesha_verify_2024 (or custom)
7. Test with WhatsApp

## Time Spent

- Scaffolding + Design System: 2h
- Website Frontend: 4h
- AI Assistant + Knowledge: 3h
- WhatsApp Integration: 2h
- Admin Panel: 2h
- Documentation + Polish: 1h
Total: ~14h for MVP (1 day with AI assistance)
