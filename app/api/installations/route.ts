import { NextResponse } from 'next/server';
import { upsertInstallation, Installation } from '../../lib/kv';
import { verifyRequestSignature, verifyBearer } from '../../lib/sign';
import { kv } from '../../lib/kv';
export async function POST(req: Request) {
  const { ok, raw, clone } = await verifyRequestSignature(req, process.env.FLAGS_HMAC_SECRET);
  if (!ok) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });

  const data = await clone.json();
  const slug = String(data.slug || '').trim();
  if (!slug) return NextResponse.json({ error: 'missing_slug' }, { status: 422 });

  const payload: Partial<Installation> = {
    slug,
    name: data.name,
    flags: data.flags ?? {},
    discord: data.discord ?? {},
  };

  const saved = await upsertInstallation(slug, payload);
  return NextResponse.json({ ok: true, installation: saved });
}

export async function GET(req: Request) {
  if (!verifyBearer(req, process.env.BOT_ADMIN_TOKEN)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const keys = await kv.keys('i:*');
  const out: Installation[] = [];
  for (const k of keys) {
    const i = await kv.get<Installation>(k);
    if (i) out.push(i);
  }
  return NextResponse.json({ ok: true, installations: out });
}
