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
 * KV in-memory shim:
 * - get/set/del/keys
 * - pattern per keys() supporta solo prefisso tipo "i:*"
 *   (qualsiasi cosa prima di "*" è trattata come prefix)
 */
const __mem = new Map<string, string>();

export const kv = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = __mem.get(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
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

  async keys(pattern?: string): Promise<string[]> {
    const all = Array.from(__mem.keys());
    if (!pattern) return all;
    // supporto semplice: "<prefix>*"
    const star = pattern.indexOf('*');
    if (star === -1) {
      // pattern senza wildcard -> match esatto
      return all.filter((k) => k === pattern);
    }
    const prefix = pattern.slice(0, star);
    return all.filter((k) => k.startsWith(prefix));
  },
};

// === Helpers di alto livello ===
// NB: usiamo il PREFISSO "i:" per allinearci alla tua route che fa kv.keys('i:*')
const instKey = (slug: string) => `i:${String(slug || '').trim()}`;

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
