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

type ActionRow = {
  id: string;
  verification_status: string;
  final_points_awarded: number;
  xp_awarded: number;
  legacy_points_awarded: number;
  multiplier_applied: number;
};

type CountRow = {
  approved_actions: number;
  league_table_rows: number;
  ranking_rows: number;
  notifications: number;
  audit_logs: number;
};

const seedUserId = '00000000-0000-0000-0000-000000012012';
const seedEmail = 'points.seed@community-league.local';
const seedUsername = 'points012';
const seedActionDescription =
  'CL-012 Points Award Baseline Action: collected litter across the local park and surrounding footpaths with clear before and after evidence for points award validation.';

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
    throw new Error('Missing current season, club, or active mission for points award baseline.');
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
      'POINT012',
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
      'Points Seed Supporter',
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
    throw new Error('Unable to resolve points seed supporter profile.');
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
      ARRAY['https://example.com/cl012-community-action-photo.jpg']::text[],
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
    )
  `;

  const actionRows = await prisma.$queryRaw<ActionRow[]>`
    SELECT
      id::text,
      verification_status::text,
      final_points_awarded,
      xp_awarded,
      legacy_points_awarded,
      multiplier_applied::float AS multiplier_applied
    FROM public.community_actions
    WHERE supporter_id = ${supporterId}::uuid
      AND description = ${seedActionDescription}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const action = actionRows[0];

  if (!action?.id) {
    throw new Error('Unable to resolve CL-012 baseline community action.');
  }

  if (!['tier1_approved', 'tier2_approved', 'tier3_approved'].includes(action.verification_status)) {
    await prisma.$executeRaw`
      UPDATE public.community_actions
      SET
        verified_by = ${seedUserId}::uuid,
        verified_at = now(),
        verification_status = 'tier1_approved'::verification_status_enum,
        updated_at = now()
      WHERE id = ${action.id}::uuid
        AND verification_status = 'pending'
    `;
  }

  const approvedRows = await prisma.$queryRaw<ActionRow[]>`
    SELECT
      id::text,
      verification_status::text,
      final_points_awarded,
      xp_awarded,
      legacy_points_awarded,
      multiplier_applied::float AS multiplier_applied
    FROM public.community_actions
    WHERE id = ${action.id}::uuid
    LIMIT 1
  `;

  const approved = approvedRows[0];

  if (!approved || !['tier1_approved', 'tier2_approved', 'tier3_approved'].includes(approved.verification_status)) {
    throw new Error('CL-012 baseline action did not enter an approved status.');
  }

  if (approved.final_points_awarded < 10 || approved.xp_awarded < 20 || approved.legacy_points_awarded < 5) {
    throw new Error(
      `CL-012 points engine award values are too low: final=${approved.final_points_awarded}, xp=${approved.xp_awarded}, legacy=${approved.legacy_points_awarded}`,
    );
  }

  const counts = await prisma.$queryRaw<CountRow[]>`
    SELECT
      (
        SELECT count(*)::int
        FROM public.community_actions
        WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
      ) AS approved_actions,
      (SELECT count(*)::int FROM public.league_tables) AS league_table_rows,
      (SELECT count(*)::int FROM public.individual_rankings) AS ranking_rows,
      (
        SELECT count(*)::int
        FROM public.notifications
        WHERE type = 'points_awarded'
      ) AS notifications,
      (
        SELECT count(*)::int
        FROM public.audit_logs
        WHERE action = 'action.points_awarded'
      ) AS audit_logs
  `;

  const countRow = counts[0];

  if ((countRow?.league_table_rows ?? 0) < 1) {
    throw new Error('Expected league table rows after approved-action trigger.');
  }

  if ((countRow?.ranking_rows ?? 0) < 1) {
    throw new Error('Expected individual ranking rows after approved-action trigger.');
  }

  if ((countRow?.notifications ?? 0) < 1) {
    throw new Error('Expected points_awarded notification after approved-action trigger.');
  }

  if ((countRow?.audit_logs ?? 0) < 1) {
    throw new Error('Expected action.points_awarded audit log after approved-action trigger.');
  }

  process.stdout.write(
    `CL-012A points award baseline passed: action=${approved.id}, final_points=${approved.final_points_awarded}, xp=${approved.xp_awarded}, legacy=${approved.legacy_points_awarded}, multiplier=${approved.multiplier_applied}, league_table_rows=${countRow.league_table_rows}, ranking_rows=${countRow.ranking_rows}\n`,
  );
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`CL-012A points award baseline failed: ${message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });