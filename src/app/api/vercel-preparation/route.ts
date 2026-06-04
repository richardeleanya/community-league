import { NextResponse } from 'next/server';

import { createCommunityLeagueVercelPreparationService } from '@/lib/vercel-preparation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueVercelPreparationService();
    const snapshot = service.getVercelPreparationSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-vercel-preparation',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Vercel preparation error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-vercel-preparation',
        message,
      },
      { status: 500 },
    );
  }
}