import { NextResponse } from 'next/server';

import { createCommunityLeagueDeploymentReadinessService } from '@/lib/deployment-readiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueDeploymentReadinessService();
    const snapshot = service.getDeploymentReadinessSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-deployment-readiness',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown deployment readiness error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-deployment-readiness',
        message,
      },
      { status: 500 },
    );
  }
}