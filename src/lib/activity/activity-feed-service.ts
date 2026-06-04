import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  ActivityActionEvent,
  ActivityAuditEvent,
  ActivityFeedCounts,
  ActivityFeedReadiness,
  ActivityFeedSnapshot,
  ActivityNotificationItem,
} from './types';

type CountRow = {
  current_seasons: number;
  notifications: number;
  unread_notifications: number;
  notification_types: number;
  audit_logs: number;
  action_audit_logs: number;
  submitted_actions: number;
  approved_actions: number;
  supporter_profiles: number;
  active_clubs: number;
};

type NotificationRow = {
  notification_id: string;
  user_id: string;
  type: string;
  is_read: boolean;
  created_at: Date | string;
};

type AuditRow = {
  audit_log_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: Date | string;
};

type ActionRow = {
  action_id: string;
  username: string;
  display_name: string | null;
  club_name: string;
  action_type: string;
  verification_status: string;
  final_points_awarded: number;
  submitted_at: Date | string;
};

function titleCaseEnum(value: string): string {
  return value
    .split('_')
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ');
}

function toIso(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export class CommunityLeagueActivityFeedService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getActivityFeedCounts(): Promise<ActivityFeedCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.notifications) AS notifications,
        (
          SELECT count(*)::int
          FROM public.notifications
          WHERE is_read = false
        ) AS unread_notifications,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'notification_type_enum'
        ) AS notification_types,
        (SELECT count(*)::int FROM public.audit_logs) AS audit_logs,
        (
          SELECT count(*)::int
          FROM public.audit_logs
          WHERE action LIKE 'action.%'
             OR entity_type IN ('community_action', 'community_actions')
        ) AS action_audit_logs,
        (SELECT count(*)::int FROM public.community_actions) AS submitted_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        (SELECT count(*)::int FROM public.supporter_profiles) AS supporter_profiles,
        (
          SELECT count(*)::int
          FROM public.clubs
          WHERE is_active = true
        ) AS active_clubs
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      notifications: row?.notifications ?? 0,
      unreadNotifications: row?.unread_notifications ?? 0,
      notificationTypes: row?.notification_types ?? 0,
      auditLogs: row?.audit_logs ?? 0,
      actionAuditLogs: row?.action_audit_logs ?? 0,
      submittedActions: row?.submitted_actions ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      supporterProfiles: row?.supporter_profiles ?? 0,
      activeClubs: row?.active_clubs ?? 0,
    };
  }

  async getRecentNotifications(limit = 10): Promise<ActivityNotificationItem[]> {
    const rows = await this.db.$queryRaw<NotificationRow[]>`
      SELECT
        id::text AS notification_id,
        user_id::text,
        type::text,
        is_read,
        created_at
      FROM public.notifications
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      notificationId: row.notification_id,
      userId: row.user_id,
      type: row.type,
      label: titleCaseEnum(row.type),
      isRead: row.is_read,
      createdAt: toIso(row.created_at),
      proofReference: `notifications:${row.notification_id}`,
    }));
  }

  async getRecentAuditEvents(limit = 10): Promise<ActivityAuditEvent[]> {
    const rows = await this.db.$queryRaw<AuditRow[]>`
      SELECT
        id::text AS audit_log_id,
        user_id::text,
        action,
        entity_type,
        entity_id::text,
        created_at
      FROM public.audit_logs
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      auditLogId: row.audit_log_id,
      userId: row.user_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      label: `${titleCaseEnum(row.action.replaceAll('.', '_'))} on ${row.entity_type}`,
      createdAt: toIso(row.created_at),
      proofReference: `audit_logs:${row.audit_log_id}`,
    }));
  }

  async getRecentActionEvents(limit = 10): Promise<ActivityActionEvent[]> {
    const rows = await this.db.$queryRaw<ActionRow[]>`
      SELECT
        ca.id::text AS action_id,
        sp.username,
        sp.display_name,
        c.name AS club_name,
        ca.action_type::text,
        ca.verification_status::text,
        ca.final_points_awarded,
        ca.submitted_at
      FROM public.community_actions ca
      JOIN public.supporter_profiles sp
        ON sp.id = ca.supporter_id
      JOIN public.clubs c
        ON c.id = ca.club_id
      ORDER BY ca.submitted_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      actionId: row.action_id,
      username: row.username,
      displayName: row.display_name ?? row.username,
      clubName: row.club_name,
      actionType: row.action_type,
      verificationStatus: row.verification_status,
      finalPointsAwarded: row.final_points_awarded,
      submittedAt: toIso(row.submitted_at),
      label: `${titleCaseEnum(row.action_type)} by ${row.display_name ?? row.username}`,
      proofReference: `community_actions:${row.action_id}`,
    }));
  }

  async getActivityFeedReadiness(): Promise<ActivityFeedReadiness> {
    const counts = await this.getActivityFeedCounts();

    return {
      legacyImpactFoundationAccepted: true,
      currentSeasonAvailable: counts.currentSeasons === 1,
      notificationEnumAvailable: counts.notificationTypes >= 1,
      notificationFeedReadable: counts.notifications >= 1,
      auditFeedReadable: counts.auditLogs >= 1,
      actionFeedReadable: counts.submittedActions >= 1,
      approvedActionAvailable: counts.approvedActions >= 1,
    };
  }

  async getActivityFeedSnapshot(): Promise<ActivityFeedSnapshot> {
    const [counts, notifications, auditEvents, actionEvents, readiness] = await Promise.all([
      this.getActivityFeedCounts(),
      this.getRecentNotifications(),
      this.getRecentAuditEvents(),
      this.getRecentActionEvents(),
      this.getActivityFeedReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Notification and activity feed is connected to notifications, audit logs, community actions and proof references.',
      counts,
      notifications,
      auditEvents,
      actionEvents,
      readiness,
    };
  }
}

export function createCommunityLeagueActivityFeedService(
  db: PrismaClient = prisma,
): CommunityLeagueActivityFeedService {
  return new CommunityLeagueActivityFeedService(db);
}