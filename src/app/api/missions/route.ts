import { NextResponse } from 'next/server';

import { createCommunityLeagueMissionCatalogueService } from '@/lib/missions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueMissionCatalogueService();
    const snapshot = await service.getMissionCatalogueSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-missions',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown mission catalogue error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-missions',
        message,
      },
      { status: 500 },
    );
  }
}