# LAYALI — Dubai evening-service concept

A working **internal MVP preview** of a responsive Dubai website, guided inquiry assistant, staff inbox/human handover and editable business knowledge. The LAYALI brand, imagery and copy are original **placeholder concept material**; they are not the client's verified business details. No real orders, prices or availability are confirmed.

> **Important:** WhatsApp messaging for shisha/tobacco is **not live**. Meta's current WhatsApp Business policy restricts tobacco-related buying/selling/promotion/facilitation and lists no tobacco exception. A Cloud API account, third-party provider or `wa.me` button is not a workaround. The WhatsApp adapter in this repository is **disabled by default and guarded for a separately cleared, genuinely non-regulated use case only**. UAE/Dubai legal advice is also required before public marketing, online inquiries or delivery for regulated products. [1](https://whatsappbusiness.com/policy/) [2](https://uaelegislation.gov.ae/en/legislations/1206)

See [PROJECT_SCOPE.md](./PROJECT_SCOPE.md) for the client-facing scope, decision gates, costs and prerequisites.

## What works now

- Original mobile-friendly landing page with Home, concept services, quote-only approach, indicative areas, process, FAQ, contact and age notice.
- Website inquiry chat: extracts date/time in **Asia/Dubai**, location, number of units and optional preferences; asks for missing required fields; saves a structured inquiry.
- Human handover on a human request, unknown question, price, availability, payment or confirmation. The bot stops after handover. The staff dashboard can review, copy a summary, reply on web chat, change status, add notes and delete an inquiry. Visitors can start a separate inquiry after a handover.
- Password-protected content editor for homepage text, illustrative services, FAQs, areas, hours and contact details. The assistant answers only from curated FAQs; it never generates a price or confirms a booking.
- Local guided-demo parser works without external keys. Add an **OpenAI API key** to enable schema-validated AI extraction after the visitor's consent; no key is present in this repository.
- Optional server-side Supabase Postgres adapter and **conditional** signed Meta Cloud API webhook/outbound adapter. WhatsApp endpoints return 404 until all policy gates and owner-owned credentials are configured.
- Noindex/robots block until a legal-approval switch, an HTTPS privacy policy and a canonical domain are provided.

## Run the preview

Requires Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
# Set ADMIN_USERNAME, ADMIN_PASSWORD (development only), and a random
# ADMIN_SESSION_SECRET of at least 32 characters in .env.local.
npm run dev
```

Open the website at `http://localhost:3000` and the staff portal at `http://localhost:3000/admin`. In Arena, the running dev process is also exposed as a **live preview**. Use fictional details in the assistant. The local demo stores data in `.data/layali.sqlite` (ignored by Git). The `.env.local` file is ignored by Git; never commit keys or share them in chat.

```bash
npm test       # state machine, parsing, handover and webhook-signature tests
npm run lint   # TypeScript check
npm run build  # production build
npm run hash-password -- 'a strong production password'
```

For production, use `ADMIN_PASSWORD_HASH` from the last command; a plaintext `ADMIN_PASSWORD` is accepted in development only.

## Production preparation (owner-owned accounts)

1. **Decide the actual offering.** Obtain written UAE/Dubai legal advice on its licence, website, advertising, delivery, age/ID checks and permitted intake channels. A tobacco-related WhatsApp sales/inquiry flow cannot simply be switched on. Obtain a written Meta determination if a separate, genuinely non-regulated equipment-only service is proposed and classification is ambiguous.
2. Supply client-approved business name, logo rights, original imagery, actual services, package terms, prices or quote-only policy, coverage, hours, escalation staff, and a lawyer-approved privacy policy. Replace all illustrative LAYALI content. The default `privacy` page is **only a demo note**, not a production policy.
3. Buy/own a domain and commercial host (**Vercel Pro** is the suggested option). Create a client-owned **Supabase Pro** project in a legally suitable region and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL editor. Set `SUPABASE_URL` and the **server-only** `SUPABASE_SERVICE_ROLE_KEY` in the host's secret manager. The local SQLite file is development-only; the app fails closed without Supabase in production.
4. Create a client-owned OpenAI API project if real AI extraction is desired; set `OPENAI_API_KEY` server-side and review provider data terms/cross-border processing. Without it, the app transparently stays in guided-demo mode. Optional `RESEND_API_KEY`, `TEAM_EMAIL` and `NOTIFICATION_FROM_EMAIL` enable internal alerts only.
5. Set a strong `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`. Configure a shared rate limiter/WAF and retention/backups before accepting real customers. The built-in rate limiter is per process only. Configure real staff coverage and a data deletion/retention procedure.
6. Only after written approval of the **specific** website activity and content, set `LEGAL_REVIEW_COMPLETED=true`, `SITE_PUBLIC_APPROVED=true`, `PRIVACY_POLICY_URL=https://...` and `SITE_URL=https://your-domain...`; then check the public site, search indexing and DNS/HTTPS. Those flags are an operational sign-off, **not** proof of legal compliance.
7. **WhatsApp is separate and conditional:** only for a genuinely non-regulated, explicitly cleared use case, set `SERVICE_CLASSIFICATION=non_regulated`, `WHATSAPP_USE_CASE_APPROVED=true` and the owner-owned Meta Business/Cloud API number, token, app secret and verify token. The webhook URL is `/api/whatsapp/webhook`. It verifies signatures, deduplicates inbound event IDs, collects explicit age/privacy consent before AI processing, and limits manual replies to the inbound 24-hour window. **Do not set these flags for tobacco.** Add a durable webhook retry queue and test Meta account/number approval before treating this adapter as production-ready.

**Development storage:** Node's built-in SQLite. **Production storage:** Supabase Postgres with RLS denying browser access and service-role access from server routes only. **Frontend/backend:** Next.js 15, React 19, TypeScript, bespoke CSS. **AI:** optional OpenAI structured extraction plus deterministic guardrails. **Messaging:** first-party web chat; conditional official Cloud API adapter. No extra object-storage purchase is needed for this text-only MVP.

## Boundaries

This repository contains an end-to-end **website → web assistant → inquiry → staff handover** preview, not a live commercial launch. It does not include real business credentials, verified pricing/areas, checkout, payment, reservations, automated availability, customer campaigns, an approved public tobacco website or an active tobacco-related WhatsApp bot. External account approval and legal review cannot be completed by code. A 48-hour public release is conditional on those prerequisites being ready in advance.
