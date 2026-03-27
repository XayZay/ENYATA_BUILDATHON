function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error('Missing environment variable: ' + name);
  }
  return value;
}

export const env = {
  supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  monierateApiKey: process.env.MONIERATE_API_KEY,
  openErApiUrl: process.env.OPEN_ER_API_URL ?? 'https://open.er-api.com/v6/latest/USD',
  interswitchClientId: process.env.INTERSWITCH_CLIENT_ID,
  interswitchClientSecret: process.env.INTERSWITCH_CLIENT_SECRET,
  interswitchBaseUrl: process.env.INTERSWITCH_BASE_URL ?? 'https://sandbox.interswitchng.com'
};

export function isInterswitchConfigured() {
  return Boolean(env.interswitchClientId && env.interswitchClientSecret);
}

export function isMonierateConfigured() {
  return Boolean(env.monierateApiKey);
}
