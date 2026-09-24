import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminLogin } from '@/components/AdminLogin';
import { isAdmin } from '@/lib/auth';
import { isPublicApproved, isWhatsAppEnabled } from '@/lib/config';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminPage() {
  if (!await isAdmin()) return <AdminLogin />;
  const store = getStore();
  const [settings, inquiries] = await Promise.all([store.getSettings(), store.listInquiries()]);
  return <AdminDashboard initialSettings={settings} initialInquiries={inquiries} approved={isPublicApproved()} whatsappEnabled={isWhatsAppEnabled()} />;
}
