import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import prisma from '../lib/prisma/client';

type BaselineRow = {
  current_season_id: string;
  club_id: string;
  mission_id: string;
};

type ProfileRow = {
  id: string;
};

type SchemaColumnRow = {
  table_name: string;
  column_name: string;
};

type UsernameProbeRow = {
  ok: boolean;
};

type CountRow = {
  pending_actions: number;
  moderators: number;
};

const seedUserId = '00000000-0000-0000-0000-000000011011';
const seedEmail = 'verification.seed@community-league.local';
const seedUsername = 'verify011';
const seedActionDescription =
  'Verification Queue Baseline Action: collected litter across the local park and surrounding footpaths with clear before and after evidence for community validation.';

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

async function assertAcceptedSchemaColumns(): Promise<void> {
  const rows = await prisma.$queryRaw<SchemaColumnRow[]>`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (
          table_name = 'supporter_profiles'
          AND column_name IN (
            'current_xp',
            'total_xp_ever',
            'streak_current_days',
            'streak_longest_days',
            'current_level',
            'community_points_season',
            'community_points_alltime',
            'legacy_score'
          )
        )
        OR (
          table_name = 'community_actions'
          AND column_name IN (
            'description',
            'photo_urls',
            'gps_latitude',
            'gps_longitude',
            'gps_accuracy_metres',
            'verification_status',
            'verification_tier',
            'base_points',
            'final_points_awarded',
            'xp_awarded',
            'legacy_points_awarded',
            'fraud_score',
            'is_fraudulent'
          )
        )
      )
  `;

  const available = new Set(rows.map((row) => `${row.table_name}.${row.column_name}`));

  const required = [
    'supporter_profiles.current_xp',
    'supporter_profiles.total_xp_ever',
    'supporter_profiles.streak_current_days',
    'supporter_profiles.streak_longest_days',
    'community_actions.description',
    'community_actions.photo_urls',
    'community_actions.verification_status',
    'community_actions.verification_tier',
  ];

  const missing = required.filter((column) => !available.has(column));

  if (missing.length > 0) {
    throw new Error(`Accepted schema column check failed. Missing: ${missing.join(', ')}`);
  }
}

async function assertUsernameConstraint(): Promise<void> {
  const rows = await prisma.$queryRaw<UsernameProbeRow[]>`
    SELECT ${seedUsername} ~ '^[a-z0-9_]{3,20}$' AS ok
  `;

  if (rows[0]?.ok !== true) {
    throw new Error(`Seed username does not meet accepted username constraint shape: ${seedUsername}`);
  }
}

async function main(): Promise<void> {
  loadEnvFile('.env');
  loadEnvFile('.env.local');

  await assertAcceptedSchemaColumns();
  await assertUsernameConstraint();

  const baseline = await prisma.$queryRaw<BaselineRow[]>`
    SELECT
      (SELECT id::text FROM public.seasons WHERE is_current = true ORDER BY created_at DESC LIMIT 1) AS current_season_id,
      (
        SELECT id::text
        FROM public.clubs
        WHERE is_active = true
        ORDER BY season_position ASC NULLS LAST, name ASC
        LIMIT 1
      ) AS club_id,
      (
        SELECT id::text
        FROM public.missions
        WHERE is_active = true
          AND start_date <= now()
          AND end_date > now()
        ORDER BY created_at DESC
        LIMIT 1
      ) AS mission_id
  `;

  const currentSeasonId = baseline[0]?.current_season_id;
  const clubId = baseline[0]?.club_id;
  const missionId = baseline[0]?.mission_id;

  if (!currentSeasonId || !clubId || !missionId) {
    throw new Error('Missing current season, club, or active mission for verification baseline.');
  }

  await prisma.$executeRaw`
    INSERT INTO public.users (
      id,
      email,
      email_verified,
      password_hash,
      account_status,
      referral_code,
      is_admin,
      is_moderator,
      created_at,
      updated_at
    )
    VALUES (
      ${seedUserId}::uuid,
      ${seedEmail},
      true,
      'seed-password-not-used',
      'active'::account_status_enum,
      'VERIF011',
      true,
      true,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      email_verified = true,
      account_status = 'active'::account_status_enum,
      is_admin = true,
      is_moderator = true,
      updated_at = now()
  `;

  await prisma.$executeRaw`
    INSERT INTO public.supporter_profiles (
      user_id,
      username,
      display_name,
      club_id,
      club_joined_at,
      specialist_path,
      specialist_path_set_at,
      current_level,
      current_xp,
      total_xp_ever,
      community_points_season,
      community_points_alltime,
      legacy_score,
      volunteer_hours_total,
      trees_planted_total,
      food_donations_total,
      actions_completed_total,
      actions_completed_season,
      streak_current_days,
      streak_longest_days,
      location_city,
      location_country,
      is_public,
      created_at,
      updated_at
    )
    VALUES (
      ${seedUserId}::uuid,
      ${seedUsername},
      'Verification Seed Supporter',
      ${clubId}::uuid,
      now(),
      'environmental_champion'::specialist_path_enum,
      now(),
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      'Manchester',
      'GB',
      true,
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      username = EXCLUDED.username,
      display_name = EXCLUDED.display_name,
      club_id = EXCLUDED.club_id,
      club_joined_at = COALESCE(public.supporter_profiles.club_joined_at, now()),
      specialist_path = COALESCE(public.supporter_profiles.specialist_path, EXCLUDED.specialist_path),
      specialist_path_set_at = COALESCE(public.supporter_profiles.specialist_path_set_at, now()),
      location_city = EXCLUDED.location_city,
      location_country = EXCLUDED.location_country,
      is_public = true,
      updated_at = now()
  `;

  const profileRows = await prisma.$queryRaw<ProfileRow[]>`
    SELECT id::text
    FROM public.supporter_profiles
    WHERE user_id = ${seedUserId}::uuid
    LIMIT 1
  `;

  const supporterId = profileRows[0]?.id;

  if (!supporterId) {
    throw new Error('Unable to resolve verification seed supporter profile.');
  }

  await prisma.$executeRaw`
    INSERT INTO public.community_actions (
      supporter_id,
      club_id,
      mission_id,
      season_id,
      action_type,
      action_category,
      description,
      photo_urls,
      gps_latitude,
      gps_longitude,
      gps_accuracy_metres,
      gps_location_name,
      action_date,
      submitted_at,
      verification_status,
      verification_tier,
      base_points,
      multiplier_applied,
      final_points_awarded,
      xp_awarded,
      legacy_points_awarded,
      volunteer_hours,
      trees_count,
      food_items_count,
      fraud_score,
      is_fraudulent,
      created_at,
      updated_at
    )
    SELECT
      ${supporterId}::uuid,
      ${clubId}::uuid,
      ${missionId}::uuid,
      ${currentSeasonId}::uuid,
      'litter_collection'::action_type_enum,
      'environment'::action_category_enum,
      ${seedActionDescription},
      ARRAY['https://example.com/community-action-photo.jpg']::text[],
      53.4808,
      -2.2426,
      12,
      'Manchester',
      now(),
      now(),
      'pending'::verification_status_enum,
      'tier_1'::verification_tier_enum,
      10,
      1.0,
      0,
      0,
      0,
      1,
      0,
      0,
      5,
      false,
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.community_actions
      WHERE supporter_id = ${supporterId}::uuid
        AND description = ${seedActionDescription}
        AND verification_status = 'pending'
    )
  `;

  const counts = await prisma.$queryRaw<CountRow[]>`
    SELECT
      (
        SELECT count(*)::int
        FROM public.community_actions
        WHERE verification_status = 'pending'
      ) AS pending_actions,
      (
        SELECT count(*)::int
        FROM public.users
        WHERE is_moderator = true OR is_admin = true
      ) AS moderators
  `;

  const row = counts[0];

  if ((row?.pending_actions ?? 0) < 1) {
    throw new Error('Expected at least 1 pending community action after verification baseline seed.');
  }

  if ((row?.moderators ?? 0) < 1) {
    throw new Error('Expected at least 1 moderator/admin after verification baseline seed.');
  }

  process.stdout.write(
    `CL-011A3 verification queue baseline seed passed: pending_actions=${row.pending_actions}, moderators=${row.moderators}, username=${seedUsername}\n`,
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`CL-011A3 verification queue baseline seed failed: ${message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });