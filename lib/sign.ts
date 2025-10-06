import crypto from "crypto";

/** HMAC esadecimale del payload */
export function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

/** Confronto firma HMAC costante-time */
export function verifySignature(payload: string, signatureHex: string, secret: string): boolean {
  if (!secret || !signatureHex) return false;
  const expected = signPayload(payload, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHex));
  } catch {
    return false;
  }
}

/**
 * Verifica la richiesta firmata via header X-Signature.
 * Ritorna anche:
 *  - raw   : il body grezzo usato per la firma
 *  - clone : la Request clonata che puoi .json()-are
 */
export async function verifyRequestSignature(
  req: Request,
  secret?: string
): Promise<{ ok: boolean; raw: string; clone: Request }> {
  const sig =
    (req.headers.get("x-signature") || req.headers.get("X-Signature") || "").trim();
  const s = (
    secret ||
    process.env.FLAGS_HMAC_SECRET ||
    process.env.FLAGS_SIGNING_SECRET ||
    process.env.FLAGS_SHARED_SECRET ||
    ""
  ).trim();

  const clone = req.clone();
  const raw = await clone.text(); // IMPORTANTISSIMO

  const ok = !!s && verifySignature(raw, sig, s);
  return { ok, raw, clone };
}

/** Verifica Authorization: Bearer <token> */
export function verifyBearer(req: Request, token?: string): boolean {
  const header = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const want = (token || process.env.FLAGS_API_TOKEN || process.env.API_TOKEN || "").trim();
  if (!want) return false;
  const got = header.replace(/^Bearer\s+/i, "").trim();
  try {
    return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
  } catch {
    return false;
  }
}
