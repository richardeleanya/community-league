import { NextResponse } from 'next/server';

import { createCommunityLeagueOperationsOverviewService } from '@/lib/operations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueOperationsOverviewService();
    const snapshot = await service.getOperationsOverviewSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-operations-overview',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown operations overview error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-operations-overview',
        message,
      },
      { status: 500 },
    );
  }
}