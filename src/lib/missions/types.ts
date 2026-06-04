export type MissionCatalogueCounts = {
  currentSeasons: number;
  activeLeagues: number;
  activeClubs: number;
  activeFixtures: number;
  activeMissionWindows: number;
  activeMissions: number;
  actionTypes: number;
  missionCategories: number;
  approvedActions: number;
  submittedActions: number;
};

export type FixtureMissionCard = {
  fixtureId: string;
  leagueId: string;
  seasonId: string;
  homeClubId: string;
  homeClubName: string;
  awayClubId: string;
  awayClubName: string;
  matchDate: string;
  matchWeek: number;
  fixtureType: string;
  pointMultiplier: number;
  status: string;
  missionWeekActive: boolean;
  missionStartAt: string | null;
  missionEndAt: string | null;
  activeMissionCount: number;
};

export type MissionCatalogueCard = {
  missionId: string;
  fixtureId: string | null;
  title: string;
  description: string;
  actionCategory: string;
  actionType: string;
  basePoints: number;
  baseXp: number;
  multiplierOverride: number | null;
  verificationTierRequired: string;
  maxCompletionsPerUser: number | null;
  maxCompletionsTotal: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  fixtureType: string | null;
  fixtureMultiplier: number | null;
  homeClubName: string | null;
  awayClubName: string | null;
};

export type MissionCatalogueReadiness = {
  profileFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  activeFixtureAvailable: boolean;
  activeMissionWindowAvailable: boolean;
  activeMissionAvailable: boolean;
  actionTypeCoverageAvailable: boolean;
  missionCategoryCoverageAvailable: boolean;
  pointsAwardContextAvailable: boolean;
};

export type MissionCatalogueSnapshot = {
  generatedAt: string;
  headline: string;
  counts: MissionCatalogueCounts;
  fixtures: FixtureMissionCard[];
  missions: MissionCatalogueCard[];
  readiness: MissionCatalogueReadiness;
};