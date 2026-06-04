import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  OperationsMetricCard,
  OperationsOverviewCounts,
  OperationsOverviewReadiness,
  OperationsOverviewSnapshot,
  OperationsWorkstream,
} from './types';

type CountRow = {
  current_seasons: number;
  active_clubs: number;
  active_missions: number;
  fixtures_active: number;
  submitted_actions: number;
  pending_actions: number;
  approved_actions: number;
  under_review_actions: number;
  open_fraud_reports: number;
  notifications: number;
  unread_notifications: number;
  audit_logs: number;
  platform_settings: number;
  league_rows: number;
  ranking_rows: number;
  awards_rows: number;
  evidence_ready_actions: number;
};

function metricState(value: number, minimumReady: number): 'ready' | 'attention' | 'blocked' {
  if (value >= minimumReady) {
    return 'ready';
  }

  if (value > 0) {
    return 'attention';
  }

  return 'blocked';
}

function attentionState(value: number): 'ready' | 'attention' | 'blocked' {
  if (value === 0) {
    return 'ready';
  }

  return 'attention';
}

export class CommunityLeagueOperationsOverviewService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getOperationsOverviewCounts(): Promise<OperationsOverviewCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (
          SELECT count(*)::int
          FROM public.missions
          WHERE is_active = true
            AND start_date <= now()
            AND end_date > now()
        ) AS active_missions,
        (
          SELECT count(*)::int
          FROM public.fixtures
          WHERE status = 'active'
        ) AS fixtures_active,
        (SELECT count(*)::int FROM public.community_actions) AS submitted_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status = 'pending'
        ) AS pending_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('under_review', 'flagged')
        ) AS under_review_actions,
        (
          SELECT count(*)::int
          FROM public.fraud_reports
          WHERE status IN ('open', 'under_review')
        ) AS open_fraud_reports,
        (SELECT count(*)::int FROM public.notifications) AS notifications,
        (
          SELECT count(*)::int
          FROM public.notifications
          WHERE is_read = false
        ) AS unread_notifications,
        (SELECT count(*)::int FROM public.audit_logs) AS audit_logs,
        (SELECT count(*)::int FROM public.platform_settings) AS platform_settings,
        (
          SELECT count(*)::int
          FROM public.league_tables lt
          JOIN public.seasons s
            ON s.id = lt.season_id
          WHERE s.is_current = true
        ) AS league_rows,
        (
          SELECT count(*)::int
          FROM public.individual_rankings ir
          JOIN public.seasons s
            ON s.id = ir.season_id
          WHERE s.is_current = true
        ) AS ranking_rows,
        (SELECT count(*)::int FROM public.awards) AS awards_rows,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE gps_latitude IS NOT NULL
            AND gps_longitude IS NOT NULL
            AND cardinality(photo_urls) >= 1
        ) AS evidence_ready_actions
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      activeMissions: row?.active_missions ?? 0,
      fixturesActive: row?.fixtures_active ?? 0,
      submittedActions: row?.submitted_actions ?? 0,
      pendingActions: row?.pending_actions ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      underReviewActions: row?.under_review_actions ?? 0,
      openFraudReports: row?.open_fraud_reports ?? 0,
      notifications: row?.notifications ?? 0,
      unreadNotifications: row?.unread_notifications ?? 0,
      auditLogs: row?.audit_logs ?? 0,
      platformSettings: row?.platform_settings ?? 0,
      leagueRows: row?.league_rows ?? 0,
      rankingRows: row?.ranking_rows ?? 0,
      awardsRows: row?.awards_rows ?? 0,
      evidenceReadyActions: row?.evidence_ready_actions ?? 0,
    };
  }

  buildMetricCards(counts: OperationsOverviewCounts): OperationsMetricCard[] {
    return [
      {
        key: 'active-clubs',
        label: 'Active clubs',
        value: counts.activeClubs,
        state: metricState(counts.activeClubs, 1),
        proofReference: 'clubs:is_active',
      },
      {
        key: 'active-missions',
        label: 'Active missions',
        value: counts.activeMissions,
        state: metricState(counts.activeMissions, 1),
        proofReference: 'missions:active_window',
      },
      {
        key: 'submitted-actions',
        label: 'Submitted actions',
        value: counts.submittedActions,
        state: metricState(counts.submittedActions, 1),
        proofReference: 'community_actions:submitted',
      },
      {
        key: 'approved-actions',
        label: 'Approved actions',
        value: counts.approvedActions,
        state: metricState(counts.approvedActions, 1),
        proofReference: 'community_actions:approved',
      },
      {
        key: 'evidence-ready-actions',
        label: 'Evidence-ready actions',
        value: counts.evidenceReadyActions,
        state: metricState(counts.evidenceReadyActions, 1),
        proofReference: 'community_actions:gps_photo_evidence',
      },
      {
        key: 'open-fraud-reports',
        label: 'Open fraud reports',
        value: counts.openFraudReports,
        state: attentionState(counts.openFraudReports),
        proofReference: 'fraud_reports:open_under_review',
      },
      {
        key: 'activity-events',
        label: 'Activity events',
        value: counts.notifications + counts.auditLogs + counts.submittedActions,
        state: metricState(counts.notifications + counts.auditLogs + counts.submittedActions, 3),
        proofReference: 'notifications:audit_logs:community_actions',
      },
      {
        key: 'platform-settings',
        label: 'Platform settings',
        value: counts.platformSettings,
        state: metricState(counts.platformSettings, 30),
        proofReference: 'platform_settings:all',
      },
    ];
  }

  buildWorkstreams(counts: OperationsOverviewCounts): OperationsWorkstream[] {
    return [
      {
        key: 'competition',
        label: 'Competition operations',
        status:
          counts.currentSeasons === 1 && counts.activeClubs >= 1 && counts.fixturesActive >= 1
            ? 'ready'
            : 'attention',
        summary: 'Season, club and fixture base for the operating league.',
        proofReference: 'seasons:clubs:fixtures',
      },
      {
        key: 'missions',
        label: 'Mission operations',
        status: counts.activeMissions >= 1 ? 'ready' : 'blocked',
        summary: 'Active mission window feeding supporter action submission.',
        proofReference: 'missions:active_window',
      },
      {
        key: 'actions',
        label: 'Action pipeline',
        status:
          counts.submittedActions >= 1 && counts.approvedActions >= 1
            ? 'ready'
            : counts.submittedActions >= 1
              ? 'attention'
              : 'blocked',
        summary: 'Submitted and approved community actions feeding points and recognition.',
        proofReference: 'community_actions:pipeline',
      },
      {
        key: 'verification',
        label: 'Verification and points',
        status:
          counts.approvedActions >= 1 && counts.leagueRows >= 1 && counts.rankingRows >= 1
            ? 'ready'
            : 'attention',
        summary: 'Verification outcomes connected to points, rankings and league table rows.',
        proofReference: 'community_actions:league_tables:individual_rankings',
      },
      {
        key: 'moderation',
        label: 'Moderation attention',
        status: counts.openFraudReports === 0 ? 'ready' : 'attention',
        summary: 'Fraud reports and review load for the moderation surface.',
        proofReference: 'fraud_reports:open_under_review',
      },
      {
        key: 'activity',
        label: 'Activity and notifications',
        status: counts.notifications >= 1 && counts.auditLogs >= 1 ? 'ready' : 'attention',
        summary: 'Notifications and audit records feeding the activity surface.',
        proofReference: 'notifications:audit_logs',
      },
      {
        key: 'admin',
        label: 'Admin controls',
        status: counts.platformSettings >= 30 ? 'ready' : 'blocked',
        summary: 'Platform control settings and audit-backed admin visibility.',
        proofReference: 'platform_settings:audit_logs',
      },
    ];
  }

  async getOperationsOverviewReadiness(): Promise<OperationsOverviewReadiness> {
    const counts = await this.getOperationsOverviewCounts();

    return {
      adminControlFoundationAccepted: true,
      currentSeasonAvailable: counts.currentSeasons === 1,
      clubFoundationAvailable: counts.activeClubs >= 1,
      missionFoundationAvailable: counts.activeMissions >= 1,
      actionPipelineAvailable: counts.submittedActions >= 1,
      verificationPipelineAvailable: counts.approvedActions >= 1,
      moderationPipelineReadable: counts.openFraudReports >= 0,
      activityPipelineReadable: counts.notifications >= 1 && counts.auditLogs >= 1,
      adminSettingsReadable: counts.platformSettings >= 30,
      leaderboardReadable: counts.leagueRows >= 1 && counts.rankingRows >= 1,
      evidenceReadable: counts.evidenceReadyActions >= 1,
    };
  }

  async getOperationsOverviewSnapshot(): Promise<OperationsOverviewSnapshot> {
    const counts = await this.getOperationsOverviewCounts();
    const readiness = await this.getOperationsOverviewReadiness();

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Admin dashboard and operations overview is connected across competition, missions, action pipeline, verification, moderation, activity, evidence and platform settings.',
      counts,
      metrics: this.buildMetricCards(counts),
      workstreams: this.buildWorkstreams(counts),
      readiness,
    };
  }
}

export function createCommunityLeagueOperationsOverviewService(
  db: PrismaClient = prisma,
): CommunityLeagueOperationsOverviewService {
  return new CommunityLeagueOperationsOverviewService(db);
}