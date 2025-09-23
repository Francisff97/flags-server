import { NextResponse } from 'next/server';
import { getInstallation } from '@/lib/kv';

type Ctx = { params: { slug: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const inst = await getInstallation(params.slug);
  if (!inst) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(inst);
}