import crypto from 'crypto';

export function signBody(body: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

export async function verifyRequestSignature(req: Request, secret?: string) {
  if (!secret) return false;
  const sig = req.headers.get('x-signature') || '';
  const raw = await req.text();
  const expected = signBody(raw, secret);
  const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  const clone = new Request(req.url, { method: req.method, headers: req.headers, body: raw });
  return { ok, raw, clone };
}

export function verifyBearer(req: Request, token?: string) {
  const h = req.headers.get('authorization') || '';
  if (!token) return false;
  return h === `Bearer ${token}`;
}