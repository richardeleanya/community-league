import { NextResponse } from 'next/server';

import { createCommunityLeagueDeploymentOperatorGateService } from '@/lib/deployment-operator-gate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueDeploymentOperatorGateService();
    const snapshot = service.getDeploymentOperatorGateSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-deployment-operator-gate',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown deployment operator gate error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-deployment-operator-gate',
        message,
      },
      { status: 500 },
    );
  }
}