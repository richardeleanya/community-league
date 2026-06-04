import { NextResponse } from 'next/server';

import { createCommunityLeagueVisualPolishService } from '@/lib/visual-polish';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueVisualPolishService();
    const snapshot = service.getVisualPolishSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-visual-polish',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown visual polish error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-visual-polish',
        message,
      },
      { status: 500 },
    );
  }
}