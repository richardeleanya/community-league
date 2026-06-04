import { NextResponse, type NextRequest } from 'next/server';

import { createCommunityLeagueOnboardingService } from '@/lib/onboarding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const service = createCommunityLeagueOnboardingService();
    const username = request.nextUrl.searchParams.get('username');
    const snapshot = await service.getOnboardingFoundationSnapshot();

    const usernameAvailability = username
      ? await service.checkUsernameAvailability(username)
      : null;

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-onboarding-foundation',
      snapshot,
      usernameAvailability,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown onboarding foundation error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-onboarding-foundation',
        message,
      },
      { status: 500 },
    );
  }
}