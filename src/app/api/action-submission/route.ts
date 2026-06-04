import { NextResponse, type NextRequest } from 'next/server';

import { createCommunityLeagueActionSubmissionService } from '@/lib/action-submission';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueActionSubmissionService();
    const snapshot = await service.getActionSubmissionFoundationSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-action-submission',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown action submission error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-action-submission',
        message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const service = createCommunityLeagueActionSubmissionService();
    const validation = service.validateDraft(body);

    return NextResponse.json({
      status: validation.valid ? 'ok' : 'invalid',
      service: 'community-league-action-submission',
      validation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown action submission validation error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-action-submission',
        message,
      },
      { status: 500 },
    );
  }
}