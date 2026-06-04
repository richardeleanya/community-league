import { NextResponse } from 'next/server';

import { createCommunityLeagueFinalAcceptanceService } from '@/lib/final-acceptance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueFinalAcceptanceService();
    const snapshot = service.getFinalAcceptanceSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-final-acceptance',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown final acceptance error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-final-acceptance',
        message,
      },
      { status: 500 },
    );
  }
}