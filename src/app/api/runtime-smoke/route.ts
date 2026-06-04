import { NextResponse } from 'next/server';

import { createCommunityLeagueRuntimeSmokeService } from '@/lib/runtime-smoke';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueRuntimeSmokeService();
    const snapshot = service.getRuntimeSmokeSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-runtime-smoke',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown runtime smoke error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-runtime-smoke',
        message,
      },
      { status: 500 },
    );
  }
}