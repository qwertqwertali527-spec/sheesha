import type { MetadataRoute } from 'next';
import { isPublicApproved } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return { rules: isPublicApproved() ? { userAgent: '*', allow: '/' } : { userAgent: '*', disallow: '/' } };
}
