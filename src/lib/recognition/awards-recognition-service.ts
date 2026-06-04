import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type {
  RecognitionAwardTypeOption,
  RecognitionCandidate,
  RecognitionCounts,
  RecognitionReadiness,
  RecognitionSnapshot,
} from './types';

type CountRow = {
  current_seasons: number;
  award_types: number;
  award_rows: number;
  published_awards: number;
  ranking_rows: number;
  league_table_rows: number;
  approved_actions: number;
  supporter_profiles: number;
  clubs: number;
  top_supporter_points: number | null;
  top_club_points: number | null;
};

type EnumRow = {
  value: string;
  sort_order: number;
};

type SupporterCandidateRow = {
  supporter_id: string;
  username: string;
  display_name: string | null;
  club_name: string;
  community_points: number;
  rank_overall: number;
};

type ClubCandidateRow = {
  club_id: string;
  club_name: string;
  points: number;
  community_difference: number;
  position: number;
};

type ActionCandidateRow = {
  action_id: string;
  username: string;
  display_name: string | null;
  club_name: string;
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

export class CommunityLeagueAwardsRecognitionService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getRecognitionCounts(): Promise<RecognitionCounts> {
    const rows = await this.db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT count(*)::int FROM public.seasons WHERE is_current = true) AS current_seasons,
        (
          SELECT count(*)::int
          FROM pg_enum e
          JOIN pg_type t
            ON t.oid = e.enumtypid
          WHERE t.typname = 'award_type_enum'
        ) AS award_types,
        (SELECT count(*)::int FROM public.awards) AS award_rows,
        (
          SELECT count(*)::int
          FROM public.awards
          WHERE is_published = true
        ) AS published_awards,
        (
          SELECT count(*)::int
          FROM public.individual_rankings ir
          JOIN public.seasons s
            ON s.id = ir.season_id
          WHERE s.is_current = true
        ) AS ranking_rows,
        (
          SELECT count(*)::int
          FROM public.league_tables lt
          JOIN public.seasons s
            ON s.id = lt.season_id
          WHERE s.is_current = true
        ) AS league_table_rows,
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
        ) AS clubs,
        (
          SELECT max(community_points)::int
          FROM public.individual_rankings ir
          JOIN public.seasons s
            ON s.id = ir.season_id
          WHERE s.is_current = true
        ) AS top_supporter_points,
        (
          SELECT max(points)::int
          FROM public.league_tables lt
          JOIN public.seasons s
            ON s.id = lt.season_id
          WHERE s.is_current = true
        ) AS top_club_points
    `;

    const row = rows[0];

    return {
      currentSeasons: row?.current_seasons ?? 0,
      awardTypes: row?.award_types ?? 0,
      awardRows: row?.award_rows ?? 0,
      publishedAwards: row?.published_awards ?? 0,
      rankingRows: row?.ranking_rows ?? 0,
      leagueTableRows: row?.league_table_rows ?? 0,
      approvedActions: row?.approved_actions ?? 0,
      supporterProfiles: row?.supporter_profiles ?? 0,
      clubs: row?.clubs ?? 0,
      topSupporterPoints: row?.top_supporter_points ?? 0,
      topClubPoints: row?.top_club_points ?? 0,
    };
  }

  async getAwardTypeOptions(): Promise<RecognitionAwardTypeOption[]> {
    const rows = await this.db.$queryRaw<EnumRow[]>`
      SELECT
        e.enumlabel AS value,
        e.enumsortorder::int AS sort_order
      FROM pg_enum e
      JOIN pg_type t
        ON t.oid = e.enumtypid
      WHERE t.typname = 'award_type_enum'
      ORDER BY e.enumsortorder ASC
    `;

    return rows.map((row) => ({
      value: row.value,
      label: titleCaseEnum(row.value),
      sortOrder: row.sort_order,
    }));
  }

  async getSupporterRecognitionCandidates(limit = 5): Promise<RecognitionCandidate[]> {
    const rows = await this.db.$queryRaw<SupporterCandidateRow[]>`
      SELECT
        ir.supporter_id::text,
        sp.username,
        sp.display_name,
        c.name AS club_name,
        ir.community_points,
        ir.rank_overall
      FROM public.individual_rankings ir
      JOIN public.seasons s
        ON s.id = ir.season_id
      JOIN public.supporter_profiles sp
        ON sp.id = ir.supporter_id
      JOIN public.clubs c
        ON c.id = ir.club_id
      WHERE s.is_current = true
      ORDER BY ir.rank_overall ASC, ir.community_points DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      awardType: row.rank_overall === 1 ? 'community_golden_boot' : 'community_playmaker',
      recipientType: 'supporter',
      recipientId: row.supporter_id,
      recipientName: row.display_name ?? row.username,
      clubName: row.club_name,
      points: row.community_points,
      rank: row.rank_overall,
      basis: 'Current-season individual ranking and verified community points.',
      proofReference: `individual_rankings:${row.supporter_id}`,
    }));
  }

  async getClubRecognitionCandidates(limit = 5): Promise<RecognitionCandidate[]> {
    const rows = await this.db.$queryRaw<ClubCandidateRow[]>`
      SELECT
        lt.club_id::text,
        c.name AS club_name,
        lt.points,
        lt.community_difference,
        lt.position
      FROM public.league_tables lt
      JOIN public.seasons s
        ON s.id = lt.season_id
      JOIN public.clubs c
        ON c.id = lt.club_id
      WHERE s.is_current = true
      ORDER BY lt.position ASC, lt.points DESC, lt.community_difference DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      awardType: row.position === 1 ? 'league_champions' : 'community_club_year',
      recipientType: 'club',
      recipientId: row.club_id,
      recipientName: row.club_name,
      clubName: row.club_name,
      points: row.points,
      rank: row.position,
      basis: 'Current-season club league table position and points.',
      proofReference: `league_tables:${row.club_id}`,
    }));
  }

  async getActionRecognitionCandidates(limit = 5): Promise<RecognitionCandidate[]> {
    const rows = await this.db.$queryRaw<ActionCandidateRow[]>`
      SELECT
        ca.id::text AS action_id,
        sp.username,
        sp.display_name,
        c.name AS club_name,
        ca.action_type::text,
        ca.final_points_awarded,
        ca.legacy_points_awarded
      FROM public.community_actions ca
      JOIN public.supporter_profiles sp
        ON sp.id = ca.supporter_id
      JOIN public.clubs c
        ON c.id = ca.club_id
      WHERE ca.verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
      ORDER BY ca.final_points_awarded DESC, ca.legacy_points_awarded DESC, ca.submitted_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      awardType: row.action_type === 'tree_planting' ? 'community_green_boot' : 'community_heart_award',
      recipientType: 'community_action',
      recipientId: row.action_id,
      recipientName: row.display_name ?? row.username,
      clubName: row.club_name,
      points: row.final_points_awarded,
      rank: null,
      basis: `Verified ${titleCaseEnum(row.action_type)} action with points and legacy output.`,
      proofReference: `community_actions:${row.action_id}`,
    }));
  }

  async getRecognitionCandidates(): Promise<RecognitionCandidate[]> {
    const [supporters, clubs, actions] = await Promise.all([
      this.getSupporterRecognitionCandidates(),
      this.getClubRecognitionCandidates(),
      this.getActionRecognitionCandidates(),
    ]);

    return [...supporters, ...clubs, ...actions];
  }

  async getRecognitionReadiness(): Promise<RecognitionReadiness> {
    const counts = await this.getRecognitionCounts();

    return {
      moderationFoundationAccepted: true,
      currentSeasonAvailable: counts.currentSeasons === 1,
      awardEnumAvailable: counts.awardTypes >= 1,
      supporterRankingAvailable: counts.rankingRows >= 1,
      clubRankingAvailable: counts.leagueTableRows >= 1,
      approvedActionAvailable: counts.approvedActions >= 1,
      recognitionCandidateReadable:
        counts.rankingRows >= 1 && counts.leagueTableRows >= 1 && counts.approvedActions >= 1,
      awardsTableReadable: counts.awardRows >= 0 && counts.publishedAwards >= 0,
    };
  }

  async getRecognitionSnapshot(): Promise<RecognitionSnapshot> {
    const [counts, awardTypes, candidates, readiness] = await Promise.all([
      this.getRecognitionCounts(),
      this.getAwardTypeOptions(),
      this.getRecognitionCandidates(),
      this.getRecognitionReadiness(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Awards and recognition is connected to award enums, rankings, league tables, approved actions and proof references.',
      counts,
      awardTypes,
      candidates,
      readiness,
    };
  }
}

export function createCommunityLeagueAwardsRecognitionService(
  db: PrismaClient = prisma,
): CommunityLeagueAwardsRecognitionService {
  return new CommunityLeagueAwardsRecognitionService(db);
}