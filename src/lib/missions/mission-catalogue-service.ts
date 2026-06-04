import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  FixtureMissionCard,
  MissionCatalogueCard,
  MissionCatalogueCounts,
  MissionCatalogueReadiness,
  MissionCatalogueSnapshot,
} from './types';

type CountRow = {
  current_seasons: number;
  active_leagues: number;
  active_clubs: number;
  active_fixtures: number;
  active_mission_windows: number;
  active_missions: number;
  action_types: number;
  mission_categories: number;
  approved_actions: number;
  submitted_actions: number;
};

type FixtureRow = {
  fixture_id: string;
  league_id: string;
  season_id: string;
  home_club_id: string;
  home_club_name: string;
  away_club_id: string;
  away_club_name: string;
  match_date: Date | string;
  match_week: number;
  fixture_type: string;
  point_multiplier: number | string;
  status: string;
  mission_week_active: boolean;
  mission_start_at: Date | string | null;
  mission_end_at: Date | string | null;
  active_mission_count: number;
};

type MissionRow = {
  mission_id: string;
  fixture_id: string | null;
  title: string;
  description: string;
  action_category: string;
  action_type: string;
  base_points: number;
  base_xp: number;
  multiplier_override: number | string | null;
  verification_tier_required: string;
  max_completions_per_user: number | null;
  max_completions_total: number | null;
  start_date: Date | string;
  end_date: Date | string;
  is_active: boolean;
  fixture_type: string | null;
  fixture_multiplier: number | string | null;
  home_club_name: string | null;
  away_club_name: string | null;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function toIsoOrNull(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  return toIso(value);
}

function toNumberOrNull(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  return Number(value);
}

export class CommunityLeagueMissionCatalogueService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getMissionCatalogueCounts(): Promise<MissionCatalogueCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (
          SELECT count(*)::int
          FROM public.fixtures
          WHERE status = 'active'
        ) AS active_fixtures,
        (
          SELECT count(*)::int
          FROM public.fixtures
          WHERE status = 'active'
            AND mission_week_active = true
            AND mission_start_at <= now()
            AND mission_end_at > now()
        ) AS active_mission_windows,
        (
          SELECT count(*)::int
          FROM public.missions
          WHERE is_active = true
            AND start_date <= now()
            AND end_date > now()
        ) AS active_missions,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'action_type_enum'
        ) AS action_types,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'action_category_enum'
        ) AS mission_categories,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        (SELECT count(*)::int FROM public.community_actions) AS submitted_actions
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      activeLeagues: row?.active_leagues ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      activeFixtures: row?.active_fixtures ?? 0,
      activeMissionWindows: row?.active_mission_windows ?? 0,
      activeMissions: row?.active_missions ?? 0,
      actionTypes: row?.action_types ?? 0,
      missionCategories: row?.mission_categories ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      submittedActions: row?.submitted_actions ?? 0,
    };
  }

  async getFixtureMissionCards(limit = 8): Promise<FixtureMissionCard[]> {
    const rows = await this.db.$queryRaw<FixtureRow[]>`
      SELECT
        f.id::text AS fixture_id,
        f.league_id::text,
        f.season_id::text,
        f.home_club_id::text,
        hc.name AS home_club_name,
        f.away_club_id::text,
        ac.name AS away_club_name,
        f.match_date,
        f.match_week,
        f.fixture_type::text,
        f.point_multiplier,
        f.status::text,
        f.mission_week_active,
        f.mission_start_at,
        f.mission_end_at,
        (
          SELECT count(*)::int
          FROM public.missions m
          WHERE m.fixture_id = f.id
            AND m.is_active = true
            AND m.start_date <= now()
            AND m.end_date > now()
        ) AS active_mission_count
      FROM public.fixtures f
      JOIN public.clubs hc
        ON hc.id = f.home_club_id
      JOIN public.clubs ac
        ON ac.id = f.away_club_id
      WHERE f.season_id = (
        SELECT id
        FROM public.seasons
        WHERE is_current = true
        ORDER BY created_at DESC
        LIMIT 1
      )
      ORDER BY
        CASE WHEN f.status = 'active' THEN 0 ELSE 1 END,
        f.match_date ASC,
        hc.name ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      fixtureId: row.fixture_id,
      leagueId: row.league_id,
      seasonId: row.season_id,
      homeClubId: row.home_club_id,
      homeClubName: row.home_club_name,
      awayClubId: row.away_club_id,
      awayClubName: row.away_club_name,
      matchDate: toIso(row.match_date),
      matchWeek: row.match_week,
      fixtureType: row.fixture_type,
      pointMultiplier: Number(row.point_multiplier),
      status: row.status,
      missionWeekActive: row.mission_week_active,
      missionStartAt: toIsoOrNull(row.mission_start_at),
      missionEndAt: toIsoOrNull(row.mission_end_at),
      activeMissionCount: row.active_mission_count,
    }));
  }

  async getMissionCatalogueCards(limit = 16): Promise<MissionCatalogueCard[]> {
    const rows = await this.db.$queryRaw<MissionRow[]>`
      SELECT
        m.id::text AS mission_id,
        m.fixture_id::text,
        m.title,
        m.description,
        m.action_category::text,
        m.action_type::text,
        m.base_points,
        m.base_xp,
        m.multiplier_override,
        m.verification_tier_required::text,
        m.max_completions_per_user,
        m.max_completions_total,
        m.start_date,
        m.end_date,
        m.is_active,
        f.fixture_type::text AS fixture_type,
        f.point_multiplier AS fixture_multiplier,
        hc.name AS home_club_name,
        ac.name AS away_club_name
      FROM public.missions m
      LEFT JOIN public.fixtures f
        ON f.id = m.fixture_id
      LEFT JOIN public.clubs hc
        ON hc.id = f.home_club_id
      LEFT JOIN public.clubs ac
        ON ac.id = f.away_club_id
      WHERE m.is_active = true
        AND m.start_date <= now()
        AND m.end_date > now()
      ORDER BY m.end_date ASC, m.base_points DESC, m.title ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      missionId: row.mission_id,
      fixtureId: row.fixture_id,
      title: row.title,
      description: row.description,
      actionCategory: row.action_category,
      actionType: row.action_type,
      basePoints: row.base_points,
      baseXp: row.base_xp,
      multiplierOverride: toNumberOrNull(row.multiplier_override),
      verificationTierRequired: row.verification_tier_required,
      maxCompletionsPerUser: row.max_completions_per_user,
      maxCompletionsTotal: row.max_completions_total,
      startDate: toIso(row.start_date),
      endDate: toIso(row.end_date),
      isActive: row.is_active,
      fixtureType: row.fixture_type,
      fixtureMultiplier: toNumberOrNull(row.fixture_multiplier),
      homeClubName: row.home_club_name,
      awayClubName: row.away_club_name,
    }));
  }

  async getMissionCatalogueReadiness(): Promise<MissionCatalogueReadiness> {
    const counts = await this.getMissionCatalogueCounts();

    return {
      profileFoundationAccepted: true,
      currentSeasonAvailable: counts.currentSeasons === 1,
      activeFixtureAvailable: counts.activeFixtures >= 1,
      activeMissionWindowAvailable: counts.activeMissionWindows >= 1,
      activeMissionAvailable: counts.activeMissions >= 1,
      actionTypeCoverageAvailable: counts.actionTypes >= 14,
      missionCategoryCoverageAvailable: counts.missionCategories >= 4,
      pointsAwardContextAvailable: counts.approvedActions >= 1 && counts.submittedActions >= 1,
    };
  }

  async getMissionCatalogueSnapshot(): Promise<MissionCatalogueSnapshot> {
    const [counts, fixtures, missions, readiness] = await Promise.all([
      this.getMissionCatalogueCounts(),
      this.getFixtureMissionCards(),
      this.getMissionCatalogueCards(),
      this.getMissionCatalogueReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Mission catalogue is connected to active fixture windows, action categories, verification tiers and accepted points output.',
      counts,
      fixtures,
      missions,
      readiness,
    };
  }
}

export function createCommunityLeagueMissionCatalogueService(
  db: PrismaClient = prisma,
): CommunityLeagueMissionCatalogueService {
  return new CommunityLeagueMissionCatalogueService(db);
}