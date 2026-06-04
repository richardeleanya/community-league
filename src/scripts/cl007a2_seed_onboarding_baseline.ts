import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import prisma from '../lib/prisma/client';

type CountRow = {
  current_seasons: number;
  active_leagues: number;
  active_clubs: number;
};

function loadEnvFile(fileName: string): void {
  const filePath = join(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function getBaselineCounts(): Promise<CountRow> {
  const rows = await prisma.$queryRaw<CountRow[]>`
    SELECT
      (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
      (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
      (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs
  `;

  return rows[0] ?? {
    current_seasons: 0,
    active_leagues: 0,
    active_clubs: 0,
  };
}

async function main(): Promise<void> {
  loadEnvFile('.env');
  loadEnvFile('.env.local');

  await prisma.$executeRaw`
    INSERT INTO public.seasons (
      name,
      slug,
      start_date,
      end_date,
      is_current,
      is_completed
    )
    SELECT
      'Community League 2026',
      'community-league-2026',
      DATE '2026-01-01',
      DATE '2026-12-31',
      true,
      false
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.seasons
      WHERE is_current = true
    )
    ON CONFLICT (slug) DO UPDATE
    SET
      is_current = true,
      is_completed = false
  `;

  const seasonRows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id::text
    FROM public.seasons
    WHERE is_current = true
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const seasonId = seasonRows[0]?.id;

  if (!seasonId) {
    throw new Error('Unable to resolve current season after baseline repair.');
  }

  await prisma.$executeRaw`
    INSERT INTO public.leagues (
      name,
      display_name,
      slug,
      country,
      tier,
      season_id,
      primary_colour,
      is_active,
      max_clubs,
      promotion_spots,
      relegation_spots
    )
    VALUES (
      'community_premier_league',
      'Community Premier League',
      'community-premier-league',
      'GB',
      1,
      ${seasonId}::uuid,
      '#6C63FF',
      true,
      20,
      3,
      3
    )
    ON CONFLICT (slug) DO UPDATE
    SET
      season_id = EXCLUDED.season_id,
      is_active = true,
      display_name = EXCLUDED.display_name,
      country = EXCLUDED.country,
      primary_colour = EXCLUDED.primary_colour
  `;

  const leagueRows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id::text
    FROM public.leagues
    WHERE slug = 'community-premier-league'
    LIMIT 1
  `;

  const leagueId = leagueRows[0]?.id;

  if (!leagueId) {
    throw new Error('Unable to resolve Community Premier League after baseline repair.');
  }

  await prisma.$executeRaw`
    INSERT INTO public.clubs (
      name,
      short_name,
      slug,
      country,
      league_id,
      primary_colour,
      secondary_colour,
      city,
      description,
      is_verified,
      is_active,
      season_position
    )
    VALUES
      (
        'Community North FC',
        'NTH',
        'community-north-fc',
        'GB',
        ${leagueId}::uuid,
        '#6C63FF',
        '#00E5A0',
        'Manchester',
        'Baseline club for onboarding and club selection validation.',
        true,
        true,
        1
      ),
      (
        'Community South FC',
        'STH',
        'community-south-fc',
        'GB',
        ${leagueId}::uuid,
        '#FFB547',
        '#07111F',
        'London',
        'Baseline club for onboarding and club selection validation.',
        true,
        true,
        2
      )
    ON CONFLICT (slug) DO UPDATE
    SET
      league_id = EXCLUDED.league_id,
      country = EXCLUDED.country,
      primary_colour = EXCLUDED.primary_colour,
      secondary_colour = EXCLUDED.secondary_colour,
      city = EXCLUDED.city,
      is_verified = true,
      is_active = true,
      season_position = EXCLUDED.season_position
  `;

  const counts = await getBaselineCounts();

  if (counts.current_seasons !== 1) {
    throw new Error(`Expected exactly 1 current season after repair, received ${counts.current_seasons}`);
  }

  if (counts.active_leagues < 1) {
    throw new Error(`Expected at least 1 active league after repair, received ${counts.active_leagues}`);
  }

  if (counts.active_clubs < 2) {
    throw new Error(`Expected at least 2 active clubs after repair, received ${counts.active_clubs}`);
  }

  process.stdout.write(
    `CL-007A2 onboarding baseline seed repair passed: current_seasons=${counts.current_seasons}, active_leagues=${counts.active_leagues}, active_clubs=${counts.active_clubs}\n`,
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`CL-007A2 onboarding baseline seed repair failed: ${message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });