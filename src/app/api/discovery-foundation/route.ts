import { NextResponse } from 'next/server';

import { createCommunityLeagueDiscoveryService } from '@/lib/discovery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueDiscoveryService();
    const snapshot = await service.getDiscoveryFoundationSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-discovery-foundation',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown club/league discovery error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-discovery-foundation',
        message,
      },
      { status: 500 },
    );
  }
}