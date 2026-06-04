export type ProfileSurfaceCounts = {
  currentSeasons: number;
  activeClubs: number;
  supporterProfiles: number;
  publicSupporterProfiles: number;
  approvedActions: number;
  leagueTableRows: number;
  individualRankingRows: number;
  topClubCommunityPoints: number;
  topSupporterCommunityPoints: number;
  legacyMapPins: number;
};

export type ClubProfileSummary = {
  clubId: string;
  name: string;
  slug: string;
  country: string;
  leaguePosition: number;
  communityPoints: number;
  communityTasksCompleted: number;
  communityDifference: number;
  seasonCommunityPoints: number;
  supporterCount: number;
  approvedActions: number;
  isActive: boolean;
};

export type SupporterProfileSummary = {
  supporterId: string;
  username: string;
  displayName: string;
  clubId: string;
  clubName: string;
  currentLevel: number;
  levelTitle: string;
  seasonCommunityPoints: number;
  allTimeCommunityPoints: number;
  rankingCommunityPoints: number;
  legacyScore: number;
  rankOverall: number;
  rankInClub: number;
  lastActionAt: string | null;
};

export type ProfileSurfaceReadiness = {
  leaderboardFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  clubProfilesAvailable: boolean;
  supporterProfilesAvailable: boolean;
  leaguePositionAvailable: boolean;
  supporterRankingAvailable: boolean;
  communityPointsVisible: boolean;
  legacyProofAvailable: boolean;
};

export type ProfileSurfaceSnapshot = {
  generatedAt: string;
  headline: string;
  counts: ProfileSurfaceCounts;
  clubs: ClubProfileSummary[];
  supporters: SupporterProfileSummary[];
  readiness: ProfileSurfaceReadiness;
};