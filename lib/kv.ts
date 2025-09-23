import { kv } from '@vercel/kv';

export type Flags = {
  email_templates?: boolean;
  discord_integration?: boolean;
  tutorials?: boolean;
};

export type DiscordConf = {
  guildId?: string;
  channelIds?: string[];
};

export type Installation = {
  slug: string;
  name?: string;
  flags: Flags;
  discord: DiscordConf;
  updatedAt: string;
};

export const KV = kv;

export async function getInstallation(slug: string): Promise<Installation | null> {
  return (await KV.get<Installation>(`i:${slug}`)) ?? null;
}

export async function putInstallation(i: Installation) {
  i.updatedAt = new Date().toISOString();
  await KV.set(`i:${i.slug}`, i);
}

export async function upsertInstallation(slug: string, partial: Partial<Installation>) {
  const current = (await getInstallation(slug)) ?? { slug, flags: {}, discord: {}, updatedAt: '' };
  const merged: Installation = {
    ...current,
    ...partial,
    flags: { ...current.flags, ...(partial.flags ?? {}) },
    discord: { ...current.discord, ...(partial.discord ?? {}) },
    updatedAt: new Date().toISOString(),
  };
  await putInstallation(merged);
  return merged;
}