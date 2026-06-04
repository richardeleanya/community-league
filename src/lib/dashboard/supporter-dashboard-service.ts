import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  SupporterClubStanding,
  SupporterDashboardCounts,
  SupporterDashboardMetric,
  SupporterDashboardReadiness,
  SupporterDashboardSnapshot,
  SupporterProgressBand,
} from './types';

type DashboardCountsRow = {
  current_seasons: number;
  active_leagues: number;
  active_clubs: number;
  missions: number;
  submitted_actions: number;
  approved_actions: number;
  supporter_profiles: number;
  xp_levels: number;
};

type ClubStandingRow = {
  club_id: string;
  club_name: string;
  club_slug: string;
  league_name: string;
  season_position: number | null;
  community_points_season: number;
  legacy_score: number;
  is_verified: boolean;
};

type ProgressBandRow = {
  level: number;
  title: string;
  xp_required: number;
  colour: string | null;
};

type DashboardReadinessRow = {
  current_seasons: number;
  active_leagues: number;
  active_clubs: number;
  xp_levels: number;
  settings: number;
};

export class CommunityLeagueSupporterDashboardService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getDashboardCounts(): Promise<SupporterDashboardCounts> {
    const rows = await this.db.$queryRaw<DashboardCountsRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (SELECT count(*)::int FROM public.missions WHERE is_active = true) AS missions,
        (SELECT count(*)::int FROM public.community_actions) AS submitted_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        (SELECT count(*)::int FROM public.supporter_profiles) AS supporter_profiles,
        (SELECT count(*)::int FROM public.xp_level_thresholds) AS xp_levels
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      activeLeagues: row?.active_leagues ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      missions: row?.missions ?? 0,
      submittedActions: row?.submitted_actions ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      supporterProfiles: row?.supporter_profiles ?? 0,
      xpLevels: row?.xp_levels ?? 0,
    };
  }

  async getFeaturedClubStandings(limit = 6): Promise<SupporterClubStanding[]> {
    const rows = await this.db.$queryRaw<ClubStandingRow[]>`
      SELECT
        c.id::text AS club_id,
        c.name AS club_name,
        c.slug AS club_slug,
        l.display_name AS league_name,
        c.season_position,
        c.community_points_season,
        c.legacy_score,
        c.is_verified
      FROM public.clubs c
      JOIN public.leagues l
        ON l.id = c.league_id
      WHERE c.is_active = true
        AND l.is_active = true
      ORDER BY
        c.season_position ASC NULLS LAST,
        c.community_points_season DESC,
        c.legacy_score DESC,
        c.name ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      clubId: row.club_id,
      clubName: row.club_name,
      clubSlug: row.club_slug,
      leagueName: row.league_name,
      seasonPosition: row.season_position,
      communityPointsSeason: row.community_points_season,
      legacyScore: row.legacy_score,
      isVerified: row.is_verified,
    }));
  }

  async getProgressBands(): Promise<SupporterProgressBand[]> {
    const rows = await this.db.$queryRaw<ProgressBandRow[]>`
      SELECT
        level,
        title,
        xp_required,
        colour
      FROM public.xp_level_thresholds
      WHERE level IN (1, 5, 10, 20, 35, 50, 75, 100)
      ORDER BY level ASC
    `;

    return rows.map((row) => ({
      level: row.level,
      title: row.title,
      xpRequired: row.xp_required,
      colour: row.colour,
    }));
  }

  buildMetrics(counts: SupporterDashboardCounts): SupporterDashboardMetric[] {
    return [
      {
        label: 'Active clubs',
        value: counts.activeClubs,
        proof: 'Counted from active public clubs linked to accepted league discovery.',
      },
      {
        label: 'Supporter profiles',
        value: counts.supporterProfiles,
        proof: 'Counted from supporter_profiles for dashboard identity readiness.',
      },
      {
        label: 'Approved actions',
        value: counts.approvedActions,
        proof: 'Counted from community_actions approved verification states.',
      },
      {
        label: 'XP levels',
        value: counts.xpLevels,
        proof: 'Counted from seeded xp_level_thresholds foundation.',
      },
    ];
  }

  async getDashboardReadiness(): Promise<SupporterDashboardReadiness> {
    const rows = await this.db.$queryRaw<DashboardReadinessRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (SELECT count(*)::int FROM public.xp_level_thresholds) AS xp_levels,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key IN ('points_multiplier_table', 'referral_bonus_points')
        ) AS settings
    `;

    const row = rows[0];

    return {
      discoveryFoundationAccepted: true,
      currentSeasonAvailable: (row?.current_seasons ?? 0) === 1,
      clubLeagueDiscoveryAvailable: (row?.active_leagues ?? 0) >= 1 && (row?.active_clubs ?? 0) >= 2,
      supporterProgressAvailable: (row?.xp_levels ?? 0) === 100,
      pointsEngineBaselineAvailable: (row?.settings ?? 0) === 2,
      dashboardApiReady: true,
    };
  }

  async getSupporterDashboardSnapshot(): Promise<SupporterDashboardSnapshot> {
    const [counts, featuredClubs, progressBands, readiness] = await Promise.all([
      this.getDashboardCounts(),
      this.getFeaturedClubStandings(),
      this.getProgressBands(),
      this.getDashboardReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline: 'Supporter dashboard foundation is connected to live league, club, action and XP data.',
      counts,
      metrics: this.buildMetrics(counts),
      featuredClubs,
      progressBands,
      readiness,
    };
  }
}

export function createCommunityLeagueSupporterDashboardService(
  db: PrismaClient = prisma,
): CommunityLeagueSupporterDashboardService {
  return new CommunityLeagueSupporterDashboardService(db);
}