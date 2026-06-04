import { NextResponse } from 'next/server';

import { createCommunityLeagueHomepageCompositionService } from '@/lib/homepage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueHomepageCompositionService();
    const snapshot = service.getHomepageCompositionSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-homepage-composition',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown homepage composition error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-homepage-composition',
        message,
      },
      { status: 500 },
    );
  }
}