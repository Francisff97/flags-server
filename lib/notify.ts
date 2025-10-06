// lib/notify.ts
import crypto from "crypto";

function resolveRefreshUrl(): string | null {
  // 1) esplicita
  if (process.env.PLATFORM_REFRESH_URL) return process.env.PLATFORM_REFRESH_URL;

  // 2) base URL esplicita
  if (process.env.PLATFORM_URL) return `${process.env.PLATFORM_URL.replace(/\/+$/,'')}/api/flags/refresh`;

  // 3) Vercel URL auto
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/+$/,'')}/api/flags/refresh`;

  return null;
}

function getSigningSecret(): string {
  // accetta sia il nome usato dalla Platform sia quello del flags-server
  return process.env.FLAGS_SIGNING_SECRET
      || process.env.FLAGS_SHARED_SECRET
      || "";
}

export async function notifyPlatformRefresh(slug: string): Promise<boolean> {
  const url = resolveRefreshUrl();
  const secret = getSigningSecret();
  if (!url || !secret) {
    console.warn("[notifyPlatformRefresh] missing url or secret", { url: !!url, secret: !!secret });
    return false;
  }

  const body = JSON.stringify({ slug });
  const sig = crypto.createHmac("sha256", secret).update(body, "utf8").digest("hex");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Signature": sig,
      },
      body, // IMPORTANTISSIMO: la stessa stringa usata per l'HMAC
      // N.B. niente re-stringify, niente trasformazioni
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[notifyPlatformRefresh] not ok", res.status, text);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[notifyPlatformRefresh] error", (err as Error)?.message || err);
    return false;
  }
}
