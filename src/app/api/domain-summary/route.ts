import { NextResponse } from 'next/server';

import { createCommunityLeagueDomainService } from '@/lib/domain';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueDomainService();
    const snapshot = await service.getFoundationSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-domain-summary',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown domain summary error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-domain-summary',
        message,
      },
      { status: 500 },
    );
  }
}