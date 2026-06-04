import { NextResponse } from 'next/server';

import { createCommunityLeagueProductionEnvironmentContractService } from '@/lib/production-environment-contract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueProductionEnvironmentContractService();
    const snapshot = service.getProductionEnvironmentContractSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-production-environment-contract',
      snapshot,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown production environment contract error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-production-environment-contract',
        message,
      },
      { status: 500 },
    );
  }
}