import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type FoundationCountRow = {
  label: string;
  count: number;
};

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<FoundationCountRow[]>`
      SELECT 'seasons' AS label, count(*)::int AS count FROM public.seasons
      UNION ALL
      SELECT 'leagues' AS label, count(*)::int AS count FROM public.leagues
      UNION ALL
      SELECT 'clubs' AS label, count(*)::int AS count FROM public.clubs
      UNION ALL
      SELECT 'xp_level_thresholds' AS label, count(*)::int AS count FROM public.xp_level_thresholds
      UNION ALL
      SELECT 'platform_settings' AS label, count(*)::int AS count FROM public.platform_settings
    `;

    return NextResponse.json({
      status: 'ok',
      service: 'community-premier-league',
      foundation: {
        database: 'accepted',
        prisma: 'accepted',
        supabaseClient: 'accepted',
        appSurface: 'active',
      },
      counts: rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown foundation status error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-premier-league',
        message,
      },
      { status: 500 },
    );
  }
}