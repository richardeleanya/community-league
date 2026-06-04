export type ActionSubmissionCounts = {
  currentSeasons: number;
  activeLeagues: number;
  activeClubs: number;
  activeMissions: number;
  submittedActions: number;
  pendingActions: number;
  actionTypes: number;
  platformSettings: number;
  communityActionColumns: number;
  communityActionConstraints: number;
};

export type ActionSubmissionLimits = {
  descriptionMinChars: number;
  descriptionMaxChars: number;
  maxPhotos: number;
  maxPhotoMb: number;
  maxDaysPast: number;
};

export type ActionTypeOption = {
  value: string;
  label: string;
  sortOrder: number;
};

export type MissionSubmissionCard = {
  id: string;
  title: string;
  description: string;
  actionCategory: string;
  actionType: string;
  basePoints: number;
  baseXp: number;
  verificationTierRequired: string;
  startDate: string;
  endDate: string;
  fixtureId: string | null;
};

export type ActionSubmissionReadiness = {
  dashboardFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  clubSelectionAvailable: boolean;
  actionTypeEnumAvailable: boolean;
  missionBaselineAvailable: boolean;
  submissionSettingsAvailable: boolean;
  communityActionTableReady: boolean;
  serverValidationReady: boolean;
};

export type ActionSubmissionDraftInput = {
  actionType: string;
  actionCategory: string;
  missionId?: string | null;
  description: string;
  photoUrls: string[];
  gpsLatitude: number;
  gpsLongitude: number;
  gpsAccuracyMetres: number;
  actionDate: string;
  volunteerHours?: number;
  treesCount?: number;
  foodItemsCount?: number;
};

export type ActionSubmissionDraftValidation = {
  valid: boolean;
  errors: string[];
  data: ActionSubmissionDraftInput | null;
};

export type ActionSubmissionFoundationSnapshot = {
  generatedAt: string;
  headline: string;
  counts: ActionSubmissionCounts;
  limits: ActionSubmissionLimits;
  actionTypes: ActionTypeOption[];
  activeMissions: MissionSubmissionCard[];
  readiness: ActionSubmissionReadiness;
};