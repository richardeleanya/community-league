export type CommunityLeagueCounts = {
  users: number;
  supporterProfiles: number;
  clubs: number;
  leagues: number;
  seasons: number;
  fixtures: number;
  missions: number;
  communityActions: number;
  peerValidations: number;
  fraudReports: number;
  penalties: number;
  xpLevelThresholds: number;
  leagueTables: number;
  individualRankings: number;
  awards: number;
  legacyProjects: number;
  legacyMapPins: number;
  clubNews: number;
  notifications: number;
  auditLogs: number;
  platformSettings: number;
};

export type XpLevelPreview = {
  level: number;
  title: string;
  xpRequired: number;
  colour: string | null;
};

export type DomainFoundationSnapshot = {
  generatedAt: string;
  counts: CommunityLeagueCounts;
  xpPreview: XpLevelPreview[];
  settings: {
    pointsMultiplierTable: unknown;
    referralBonusPoints: unknown;
    actionMaxPhotos: unknown;
  };
  readiness: {
    databaseFoundation: 'accepted';
    prismaFoundation: 'accepted';
    supabaseClientFoundation: 'accepted';
    appSurfaceFoundation: 'accepted';
    domainServiceLayer: 'active';
  };
};