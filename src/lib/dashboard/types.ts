export type SupporterDashboardCounts = {
  currentSeasons: number;
  activeLeagues: number;
  activeClubs: number;
  missions: number;
  submittedActions: number;
  approvedActions: number;
  supporterProfiles: number;
  xpLevels: number;
};

export type SupporterDashboardMetric = {
  label: string;
  value: number;
  proof: string;
};

export type SupporterClubStanding = {
  clubId: string;
  clubName: string;
  clubSlug: string;
  leagueName: string;
  seasonPosition: number | null;
  communityPointsSeason: number;
  legacyScore: number;
  isVerified: boolean;
};

export type SupporterProgressBand = {
  level: number;
  title: string;
  xpRequired: number;
  colour: string | null;
};

export type SupporterDashboardReadiness = {
  discoveryFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  clubLeagueDiscoveryAvailable: boolean;
  supporterProgressAvailable: boolean;
  pointsEngineBaselineAvailable: boolean;
  dashboardApiReady: boolean;
};

export type SupporterDashboardSnapshot = {
  generatedAt: string;
  headline: string;
  counts: SupporterDashboardCounts;
  metrics: SupporterDashboardMetric[];
  featuredClubs: SupporterClubStanding[];
  progressBands: SupporterProgressBand[];
  readiness: SupporterDashboardReadiness;
};