export const env = {
  FLAGS_SHARED_SECRET: process.env.FLAGS_SHARED_SECRET || "",
  KV_REST_API_URL: process.env.KV_REST_API_URL || "",
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",
  KV_URL: process.env.KV_URL || "",
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || "",
};

export function hasKV(): boolean {
  return Boolean(env.KV_REST_API_URL && env.KV_REST_API_TOKEN);
}
