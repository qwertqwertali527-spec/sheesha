# Tech Stack - Dubai Sheesha Delivery

## Overview
Modern, fast, AI-powered MVP built for 2-day timeline. No over-engineering.

## Frontend

### Next.js 14 (App Router)
- **Why:** Industry standard, fast, SEO-friendly, API routes built-in, easy deploy to Vercel
- **Features used:** App Router, API Routes, Server Components, Metadata API
- **Alternative considered:** Vite + Express (more setup, no SEO)

### Tailwind CSS 3.4
- **Why:** Fast styling, luxury design with custom gold palette, responsive out of box
- **Custom:** Gold gradient, charcoal, glass morphism, animations

### Lucide React
- **Why:** Lightweight, beautiful icons, tree-shakable
- **Used for:** All UI icons (Phone, MessageCircle, etc.)

### TypeScript
- **Why:** Type safety, better DX

## Backend

### Next.js API Routes (Node.js)
- **Endpoints:**
  - `/api/chat` - Website AI chat
  - `/api/webhook/whatsapp` - WhatsApp Cloud API webhook (GET verify, POST receive)
  - `/api/inquiries` - Get inquiries & knowledge
  - `/api/admin` - Admin auth & save knowledge

### File Storage (MVP)
- `data/knowledge.json` - Business knowledge base (editable via admin)
- `data/conversations.json` - WhatsApp conversation history (phone → messages[])
- `data/inquiries.json` - All inquiries array
- **Why MVP:** No DB setup needed, fast, easy to understand, easy to migrate
- **Production upgrade:** Prisma + PostgreSQL (Supabase) - 1 hour migration

### OpenAI SDK 4.52
- **Model:** `gpt-4o-mini` (default) - $0.15/1M input, $0.60/1M output, fast, good quality
- **Fallback:** `gpt-4o` for better quality, or `gpt-3.5-turbo` for cheaper
- **Alternative:** Claude 3.5 Sonnet (better but more expensive), Gemini Flash
- **Rule-based fallback:** If no OPENAI_API_KEY, uses regex + intent detection (works offline)

## WhatsApp

### WhatsApp Cloud API (Meta Graph API v18.0)
- **Why official:** Compliant, reliable, free tier, no third-party like Twilio (which costs)
- **Flow:**
  1. Customer sends message to business number
  2. Meta POSTs to webhook URL with message
  3. Our server processes with AI, replies via Graph API POST
  4. Message delivered to customer WhatsApp
- **Costs:** Free for first 1000 conversations/month, then ~$0.05/conversation (Meta pricing)
- **Setup needed:** Facebook Business Manager, WhatsApp Business Account, Phone Number ID, Access Token

### wa.me Links
- **Why:** Simplest integration for website → WhatsApp
- **Format:** `https://wa.me/971501234567?text=Hi%20I%20need%20...`
- **Works without API:** Even if Cloud API not setup, website still generates leads via direct WhatsApp

## AI Assistant

### Architecture
```
System Prompt (knowledge base + instructions)
+ Conversation History (last 10 messages)
+ User Message
→ OpenAI Chat Completion
→ Reply + Structured Data Extraction (second call)
```

### System Prompt Includes
- Business info, hours, areas, delivery fee
- All packages with prices & includes
- All flavors
- FAQs
- Policies
- How it works
- Instructions to collect 8 fields
- Handover triggers
- Anti-hallucination rules

### Data Extraction
- Second OpenAI call with extraction prompt
- Returns JSON: name, date, time, location, area, numberOfSheeshas, package, flavors, specialRequirements, isComplete, needsHuman, summary
- Fallback: regex extraction in rule-based mode

### Human Handover
- Detected if: customer says "human", "agent", "call me", complaint, payment issue, AI unsure
- Action: status=handover, notify business with ⚠️, message to customer "connecting to team"

## Admin

### Simple Auth
- Password in env `ADMIN_PASSWORD` (default admin123)
- Stored in localStorage for session
- No JWT for MVP (fast)
- Upgrade: NextAuth with email/password

### Features
- View inquiries (filter by status)
- Delete inquiry
- Reply on WhatsApp (wa.me link)
- Edit packages (name, price, duration, includes)
- Edit business info (name, phone, hours, areas)
- Edit FAQs
- Save to knowledge.json (immediate effect on AI)

## Hosting & Deployment

### Recommended: Vercel
- **Why:** Zero-config Next.js, env vars, serverless functions, free tier, global CDN
- **Deploy:** `git push` → auto deploy
- **Env vars:** Add in Vercel dashboard
- **Domain:** Add custom domain (sheeshadelivery.ae) with DNS

### Alternative: Any Node.js hosting
- Hostinger VPS, DigitalOcean, AWS EC2
- Need: Node 18+, npm, PM2 for process

### Environment Variables
```
OPENAI_API_KEY=sk-...
WHATSAPP_TOKEN=EAA...
WHATSAPP_PHONE_NUMBER_ID=123...
WHATSAPP_VERIFY_TOKEN=sheesha_verify_2024
WHATSAPP_BUSINESS_ACCOUNT_ID=...
BUSINESS_WHATSAPP_NUMBER=9715...
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567
```

## Costs (Monthly Estimate)

- Domain: $10/year (AED 40)
- Hosting Vercel: $0-20 (free tier enough for MVP)
- WhatsApp Cloud API: $0 for 1000 conversations, then ~$20 for 2000 more
- OpenAI: $10-30 for 1000 conversations (gpt-4o-mini)
- Total MVP: ~$20-50/month + domain

## Security & Compliance

- No sensitive data in repo (.env.example only)
- .gitignore for data/*.json (conversations)
- 18+ disclaimer, licensed service notice
- WhatsApp policy compliant (user-initiated only)
- Sanitization mentioned

## Scalability Path

- **0-100 orders/day:** Current JSON storage OK
- **100-1000/day:** Migrate to Supabase PostgreSQL + Prisma (1 hour)
- **1000+/day:** Add Redis for conversation cache, queue for WhatsApp sending, load balancer

## Why This Stack for 2-Day MVP?

- No over-engineering (no Docker, no microservices, no complex DB)
- Single Next.js app does frontend + backend
- Tailwind fast styling vs custom CSS
- OpenAI easy integration vs building own LLM
- WhatsApp Cloud API official vs Twilio cost
- File storage vs DB setup time
- Works offline (rule-based fallback) even without OpenAI key

## Future Tech Additions

- Prisma + Supabase PostgreSQL
- NextAuth for admin
- Stripe / PayTabs for payment
- Upstash Redis for cache
- Vercel Analytics
- Sentry for error tracking
- Resend for email notifications
