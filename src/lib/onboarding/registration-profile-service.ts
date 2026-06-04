import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  ClubSelectionOption,
  OnboardingFoundationCounts,
  OnboardingFoundationSnapshot,
  OnboardingReadiness,
  OnboardingStage,
  UsernameAvailability,
} from './types';

const usernamePattern = /^[a-z0-9_]{3,24}$/;

type OnboardingCountsRow = {
  users: number;
  supporter_profiles: number;
  active_users: number;
  pending_verification_users: number;
  active_clubs: number;
  active_leagues: number;
  current_seasons: number;
};

type ClubOptionRow = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  badge_url: string | null;
  community_points_season: number;
};

type OnboardingReadinessRow = {
  user_columns: number;
  profile_columns: number;
  active_clubs: number;
  xp_levels: number;
  onboarding_settings: number;
};

export class CommunityLeagueOnboardingService {
  constructor(private readonly db: PrismaClient = prisma) {}

  normaliseUsername(username: string): string {
    return username.trim().toLowerCase();
  }

  async checkUsernameAvailability(username: string): Promise<UsernameAvailability> {
    const normalisedUsername = this.normaliseUsername(username);
    const isFormatValid = usernamePattern.test(normalisedUsername);

    if (!isFormatValid) {
      return {
        username,
        normalisedUsername,
        isFormatValid: false,
        isAvailable: false,
        reason: 'Username must be 3-24 characters and use only lowercase letters, numbers or underscores.',
      };
    }

    const existingCount = await this.db.supporter_profiles.count({
      where: {
        username: normalisedUsername,
      },
    });

    return {
      username,
      normalisedUsername,
      isFormatValid: true,
      isAvailable: existingCount === 0,
      reason: existingCount === 0 ? null : 'Username is already taken.',
    };
  }

  async getOnboardingCounts(): Promise<OnboardingFoundationCounts> {
    const rows = await this.db.$queryRaw<OnboardingCountsRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.users) AS users,
        (SELECT count(*)::int FROM public.supporter_profiles) AS supporter_profiles,
        (SELECT count(*)::int FROM public.users WHERE account_status = 'active') AS active_users,
        (SELECT count(*)::int FROM public.users WHERE account_status = 'pending_verification') AS pending_verification_users,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons
    `;

    const row = rows[0];

    return {
      users: row?.users ?? 0,
      supporterProfiles: row?.supporter_profiles ?? 0,
      activeUsers: row?.active_users ?? 0,
      pendingVerificationUsers: row?.pending_verification_users ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      activeLeagues: row?.active_leagues ?? 0,
      currentSeasons: row?.current_seasons ?? 0,
    };
  }

  async getAvailableClubs(limit = 12): Promise<ClubSelectionOption[]> {
    const rows = await this.db.$queryRaw<ClubOptionRow[]>`
      SELECT
        id::text,
        name,
        slug,
        country,
        badge_url,
        community_points_season
      FROM public.clubs
      WHERE is_active = true
      ORDER BY community_points_season DESC, name ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      country: row.country,
      badgeUrl: row.badge_url,
      communityPointsSeason: row.community_points_season,
    }));
  }

  async getOnboardingReadiness(): Promise<OnboardingReadiness> {
    const rows = await this.db.$queryRaw<OnboardingReadinessRow[]>`
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
              'referral_code',
              'created_at',
              'updated_at'
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
              'club_id',
              'current_level',
              'community_points_season',
              'community_points_alltime',
              'legacy_score'
            )
        ) AS profile_columns,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (SELECT count(*)::int FROM public.xp_level_thresholds) AS xp_levels,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key IN (
            'action_description_min_chars',
            'action_description_max_chars',
            'referral_bonus_points'
          )
        ) AS onboarding_settings
    `;

    const row = rows[0];

    return {
      accountFoundationAccepted: true,
      usersTableReady: (row?.user_columns ?? 0) >= 7,
      supporterProfilesTableReady: (row?.profile_columns ?? 0) >= 8,
      clubsAvailableForSelection: (row?.active_clubs ?? 0) > 0,
      xpLevelsSeeded: (row?.xp_levels ?? 0) === 100,
      onboardingSettingsAvailable: (row?.onboarding_settings ?? 0) === 3,
    };
  }

  resolveInitialStage(counts: OnboardingFoundationCounts): OnboardingStage {
    if (counts.users === 0) {
      return 'account_created';
    }

    if (counts.pendingVerificationUsers > 0) {
      return 'email_verified';
    }

    if (counts.supporterProfiles < counts.users) {
      return 'profile_required';
    }

    if (counts.activeClubs === 0) {
      return 'club_selection_required';
    }

    return 'ready_for_actions';
  }

  async getOnboardingFoundationSnapshot(): Promise<OnboardingFoundationSnapshot> {
    const [counts, availableClubs, readiness] = await Promise.all([
      this.getOnboardingCounts(),
      this.getAvailableClubs(),
      this.getOnboardingReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      stage: this.resolveInitialStage(counts),
      counts,
      usernameRules: {
        minLength: 3,
        maxLength: 24,
        pattern: '^[a-z0-9_]{3,24}$',
      },
      availableClubs,
      readiness,
    };
  }
}

export function createCommunityLeagueOnboardingService(
  db: PrismaClient = prisma,
): CommunityLeagueOnboardingService {
  return new CommunityLeagueOnboardingService(db);
}