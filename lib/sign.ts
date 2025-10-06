// lib/sign.ts
import crypto from "crypto";
import { env } from "../lib/env";

export function signPayload(payload: unknown): string {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload ?? {});
  return crypto.createHmac("sha256", env.FLAGS_SHARED_SECRET || "")
               .update(body)
               .digest("hex");
}

export function verifySignature(payload: unknown, signature?: string | null): boolean {
  if (!env.FLAGS_SHARED_SECRET) return true; // per primo deploy senza env
  const expected = signPayload(payload);
  return signature === expected;
}
