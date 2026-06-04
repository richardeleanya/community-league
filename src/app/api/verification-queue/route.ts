import { NextResponse, type NextRequest } from 'next/server';

import { createCommunityLeagueVerificationQueueService } from '@/lib/verification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueVerificationQueueService();
    const snapshot = await service.getVerificationQueueFoundationSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-verification-queue',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown verification queue error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-verification-queue',
        message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const service = createCommunityLeagueVerificationQueueService();
    const validation = service.validateDecisionDraft(body);

    return NextResponse.json({
      status: validation.valid ? 'ok' : 'invalid',
      service: 'community-league-verification-queue',
      validation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown verification decision validation error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-verification-queue',
        message,
      },
      { status: 500 },
    );
  }
}