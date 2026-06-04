import { NextResponse } from 'next/server';

import { createCommunityLeagueAwardsRecognitionService } from '@/lib/recognition';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueAwardsRecognitionService();
    const snapshot = await service.getRecognitionSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-awards-recognition',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown awards recognition error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-awards-recognition',
        message,
      },
      { status: 500 },
    );
  }
}