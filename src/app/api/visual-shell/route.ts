import { NextResponse } from 'next/server';

import { createCommunityLeagueVisualShellService } from '@/lib/visual-shell';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueVisualShellService();
    const snapshot = service.getVisualShellSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-visual-shell',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown visual shell error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-visual-shell',
        message,
      },
      { status: 500 },
    );
  }
}