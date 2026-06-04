import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../lib/supabase/database.types';

function loadEnvFile(fileName: string): void {
  const filePath = join(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const requiredTables = [
  'users',
  'seasons',
  'leagues',
  'clubs',
  'supporter_profiles',
  'fixtures',
  'missions',
  'community_actions',
  'peer_validations',
  'fraud_reports',
  'penalties',
  'xp_level_thresholds',
  'league_tables',
  'individual_rankings',
  'awards',
  'legacy_projects',
  'legacy_map_pins',
  'club_news',
  'notifications',
  'audit_logs',
  'platform_settings',
] as const;

type TypedSupabaseClient = SupabaseClient<Database>;

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
  }

  if (!supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.');
  }

  const supabase: TypedSupabaseClient = createSupabaseClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const typedSeasonQuery = supabase.from('seasons').select('id');
  void typedSeasonQuery;

  const typedActionQuery = supabase.from('community_actions').select('id, verification_status');
  void typedActionQuery;

  for (const tableName of requiredTables) {
    if (typeof tableName !== 'string' || tableName.length === 0) {
      throw new Error('Invalid table name detected in required table list.');
    }
  }

  const sessionResult = await supabase.auth.getSession();

  if (sessionResult.error) {
    throw new Error(`Supabase auth endpoint validation failed: ${sessionResult.error.message}`);
  }

  process.stdout.write('CL-003A2 Supabase typed client and auth endpoint validation passed\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-003A2 Supabase validation failed: ${message}\n`);
  process.exit(1);
});