import { NextResponse } from 'next/server';

import { createCommunityLeagueLegacyImpactMapService } from '@/lib/impact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueLegacyImpactMapService();
    const snapshot = await service.getLegacyImpactSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-legacy-impact-map',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown legacy impact map error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-legacy-impact-map',
        message,
      },
      { status: 500 },
    );
  }
}