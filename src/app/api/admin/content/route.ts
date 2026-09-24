import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { isSameOrigin } from '@/lib/security';
import { getStore } from '@/lib/store';
import { settingsSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    return NextResponse.json({ settings: await getStore().getSettings() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Could not load content.' }, { status: 503 }); }
}

export async function PATCH(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  try {
    const parsed = settingsSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Please check the content fields and lengths.' }, { status: 400 });
    return NextResponse.json({ settings: await getStore().saveSettings(parsed.data) });
  } catch { return NextResponse.json({ error: 'Could not save content.' }, { status: 503 }); }
}
