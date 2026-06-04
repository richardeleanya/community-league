import { NextResponse } from 'next/server';

import { createCommunityLeagueLaunchDecisionService } from '@/lib/launch-decision';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueLaunchDecisionService();
    const snapshot = service.getLaunchDecisionSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-launch-decision',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown launch decision error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-launch-decision',
        message,
      },
      { status: 500 },
    );
  }
}