export type OperationsOverviewCounts = {
  currentSeasons: number;
  activeClubs: number;
  activeMissions: number;
  fixturesActive: number;
  submittedActions: number;
  pendingActions: number;
  approvedActions: number;
  underReviewActions: number;
  openFraudReports: number;
  notifications: number;
  unreadNotifications: number;
  auditLogs: number;
  platformSettings: number;
  leagueRows: number;
  rankingRows: number;
  awardsRows: number;
  evidenceReadyActions: number;
};

export type OperationsMetricCard = {
  key: string;
  label: string;
  value: number;
  state: 'ready' | 'attention' | 'blocked';
  proofReference: string;
};

export type OperationsWorkstream = {
  key: string;
  label: string;
  status: 'ready' | 'attention' | 'blocked';
  summary: string;
  proofReference: string;
};

export type OperationsOverviewReadiness = {
  adminControlFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  clubFoundationAvailable: boolean;
  missionFoundationAvailable: boolean;
  actionPipelineAvailable: boolean;
  verificationPipelineAvailable: boolean;
  moderationPipelineReadable: boolean;
  activityPipelineReadable: boolean;
  adminSettingsReadable: boolean;
  leaderboardReadable: boolean;
  evidenceReadable: boolean;
};

export type OperationsOverviewSnapshot = {
  generatedAt: string;
  headline: string;
  counts: OperationsOverviewCounts;
  metrics: OperationsMetricCard[];
  workstreams: OperationsWorkstream[];
  readiness: OperationsOverviewReadiness;
};