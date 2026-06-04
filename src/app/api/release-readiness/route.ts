import { NextResponse } from 'next/server';

import { createCommunityLeagueReleaseReadinessService } from '@/lib/release-readiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueReleaseReadinessService();
    const evidencePack = service.getReleaseReadinessEvidencePack();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-release-readiness',
      evidencePack,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown release readiness error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-release-readiness',
        message,
      },
      { status: 500 },
    );
  }
}