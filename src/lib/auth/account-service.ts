import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

import type {
  AccountFoundationCounts,
  AccountFoundationReadiness,
  AccountFoundationSnapshot,
  AccountPolicySnapshot,
  AccountSessionState,
} from './types';

type AccountCountsRow = {
  users: number;
  supporter_profiles: number;
  active_users: number;
  pending_verification_users: number;
  admin_users: number;
  moderator_users: number;
};

type AuthReadinessRow = {
  user_columns: number;
  profile_columns: number;
  auth_settings: number;
};

type SettingRow = {
  key: string;
  value: unknown;
};

export class CommunityLeagueAccountService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getCurrentSessionState(): Promise<AccountSessionState> {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return {
          status: 'anonymous',
          userId: null,
          email: null,
        };
      }

      return {
        status: 'authenticated',
        userId: data.user.id,
        email: data.user.email ?? null,
      };
    } catch {
      return {
        status: 'anonymous',
        userId: null,
        email: null,
      };
    }
  }

  async getAccountCounts(): Promise<AccountFoundationCounts> {
    const rows = await this.db.$queryRaw<AccountCountsRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.users) AS users,
        (SELECT count(*)::int FROM public.supporter_profiles) AS supporter_profiles,
        (SELECT count(*)::int FROM public.users WHERE account_status = 'active') AS active_users,
        (SELECT count(*)::int FROM public.users WHERE account_status = 'pending_verification') AS pending_verification_users,
        (SELECT count(*)::int FROM public.users WHERE is_admin = true) AS admin_users,
        (SELECT count(*)::int FROM public.users WHERE is_moderator = true) AS moderator_users
    `;

    const row = rows[0];

    return {
      users: row?.users ?? 0,
      supporterProfiles: row?.supporter_profiles ?? 0,
      activeUsers: row?.active_users ?? 0,
      pendingVerificationUsers: row?.pending_verification_users ?? 0,
      adminUsers: row?.admin_users ?? 0,
      moderatorUsers: row?.moderator_users ?? 0,
    };
  }

  async getPolicySnapshot(): Promise<AccountPolicySnapshot> {
    const rows = await this.db.$queryRaw<SettingRow[]>`
      SELECT key, value
      FROM public.platform_settings
      WHERE key IN (
        'max_login_attempts',
        'lockout_duration_minutes',
        'session_inactivity_days'
      )
      ORDER BY key ASC
    `;

    const settings = new Map(rows.map((row) => [row.key, row.value]));

    return {
      maxLoginAttempts: settings.get('max_login_attempts') ?? null,
      lockoutDurationMinutes: settings.get('lockout_duration_minutes') ?? null,
      sessionInactivityDays: settings.get('session_inactivity_days') ?? null,
    };
  }

  async getReadiness(): Promise<AccountFoundationReadiness> {
    const rows = await this.db.$queryRaw<AuthReadinessRow[]>`
      SELECT
        (
          SELECT count(*)::int
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name IN (
              'id',
              'email',
              'account_status',
              'email_verified',
              'is_admin',
              'is_moderator',
              'failed_login_attempts',
              'locked_until'
            )
        ) AS user_columns,
        (
          SELECT count(*)::int
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'supporter_profiles'
            AND column_name IN (
              'id',
              'user_id',
              'username',
              'current_level',
              'community_points_season',
              'community_points_alltime'
            )
        ) AS profile_columns,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key IN (
            'max_login_attempts',
            'lockout_duration_minutes',
            'session_inactivity_days'
          )
        ) AS auth_settings
    `;

    const row = rows[0];

    return {
      authUserTableSynced: (row?.user_columns ?? 0) >= 8,
      supporterProfileLinkAvailable: (row?.profile_columns ?? 0) >= 6,
      accountStatusPolicyAvailable: (row?.user_columns ?? 0) >= 4,
      adminModeratorFlagsAvailable: (row?.user_columns ?? 0) >= 6,
      authSettingsAvailable: (row?.auth_settings ?? 0) === 3,
    };
  }

  async getAccountFoundationSnapshot(): Promise<AccountFoundationSnapshot> {
    const [session, counts, policy, readiness] = await Promise.all([
      this.getCurrentSessionState(),
      this.getAccountCounts(),
      this.getPolicySnapshot(),
      this.getReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      session,
      counts,
      policy,
      readiness,
    };
  }
}

export function createCommunityLeagueAccountService(
  db: PrismaClient = prisma,
): CommunityLeagueAccountService {
  return new CommunityLeagueAccountService(db);
}