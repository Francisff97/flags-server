import { NextResponse } from 'next/server';
import { getInstallation, upsertInstallation } from '@/lib/kv';
import { verifyRequestSignature } from '@/lib/sign';

type Ctx = { params: { slug: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const inst = await getInstallation(params.slug);
  if (!inst) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ discord: inst.discord, updatedAt: inst.updatedAt });
}

export async function POST(req: Request, { params }: Ctx) {
  const { ok, raw, clone } = await verifyRequestSignature(req, process.env.FLAGS_HMAC_SECRET);
  if (!ok) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });

  const body = await clone.json();
  const discord = {
    guildId: body.guildId ?? undefined,
    channelIds: Array.isArray(body.channelIds) ? body.channelIds.map(String) : undefined,
  };
  const updated = await upsertInstallation(params.slug, { discord });
  return NextResponse.json({ ok: true, discord: updated.discord, updatedAt: updated.updatedAt });
}