import { NextResponse } from 'next/server';

import { createCommunityLeagueProfileSurfaceService } from '@/lib/profiles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueProfileSurfaceService();
    const snapshot = await service.getProfileSurfaceSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-profiles',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown profile surface error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-profiles',
        message,
      },
      { status: 500 },
    );
  }
}