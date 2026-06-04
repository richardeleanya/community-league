import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import prisma from '../lib/prisma/client';

type ClubRow = {
  id: string;
};

type LeagueRow = {
  id: string;
};

type SeasonRow = {
  id: string;
};

type BaselineCountsRow = {
  active_fixtures: number;
  active_missions: number;
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

async function main(): Promise<void> {
  loadEnvFile('.env');
  loadEnvFile('.env.local');

  const seasonRows = await prisma.$queryRaw<SeasonRow[]>`
    SELECT id::text
    FROM public.seasons
    WHERE is_current = true
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const seasonId = seasonRows[0]?.id;

  if (!seasonId) {
    throw new Error('No current season available for action submission baseline.');
  }

  const leagueRows = await prisma.$queryRaw<LeagueRow[]>`
    SELECT id::text
    FROM public.leagues
    WHERE slug = 'community-premier-league'
      AND is_active = true
    LIMIT 1
  `;

  const leagueId = leagueRows[0]?.id;

  if (!leagueId) {
    throw new Error('No active Community Premier League available for action submission baseline.');
  }

  const clubRows = await prisma.$queryRaw<ClubRow[]>`
    SELECT id::text
    FROM public.clubs
    WHERE league_id = ${leagueId}::uuid
      AND is_active = true
    ORDER BY season_position ASC NULLS LAST, name ASC
    LIMIT 2
  `;

  if (clubRows.length < 2) {
    throw new Error(`Expected 2 active clubs for fixture baseline, received ${clubRows.length}`);
  }

  const homeClubId = clubRows[0].id;
  const awayClubId = clubRows[1].id;

  await prisma.$executeRaw`
    INSERT INTO public.fixtures (
      season_id,
      league_id,
      home_club_id,
      away_club_id,
      match_date,
      match_week,
      fixture_type,
      point_multiplier,
      status,
      mission_week_active,
      mission_start_at,
      mission_end_at
    )
    SELECT
      ${seasonId}::uuid,
      ${leagueId}::uuid,
      ${homeClubId}::uuid,
      ${awayClubId}::uuid,
      now() + interval '7 days',
      1,
      'league'::fixture_type_enum,
      1.0,
      'active'::fixture_status_enum,
      true,
      now() - interval '1 day',
      now() + interval '30 days'
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.fixtures
      WHERE season_id = ${seasonId}::uuid
        AND league_id = ${leagueId}::uuid
        AND home_club_id = ${homeClubId}::uuid
        AND away_club_id = ${awayClubId}::uuid
        AND status = 'active'
    )
  `;

  const fixtureRows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id::text
    FROM public.fixtures
    WHERE season_id = ${seasonId}::uuid
      AND league_id = ${leagueId}::uuid
      AND status = 'active'
      AND mission_start_at <= now()
      AND mission_end_at > now()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const fixtureId = fixtureRows[0]?.id;

  if (!fixtureId) {
    throw new Error('Unable to resolve active fixture for action submission baseline.');
  }

  await prisma.$executeRaw`
    INSERT INTO public.missions (
      fixture_id,
      title,
      description,
      action_category,
      action_type,
      base_points,
      base_xp,
      multiplier_override,
      verification_tier_required,
      max_completions_per_user,
      max_completions_total,
      start_date,
      end_date,
      is_active
    )
    SELECT
      ${fixtureId}::uuid,
      'Opening Weekend Litter Mission',
      'Baseline mission used to validate action submission readiness and mission selection.',
      'environment'::action_category_enum,
      'litter_collection'::action_type_enum,
      10,
      20,
      1.0,
      'tier_1'::verification_tier_enum,
      3,
      500,
      now() - interval '1 day',
      now() + interval '30 days',
      true
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.missions
      WHERE title = 'Opening Weekend Litter Mission'
        AND is_active = true
    )
  `;

  const counts = await prisma.$queryRaw<BaselineCountsRow[]>`
    SELECT
      (
        SELECT count(*)::int
        FROM public.fixtures
        WHERE status = 'active'
          AND mission_start_at <= now()
          AND mission_end_at > now()
      ) AS active_fixtures,
      (
        SELECT count(*)::int
        FROM public.missions
        WHERE is_active = true
          AND start_date <= now()
          AND end_date > now()
      ) AS active_missions
  `;

  const row = counts[0];

  if ((row?.active_fixtures ?? 0) < 1) {
    throw new Error('Expected at least 1 active fixture after action submission baseline repair.');
  }

  if ((row?.active_missions ?? 0) < 1) {
    throw new Error('Expected at least 1 active mission after action submission baseline repair.');
  }

  process.stdout.write(
    `CL-010A action submission baseline seed passed: active_fixtures=${row.active_fixtures}, active_missions=${row.active_missions}\n`,
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`CL-010A action submission baseline seed failed: ${message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });