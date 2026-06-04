import { NextResponse } from 'next/server';

import { createCommunityLeagueActivityFeedService } from '@/lib/activity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueActivityFeedService();
    const snapshot = await service.getActivityFeedSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-activity-feed',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown activity feed error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-activity-feed',
        message,
      },
      { status: 500 },
    );
  }
}