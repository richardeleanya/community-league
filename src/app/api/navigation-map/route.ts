import { NextResponse } from 'next/server';

import { createCommunityLeagueProductRouteMapService } from '@/lib/navigation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueProductRouteMapService();
    const snapshot = service.getNavigationRouteMapSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-navigation-route-map',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown navigation route map error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-navigation-route-map',
        message,
      },
      { status: 500 },
    );
  }
}