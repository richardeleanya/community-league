import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import { validateActionSubmissionDraft } from './schema';
import type {
  ActionSubmissionCounts,
  ActionSubmissionDraftValidation,
  ActionSubmissionFoundationSnapshot,
  ActionSubmissionLimits,
  ActionSubmissionReadiness,
  ActionTypeOption,
  MissionSubmissionCard,
} from './types';

type CountRow = {
  current_seasons: number;
  active_leagues: number;
  active_clubs: number;
  active_missions: number;
  submitted_actions: number;
  pending_actions: number;
  action_types: number;
  platform_settings: number;
  community_action_columns: number;
  community_action_constraints: number;
};

type SettingRow = {
  key: string;
  value: unknown;
};

type EnumRow = {
  value: string;
  sort_order: number;
};

type MissionRow = {
  id: string;
  title: string;
  description: string;
  action_category: string;
  action_type: string;
  base_points: number;
  base_xp: number;
  verification_tier_required: string;
  start_date: Date | string;
  end_date: Date | string;
  fixture_id: string | null;
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

function numberSetting(value: unknown, property: string, fallback: number): number {
  if (typeof value !== 'object' || value === null) {
    return fallback;
  }

  const candidate = (value as Record<string, unknown>)[property];

  if (typeof candidate === 'number') {
    return candidate;
  }

  return fallback;
}

export class CommunityLeagueActionSubmissionService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getSubmissionCounts(): Promise<ActionSubmissionCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (
          SELECT count(*)::int
          FROM public.missions
          WHERE is_active = true
            AND start_date <= now()
            AND end_date > now()
        ) AS active_missions,
        (SELECT count(*)::int FROM public.community_actions) AS submitted_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status = 'pending'
        ) AS pending_actions,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'action_type_enum'
        ) AS action_types,
        (
          SELECT count(*)::int
          FROM public.platform_settings
          WHERE key IN (
            'action_description_min_chars',
            'action_description_max_chars',
            'action_max_photos',
            'action_photo_max_mb',
            'action_max_days_past'
          )
        ) AS platform_settings,
        (
          SELECT count(*)::int
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'community_actions'
            AND column_name IN (
              'id',
              'supporter_id',
              'club_id',
              'mission_id',
              'fixture_id',
              'season_id',
              'action_type',
              'action_category',
              'description',
              'photo_urls',
              'gps_latitude',
              'gps_longitude',
              'gps_accuracy_metres',
              'submitted_at',
              'action_date',
              'verification_status',
              'verification_tier',
              'base_points',
              'final_points_awarded',
              'xp_awarded',
              'legacy_points_awarded'
            )
        ) AS community_action_columns,
        (
          SELECT count(*)::int
          FROM pg_constraint
          WHERE conname IN (
            'chk_community_actions_description_length',
            'chk_community_actions_photo_count',
            'chk_community_actions_latitude_range',
            'chk_community_actions_longitude_range',
            'chk_community_actions_gps_accuracy_non_negative',
            'chk_community_actions_points_non_negative',
            'chk_community_actions_rejection_reason_required'
          )
        ) AS community_action_constraints
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      activeLeagues: row?.active_leagues ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      activeMissions: row?.active_missions ?? 0,
      submittedActions: row?.submitted_actions ?? 0,
      pendingActions: row?.pending_actions ?? 0,
      actionTypes: row?.action_types ?? 0,
      platformSettings: row?.platform_settings ?? 0,
      communityActionColumns: row?.community_action_columns ?? 0,
      communityActionConstraints: row?.community_action_constraints ?? 0,
    };
  }

  async getSubmissionLimits(): Promise<ActionSubmissionLimits> {
    const rows = await this.db.$queryRaw<SettingRow[]>`
      SELECT key, value
      FROM public.platform_settings
      WHERE key IN (
        'action_description_min_chars',
        'action_description_max_chars',
        'action_max_photos',
        'action_photo_max_mb',
        'action_max_days_past'
      )
      ORDER BY key ASC
    `;

    const settings = new Map(rows.map((row) => [row.key, row.value]));

    return {
      descriptionMinChars: numberSetting(settings.get('action_description_min_chars'), 'chars', 50),
      descriptionMaxChars: numberSetting(settings.get('action_description_max_chars'), 'chars', 500),
      maxPhotos: numberSetting(settings.get('action_max_photos'), 'count', 10),
      maxPhotoMb: numberSetting(settings.get('action_photo_max_mb'), 'mb', 2),
      maxDaysPast: numberSetting(settings.get('action_max_days_past'), 'days', 7),
    };
  }

  async getActionTypeOptions(): Promise<ActionTypeOption[]> {
    const rows = await this.db.$queryRaw<EnumRow[]>`
      SELECT
        e.enumlabel AS value,
        e.enumsortorder::int AS sort_order
      FROM pg_enum e
      JOIN pg_type t
        ON t.oid = e.enumtypid
      WHERE t.typname = 'action_type_enum'
      ORDER BY e.enumsortorder ASC
    `;

    return rows.map((row) => ({
      value: row.value,
      label: titleCaseEnum(row.value),
      sortOrder: row.sort_order,
    }));
  }

  async getActiveMissionCards(limit = 8): Promise<MissionSubmissionCard[]> {
    const rows = await this.db.$queryRaw<MissionRow[]>`
      SELECT
        id::text,
        title,
        description,
        action_category::text,
        action_type::text,
        base_points,
        base_xp,
        verification_tier_required::text,
        start_date,
        end_date,
        fixture_id::text
      FROM public.missions
      WHERE is_active = true
        AND start_date <= now()
        AND end_date > now()
      ORDER BY end_date ASC, title ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      actionCategory: row.action_category,
      actionType: row.action_type,
      basePoints: row.base_points,
      baseXp: row.base_xp,
      verificationTierRequired: row.verification_tier_required,
      startDate: toIso(row.start_date),
      endDate: toIso(row.end_date),
      fixtureId: row.fixture_id,
    }));
  }

  async getSubmissionReadiness(): Promise<ActionSubmissionReadiness> {
    const counts = await this.getSubmissionCounts();

    return {
      dashboardFoundationAccepted: true,
      currentSeasonAvailable: counts.currentSeasons === 1,
      clubSelectionAvailable: counts.activeClubs >= 2,
      actionTypeEnumAvailable: counts.actionTypes >= 14,
      missionBaselineAvailable: counts.activeMissions >= 1,
      submissionSettingsAvailable: counts.platformSettings === 5,
      communityActionTableReady:
        counts.communityActionColumns >= 21 && counts.communityActionConstraints >= 7,
      serverValidationReady: true,
    };
  }

  validateDraft(input: unknown): ActionSubmissionDraftValidation {
    return validateActionSubmissionDraft(input);
  }

  async getActionSubmissionFoundationSnapshot(): Promise<ActionSubmissionFoundationSnapshot> {
    const [counts, limits, actionTypes, activeMissions, readiness] = await Promise.all([
      this.getSubmissionCounts(),
      this.getSubmissionLimits(),
      this.getActionTypeOptions(),
      this.getActiveMissionCards(),
      this.getSubmissionReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community action submission foundation is connected to live season, club, mission, enum, setting and validation data.',
      counts,
      limits,
      actionTypes,
      activeMissions,
      readiness,
    };
  }
}

export function createCommunityLeagueActionSubmissionService(
  db: PrismaClient = prisma,
): CommunityLeagueActionSubmissionService {
  return new CommunityLeagueActionSubmissionService(db);
}