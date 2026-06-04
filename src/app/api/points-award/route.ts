import { NextResponse, type NextRequest } from 'next/server';

import { createCommunityLeaguePointsAwardService } from '@/lib/points-award';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeaguePointsAwardService();
    const snapshot = await service.getPointsAwardFoundationSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-points-award',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown points award error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-points-award',
        message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const service = createCommunityLeaguePointsAwardService();
    const validation = service.validateDecisionDraft(body);

    return NextResponse.json({
      status: validation.valid ? 'ok' : 'invalid',
      service: 'community-league-points-award',
      validation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown points award validation error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-points-award',
        message,
      },
      { status: 500 },
    );
  }
}