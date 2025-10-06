// lib/kv.ts

export type Installation = {
  slug: string;
  name?: string;
  flags?: Record<string, any>;
  discord?: { guildId?: string; channelIds?: string[] };
  config?: Record<string, any>;
  updatedAt: number; // epoch ms
};

/**
 * SHIM KV in-memory. Se usi Redis/Vercel KV sostituisci qui dentro:
 *  - get:    return await redis.get(key)
 *  - set:    await redis.set(key, JSON.stringify(value))
 *  - del:    await redis.del(key)
 */
const __mem = new Map<string, string>();

export const kv = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = __mem.get(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // se hai salvato plain string
      return raw as unknown as T;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    __mem.set(key, raw);
  },

  async del(key: string): Promise<void> {
    __mem.delete(key);
  },
};

/** Helpers di alto livello (usano kv sotto) */
const instKey = (slug: string) => `installation:${slug}`;

export async function getInstallation(slug: string): Promise<Installation | null> {
  const s = String(slug || '').trim();
  if (!s) return null;
  return (await kv.get<Installation>(instKey(s))) || null;
}

export async function upsertInstallation(
  slug: string,
  patch: Partial<Installation>
): Promise<Installation> {
  const s = String(slug || '').trim();
  if (!s) throw new Error('missing slug');

  const prev =
    (await kv.get<Installation>(instKey(s))) || ({ slug: s, updatedAt: Date.now() } as Installation);

  const next: Installation = {
    ...prev,
    ...patch,
    flags: { ...(prev.flags || {}), ...(patch.flags || {}) },
    discord: {
      ...(prev.discord || {}),
      ...(patch.discord || {}),
      channelIds: patch.discord?.channelIds ?? prev.discord?.channelIds,
    },
    config: { ...(prev.config || {}), ...(patch.config || {}) },
    updatedAt: Date.now(),
  };

  await kv.set(instKey(s), next);
  return next;
}
