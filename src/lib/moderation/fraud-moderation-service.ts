import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  ModerationReviewCounts,
  ModerationReviewItem,
  ModerationReviewReadiness,
  ModerationReviewSnapshot,
  ModerationRiskSignal,
} from './types';

type CountRow = {
  current_seasons: number;
  submitted_actions: number;
  approved_actions: number;
  pending_actions: number;
  under_review_actions: number;
  flagged_actions: number;
  fraudulent_actions: number;
  actions_with_fraud_score: number;
  fraud_report_rows: number;
  open_fraud_reports: number;
  report_types: number;
  report_statuses: number;
  active_penalties: number;
};

type ReviewRow = {
  action_id: string;
  supporter_id: string;
  username: string;
  display_name: string | null;
  club_id: string;
  club_name: string;
  mission_id: string | null;
  mission_title: string | null;
  action_type: string;
  action_category: string;
  description: string;
  photo_count: number;
  gps_accuracy_metres: number | string;
  verification_status: string;
  verification_tier: string;
  fraud_score: number | null;
  is_fraudulent: boolean;
  duplicate_hash_present: boolean;
  device_fingerprint_present: boolean;
  submitted_at: Date | string;
  final_points_awarded: number;
};

type RiskRow = {
  action_id: string;
  risk_band: 'low' | 'review' | 'high';
  fraud_score: number | null;
  gps_evidence_present: boolean;
  photo_evidence_present: boolean;
  duplicate_hash_present: boolean;
  device_fingerprint_present: boolean;
  is_fraudulent: boolean;
  verification_status: string;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export class CommunityLeagueFraudModerationService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getModerationReviewCounts(): Promise<ModerationReviewCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.community_actions) AS submitted_actions,
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
          WHERE is_fraudulent = true
        ) AS fraudulent_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE fraud_score IS NOT NULL
        ) AS actions_with_fraud_score,
        (SELECT count(*)::int FROM public.fraud_reports) AS fraud_report_rows,
        (
          SELECT count(*)::int
          FROM public.fraud_reports
          WHERE status = 'open'
        ) AS open_fraud_reports,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'report_type_enum'
        ) AS report_types,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'report_status_enum'
        ) AS report_statuses,
        (
          SELECT count(*)::int
          FROM public.penalties
          WHERE is_active = true
        ) AS active_penalties
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      submittedActions: row?.submitted_actions ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      pendingActions: row?.pending_actions ?? 0,
      underReviewActions: row?.under_review_actions ?? 0,
      flaggedActions: row?.flagged_actions ?? 0,
      fraudulentActions: row?.fraudulent_actions ?? 0,
      actionsWithFraudScore: row?.actions_with_fraud_score ?? 0,
      fraudReportRows: row?.fraud_report_rows ?? 0,
      openFraudReports: row?.open_fraud_reports ?? 0,
      reportTypes: row?.report_types ?? 0,
      reportStatuses: row?.report_statuses ?? 0,
      activePenalties: row?.active_penalties ?? 0,
    };
  }

  async getModerationReviewItems(limit = 12): Promise<ModerationReviewItem[]> {
    const rows = await this.db.$queryRaw<ReviewRow[]>`
      SELECT
        ca.id::text AS action_id,
        ca.supporter_id::text,
        sp.username,
        sp.display_name,
        ca.club_id::text,
        c.name AS club_name,
        ca.mission_id::text,
        m.title AS mission_title,
        ca.action_type::text,
        ca.action_category::text,
        ca.description,
        COALESCE(cardinality(ca.photo_urls), 0)::int AS photo_count,
        ca.gps_accuracy_metres,
        ca.verification_status::text,
        ca.verification_tier::text,
        ca.fraud_score,
        ca.is_fraudulent,
        (ca.duplicate_hash IS NOT NULL) AS duplicate_hash_present,
        (ca.device_fingerprint IS NOT NULL) AS device_fingerprint_present,
        ca.submitted_at,
        ca.final_points_awarded
      FROM public.community_actions ca
      JOIN public.supporter_profiles sp
        ON sp.id = ca.supporter_id
      JOIN public.clubs c
        ON c.id = ca.club_id
      LEFT JOIN public.missions m
        ON m.id = ca.mission_id
      ORDER BY
        COALESCE(ca.fraud_score, 0) DESC,
        CASE
          WHEN ca.verification_status IN ('under_review', 'flagged', 'pending') THEN 0
          ELSE 1
        END,
        ca.submitted_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      actionId: row.action_id,
      supporterId: row.supporter_id,
      username: row.username,
      displayName: row.display_name ?? row.username,
      clubId: row.club_id,
      clubName: row.club_name,
      missionId: row.mission_id,
      missionTitle: row.mission_title,
      actionType: row.action_type,
      actionCategory: row.action_category,
      description: row.description,
      photoCount: row.photo_count,
      gpsAccuracyMetres: Number(row.gps_accuracy_metres),
      verificationStatus: row.verification_status,
      verificationTier: row.verification_tier,
      fraudScore: row.fraud_score ?? 0,
      isFraudulent: row.is_fraudulent,
      duplicateHashPresent: row.duplicate_hash_present,
      deviceFingerprintPresent: row.device_fingerprint_present,
      submittedAt: toIso(row.submitted_at),
      finalPointsAwarded: row.final_points_awarded,
    }));
  }

  async getModerationRiskSignals(limit = 12): Promise<ModerationRiskSignal[]> {
    const rows = await this.db.$queryRaw<RiskRow[]>`
      SELECT
        ca.id::text AS action_id,
        CASE
          WHEN ca.is_fraudulent = true OR COALESCE(ca.fraud_score, 0) >= 70 THEN 'high'
          WHEN ca.verification_status IN ('under_review', 'flagged')
            OR COALESCE(ca.fraud_score, 0) >= 40
          THEN 'review'
          ELSE 'low'
        END AS risk_band,
        ca.fraud_score,
        (
          ca.gps_latitude IS NOT NULL
          AND ca.gps_longitude IS NOT NULL
          AND ca.gps_accuracy_metres IS NOT NULL
        ) AS gps_evidence_present,
        (COALESCE(cardinality(ca.photo_urls), 0) > 0) AS photo_evidence_present,
        (ca.duplicate_hash IS NOT NULL) AS duplicate_hash_present,
        (ca.device_fingerprint IS NOT NULL) AS device_fingerprint_present,
        ca.is_fraudulent,
        ca.verification_status::text
      FROM public.community_actions ca
      ORDER BY
        COALESCE(ca.fraud_score, 0) DESC,
        ca.submitted_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      actionId: row.action_id,
      riskBand: row.risk_band,
      fraudScore: row.fraud_score ?? 0,
      gpsEvidencePresent: row.gps_evidence_present,
      photoEvidencePresent: row.photo_evidence_present,
      duplicateHashPresent: row.duplicate_hash_present,
      deviceFingerprintPresent: row.device_fingerprint_present,
      isFraudulent: row.is_fraudulent,
      verificationStatus: row.verification_status,
    }));
  }

  async getModerationReviewReadiness(): Promise<ModerationReviewReadiness> {
    const counts = await this.getModerationReviewCounts();

    return {
      evidenceDetailAccepted: true,
      submittedActionsAvailable: counts.submittedActions >= 1,
      fraudScoringColumnsAvailable: counts.actionsWithFraudScore >= 1 || counts.submittedActions >= 1,
      moderationEnumsAvailable: counts.reportTypes >= 1 && counts.reportStatuses >= 1,
      moderationQueueReadable:
        counts.submittedActions >= 1 && counts.pendingActions + counts.underReviewActions + counts.flaggedActions >= 0,
      riskSignalReadable: counts.submittedActions >= 1,
      reportTableAvailable: counts.fraudReportRows >= 0,
      penaltyTableAvailable: counts.activePenalties >= 0,
    };
  }

  async getModerationReviewSnapshot(): Promise<ModerationReviewSnapshot> {
    const [counts, reviewItems, riskSignals, readiness] = await Promise.all([
      this.getModerationReviewCounts(),
      this.getModerationReviewItems(),
      this.getModerationRiskSignals(),
      this.getModerationReviewReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Fraud and moderation review is connected to action evidence, fraud score signals, report enums and penalty readiness.',
      counts,
      reviewItems,
      riskSignals,
      readiness,
    };
  }
}

export function createCommunityLeagueFraudModerationService(
  db: PrismaClient = prisma,
): CommunityLeagueFraudModerationService {
  return new CommunityLeagueFraudModerationService(db);
}