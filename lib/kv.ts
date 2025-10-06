export type Installation = {
  slug: string;
  name?: string;
  flags?: Record<string, any>;
  discord?: { guildId?: string; channelIds?: string[] };
  config?: Record<string, any>;
  updatedAt: number; // epoch ms
};

// Fallback in-memory. Se hai Redis/KV, sostituisci SOLO dentro get/upsert.
const mem = new Map<string, Installation>();

function mergeInstall(a: Installation, b: Partial<Installation>): Installation {
  return {
    ...a,
    ...b,
    flags: { ...(a.flags || {}), ...(b.flags || {}) },
    discord: {
      ...(a.discord || {}),
      ...(b.discord || {}),
      channelIds: b.discord?.channelIds ?? a.discord?.channelIds,
    },
    config: { ...(a.config || {}), ...(b.config || {}) },
    updatedAt: Date.now(),
  };
}

export async function getInstallation(slug: string): Promise<Installation | null> {
  const s = String(slug || "").trim();
  if (!s) return null;
  return mem.get(s) || null;
}

export async function upsertInstallation(
  slug: string,
  patch: Partial<Installation>
): Promise<Installation> {
  const s = String(slug || "").trim();
  if (!s) throw new Error("missing slug");
  const prev: Installation = mem.get(s) || { slug: s, updatedAt: Date.now() };
  const next = mergeInstall(prev, patch);
  mem.set(s, next);
  return next;
}
