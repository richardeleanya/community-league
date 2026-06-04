import { NextResponse } from 'next/server';

import { createCommunityLeagueActionEvidenceDetailService } from '@/lib/evidence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueActionEvidenceDetailService();
    const snapshot = await service.getEvidenceDetailSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-action-evidence-detail',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown action evidence detail error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-action-evidence-detail',
        message,
      },
      { status: 500 },
    );
  }
}