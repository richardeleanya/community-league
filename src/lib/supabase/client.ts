import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './database.types';

function getSupabaseClientConfig(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required.');
  }

  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required.');
  }

  return { url, key };
}

export function createClient() {
  const { url, key } = getSupabaseClientConfig();

  return createBrowserClient<Database>(url, key);
}