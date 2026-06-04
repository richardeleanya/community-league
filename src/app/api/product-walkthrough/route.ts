import { NextResponse } from 'next/server';

import { createCommunityLeagueProductWalkthroughService } from '@/lib/product-walkthrough';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueProductWalkthroughService();
    const snapshot = service.getProductWalkthroughSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-product-walkthrough',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown product walkthrough error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-product-walkthrough',
        message,
      },
      { status: 500 },
    );
  }
}