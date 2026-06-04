import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  IndividualLeaderboardRow,
  LeaderboardCounts,
  LeaderboardFoundationSnapshot,
  LeaderboardReadiness,
  LeagueTableLeaderboardRow,
} from './types';

type CountRow = {
  current_seasons: number;
  active_leagues: number;
  active_clubs: number;
  approved_actions: number;
  league_table_rows: number;
  individual_ranking_rows: number;
  top_club_points: number;
  top_supporter_points: number;
  points_awarded_notifications: number;
  points_audit_logs: number;
};

type LeagueTableRow = {
  club_id: string;
  club_name: string;
  club_slug: string;
  position: number;
  community_tasks_completed: number;
  community_points_for: number;
  community_points_against: number;
  community_difference: number;
  points: number;
};

type IndividualRow = {
  supporter_id: string;
  username: string;
  display_name: string | null;
  club_id: string;
  club_name: string;
  rank_overall: number;
  rank_in_club: number;
  community_points: number;
};

export class CommunityLeagueLeaderboardService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getLeaderboardCounts(): Promise<LeaderboardCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
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
        ) AS top_club_points,
        (
          SELECT COALESCE(MAX(community_points), 0)::int
          FROM public.individual_rankings
        ) AS top_supporter_points,
        (
          SELECT count(*)::int
          FROM public.notifications
          WHERE type = 'points_awarded'
        ) AS points_awarded_notifications,
        (
          SELECT count(*)::int
          FROM public.audit_logs
          WHERE action = 'action.points_awarded'
        ) AS points_audit_logs
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      activeLeagues: row?.active_leagues ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      leagueTableRows: row?.league_table_rows ?? 0,
      individualRankingRows: row?.individual_ranking_rows ?? 0,
      topClubPoints: row?.top_club_points ?? 0,
      topSupporterPoints: row?.top_supporter_points ?? 0,
      pointsAwardedNotifications: row?.points_awarded_notifications ?? 0,
      pointsAuditLogs: row?.points_audit_logs ?? 0,
    };
  }

  async getLeagueTable(limit = 20): Promise<LeagueTableLeaderboardRow[]> {
    const rows = await this.db.$queryRaw<LeagueTableRow[]>`
      SELECT
        lt.club_id::text,
        c.name AS club_name,
        c.slug AS club_slug,
        lt.position,
        lt.community_tasks_completed,
        lt.community_points_for,
        lt.community_points_against,
        lt.community_difference,
        lt.points
      FROM public.league_tables lt
      JOIN public.clubs c
        ON c.id = lt.club_id
      WHERE lt.season_id = (
        SELECT id
        FROM public.seasons
        WHERE is_current = true
        ORDER BY created_at DESC
        LIMIT 1
      )
      ORDER BY
        lt.community_points_for DESC,
        lt.community_difference DESC,
        lt.position ASC,
        c.name ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      clubId: row.club_id,
      clubName: row.club_name,
      clubSlug: row.club_slug,
      position: row.position,
      communityTasksCompleted: row.community_tasks_completed,
      communityPointsFor: row.community_points_for,
      communityPointsAgainst: row.community_points_against,
      communityDifference: row.community_difference,
      points: row.points,
    }));
  }

  async getIndividualLeaderboard(limit = 20): Promise<IndividualLeaderboardRow[]> {
    const rows = await this.db.$queryRaw<IndividualRow[]>`
      SELECT
        ir.supporter_id::text,
        sp.username,
        sp.display_name,
        ir.club_id::text,
        c.name AS club_name,
        ir.rank_overall,
        ir.rank_in_club,
        ir.community_points
      FROM public.individual_rankings ir
      JOIN public.supporter_profiles sp
        ON sp.id = ir.supporter_id
      JOIN public.clubs c
        ON c.id = ir.club_id
      WHERE ir.season_id = (
        SELECT id
        FROM public.seasons
        WHERE is_current = true
        ORDER BY created_at DESC
        LIMIT 1
      )
      ORDER BY ir.community_points DESC, ir.rank_overall ASC, sp.username ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      supporterId: row.supporter_id,
      username: row.username,
      displayName: row.display_name ?? row.username,
      clubId: row.club_id,
      clubName: row.club_name,
      rankOverall: row.rank_overall,
      rankInClub: row.rank_in_club,
      communityPoints: row.community_points,
    }));
  }

  async getLeaderboardReadiness(): Promise<LeaderboardReadiness> {
    const counts = await this.getLeaderboardCounts();

    return {
      pointsAwardFoundationAccepted: true,
      currentSeasonAvailable: counts.currentSeasons === 1,
      activeLeagueAvailable: counts.activeLeagues >= 1,
      leagueTableAvailable: counts.leagueTableRows >= 1 && counts.topClubPoints >= 1,
      individualLeaderboardAvailable: counts.individualRankingRows >= 1 && counts.topSupporterPoints >= 1,
      approvedActionAvailable: counts.approvedActions >= 1,
      pointsNotificationAvailable: counts.pointsAwardedNotifications >= 1,
      pointsAuditAvailable: counts.pointsAuditLogs >= 1,
    };
  }

  async getLeaderboardFoundationSnapshot(): Promise<LeaderboardFoundationSnapshot> {
    const [counts, leagueTable, individualLeaderboard, readiness] = await Promise.all([
      this.getLeaderboardCounts(),
      this.getLeagueTable(),
      this.getIndividualLeaderboard(),
      this.getLeaderboardReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'League table and supporter leaderboard are connected to the accepted community points award outputs.',
      counts,
      leagueTable,
      individualLeaderboard,
      readiness,
    };
  }
}

export function createCommunityLeagueLeaderboardService(
  db: PrismaClient = prisma,
): CommunityLeagueLeaderboardService {
  return new CommunityLeagueLeaderboardService(db);
}