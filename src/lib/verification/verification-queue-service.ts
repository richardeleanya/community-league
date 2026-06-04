import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import { validateVerificationDecisionDraft } from './schema';
import type {
  VerificationDecisionValidation,
  VerificationQueueCounts,
  VerificationQueueFoundationSnapshot,
  VerificationQueueItem,
  VerificationQueueReadiness,
} from './types';

type CountRow = {
  total_actions: number;
  pending_actions: number;
  under_review_actions: number;
  flagged_actions: number;
  approved_actions: number;
  rejected_actions: number;
  open_peer_validations: number;
  open_fraud_reports: number;
  moderators: number;
};

type QueueRow = {
  id: string;
  supporter_id: string;
  username: string;
  club_id: string;
  club_name: string;
  mission_title: string | null;
  action_type: string;
  action_category: string;
  verification_status: string;
  verification_tier: string;
  fraud_score: number;
  base_points: number;
  submitted_at: Date | string;
  action_date: Date | string;
  description: string;
};

type ReadinessRow = {
  pending_actions: number;
  status_enum_values: number;
  queue_tables: number;
  moderator_columns: number;
  audit_tables: number;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export class CommunityLeagueVerificationQueueService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getVerificationQueueCounts(): Promise<VerificationQueueCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.community_actions) AS total_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status = 'pending'
        ) AS pending_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status = 'under_review'
        ) AS under_review_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status = 'flagged'
        ) AS flagged_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status = 'rejected'
        ) AS rejected_actions,
        (
          SELECT count(*)::int
          FROM public.peer_validations
          WHERE responded_at IS NULL
        ) AS open_peer_validations,
        (
          SELECT count(*)::int
          FROM public.fraud_reports
          WHERE status IN ('open', 'under_review')
        ) AS open_fraud_reports,
        (
          SELECT count(*)::int
          FROM public.users
          WHERE is_moderator = true OR is_admin = true
        ) AS moderators
    `;

    const row = rows[0];

    return {
      totalActions: row?.total_actions ?? 0,
      pendingActions: row?.pending_actions ?? 0,
      underReviewActions: row?.under_review_actions ?? 0,
      flaggedActions: row?.flagged_actions ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      rejectedActions: row?.rejected_actions ?? 0,
      openPeerValidations: row?.open_peer_validations ?? 0,
      openFraudReports: row?.open_fraud_reports ?? 0,
      moderators: row?.moderators ?? 0,
    };
  }

  async getQueueItems(limit = 20): Promise<VerificationQueueItem[]> {
    const rows = await this.db.$queryRaw<QueueRow[]>`
      SELECT
        ca.id::text,
        ca.supporter_id::text,
        sp.username,
        ca.club_id::text,
        c.name AS club_name,
        m.title AS mission_title,
        ca.action_type::text,
        ca.action_category::text,
        ca.verification_status::text,
        ca.verification_tier::text,
        ca.fraud_score,
        ca.base_points,
        ca.submitted_at,
        ca.action_date,
        ca.description
      FROM public.community_actions ca
      JOIN public.supporter_profiles sp
        ON sp.id = ca.supporter_id
      JOIN public.clubs c
        ON c.id = ca.club_id
      LEFT JOIN public.missions m
        ON m.id = ca.mission_id
      WHERE ca.verification_status IN ('pending', 'under_review', 'flagged')
      ORDER BY
        CASE ca.verification_status::text
          WHEN 'flagged' THEN 1
          WHEN 'under_review' THEN 2
          ELSE 3
        END,
        ca.submitted_at ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      supporterId: row.supporter_id,
      username: row.username,
      clubId: row.club_id,
      clubName: row.club_name,
      missionTitle: row.mission_title,
      actionType: row.action_type,
      actionCategory: row.action_category,
      verificationStatus: row.verification_status,
      verificationTier: row.verification_tier,
      fraudScore: row.fraud_score,
      basePoints: row.base_points,
      submittedAt: toIso(row.submitted_at),
      actionDate: toIso(row.action_date),
      description: row.description,
    }));
  }

  async getVerificationQueueReadiness(): Promise<VerificationQueueReadiness> {
    const rows = await this.db.$queryRaw<ReadinessRow[]>`
      SELECT
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('pending', 'under_review', 'flagged')
        ) AS pending_actions,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'verification_status_enum'
        ) AS status_enum_values,
        (
          SELECT count(*)::int
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name IN ('community_actions', 'peer_validations', 'fraud_reports', 'audit_logs')
        ) AS queue_tables,
        (
          SELECT count(*)::int
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name IN ('is_admin', 'is_moderator')
        ) AS moderator_columns,
        (
          SELECT count(*)::int
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name IN ('audit_logs', 'fraud_reports', 'penalties')
        ) AS audit_tables
    `;

    const row = rows[0];

    return {
      actionSubmissionFoundationAccepted: true,
      pendingQueueAvailable: (row?.pending_actions ?? 0) >= 1,
      statusEnumAvailable: (row?.status_enum_values ?? 0) >= 7,
      queueTablesAvailable: (row?.queue_tables ?? 0) === 4,
      moderationAccessLayerAvailable: (row?.moderator_columns ?? 0) === 2,
      decisionValidationReady: true,
      auditTrailTargetAvailable: (row?.audit_tables ?? 0) === 3,
    };
  }

  validateDecisionDraft(input: unknown): VerificationDecisionValidation {
    return validateVerificationDecisionDraft(input);
  }

  async getVerificationQueueFoundationSnapshot(): Promise<VerificationQueueFoundationSnapshot> {
    const [counts, queue, readiness] = await Promise.all([
      this.getVerificationQueueCounts(),
      this.getQueueItems(),
      this.getVerificationQueueReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Verification queue foundation is connected to live pending actions, moderation access, fraud reports, peer validation and audit targets.',
      counts,
      queue,
      readiness,
    };
  }
}

export function createCommunityLeagueVerificationQueueService(
  db: PrismaClient = prisma,
): CommunityLeagueVerificationQueueService {
  return new CommunityLeagueVerificationQueueService(db);
}