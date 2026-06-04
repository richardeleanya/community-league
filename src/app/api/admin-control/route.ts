import { NextResponse } from 'next/server';

import { createCommunityLeagueAdminControlService } from '@/lib/admin-control';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueAdminControlService();
    const snapshot = await service.getAdminControlSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-admin-control',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown admin control error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-admin-control',
        message,
      },
      { status: 500 },
    );
  }
}