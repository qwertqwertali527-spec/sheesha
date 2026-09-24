# Deployment Guide - 10 Minutes to Live

## Quick Deploy to Vercel (Recommended)

### 1. Push to GitHub (Already Done)
Branch `arena/01a0d520-sheesha` is pushed. Create PR or deploy directly from this branch.

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Import GitHub repo `qwertqwertali527-spec/sheesha`
3. Select branch `arena/01a0d520-sheesha`
4. Framework: Next.js (auto-detected)
5. Add Environment Variables (see below)
6. Deploy → Live in 2 minutes

### 3. Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables, add:

```
OPENAI_API_KEY=sk-proj-... (get from https://platform.openai.com/api-keys)
OPENAI_MODEL=gpt-4o-mini
WHATSAPP_TOKEN=EAA... (from Meta, see WHATSAPP_SETUP.md)
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=sheesha_verify_2024
WHATSAPP_BUSINESS_ACCOUNT_ID=...
BUSINESS_WHATSAPP_NUMBER=9715XXXXXXXX (your personal number for order summaries)
ADMIN_PASSWORD=choose_strong_password_123
NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567 (public business number with country code, no +)
NEXT_PUBLIC_BUSINESS_NAME=Dubai Sheesha Delivery
```

**Minimum for MVP launch (no WhatsApp API yet):**
```
OPENAI_API_KEY=sk-...
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567
```
Website will work with wa.me links + AI widget. WhatsApp automation needs full vars.

### 4. Add Domain

1. Vercel → Settings → Domains → Add `sheeshadelivery.ae` or your domain
2. Add DNS records as instructed (A or CNAME)
3. Wait 5-10 mins for propagation
4. SSL auto

### 5. Test Live

- Open https://yourdomain.com → should load luxury website
- Click WhatsApp button → should open wa.me with message
- Test AI widget bottom-right: type "Hi I need 2 sheeshas in Marina tonight 9pm"
- Check /admin → login → see inquiries

### 6. Setup WhatsApp Webhook (For AI Automation)

After domain is live:

1. Follow `WHATSAPP_SETUP.md` to create Meta App
2. In Meta Dashboard → WhatsApp → Configuration → Webhook
3. Callback URL: `https://yourdomain.com/api/webhook/whatsapp`
4. Verify Token: `sheesha_verify_2024` (must match env)
5. Subscribe to `messages`
6. Send test WhatsApp to business number → AI should auto-reply
7. Check Vercel logs for "Incoming WhatsApp"

## Alternative: Deploy to Hostinger / VPS

```bash
# On server
git clone https://github.com/qwertqwertali527-spec/sheesha.git
cd sheesha
git checkout arena/01a0d520-sheesha
npm install
cp .env.example .env.local
# Edit .env.local
npm run build
npm start
# Use PM2 for production
npm install -g pm2
pm2 start npm --name "sheesha" -- start
pm2 save
pm2 startup
```

Need Node.js 18+.

## Post-Deployment Checklist

- [ ] Website loads on mobile + desktop
- [ ] WhatsApp buttons work (wa.me)
- [ ] AI widget responds (test message)
- [ ] /admin login works
- [ ] Update packages/prices in admin if needed
- [ ] Update business phone number in env
- [ ] Test order flow end-to-end
- [ ] If using Cloud API: test real WhatsApp message
- [ ] Add Google Analytics (optional)
- [ ] Submit sitemap to Google Search Console

## Rollback

If something breaks:
- Vercel → Deployments → Previous deployment → Redeploy
- Or `git revert` and push

## Monitoring

- Vercel → Logs → Runtime logs (see WhatsApp webhook, AI errors)
- /admin → Inquiries (check if orders coming)
- OpenAI Dashboard → Usage (monitor costs)

## Costs After Deploy

- Vercel free tier: 100GB bandwidth, enough for MVP
- If >1000 orders/month, upgrade to Pro $20/mo
- OpenAI: Monitor at https://platform.openai.com/usage
- WhatsApp: Monitor at Meta Business Manager

## Support

If stuck:
1. Check Vercel logs
2. Check `REPORT.md` for what's missing
3. Check `WHATSAPP_SETUP.md` troubleshooting
4. Test locally first: `npm run dev`

---

**Estimated time from zero to live: 15 minutes (without WhatsApp Cloud API), 60 minutes (with AI automation)**
