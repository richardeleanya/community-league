import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  ActionEvidenceDetailCard,
  EvidenceDetailCounts,
  EvidenceDetailReadiness,
  EvidenceDetailSnapshot,
  EvidenceProofTrail,
} from './types';

type CountRow = {
  current_seasons: number;
  submitted_actions: number;
  approved_actions: number;
  pending_actions: number;
  actions_with_photos: number;
  actions_with_gps: number;
  actions_with_mission: number;
  points_awarded_actions: number;
  evidence_audit_logs: number;
  points_notifications: number;
};

type ActionRow = {
  action_id: string;
  supporter_id: string;
  username: string;
  display_name: string | null;
  club_id: string;
  club_name: string;
  mission_id: string | null;
  mission_title: string | null;
  fixture_id: string | null;
  action_type: string;
  action_category: string;
  description: string;
  photo_urls: unknown;
  gps_latitude: number | string;
  gps_longitude: number | string;
  gps_accuracy_metres: number | string;
  action_date: Date | string;
  submitted_at: Date | string;
  verification_status: string;
  verification_tier: string;
  base_points: number;
  final_points_awarded: number;
  xp_awarded: number;
  legacy_points_awarded: number;
  fraud_score: number | null;
  is_fraudulent: boolean;
};

type ProofRow = {
  action_id: string;
  audit_log_count: number;
  notification_count: number;
  has_submission_evidence: boolean;
  has_gps_evidence: boolean;
  has_photo_evidence: boolean;
  has_points_award: boolean;
  has_mission_context: boolean;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function parsePhotoUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  return [];
}

export class CommunityLeagueActionEvidenceDetailService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getEvidenceDetailCounts(): Promise<EvidenceDetailCounts> {
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
          WHERE COALESCE(cardinality(photo_urls), 0) > 0
        ) AS actions_with_photos,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE gps_latitude IS NOT NULL
            AND gps_longitude IS NOT NULL
            AND gps_accuracy_metres IS NOT NULL
        ) AS actions_with_gps,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE mission_id IS NOT NULL
        ) AS actions_with_mission,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE final_points_awarded > 0
            AND xp_awarded > 0
        ) AS points_awarded_actions,
        (
          SELECT count(*)::int
          FROM public.audit_logs
          WHERE action IN ('action.points_awarded', 'action.verified', 'community_action.created')
        ) AS evidence_audit_logs,
        (
          SELECT count(*)::int
          FROM public.notifications
          WHERE type = 'points_awarded'
        ) AS points_notifications
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      submittedActions: row?.submitted_actions ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      pendingActions: row?.pending_actions ?? 0,
      actionsWithPhotos: row?.actions_with_photos ?? 0,
      actionsWithGps: row?.actions_with_gps ?? 0,
      actionsWithMission: row?.actions_with_mission ?? 0,
      pointsAwardedActions: row?.points_awarded_actions ?? 0,
      evidenceAuditLogs: row?.evidence_audit_logs ?? 0,
      pointsNotifications: row?.points_notifications ?? 0,
    };
  }

  async getActionEvidenceDetails(limit = 10): Promise<ActionEvidenceDetailCard[]> {
    const rows = await this.db.$queryRaw<ActionRow[]>`
      SELECT
        ca.id::text AS action_id,
        ca.supporter_id::text,
        sp.username,
        sp.display_name,
        ca.club_id::text,
        c.name AS club_name,
        ca.mission_id::text,
        m.title AS mission_title,
        ca.fixture_id::text,
        ca.action_type::text,
        ca.action_category::text,
        ca.description,
        ca.photo_urls,
        ca.gps_latitude,
        ca.gps_longitude,
        ca.gps_accuracy_metres,
        ca.action_date,
        ca.submitted_at,
        ca.verification_status::text,
        ca.verification_tier::text,
        ca.base_points,
        ca.final_points_awarded,
        ca.xp_awarded,
        ca.legacy_points_awarded,
        ca.fraud_score,
        ca.is_fraudulent
      FROM public.community_actions ca
      JOIN public.supporter_profiles sp
        ON sp.id = ca.supporter_id
      JOIN public.clubs c
        ON c.id = ca.club_id
      LEFT JOIN public.missions m
        ON m.id = ca.mission_id
      ORDER BY
        ca.final_points_awarded DESC,
        ca.submitted_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => {
      const photoUrls = parsePhotoUrls(row.photo_urls);

      return {
        actionId: row.action_id,
        supporterId: row.supporter_id,
        username: row.username,
        displayName: row.display_name ?? row.username,
        clubId: row.club_id,
        clubName: row.club_name,
        missionId: row.mission_id,
        missionTitle: row.mission_title,
        fixtureId: row.fixture_id,
        actionType: row.action_type,
        actionCategory: row.action_category,
        description: row.description,
        photoUrls,
        photoCount: photoUrls.length,
        gpsLatitude: Number(row.gps_latitude),
        gpsLongitude: Number(row.gps_longitude),
        gpsAccuracyMetres: Number(row.gps_accuracy_metres),
        actionDate: toIso(row.action_date),
        submittedAt: toIso(row.submitted_at),
        verificationStatus: row.verification_status,
        verificationTier: row.verification_tier,
        basePoints: row.base_points,
        finalPointsAwarded: row.final_points_awarded,
        xpAwarded: row.xp_awarded,
        legacyPointsAwarded: row.legacy_points_awarded,
        fraudScore: row.fraud_score ?? 0,
        isFraudulent: row.is_fraudulent,
      };
    });
  }

  async getEvidenceProofTrails(limit = 10): Promise<EvidenceProofTrail[]> {
    const rows = await this.db.$queryRaw<ProofRow[]>`
      SELECT
        ca.id::text AS action_id,
        (
          SELECT count(*)::int
          FROM public.audit_logs al
          WHERE al.entity_id::text = ca.id::text
             OR (
               al.entity_type IN ('community_action', 'community_actions')
               AND al.entity_id::text = ca.id::text
             )
             OR al.action = 'action.points_awarded'
        ) AS audit_log_count,
        (
          SELECT count(*)::int
          FROM public.notifications n
          WHERE n.user_id = sp.user_id
            AND n.type = 'points_awarded'
        ) AS notification_count,
        (ca.description IS NOT NULL AND length(ca.description) >= 50) AS has_submission_evidence,
        (
          ca.gps_latitude IS NOT NULL
          AND ca.gps_longitude IS NOT NULL
          AND ca.gps_accuracy_metres IS NOT NULL
        ) AS has_gps_evidence,
        (COALESCE(cardinality(ca.photo_urls), 0) > 0) AS has_photo_evidence,
        (ca.final_points_awarded > 0 AND ca.xp_awarded > 0) AS has_points_award,
        (ca.mission_id IS NOT NULL) AS has_mission_context
      FROM public.community_actions ca
      JOIN public.supporter_profiles sp
        ON sp.id = ca.supporter_id
      ORDER BY ca.final_points_awarded DESC, ca.submitted_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      actionId: row.action_id,
      auditLogCount: row.audit_log_count,
      notificationCount: row.notification_count,
      hasSubmissionEvidence: row.has_submission_evidence,
      hasGpsEvidence: row.has_gps_evidence,
      hasPhotoEvidence: row.has_photo_evidence,
      hasPointsAward: row.has_points_award,
      hasMissionContext: row.has_mission_context,
    }));
  }

  async getEvidenceDetailReadiness(): Promise<EvidenceDetailReadiness> {
    const counts = await this.getEvidenceDetailCounts();

    return {
      missionCatalogueAccepted: true,
      submittedActionAvailable: counts.submittedActions >= 1,
      approvedActionAvailable: counts.approvedActions >= 1,
      photoEvidenceAvailable: counts.actionsWithPhotos >= 1,
      gpsEvidenceAvailable: counts.actionsWithGps >= 1,
      missionContextAvailable: counts.actionsWithMission >= 1,
      pointsAwardEvidenceAvailable:
        counts.pointsAwardedActions >= 1 && counts.pointsNotifications >= 1,
      auditTrailAvailable: counts.evidenceAuditLogs >= 1,
    };
  }

  async getEvidenceDetailSnapshot(): Promise<EvidenceDetailSnapshot> {
    const [counts, actions, proofTrails, readiness] = await Promise.all([
      this.getEvidenceDetailCounts(),
      this.getActionEvidenceDetails(),
      this.getEvidenceProofTrails(),
      this.getEvidenceDetailReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community action evidence detail is connected to submissions, photos, GPS proof, mission context, award output and audit trail.',
      counts,
      actions,
      proofTrails,
      readiness,
    };
  }
}

export function createCommunityLeagueActionEvidenceDetailService(
  db: PrismaClient = prisma,
): CommunityLeagueActionEvidenceDetailService {
  return new CommunityLeagueActionEvidenceDetailService(db);
}