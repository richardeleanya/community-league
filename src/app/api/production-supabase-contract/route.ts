import { NextResponse } from 'next/server';

import { createCommunityLeagueProductionSupabaseContractService } from '@/lib/production-supabase-contract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = createCommunityLeagueProductionSupabaseContractService();
    const snapshot = service.getProductionSupabaseContractSnapshot();

    return NextResponse.json({
      status: 'ok',
      service: 'community-league-production-supabase-contract',
      snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown production Supabase contract error';

    return NextResponse.json(
      {
        status: 'error',
        service: 'community-league-production-supabase-contract',
        message,
      },
      { status: 500 },
    );
  }
}