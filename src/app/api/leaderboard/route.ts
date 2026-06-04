import { NextResponse } from 'next/server';

import { createCommunityLeagueLeaderboardService } from '@/lib/leaderboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueLeaderboardService();
    const snapshot = await service.getLeaderboardFoundationSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-leaderboard',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown leaderboard error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-leaderboard',
        message,
      },
      { status: 500 },
    );
  }
}