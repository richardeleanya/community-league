import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  AdminControlCounts,
  AdminControlReadiness,
  AdminControlSnapshot,
  AdminRoleSummary,
  PlatformSettingCard,
} from './types';

type CountRow = {
  platform_settings: number;
  public_settings: number;
  fraud_settings: number;
  verification_settings: number;
  action_settings: number;
  auth_settings: number;
  points_settings: number;
  users: number;
  active_users: number;
  admin_users: number;
  moderator_users: number;
  audit_logs: number;
};

type SettingRow = {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: Date | string;
};

type RoleRow = {
  users: number;
  active_users: number;
  admin_users: number;
  moderator_users: number;
  pending_verification_users: number;
  suspended_users: number;
};

function toIso(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function settingGroup(key: string): string {
  if (key.startsWith('fraud_')) {
    return 'fraud';
  }

  if (key.startsWith('verification_')) {
    return 'verification';
  }

  if (key.startsWith('action_')) {
    return 'action';
  }

  if (key.includes('login') || key.includes('lockout') || key.includes('session')) {
    return 'auth';
  }

  if (key.startsWith('points_') || key.includes('multiplier') || key.includes('referral_bonus')) {
    return 'points';
  }

  if (key.includes('public') || key.includes('whitelist')) {
    return 'public';
  }

  return 'platform';
}

export class CommunityLeagueAdminControlService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getAdminControlCounts(): Promise<AdminControlCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.platform_settings) AS platform_settings,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key IN ('points_multiplier_table', 'public_settings_whitelist')
        ) AS public_settings,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key LIKE 'fraud_%'
        ) AS fraud_settings,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key LIKE 'verification_%'
        ) AS verification_settings,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key LIKE 'action_%'
        ) AS action_settings,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key IN ('session_inactivity_days', 'max_login_attempts', 'lockout_duration_minutes')
        ) AS auth_settings,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key IN (
            'points_multiplier_table',
            'points_xp_max_multiplier',
            'referral_bonus_points'
          )
        ) AS points_settings,
        (SELECT count(*)::int FROM public.users) AS users,
        (
          SELECT count(*)::int
          FROM public.users
          WHERE account_status = 'active'
        ) AS active_users,
        (
          SELECT count(*)::int
          FROM public.users
          WHERE is_admin = true
        ) AS admin_users,
        (
          SELECT count(*)::int
          FROM public.users
          WHERE is_moderator = true OR is_admin = true
        ) AS moderator_users,
        (SELECT count(*)::int FROM public.audit_logs) AS audit_logs
    `;

    const row = rows[0];

    return {
      platformSettings: row?.platform_settings ?? 0,
      publicSettings: row?.public_settings ?? 0,
      fraudSettings: row?.fraud_settings ?? 0,
      verificationSettings: row?.verification_settings ?? 0,
      actionSettings: row?.action_settings ?? 0,
      authSettings: row?.auth_settings ?? 0,
      pointsSettings: row?.points_settings ?? 0,
      users: row?.users ?? 0,
      activeUsers: row?.active_users ?? 0,
      adminUsers: row?.admin_users ?? 0,
      moderatorUsers: row?.moderator_users ?? 0,
      auditLogs: row?.audit_logs ?? 0,
    };
  }

  async getPlatformSettingCards(limit = 30): Promise<PlatformSettingCard[]> {
    const rows = await this.db.$queryRaw<SettingRow[]>`
      SELECT
        key,
        value,
        description,
        updated_at
      FROM public.platform_settings
      ORDER BY
        CASE
          WHEN key IN ('points_multiplier_table', 'public_settings_whitelist') THEN 0
          WHEN key LIKE 'fraud_%' THEN 1
          WHEN key LIKE 'verification_%' THEN 2
          WHEN key LIKE 'action_%' THEN 3
          WHEN key IN ('session_inactivity_days', 'max_login_attempts', 'lockout_duration_minutes') THEN 4
          ELSE 5
        END,
        key ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      key: row.key,
      group: settingGroup(row.key),
      description: row.description ?? '',
      value: row.value,
      isPublic: row.key === 'points_multiplier_table' || row.key === 'public_settings_whitelist',
      updatedAt: toIso(row.updated_at),
      proofReference: `platform_settings:${row.key}`,
    }));
  }

  async getAdminRoleSummary(): Promise<AdminRoleSummary> {
    const rows = await this.db.$queryRaw<RoleRow[]>`
      SELECT
        count(*)::int AS users,
        count(*) FILTER (WHERE account_status = 'active')::int AS active_users,
        count(*) FILTER (WHERE is_admin = true)::int AS admin_users,
        count(*) FILTER (WHERE is_moderator = true OR is_admin = true)::int AS moderator_users,
        count(*) FILTER (WHERE account_status = 'pending_verification')::int AS pending_verification_users,
        count(*) FILTER (WHERE account_status = 'suspended')::int AS suspended_users
      FROM public.users
    `;

    const row = rows[0];

    return {
      users: row?.users ?? 0,
      activeUsers: row?.active_users ?? 0,
      adminUsers: row?.admin_users ?? 0,
      moderatorUsers: row?.moderator_users ?? 0,
      pendingVerificationUsers: row?.pending_verification_users ?? 0,
      suspendedUsers: row?.suspended_users ?? 0,
    };
  }

  async getAdminControlReadiness(): Promise<AdminControlReadiness> {
    const counts = await this.getAdminControlCounts();

    return {
      activityFeedFoundationAccepted: true,
      platformSettingsAvailable: counts.platformSettings >= 30,
      publicWhitelistAvailable: counts.publicSettings >= 2,
      fraudSettingsAvailable: counts.fraudSettings >= 10,
      verificationSettingsAvailable: counts.verificationSettings >= 5,
      actionSettingsAvailable: counts.actionSettings >= 5,
      authSettingsAvailable: counts.authSettings >= 3,
      pointsSettingsAvailable: counts.pointsSettings >= 3,
      userAdminColumnsReadable: counts.users >= 0 && counts.adminUsers >= 0 && counts.moderatorUsers >= 0,
      auditLogReadable: counts.auditLogs >= 1,
    };
  }

  async getAdminControlSnapshot(): Promise<AdminControlSnapshot> {
    const [counts, settings, roles, readiness] = await Promise.all([
      this.getAdminControlCounts(),
      this.getPlatformSettingCards(),
      this.getAdminRoleSummary(),
      this.getAdminControlReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Platform settings and admin control is connected to live settings, public whitelist, fraud controls, verification controls, action limits, auth limits, roles and audit logs.',
      counts,
      settings,
      roles,
      readiness,
    };
  }
}

export function createCommunityLeagueAdminControlService(
  db: PrismaClient = prisma,
): CommunityLeagueAdminControlService {
  return new CommunityLeagueAdminControlService(db);
}