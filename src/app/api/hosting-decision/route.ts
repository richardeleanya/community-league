import { NextResponse } from 'next/server';

import { createCommunityLeagueHostingDecisionService } from '@/lib/hosting-decision';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueHostingDecisionService();
    const snapshot = service.getHostingDecisionSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-hosting-decision',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown hosting decision error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-hosting-decision',
        message,
      },
      { status: 500 },
    );
  }
}