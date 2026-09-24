# Dubai Sheesha Delivery - Premium Website + WhatsApp AI Automation

> Dubai's most trusted luxury sheesha home delivery - Website + WhatsApp AI Assistant + Advanced Business Platform

**Reference:** https://shishadelivery.ae - Modern AI version built in 1 day, Phase 2 advanced features in 2nd day

**Version:** 2.0.0 - Phase 2 Complete

## 🌟 Live Features

### Phase 1 (MVP)
- Premium Website - Luxury dark + gold design, fully responsive
- WhatsApp Integration - wa.me links + official WhatsApp Cloud API webhook
- AI Assistant - GPT-4o-mini that collects: name, date, time, location, number of sheeshas, package, flavors, special requirements
- Human Handover - Auto transfer when customer asks human, complex request, payment issue
- Admin Panel - /admin to view inquiries, edit packages, prices, FAQs, business info

### Phase 2 (Advanced) - NEW ✨
- Advanced AI Knowledge Base (RAG) - Semantic search, embeddings, context-aware answers
- Online Booking System - 3-step calendar wizard for future scheduling
- Payment Integration - Cash, Card on Delivery, Stripe, PayTabs, Bank Transfer + coupon support
- Customer Database & CRM - Auto-create customers, track orders, spent, tags, notes
- Analytics Dashboard - KPIs, revenue charts, peak hours, top areas/packages, AI insights (Recharts)
- Promotions & Coupons - Create coupons (WELCOME20, RAMADAN25, PARTY50), banner on homepage, validation API
- Automated Follow-ups - Detect 24h old completed orders, send feedback request + coupon via WhatsApp
- Advanced Admin - 9 tabs: Analytics, Orders, Bookings, CRM, Promotions, Follow-ups, Packages, Business, FAQs
- Language Toggle - EN/AR placeholder (Phase 2)
- Prisma Schema - Ready for PostgreSQL (Supabase) migration

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run dev
# Open http://localhost:3000
# Admin: http://localhost:3000/admin (default password: admin123)
```

## 📂 Project Structure

```
app/page.tsx - Main website (Hero, Promotions, Packages, Booking, Flavors, Areas, FAQ)
app/admin/page.tsx - Advanced admin (9 tabs)
app/api/ - chat, webhook/whatsapp, bookings, promotions, analytics, customers, followups, inquiries, admin

components/ - Header, Hero, Packages, FlavorsAreas, HowItWorksFAQ, Footer, WhatsAppWidget, BookingCalendar, PaymentOptions, AnalyticsDashboard, PromotionsBanner, LanguageToggle

lib/ - knowledge, knowledge-advanced (RAG), ai-assistant, whatsapp, storage, db (Prisma+JSON), payment, utils

prisma/schema.prisma - Customer, Inquiry, Booking, Promotion, etc.

data/ - knowledge.json, customers.json, promotions.json, bookings.json, analytics.json, inquiries.json, conversations.json
```

## 🚢 Deployment

See DEPLOYMENT.md - 10 minutes to live on Vercel

## 📖 Documentation

- PLAN.md, TECH_STACK.md, WHATSAPP_SETUP.md, DEPLOYMENT.md, REPORT.md, PHASE2_REPORT.md, CLIENT_PROPOSAL.md, FINAL_SUMMARY.md

---

Built with ❤️ for Dubai - Premium Sheesha Delivery in 45 mins - Now with full business platform
