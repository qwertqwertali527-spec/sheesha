import { HomePage } from '@/components/HomePage';
import { assistantMode, isPublicApproved, isWhatsAppEnabled } from '@/lib/config';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function Page() {
  const settings = await getStore().getSettings();
  return <HomePage
    settings={settings}
    approved={isPublicApproved()}
    whatsappEnabled={isWhatsAppEnabled()}
    whatsappNumber={isWhatsAppEnabled() ? process.env.WHATSAPP_PHONE_NUMBER ?? '' : ''}
    mode={assistantMode()}
    privacyUrl={isPublicApproved() ? process.env.PRIVACY_POLICY_URL ?? '/privacy' : '/privacy'}
  />;
}
