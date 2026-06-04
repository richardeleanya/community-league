import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import { validatePointsAwardDecisionDraft } from './schema';
import type {
  AwardedActionCard,
  LeagueTableAwardRow,
  PointsAwardCounts,
  PointsAwardDecisionValidation,
  PointsAwardFoundationSnapshot,
  PointsAwardReadiness,
} from './types';

type CountRow = {
  approved_actions: number;
  pending_actions: number;
  total_final_points_awarded: number;
  total_xp_awarded: number;
  total_legacy_awarded: number;
  league_table_rows: number;
  individual_ranking_rows: number;
  legacy_map_pins: number;
  points_awarded_notifications: number;
  points_audit_logs: number;
  award_functions: number;
  award_triggers: number;
};

type AwardedActionRow = {
  id: string;
  supporter_id: string;
  username: string;
  club_id: string;
  club_name: string;
  action_type: string;
  verification_status: string;
  base_points: number;
  multiplier_applied: number;
  final_points_awarded: number;
  xp_awarded: number;
  legacy_points_awarded: number;
  verified_at: Date | string | null;
};

type LeagueTableRow = {
  club_id: string;
  club_name: string;
  position: number;
  community_tasks_completed: number;
  community_points_for: number;
  community_points_against: number;
  community_difference: number;
  points: number;
};

function toIso(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export class CommunityLeaguePointsAwardService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getPointsAwardCounts(): Promise<PointsAwardCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status = 'pending'
        ) AS pending_actions,
        (
          SELECT COALESCE(SUM(final_points_awarded), 0)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS total_final_points_awarded,
        (
          SELECT COALESCE(SUM(xp_awarded), 0)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS total_xp_awarded,
        (
          SELECT COALESCE(SUM(legacy_points_awarded), 0)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS total_legacy_awarded,
        (SELECT count(*)::int FROM public.league_tables) AS league_table_rows,
        (SELECT count(*)::int FROM public.individual_rankings) AS individual_ranking_rows,
        (SELECT count(*)::int FROM public.legacy_map_pins) AS legacy_map_pins,
        (
          SELECT count(*)::int
          FROM public.notifications
          WHERE type = 'points_awarded'
        ) AS points_awarded_notifications,
        (
          SELECT count(*)::int
          FROM public.audit_logs
          WHERE action = 'action.points_awarded'
        ) AS points_audit_logs,
        (
          SELECT count(*)::int
          FROM pg_proc p
          JOIN pg_namespace n
            ON n.oid = p.pronamespace
          WHERE n.nspname = 'public'
            AND p.proname IN ('process_approved_action', 'recalculate_league_table', 'calculate_streak')
        ) AS award_functions,
        (
          SELECT count(*)::int
          FROM pg_trigger
          WHERE NOT tgisinternal
            AND tgname = 'process_approved_action_after_status_change'
        ) AS award_triggers
    `;

    const row = rows[0];

    return {
      approvedActions: row?.approved_actions ?? 0,
      pendingActions: row?.pending_actions ?? 0,
      totalFinalPointsAwarded: row?.total_final_points_awarded ?? 0,
      totalXpAwarded: row?.total_xp_awarded ?? 0,
      totalLegacyAwarded: row?.total_legacy_awarded ?? 0,
      leagueTableRows: row?.league_table_rows ?? 0,
      individualRankingRows: row?.individual_ranking_rows ?? 0,
      legacyMapPins: row?.legacy_map_pins ?? 0,
      pointsAwardedNotifications: row?.points_awarded_notifications ?? 0,
      pointsAuditLogs: row?.points_audit_logs ?? 0,
      awardFunctions: row?.award_functions ?? 0,
      awardTriggers: row?.award_triggers ?? 0,
    };
  }

  async getAwardedActions(limit = 10): Promise<AwardedActionCard[]> {
    const rows = await this.db.$queryRaw<AwardedActionRow[]>`
      SELECT
        ca.id::text,
        ca.supporter_id::text,
        sp.username,
        ca.club_id::text,
        c.name AS club_name,
        ca.action_type::text,
        ca.verification_status::text,
        ca.base_points,
        ca.multiplier_applied::float AS multiplier_applied,
        ca.final_points_awarded,
        ca.xp_awarded,
        ca.legacy_points_awarded,
        ca.verified_at
      FROM public.community_actions ca
      JOIN public.supporter_profiles sp
        ON sp.id = ca.supporter_id
      JOIN public.clubs c
        ON c.id = ca.club_id
      WHERE ca.verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
      ORDER BY ca.verified_at DESC NULLS LAST, ca.updated_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      supporterId: row.supporter_id,
      username: row.username,
      clubId: row.club_id,
      clubName: row.club_name,
      actionType: row.action_type,
      verificationStatus: row.verification_status,
      basePoints: row.base_points,
      multiplierApplied: row.multiplier_applied,
      finalPointsAwarded: row.final_points_awarded,
      xpAwarded: row.xp_awarded,
      legacyPointsAwarded: row.legacy_points_awarded,
      verifiedAt: toIso(row.verified_at),
    }));
  }

  async getLeagueTableRows(limit = 20): Promise<LeagueTableAwardRow[]> {
    const rows = await this.db.$queryRaw<LeagueTableRow[]>`
      SELECT
        lt.club_id::text,
        c.name AS club_name,
        lt.position,
        lt.community_tasks_completed,
        lt.community_points_for,
        lt.community_points_against,
        lt.community_difference,
        lt.points
      FROM public.league_tables lt
      JOIN public.clubs c
        ON c.id = lt.club_id
      ORDER BY lt.position ASC, c.name ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      clubId: row.club_id,
      clubName: row.club_name,
      position: row.position,
      communityTasksCompleted: row.community_tasks_completed,
      communityPointsFor: row.community_points_for,
      communityPointsAgainst: row.community_points_against,
      communityDifference: row.community_difference,
      points: row.points,
    }));
  }

  async getPointsAwardReadiness(): Promise<PointsAwardReadiness> {
    const counts = await this.getPointsAwardCounts();

    return {
      verificationQueueFoundationAccepted: true,
      processApprovedActionFunctionAvailable: counts.awardFunctions >= 3,
      approvedActionTriggerAvailable: counts.awardTriggers === 1,
      approvedActionAvailable: counts.approvedActions >= 1 && counts.totalFinalPointsAwarded >= 1,
      leagueTableAvailable: counts.leagueTableRows >= 1,
      individualRankingAvailable: counts.individualRankingRows >= 1,
      notificationAwardAvailable: counts.pointsAwardedNotifications >= 1,
      auditAwardAvailable: counts.pointsAuditLogs >= 1,
    };
  }

  validateDecisionDraft(input: unknown): PointsAwardDecisionValidation {
    return validatePointsAwardDecisionDraft(input);
  }

  async getPointsAwardFoundationSnapshot(): Promise<PointsAwardFoundationSnapshot> {
    const [counts, awardedActions, leagueTable, readiness] = await Promise.all([
      this.getPointsAwardCounts(),
      this.getAwardedActions(),
      this.getLeagueTableRows(),
      this.getPointsAwardReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Points award foundation is connected to the approved-action trigger, points engine, league table, individual rankings, notifications and audit trail.',
      counts,
      awardedActions,
      leagueTable,
      readiness,
    };
  }
}

export function createCommunityLeaguePointsAwardService(
  db: PrismaClient = prisma,
): CommunityLeaguePointsAwardService {
  return new CommunityLeaguePointsAwardService(db);
}