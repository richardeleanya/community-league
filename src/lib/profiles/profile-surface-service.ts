import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  ClubProfileSummary,
  ProfileSurfaceCounts,
  ProfileSurfaceReadiness,
  ProfileSurfaceSnapshot,
  SupporterProfileSummary,
} from './types';

type CountRow = {
  current_seasons: number;
  active_clubs: number;
  supporter_profiles: number;
  public_supporter_profiles: number;
  approved_actions: number;
  league_table_rows: number;
  individual_ranking_rows: number;
  top_club_community_points: number;
  top_supporter_community_points: number;
  legacy_map_pins: number;
};

type ClubRow = {
  club_id: string;
  name: string;
  slug: string;
  country: string;
  league_position: number;
  community_points: number;
  community_tasks_completed: number;
  community_difference: number;
  season_community_points: number;
  supporter_count: number;
  approved_actions: number;
  is_active: boolean;
};

type SupporterRow = {
  supporter_id: string;
  username: string;
  display_name: string | null;
  club_id: string;
  club_name: string;
  current_level: number;
  level_title: string | null;
  season_community_points: number;
  all_time_community_points: number;
  ranking_community_points: number;
  legacy_score: number;
  rank_overall: number;
  rank_in_club: number;
  last_action_at: Date | string | null;
};

function toIsoOrNull(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export class CommunityLeagueProfileSurfaceService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getProfileSurfaceCounts(): Promise<ProfileSurfaceCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (SELECT count(*)::int FROM public.supporter_profiles) AS supporter_profiles,
        (SELECT count(*)::int FROM public.supporter_profiles WHERE is_public = true) AS public_supporter_profiles,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        (SELECT count(*)::int FROM public.league_tables) AS league_table_rows,
        (SELECT count(*)::int FROM public.individual_rankings) AS individual_ranking_rows,
        (
          SELECT COALESCE(MAX(community_points_for), 0)::int
          FROM public.league_tables
        ) AS top_club_community_points,
        (
          SELECT COALESCE(MAX(community_points), 0)::int
          FROM public.individual_rankings
        ) AS top_supporter_community_points,
        (SELECT count(*)::int FROM public.legacy_map_pins) AS legacy_map_pins
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      supporterProfiles: row?.supporter_profiles ?? 0,
      publicSupporterProfiles: row?.public_supporter_profiles ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      leagueTableRows: row?.league_table_rows ?? 0,
      individualRankingRows: row?.individual_ranking_rows ?? 0,
      topClubCommunityPoints: row?.top_club_community_points ?? 0,
      topSupporterCommunityPoints: row?.top_supporter_community_points ?? 0,
      legacyMapPins: row?.legacy_map_pins ?? 0,
    };
  }

  async getClubProfiles(limit = 12): Promise<ClubProfileSummary[]> {
    const rows = await this.db.$queryRaw<ClubRow[]>`
      SELECT
        c.id::text AS club_id,
        c.name,
        c.slug,
        c.country,
        COALESCE(lt.position, c.season_position, 0)::int AS league_position,
        COALESCE(lt.community_points_for, c.community_points_season, 0)::int AS community_points,
        COALESCE(lt.community_tasks_completed, 0)::int AS community_tasks_completed,
        COALESCE(lt.community_difference, 0)::int AS community_difference,
        COALESCE(c.community_points_season, 0)::int AS season_community_points,
        (
          SELECT count(*)::int
          FROM public.supporter_profiles sp
          WHERE sp.club_id = c.id
        ) AS supporter_count,
        (
          SELECT count(*)::int
          FROM public.community_actions ca
          WHERE ca.club_id = c.id
            AND ca.verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        c.is_active
      FROM public.clubs c
      LEFT JOIN public.league_tables lt
        ON lt.club_id = c.id
       AND lt.season_id = (
          SELECT id
          FROM public.seasons
          WHERE is_current = true
          ORDER BY created_at DESC
          LIMIT 1
        )
      WHERE c.is_active = true
      ORDER BY
        COALESCE(lt.community_points_for, c.community_points_season, 0) DESC,
        COALESCE(lt.community_difference, 0) DESC,
        c.name ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      clubId: row.club_id,
      name: row.name,
      slug: row.slug,
      country: row.country,
      leaguePosition: row.league_position,
      communityPoints: row.community_points,
      communityTasksCompleted: row.community_tasks_completed,
      communityDifference: row.community_difference,
      seasonCommunityPoints: row.season_community_points,
      supporterCount: row.supporter_count,
      approvedActions: row.approved_actions,
      isActive: row.is_active,
    }));
  }

  async getSupporterProfiles(limit = 12): Promise<SupporterProfileSummary[]> {
    const rows = await this.db.$queryRaw<SupporterRow[]>`
      SELECT
        sp.id::text AS supporter_id,
        sp.username,
        sp.display_name,
        sp.club_id::text,
        c.name AS club_name,
        sp.current_level,
        xlt.title AS level_title,
        COALESCE(sp.community_points_season, 0)::int AS season_community_points,
        COALESCE(sp.community_points_alltime, 0)::int AS all_time_community_points,
        COALESCE(ir.community_points, sp.community_points_season, 0)::int AS ranking_community_points,
        COALESCE(sp.legacy_score, 0)::int AS legacy_score,
        COALESCE(ir.rank_overall, 0)::int AS rank_overall,
        COALESCE(ir.rank_in_club, 0)::int AS rank_in_club,
        sp.last_action_at
      FROM public.supporter_profiles sp
      JOIN public.clubs c
        ON c.id = sp.club_id
      LEFT JOIN public.individual_rankings ir
        ON ir.supporter_id = sp.id
       AND ir.season_id = (
          SELECT id
          FROM public.seasons
          WHERE is_current = true
          ORDER BY created_at DESC
          LIMIT 1
        )
      LEFT JOIN public.xp_level_thresholds xlt
        ON xlt.level = sp.current_level
      ORDER BY
        COALESCE(ir.community_points, sp.community_points_season, 0) DESC,
        COALESCE(sp.legacy_score, 0) DESC,
        sp.username ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      supporterId: row.supporter_id,
      username: row.username,
      displayName: row.display_name ?? row.username,
      clubId: row.club_id,
      clubName: row.club_name,
      currentLevel: row.current_level,
      levelTitle: row.level_title ?? 'Supporter',
      seasonCommunityPoints: row.season_community_points,
      allTimeCommunityPoints: row.all_time_community_points,
      rankingCommunityPoints: row.ranking_community_points,
      legacyScore: row.legacy_score,
      rankOverall: row.rank_overall,
      rankInClub: row.rank_in_club,
      lastActionAt: toIsoOrNull(row.last_action_at),
    }));
  }

  async getProfileSurfaceReadiness(): Promise<ProfileSurfaceReadiness> {
    const counts = await this.getProfileSurfaceCounts();

    return {
      leaderboardFoundationAccepted: true,
      currentSeasonAvailable: counts.currentSeasons === 1,
      clubProfilesAvailable: counts.activeClubs >= 2,
      supporterProfilesAvailable: counts.supporterProfiles >= 1,
      leaguePositionAvailable: counts.leagueTableRows >= 1 && counts.topClubCommunityPoints >= 1,
      supporterRankingAvailable:
        counts.individualRankingRows >= 1 && counts.topSupporterCommunityPoints >= 1,
      communityPointsVisible:
        counts.topClubCommunityPoints >= 1 && counts.topSupporterCommunityPoints >= 1,
      legacyProofAvailable: counts.legacyMapPins >= 1,
    };
  }

  async getProfileSurfaceSnapshot(): Promise<ProfileSurfaceSnapshot> {
    const [counts, clubs, supporters, readiness] = await Promise.all([
      this.getProfileSurfaceCounts(),
      this.getClubProfiles(),
      this.getSupporterProfiles(),
      this.getProfileSurfaceReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Club and supporter profiles are connected to community points, ranking and legacy proof outputs.',
      counts,
      clubs,
      supporters,
      readiness,
    };
  }
}

export function createCommunityLeagueProfileSurfaceService(
  db: PrismaClient = prisma,
): CommunityLeagueProfileSurfaceService {
  return new CommunityLeagueProfileSurfaceService(db);
}