import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type FoundationCount = {
  label: string;
  count: number;
};

const foundationTables = [
  'seasons',
  'leagues',
  'clubs',
  'xp_level_thresholds',
  'platform_settings',
] as const;

async function getFoundationCounts(): Promise<FoundationCount[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const counts: FoundationCount[] = [];

  for (const table of foundationTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }

    counts.push({
      label: table,
      count: count ?? 0,
    });
  }

  return counts;
}

export async function GET() {
  try {
    const counts = await getFoundationCounts();

    return NextResponse.json({
      status: 'ok',
      service: 'community-premier-league',
      foundation: {
        database: 'accepted',
        prisma: 'accepted',
        supabaseClient: 'accepted',
        appSurface: 'active',
        productionReadPath: 'supabase-service-role-server-route',
      },
      counts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown foundation status error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-premier-league',
        foundation: {
          database: 'requires-attention',
          prisma: 'accepted',
          supabaseClient: 'requires-attention',
          appSurface: 'active',
          productionReadPath: 'supabase-service-role-server-route',
        },
        message,
      },
      { status: 500 },
    );
  }
}