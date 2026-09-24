import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { isSameOrigin } from '@/lib/security';
import { getStore } from '@/lib/store';
import { adminUpdateSchema } from '@/lib/validation';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { id } = await context.params;
  try {
    const store = getStore();
    const inquiry = await store.getInquiry(id);
    if (!inquiry) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ inquiry, messages: await store.listMessages(id) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Could not load inquiry.' }, { status: 503 }); }
}

export async function PATCH(request: NextRequest, context: Context) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const { id } = await context.params;
  try {
    const parsed = adminUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid update.' }, { status: 400 });
    const store = getStore();
    if (!await store.getInquiry(id)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ inquiry: await store.updateInquiry(id, parsed.data) });
  } catch { return NextResponse.json({ error: 'Could not save update.' }, { status: 503 }); }
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const { id } = await context.params;
  try {
    const store = getStore();
    if (!await store.getInquiry(id)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    await store.deleteInquiry(id);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Could not delete inquiry.' }, { status: 503 }); }
}
