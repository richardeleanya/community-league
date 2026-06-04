import { NextResponse } from 'next/server';

import { createCommunityLeagueSupporterDashboardService } from '@/lib/dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueSupporterDashboardService();
    const snapshot = await service.getSupporterDashboardSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-supporter-dashboard',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown supporter dashboard error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-supporter-dashboard',
        message,
      },
      { status: 500 },
    );
  }
}