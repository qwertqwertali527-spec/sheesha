import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    return NextResponse.json({ inquiries: await getStore().listInquiries() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Could not load inquiries.' }, { status: 503 }); }
}
