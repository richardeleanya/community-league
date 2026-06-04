export type DiscoveryFoundationCounts = {
  currentSeasons: number;
  activeLeagues: number;
  activeClubs: number;
  totalClubs: number;
};

export type SeasonDiscoverySummary = {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export type LeagueDiscoverySummary = {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  country: string | null;
  tier: number;
  seasonId: string;
  activeClubCount: number;
};

export type ClubDiscoveryCard = {
  id: string;
  name: string;
  shortName: string | null;
  slug: string;
  country: string | null;
  city: string | null;
  leagueSlug: string;
  leagueName: string;
  primaryColour: string | null;
  secondaryColour: string | null;
  seasonPosition: number | null;
  communityPointsSeason: number;
  legacyScore: number;
  isVerified: boolean;
};

export type DiscoveryReadiness = {
  onboardingFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  leagueDiscoveryAvailable: boolean;
  clubDiscoveryAvailable: boolean;
  clubSelectionDataComplete: boolean;
};

export type DiscoveryFoundationSnapshot = {
  generatedAt: string;
  currentSeason: SeasonDiscoverySummary | null;
  leagues: LeagueDiscoverySummary[];
  featuredClubs: ClubDiscoveryCard[];
  counts: DiscoveryFoundationCounts;
  readiness: DiscoveryReadiness;
};