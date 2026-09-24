# Dubai sheesha delivery — MVP scope, stack and prerequisites

**Status:** scope and launch plan accompanying a working **internal concept preview**, not a public business launch or a legal opinion. Prepared 24 September 2026. The client owns all accounts and approves all business claims. The current implementation is documented in [README.md](./README.md); this scope is not a promise that a tobacco-related WhatsApp flow can be launched.

## 1. Decision before development: what exactly is being offered?

The reference supplied is **shishadelivery.ae** (not necessarily `sheeshadelivery.ae`). It shows shisha home delivery, flavours, party packages and WhatsApp ordering. It is a reference for page structure only: do not copy its branding, photographs, prices, product descriptions or phone number, and do not assume its implementation is compliant or approved.

**Hard platform gate.** Meta's WhatsApp Business Messaging Policy currently lists **alcohol and tobacco** as restricted goods/services for buying, selling, promoting or facilitating exchange. Its published limited Platform exceptions name certain other verticals and countries, but **do not include a tobacco exception**; the WhatsApp Business App is not an alternative for messaging about regulated verticals. An official Cloud API account, a third-party BSP, a simple `wa.me` link or an age checkbox does **not** remove this restriction. Therefore the advertised **Website → WhatsApp → AI → shisha inquiry/order** is **not an unconditional or presently supportable launch commitment** for a tobacco-related offering. No tobacco-related WhatsApp ordering, lead collection, promotion, catalog or payment flow should be activated without written confirmation from Meta that the *specific use case* is allowed. [1](https://whatsappbusiness.com/policy/)

**Local-law gate.** UAE tobacco law prohibits sales to under-18s, restricts advertising/promotion, and limits the display and sale of tobacco products to licensed designated places. A UAE/Dubai-qualified adviser must confirm whether the actual inventory, home delivery, online site, content, age-check procedure and proposed inquiry channels are permitted under the applicable licence(s). Do not assume that a trade licence, an age gate or a competitor's website settles this question. [2](https://uaelegislation.gov.ae/en/legislations/1206) [1](https://u.ae/en/information-and-services/health-and-fitness/tobacco-provisions)

**Go/no-go outcomes:**

| Outcome | What can ship |
| --- | --- |
| Tobacco-related delivery; no written legal and Meta clearance | Internal staging demo using fictional, non-tobacco data only. **No public promotional site or WhatsApp ordering/AI integration.** |
| Legal review authorizes a specific website/inquiry flow but WhatsApp remains prohibited | Only the specifically approved public content and **first-party website inquiry** flow; staff handles follow-up via a separately approved channel. No WhatsApp CTA, chat, bot or prefilled order link. |
| Genuinely non-regulated service (for example, separately verified equipment-only hire), approved local-law position, and written Meta determination if the classification is ambiguous | Website plus the official WhatsApp Cloud API flow described below, subject to account approval and platform terms. Do not disguise tobacco sales as equipment hire. |

The rest of this document describes the **target functionality**, subject to those gates. If either authority refuses permission, remove the affected features rather than routing around their policies.

## 2. Phase 1: fixed-boundary MVP

### A. Customer-facing website

- One responsive English-language site with sections/pages for **Home**, **approved services/packages**, **pricing or Request a Quote**, **approved delivery areas**, **How it works**, **FAQs**, **Contact**, **Privacy Policy** and legally required notices. Arabic copy is a separate optional addition unless supplied and agreed up front.
- Mobile-first layout tested at representative iPhone, Android, tablet and desktop sizes; accessible navigation, labelled controls, fast-loading assets, basic page titles/meta tags and HTTPS.
- Prominent **inquiry** CTA to the *approved* channel. An **Order on WhatsApp** CTA is behind a disabled-by-default feature flag and is shown only after the legal and Meta gates are satisfied. An inquiry is **not** a confirmed booking.
- Display only client-approved services, package inclusions, hours, areas and prices; otherwise display **Request a Quote**. No invented prices, reviews, photos, delivery guarantees or availability claims.
- A legally reviewed age/eligibility notice where required. Self-declaration on a website does not substitute for whatever identity/age verification the law requires at fulfilment.

### B. Inquiry and AI assistant

- Collect: **customer name; contact number or approved contact method; requested date; requested time in Asia/Dubai; exact delivery area/address; quantity; package/service; flavour/options if applicable; special requirements**. On WhatsApp (only if approved), the sender's number may supply the contact method; do not infer other fields from it.
- Parse a free-text request such as “2 sheeshas tonight in Dubai Marina at 9 PM,” normalize relative dates in **Dubai time**, retain uncertain values as `unknown`, and ask only for missing *required* information. Optional preferences can remain unanswered. Validate dates, time and quantity; never promise availability or a delivery time.
- Use the model for structured extraction and for phrasing a concise follow-up. Use deterministic required-field checks and explicit business data for answers. Do **not** let the model invent prices, service areas, business hours, offers, policies or confirmation/payment instructions. If no approved answer exists, escalate.
- Present a concise staff summary: known fields, missing fields, original message, contact method, Dubai-local requested time, handover reason and current status. Store the inquiry with a timestamp and a limited conversation history.
- Tell the customer they are speaking to an AI assistant (if deployed). Provide a clear human-contact option. If AI or a provider fails, preserve the inquiry and hand it to staff rather than silently dropping it.

### C. Human handover and operations

- Trigger human review for “speak to a person,” complex/unclear requests, unknown business answers, price/availability checks, booking confirmation, payment, safety/eligibility questions or any staff intervention. **The bot stops replying after handover** until staff explicitly resumes it.
- Password-protected staff inbox/dashboard: list, search and view inquiry/summary; statuses `new`, `needs_human`, `in_progress`, `closed`; assign/take over; record notes and status changes. Staff may reply on the same channel **only if that channel and activity are approved**; otherwise contact the customer through an approved route.
- Optional internal team email notification for new/handover inquiries, subject to the email provider's terms. No customer promotions or automated follow-ups in Phase 1.

### D. Business information management

- The current preview has an authenticated editor for **services, package descriptions, quote-only copy, illustrative areas, hours, FAQs and business contact details**. Changes take effect without a code deployment. Published prices, editable legal policies/booking rules and a staff audit-history interface require additional approved content and implementation.
- Phase 1 uses curated database records, **not a vector database/RAG system**. Staff must review content before publishing. The assistant only repeats stored FAQ answers; the editor does not by itself constitute legal approval.

### E. Approved WhatsApp adapter — conditional, not part of an unapproved launch

If, and only if, the specific use case is allowed and the client's WhatsApp Business Platform account is ready: use **Meta WhatsApp Cloud API** with verified webhook signatures, basic deduplication by message ID, server-only credentials, inbound message parsing, a 24-hour customer-service-window check and staff escalation. The current adapter is disabled, untested against a real Meta account and needs a durable retry queue before high-volume production use. Do not send outbound marketing or post-window messages without approved templates, valid opt-in and separately checked legal/platform permission. The Business App or unofficial WhatsApp automation is **not** a substitute. Meta's policy requires clear escalation paths and sets the 24-hour reply and template rules. [1](https://whatsappbusiness.com/policy/)

### F. Privacy and security baseline

- Published, lawyer-reviewed privacy notice and lawful basis/consent process for collecting names, phone numbers, addresses and chat content; explicit disclosures for AI/third-party processors where required. UAE personal-data law covers electronic processing and cross-border handling; have counsel review provider locations and data-processing agreements. [1](https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws)
- Admin authentication and least-privilege access; server-side API keys; HTTPS; input validation and basic rate limiting. **Before real-customer launch**, configure production backups, a shared rate limiter, a retention/deletion schedule and the client's support process. The preview has manual staff deletion but no scheduled purge. Do not request or store card numbers, financial details or full identity-document numbers in chat. Do not put customer data into analytics or public logs.
- Human-reviewed compliance copy and a documented manual age/eligibility verification process at fulfilment if required. Technical controls are not legal approval.

## 3. Recommended technical stack

| Layer | Phase 1 choice | Why |
| --- | --- | --- |
| Website + admin + API | **Next.js + TypeScript**, Node.js runtime, bespoke responsive CSS | One responsive application for pages, dashboard, intake and secure API routes; fast MVP deployment. |
| Hosting + HTTPS | **Vercel Pro** in a client-owned account | Commercial production deployment, preview environments, managed TLS. Replace with an approved UAE-region host if data-residency advice requires it. |
| Database + login | **Supabase Postgres** (Pro for production); local SQLite for the preview; server-side signed admin sessions with a strong password hash | Structured content, conversations and inquiry records; protected admin access. Supabase Auth/MFA can replace the single-admin login in a later hardening phase. No separate file storage purchase is needed for text-only MVP. |
| AI | **OpenAI API (`gpt-4.1-mini`)** with schema-validated JSON extraction; deterministic dialogue rules | Small, maintainable slot-filling flow; no hallucinated catalogue/availability; set spend limits. Alternative model only after agreeing cost and data terms. |
| Customer channel | **First-party web chat/form**, only if counsel approves that use; **Meta WhatsApp Cloud API** only after separate eligibility confirmation | Keeps the inquiry core separate from any prohibited channel. No scraping, personal-account bots or unofficial gateways. |
| Staff alert | Dashboard first; optional **Resend** for internal transactional email | Low-complexity handover without making email a dependency for every message. Check provider acceptable-use terms. |
| DNS | Client-owned registrar DNS (Cloudflare DNS optional) | Point the client's own domain at the approved deployment; TLS is supplied by the host. |

**Data flow when approved:** responsive site/approved channel → secure API/webhook → validated inquiry + approved content in Postgres → structured AI extraction and deterministic missing-field logic → staff summary + authenticated inbox → staff review/response. A disabled channel must not have a visible CTA or an active production webhook.

## 4. Owner purchases and prerequisites — before the 48-hour clock starts

| Owner to supply/provision | Required detail | Blocking for |
| --- | --- | --- |
| **Business and regulatory clearance** | Exact legal entity and Dubai licence/permits for the activity; written local-law advice on website advertising, online inquiries, home delivery, age/ID checks and permitted communication channels. | Any public launch involving regulated products. |
| **Platform clearance, if requesting WhatsApp** | Written Meta determination for the *actual* offering/use case if there is any doubt; approved Meta Business Portfolio/WABA, dedicated business number, approved display name and permissions. Account verification/number setup can take longer than 48 hours. | WhatsApp CTA, Cloud API bot and WhatsApp handover. |
| **Domain** | Register a domain the client owns (not the reference brand), grant DNS access or add DNS records yourself. | Branded production URL. |
| **Hosting** | Client-owned Vercel **Pro** (or legally approved alternative), invite developer to project; provide deploy permission. | Public deployment. |
| **Database/storage** | Client-owned Supabase **Pro** project, agreed region and retention/backups. Extra object storage only if later uploading media. | Production persistence and admin. |
| **AI billing** | Client-owned OpenAI API project with billing, spend cap, permitted data processing and a server-side key shared through secure secret management (not in chat or Git). | Live AI assistant. |
| **Optional alert email** | Owned sender domain/mailbox; optional Resend account and SPF/DKIM records. | Email alerts only; dashboard still works without it. |
| **Real business content** | Brand/logo and licensed imagery, approved services and package details, price/quote policy, hours, delivery areas, booking rules, FAQs, contact details and staff escalation number/email. **Do not use reference-site assets or prices.** | Accurate public copy and grounded AI answers. |
| **Legal/privacy text** | Approved privacy notice, terms/consumer notices, consent wording, age-verification instructions and data-retention period; approval for international processors if applicable. | Any real-customer data collection. |
| **Operations and sign-off** | Named staff contact(s) to receive inquiries, monitoring hours, who can quote/confirm, test cases and one decision-maker available during both days. | Handover and acceptance. |

Use account invitations and scoped access; the owner keeps ownership and pays providers directly. **Do not send passwords, Meta tokens, personal IDs or API keys in a proposal or chat.**

## 5. Timeline and acceptance

**Time zero** is when the required approvals, accounts, brand/content and decision-maker are available. Two days is a **conditional implementation target**, not a guarantee of regulator or Meta review time.

| Time | Deliverable |
| --- | --- |
| Gate 0 (before build) | Written decision on whether the product includes tobacco, whether a public site/web inquiry is lawful, and whether Meta explicitly permits the requested WhatsApp use. Freeze allowed channel and content. |
| Day 1 | Responsive site and approved copy, database schema, staff login/content editor, staging link. |
| Day 2 | Inquiry intake, slot-filling assistant, summary and handover inbox, mobile + end-to-end QA, deployment to client's domain **only if the launch gates passed**. Conditional Cloud API adapter tested only if Meta approval and account access were already complete. |

**Acceptance examples:**

1. On iPhone-, Android-, tablet- and desktop-sized viewports, pages work and every visible CTA opens only the approved channel.
2. For an approved test scenario, “2 [approved units] tonight, Dubai Marina, 9 PM” preserves quantity/area/time in Dubai time and asks only for missing required fields; it does not silently create a confirmed order or invent a price.
3. “Speak to a person” and unknown price/availability cause immediate `needs_human` status, a clear customer message, a staff-visible summary and **no further AI replies**.
4. Admin edits to an approved FAQ/service are reflected in subsequent answers; unapproved/deactivated facts are not used.
5. Authenticated staff can review and manage inquiries; unauthorized users cannot; duplicate webhook events (if WhatsApp is approved) do not create duplicate inquiries.
6. If a legal or platform gate is missing, the public tobacco/WhatsApp flow is **off**, not quietly replaced by an unofficial integration. Staging tests use fictional data.

**Not Phase 1:** checkout/payments, confirmed reservations, live inventory or delivery ETA, automated price calculation, advanced RAG, CRM sync, customer marketing, promotions, bulk outbound messaging, analytics dashboard, multilingual conversation support, mobile apps, and guaranteed Meta business verification. These require separate approval, scope, time and budget.

## 6. Ongoing costs and commercial boundary

These are **client-paid third-party costs**, not a developer fixed fee; indicative US-dollar list prices checked on 24 September 2026, before tax/overages and subject to change.

| Item | Planning budget / notes |
| --- | --- |
| Domain | Registrar's annual fee; depends on the chosen TLD. No domain has been purchased here. |
| Vercel Pro | From **US$20/month** for the first developer seat, plus usage. The free Hobby plan is for non-commercial use. [1](https://vercel.com/pricing) |
| Supabase Pro | From **US$25/month** for the production project, plus usage/extra resources. [1](https://supabase.com/pricing) |
| OpenAI API | Usage-based. `gpt-4.1-mini` lists **US$0.40 per million input tokens** and **US$1.60 per million output tokens** (standard text pricing); actual cost depends on message volume, token usage and model changes. [1](https://platform.openai.com/docs/models/gpt-4.1-mini) |
| Internal email (optional) | Resend Free has published volume limits; Pro starts at **US$20/month** if needed. Confirm its permitted use first. [1](https://resend.com/pricing) |
| WhatsApp (only if approved) | Meta Platform messaging is priced per delivered message/category/recipient market under its current pricing model; a BSP may add fees. Check the current official rate card and eligibility before budgeting. **Do not buy a BSP plan to bypass the policy.** [1](https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing/) |
| Legal/licensing | Client obtains a quote from local counsel/regulator; not included in hosting or development. |

**Indicative infrastructure floor:** approximately **US$45/month** for Vercel Pro + Supabase Pro, **plus** domain, AI usage, optional email, taxes and any approved messaging charges. If counsel requires a UAE-region hosting/database arrangement, reprice this stack before purchase. No extra “storage” product is needed for a text-only MVP.

**Development fixed fee:** **to be agreed, not invented here.** Quote Option A (legally approved website + web intake + AI + admin) and, only if permitted, Option B (Cloud API integration) separately after the gate decision and final content/requirements. The 48-hour delivery promise applies only to a funded, approved and fully provisioned scope; third-party approvals are outside the developer's control.

## 7. Decisions needed to finalize the statement of work

1. Does the offering contain tobacco, shisha tobacco, charcoal/flavours or only non-tobacco equipment/service? What exactly will be advertised, delivered and charged for?
2. Can a UAE/Dubai-qualified adviser provide written approval for this business's online marketing, intake and delivery model? If not, should we do **staging-only** until resolved?
3. Is there written Meta confirmation allowing this specific WhatsApp activity? If not, do you accept an approved web inquiry flow instead of WhatsApp for Phase 1?
4. What is the licensed company name, domain preference, actual packages/prices or quote-only choice, delivery areas, hours, language, privacy policy and staff escalation contact?
5. Who will own and fund the provider accounts, what is the target monthly budget, and who signs off the fixed development quote?

**Bottom line:** a fast technical prototype is feasible; a *compliant public tobacco sales website plus WhatsApp AI ordering flow within two days* must not be promised without the legal and platform decisions above.
