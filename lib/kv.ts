// lib/kv.ts
import { kv as vercelKv } from "@vercel/kv";
import { hasKV } from "../lib/env";

const memory = new Map<string, string>();

export const kv = {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (hasKV()) {
      // @ts-ignore types di @vercel/kv accettano any
      return await vercelKv.get<T>(key);
    }
    const raw = memory.get(key);
    if (raw == null) return null;
    try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
  },

  async set<T = unknown>(key: string, value: T): Promise<void> {
    if (hasKV()) {
      // @ts-ignore
      await vercelKv.set(key, value);
      return;
    }
    memory.set(key, JSON.stringify(value));
  },

  async del(key: string): Promise<void> {
    if (hasKV()) {
      // @ts-ignore
      await vercelKv.del(key);
      return;
    }
    memory.delete(key);
  },
};
