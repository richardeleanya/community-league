import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  ClubDiscoveryCard,
  DiscoveryFoundationCounts,
  DiscoveryFoundationSnapshot,
  DiscoveryReadiness,
  LeagueDiscoverySummary,
  SeasonDiscoverySummary,
} from './types';

type DiscoveryCountsRow = {
  current_seasons: number;
  active_leagues: number;
  active_clubs: number;
  total_clubs: number;
};

type SeasonRow = {
  id: string;
  name: string;
  slug: string;
  start_date: Date | string;
  end_date: Date | string;
  is_current: boolean;
};

type LeagueRow = {
  id: string;
  name: string;
  display_name: string;
  slug: string;
  country: string | null;
  tier: number;
  season_id: string;
  active_club_count: number;
};

type ClubRow = {
  id: string;
  name: string;
  short_name: string | null;
  slug: string;
  country: string | null;
  city: string | null;
  league_slug: string;
  league_name: string;
  primary_colour: string | null;
  secondary_colour: string | null;
  season_position: number | null;
  community_points_season: number;
  legacy_score: number;
  is_verified: boolean;
};

type DiscoveryReadinessRow = {
  current_seasons: number;
  active_leagues: number;
  active_clubs: number;
  complete_club_rows: number;
};

function toIsoDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

export class CommunityLeagueDiscoveryService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getDiscoveryCounts(): Promise<DiscoveryFoundationCounts> {
    const rows = await this.db.$queryRaw<DiscoveryCountsRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (SELECT count(*)::int FROM public.clubs) AS total_clubs
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      activeLeagues: row?.active_leagues ?? 0,
      activeClubs: row?.active_clubs ?? 0,
      totalClubs: row?.total_clubs ?? 0,
    };
  }

  async getCurrentSeason(): Promise<SeasonDiscoverySummary | null> {
    const rows = await this.db.$queryRaw<SeasonRow[]>`
      SELECT
        id::text,
        name,
        slug,
        start_date,
        end_date,
        is_current
      FROM public.seasons
      WHERE is_current = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      startDate: toIsoDate(row.start_date),
      endDate: toIsoDate(row.end_date),
      isCurrent: row.is_current,
    };
  }

  async getActiveLeagues(): Promise<LeagueDiscoverySummary[]> {
    const rows = await this.db.$queryRaw<LeagueRow[]>`
      SELECT
        l.id::text,
        l.name,
        l.display_name,
        l.slug,
        l.country,
        l.tier,
        l.season_id::text,
        (
          SELECT count(*)::int
          FROM public.clubs c
          WHERE c.league_id = l.id
            AND c.is_active = true
        ) AS active_club_count
      FROM public.leagues l
      WHERE l.is_active = true
      ORDER BY l.tier ASC, l.display_name ASC
    `;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      slug: row.slug,
      country: row.country,
      tier: row.tier,
      seasonId: row.season_id,
      activeClubCount: row.active_club_count,
    }));
  }

  async getFeaturedClubs(limit = 12): Promise<ClubDiscoveryCard[]> {
    const rows = await this.db.$queryRaw<ClubRow[]>`
      SELECT
        c.id::text,
        c.name,
        c.short_name,
        c.slug,
        c.country,
        c.city,
        l.slug AS league_slug,
        l.display_name AS league_name,
        c.primary_colour,
        c.secondary_colour,
        c.season_position,
        c.community_points_season,
        c.legacy_score,
        c.is_verified
      FROM public.clubs c
      JOIN public.leagues l
        ON l.id = c.league_id
      WHERE c.is_active = true
        AND l.is_active = true
      ORDER BY
        c.season_position ASC NULLS LAST,
        c.community_points_season DESC,
        c.name ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      shortName: row.short_name,
      slug: row.slug,
      country: row.country,
      city: row.city,
      leagueSlug: row.league_slug,
      leagueName: row.league_name,
      primaryColour: row.primary_colour,
      secondaryColour: row.secondary_colour,
      seasonPosition: row.season_position,
      communityPointsSeason: row.community_points_season,
      legacyScore: row.legacy_score,
      isVerified: row.is_verified,
    }));
  }

  async getDiscoveryReadiness(): Promise<DiscoveryReadiness> {
    const rows = await this.db.$queryRaw<DiscoveryReadinessRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (SELECT count(*)::int FROM public.leagues WHERE is_active = true) AS active_leagues,
        (SELECT count(*)::int FROM public.clubs WHERE is_active = true) AS active_clubs,
        (
          SELECT count(*)::int
          FROM public.clubs c
          JOIN public.leagues l
            ON l.id = c.league_id
          WHERE c.is_active = true
            AND l.is_active = true
            AND c.name IS NOT NULL
            AND c.slug IS NOT NULL
            AND c.short_name IS NOT NULL
            AND c.country IS NOT NULL
            AND c.primary_colour IS NOT NULL
        ) AS complete_club_rows
    `;

    const row = rows[0];

    return {
      onboardingFoundationAccepted: true,
      currentSeasonAvailable: (row?.current_seasons ?? 0) === 1,
      leagueDiscoveryAvailable: (row?.active_leagues ?? 0) >= 1,
      clubDiscoveryAvailable: (row?.active_clubs ?? 0) >= 2,
      clubSelectionDataComplete: (row?.complete_club_rows ?? 0) >= 2,
    };
  }

  async getDiscoveryFoundationSnapshot(): Promise<DiscoveryFoundationSnapshot> {
    const [counts, currentSeason, leagues, featuredClubs, readiness] = await Promise.all([
      this.getDiscoveryCounts(),
      this.getCurrentSeason(),
      this.getActiveLeagues(),
      this.getFeaturedClubs(),
      this.getDiscoveryReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      currentSeason,
      leagues,
      featuredClubs,
      counts,
      readiness,
    };
  }
}

export function createCommunityLeagueDiscoveryService(
  db: PrismaClient = prisma,
): CommunityLeagueDiscoveryService {
  return new CommunityLeagueDiscoveryService(db);
}