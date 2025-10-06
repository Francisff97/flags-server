import { NextResponse } from 'next/server';
import { getInstallation, upsertInstallation } from '@/lib/kv';
import { verifyRequestSignature } from '@/lib/sign';
import { notifyPlatformRefresh } from '@/lib/notify';

type Ctx = { params: { slug: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const inst = await getInstallation(params.slug);
  if (!inst) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ flags: inst.flags, updatedAt: inst.updatedAt });
}

export async function POST(req: Request, { params }: Ctx) {
  const { ok, raw, clone } = await verifyRequestSignature(req, process.env.FLAGS_HMAC_SECRET);
  if (!ok) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });

  const body = await clone.json();
  const flags = body.flags ?? {};
  const updated = await upsertInstallation(params.slug, { flags });
  // 🔔 notifica Platform (non blocca la response, e se fallisce logga)
+  notifyPlatformRefresh(params.slug).catch(() => {});
  return NextResponse.json({ ok: true, flags: updated.flags, updatedAt: updated.updatedAt });
}
