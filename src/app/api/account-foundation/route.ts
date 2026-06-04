import { NextResponse } from 'next/server';

import { createCommunityLeagueAccountService } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueAccountService();
    const snapshot = await service.getAccountFoundationSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-account-foundation',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown account foundation error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-account-foundation',
        message,
      },
      { status: 500 },
    );
  }
}