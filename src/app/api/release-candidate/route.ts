import { NextResponse } from 'next/server';

import { createCommunityLeagueReleaseCandidateHardeningService } from '@/lib/release-hardening';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueReleaseCandidateHardeningService();
    const snapshot = service.getReleaseCandidateHardeningSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-release-candidate-hardening',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown release candidate hardening error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-release-candidate-hardening',
        message,
      },
      { status: 500 },
    );
  }
}