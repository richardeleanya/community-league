import type { PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import type { CommunityLeagueCounts, DomainFoundationSnapshot, XpLevelPreview } from './types';

export class CommunityLeagueDomainService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getFoundationCounts(): Promise<CommunityLeagueCounts> {
    const [
      users,
      supporterProfiles,
      clubs,
      leagues,
      seasons,
      fixtures,
      missions,
      communityActions,
      peerValidations,
      fraudReports,
      penalties,
      xpLevelThresholds,
      leagueTables,
      individualRankings,
      awards,
      legacyProjects,
      legacyMapPins,
      clubNews,
      notifications,
      auditLogs,
      platformSettings,
    ] = await Promise.all([
      this.db.users.count(),
      this.db.supporter_profiles.count(),
      this.db.clubs.count(),
      this.db.leagues.count(),
      this.db.seasons.count(),
      this.db.fixtures.count(),
      this.db.missions.count(),
      this.db.community_actions.count(),
      this.db.peer_validations.count(),
      this.db.fraud_reports.count(),
      this.db.penalties.count(),
      this.db.xp_level_thresholds.count(),
      this.db.league_tables.count(),
      this.db.individual_rankings.count(),
      this.db.awards.count(),
      this.db.legacy_projects.count(),
      this.db.legacy_map_pins.count(),
      this.db.club_news.count(),
      this.db.notifications.count(),
      this.db.audit_logs.count(),
      this.db.platform_settings.count(),
    ]);

    return {
      users,
      supporterProfiles,
      clubs,
      leagues,
      seasons,
      fixtures,
      missions,
      communityActions,
      peerValidations,
      fraudReports,
      penalties,
      xpLevelThresholds,
      leagueTables,
      individualRankings,
      awards,
      legacyProjects,
      legacyMapPins,
      clubNews,
      notifications,
      auditLogs,
      platformSettings,
    };
  }

  async getXpLevelPreview(): Promise<XpLevelPreview[]> {
    const rows = await this.db.xp_level_thresholds.findMany({
      orderBy: {
        level: 'asc',
      },
      select: {
        level: true,
        title: true,
        xp_required: true,
        colour: true,
      },
      take: 8,
    });

    return rows.map((row) => ({
      level: row.level,
      title: row.title,
      xpRequired: row.xp_required,
      colour: row.colour,
    }));
  }

  async getPlatformSettingValue(key: string): Promise<unknown> {
    const row = await this.db.platform_settings.findFirst({
      where: {
        key,
      },
      select: {
        value: true,
      },
    });

    return row?.value ?? null;
  }

  async getFoundationSnapshot(): Promise<DomainFoundationSnapshot> {
    const [
      counts,
      xpPreview,
      pointsMultiplierTable,
      referralBonusPoints,
      actionMaxPhotos,
    ] = await Promise.all([
      this.getFoundationCounts(),
      this.getXpLevelPreview(),
      this.getPlatformSettingValue('points_multiplier_table'),
      this.getPlatformSettingValue('referral_bonus_points'),
      this.getPlatformSettingValue('action_max_photos'),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      counts,
      xpPreview,
      settings: {
        pointsMultiplierTable,
        referralBonusPoints,
        actionMaxPhotos,
      },
      readiness: {
        databaseFoundation: 'accepted',
        prismaFoundation: 'accepted',
        supabaseClientFoundation: 'accepted',
        appSurfaceFoundation: 'accepted',
        domainServiceLayer: 'active',
      },
    };
  }
}

export function createCommunityLeagueDomainService(
  db: PrismaClient = prisma,
): CommunityLeagueDomainService {
  return new CommunityLeagueDomainService(db);
}