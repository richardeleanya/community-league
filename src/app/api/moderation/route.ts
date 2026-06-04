import { NextResponse } from 'next/server';

import { createCommunityLeagueFraudModerationService } from '@/lib/moderation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueFraudModerationService();
    const snapshot = await service.getModerationReviewSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-fraud-moderation',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown fraud moderation error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-fraud-moderation',
        message,
      },
      { status: 500 },
    );
  }
}