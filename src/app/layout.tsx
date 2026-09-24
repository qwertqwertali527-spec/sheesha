import type { Metadata, Viewport } from 'next';
import './globals.css';
import { isPublicApproved } from '@/lib/config';

export function generateMetadata(): Metadata {
  const approved = isPublicApproved();
  return {
    ...(approved ? { metadataBase: new URL(process.env.SITE_URL!) } : {}),
    title: approved ? 'LAYALI | Thoughtfully arranged evenings in Dubai' : 'LAYALI | Concept Preview',
    description: 'A considered experience for an evening at home. Share an inquiry and let a real person review the details.',
    robots: { index: approved, follow: approved },
    ...(approved ? { openGraph: { title: 'LAYALI | Dubai', images: ['/hero-layali.jpg'] } } : {}),
  };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#10221f' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
