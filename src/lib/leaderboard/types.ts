export type LeaderboardCounts = {
  currentSeasons: number;
  activeLeagues: number;
  activeClubs: number;
  approvedActions: number;
  leagueTableRows: number;
  individualRankingRows: number;
  topClubPoints: number;
  topSupporterPoints: number;
  pointsAwardedNotifications: number;
  pointsAuditLogs: number;
};

export type LeagueTableLeaderboardRow = {
  clubId: string;
  clubName: string;
  clubSlug: string;
  position: number;
  communityTasksCompleted: number;
  communityPointsFor: number;
  communityPointsAgainst: number;
  communityDifference: number;
  points: number;
};

export type IndividualLeaderboardRow = {
  supporterId: string;
  username: string;
  displayName: string;
  clubId: string;
  clubName: string;
  rankOverall: number;
  rankInClub: number;
  communityPoints: number;
};

export type LeaderboardReadiness = {
  pointsAwardFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  activeLeagueAvailable: boolean;
  leagueTableAvailable: boolean;
  individualLeaderboardAvailable: boolean;
  approvedActionAvailable: boolean;
  pointsNotificationAvailable: boolean;
  pointsAuditAvailable: boolean;
};

export type LeaderboardFoundationSnapshot = {
  generatedAt: string;
  headline: string;
  counts: LeaderboardCounts;
  leagueTable: LeagueTableLeaderboardRow[];
  individualLeaderboard: IndividualLeaderboardRow[];
  readiness: LeaderboardReadiness;
};