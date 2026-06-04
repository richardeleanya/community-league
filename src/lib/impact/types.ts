export type LegacyImpactCounts = {
  currentSeasons: number;
  activeClubs: number;
  approvedActions: number;
  actionsWithGps: number;
  legacyProjects: number;
  activeLegacyProjects: number;
  completedLegacyProjects: number;
  legacyMapPins: number;
  pinsWithCoordinates: number;
  projectTypes: number;
  projectStatuses: number;
  actionTypes: number;
  totalLegacyPointsAwarded: number;
  totalFinalPointsAwarded: number;
};

export type LegacyProjectCard = {
  projectId: string;
  clubId: string;
  clubName: string;
  projectType: string;
  status: string;
  seasonId: string;
};

export type ImpactMapPin = {
  pinId: string;
  source: 'legacy_map_pin' | 'community_action';
  clubId: string;
  clubName: string;
  latitude: number;
  longitude: number;
  actionType: string;
  impactLabel: string;
  points: number;
  legacyPoints: number;
  proofReference: string;
};

export type LegacyImpactReadiness = {
  awardsFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  projectEnumsAvailable: boolean;
  legacyProjectTableReadable: boolean;
  legacyMapPinTableReadable: boolean;
  approvedActionImpactAvailable: boolean;
  gpsImpactAvailable: boolean;
  impactPinReadable: boolean;
};

export type LegacyImpactSnapshot = {
  generatedAt: string;
  headline: string;
  counts: LegacyImpactCounts;
  projects: LegacyProjectCard[];
  pins: ImpactMapPin[];
  readiness: LegacyImpactReadiness;
};