import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  ImpactMapPin,
  LegacyImpactCounts,
  LegacyImpactReadiness,
  LegacyImpactSnapshot,
  LegacyProjectCard,
} from './types';

type CountRow = {
  current_seasons: number;
  active_clubs: number;
  approved_actions: number;
  actions_with_gps: number;
  legacy_projects: number;
  active_legacy_projects: number;
  completed_legacy_projects: number;
  legacy_map_pins: number;
  pins_with_coordinates: number;
  project_types: number;
  project_statuses: number;
  action_types: number;
  total_legacy_points_awarded: number | null;
  total_final_points_awarded: number | null;
};

type ProjectRow = {
  project_id: string;
  club_id: string;
  club_name: string;
  project_type: string;
  status: string;
  season_id: string;
};

type LegacyPinRow = {
  pin_id: string;
  club_id: string;
  club_name: string;
  latitude: number | string;
  longitude: number | string;
  action_type: string;
};

type ActionPinRow = {
  action_id: string;
  club_id: string;
  club_name: string;
  latitude: number | string;
  longitude: number | string;
  action_type: string;
  final_points_awarded: number;
  legacy_points_awarded: number;
};

function titleCaseEnum(value: string): string {
  return value
    .split('_')
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ');
}

export class CommunityLeagueLegacyImpactMapService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getLegacyImpactCounts(): Promise<LegacyImpactCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS approved_actions,
        (
          SELECT count(*)::int
          FROM public.community_actions
          WHERE gps_latitude IS NOT NULL
            AND gps_longitude IS NOT NULL
        ) AS actions_with_gps,
        (SELECT count(*)::int FROM public.legacy_projects) AS legacy_projects,
        (
          SELECT count(*)::int
          FROM public.legacy_projects
          WHERE status IN ('approved', 'in_progress')
        ) AS active_legacy_projects,
        (
          SELECT count(*)::int
          FROM public.legacy_projects
          WHERE status = 'completed'
        ) AS completed_legacy_projects,
        (SELECT count(*)::int FROM public.legacy_map_pins) AS legacy_map_pins,
        (
          SELECT count(*)::int
          FROM public.legacy_map_pins
          WHERE latitude IS NOT NULL
            AND longitude IS NOT NULL
        ) AS pins_with_coordinates,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'project_type_enum'
        ) AS project_types,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'project_status_enum'
        ) AS project_statuses,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'action_type_enum'
        ) AS action_types,
        (
          SELECT sum(legacy_points_awarded)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS total_legacy_points_awarded,
        (
          SELECT sum(final_points_awarded)::int
          FROM public.community_actions
          WHERE verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        ) AS total_final_points_awarded
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      actionsWithGps: row?.actions_with_gps ?? 0,
      legacyProjects: row?.legacy_projects ?? 0,
      activeLegacyProjects: row?.active_legacy_projects ?? 0,
      completedLegacyProjects: row?.completed_legacy_projects ?? 0,
      legacyMapPins: row?.legacy_map_pins ?? 0,
      pinsWithCoordinates: row?.pins_with_coordinates ?? 0,
      projectTypes: row?.project_types ?? 0,
      projectStatuses: row?.project_statuses ?? 0,
      actionTypes: row?.action_types ?? 0,
      totalLegacyPointsAwarded: row?.total_legacy_points_awarded ?? 0,
      totalFinalPointsAwarded: row?.total_final_points_awarded ?? 0,
    };
  }

  async getLegacyProjectCards(limit = 8): Promise<LegacyProjectCard[]> {
    const rows = await this.db.$queryRaw<ProjectRow[]>`
      SELECT
        lp.id::text AS project_id,
        lp.club_id::text,
        c.name AS club_name,
        lp.project_type::text,
        lp.status::text,
        lp.season_id::text
      FROM public.legacy_projects lp
      JOIN public.clubs c
        ON c.id = lp.club_id
      ORDER BY
        CASE
          WHEN lp.status = 'in_progress' THEN 0
          WHEN lp.status = 'approved' THEN 1
          WHEN lp.status = 'proposed' THEN 2
          ELSE 3
        END,
        lp.id ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      projectId: row.project_id,
      clubId: row.club_id,
      clubName: row.club_name,
      projectType: row.project_type,
      status: row.status,
      seasonId: row.season_id,
    }));
  }

  async getImpactMapPins(limit = 12): Promise<ImpactMapPin[]> {
    const legacyRows = await this.db.$queryRaw<LegacyPinRow[]>`
      SELECT
        lmp.id::text AS pin_id,
        lmp.club_id::text,
        c.name AS club_name,
        lmp.latitude,
        lmp.longitude,
        lmp.action_type::text
      FROM public.legacy_map_pins lmp
      JOIN public.clubs c
        ON c.id = lmp.club_id
      WHERE lmp.latitude IS NOT NULL
        AND lmp.longitude IS NOT NULL
      ORDER BY lmp.id ASC
      LIMIT ${limit}
    `;

    const legacyPins: ImpactMapPin[] = legacyRows.map((row) => ({
      pinId: row.pin_id,
      source: 'legacy_map_pin',
      clubId: row.club_id,
      clubName: row.club_name,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      actionType: row.action_type,
      impactLabel: `${titleCaseEnum(row.action_type)} legacy map pin`,
      points: 0,
      legacyPoints: 0,
      proofReference: `legacy_map_pins:${row.pin_id}`,
    }));

    if (legacyPins.length >= limit) {
      return legacyPins;
    }

    const actionRows = await this.db.$queryRaw<ActionPinRow[]>`
      SELECT
        ca.id::text AS action_id,
        ca.club_id::text,
        c.name AS club_name,
        ca.gps_latitude AS latitude,
        ca.gps_longitude AS longitude,
        ca.action_type::text,
        ca.final_points_awarded,
        ca.legacy_points_awarded
      FROM public.community_actions ca
      JOIN public.clubs c
        ON c.id = ca.club_id
      WHERE ca.verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
        AND ca.gps_latitude IS NOT NULL
        AND ca.gps_longitude IS NOT NULL
      ORDER BY ca.legacy_points_awarded DESC, ca.final_points_awarded DESC, ca.submitted_at DESC
      LIMIT ${limit - legacyPins.length}
    `;

    const actionPins: ImpactMapPin[] = actionRows.map((row) => ({
      pinId: row.action_id,
      source: 'community_action',
      clubId: row.club_id,
      clubName: row.club_name,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      actionType: row.action_type,
      impactLabel: `${titleCaseEnum(row.action_type)} verified action impact`,
      points: row.final_points_awarded,
      legacyPoints: row.legacy_points_awarded,
      proofReference: `community_actions:${row.action_id}`,
    }));

    return [...legacyPins, ...actionPins];
  }

  async getLegacyImpactReadiness(): Promise<LegacyImpactReadiness> {
    const counts = await this.getLegacyImpactCounts();
    const pins = await this.getImpactMapPins(3);

    return {
      awardsFoundationAccepted: true,
      currentSeasonAvailable: counts.currentSeasons === 1,
      projectEnumsAvailable: counts.projectTypes >= 1 && counts.projectStatuses >= 1,
      legacyProjectTableReadable: counts.legacyProjects >= 0,
      legacyMapPinTableReadable: counts.legacyMapPins >= 0,
      approvedActionImpactAvailable: counts.approvedActions >= 1 && counts.totalLegacyPointsAwarded >= 0,
      gpsImpactAvailable: counts.actionsWithGps >= 1,
      impactPinReadable: pins.length >= 1,
    };
  }

  async getLegacyImpactSnapshot(): Promise<LegacyImpactSnapshot> {
    const [counts, projects, pins, readiness] = await Promise.all([
      this.getLegacyImpactCounts(),
      this.getLegacyProjectCards(),
      this.getImpactMapPins(),
      this.getLegacyImpactReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Legacy project and impact map is connected to legacy enums, project tables, map pins, approved GPS actions and legacy point output.',
      counts,
      projects,
      pins,
      readiness,
    };
  }
}

export function createCommunityLeagueLegacyImpactMapService(
  db: PrismaClient = prisma,
): CommunityLeagueLegacyImpactMapService {
  return new CommunityLeagueLegacyImpactMapService(db);
}