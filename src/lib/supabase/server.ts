import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from './database.types';

function getSupabaseServerConfig(): { url: string; key: string } {
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

export async function createClient() {
  const { url, key } = getSupabaseServerConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies.
          // The proxy refresh layer handles session cookie persistence.
        }
      },
    },
  });
}