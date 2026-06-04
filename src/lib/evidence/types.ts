export type EvidenceDetailCounts = {
  currentSeasons: number;
  submittedActions: number;
  approvedActions: number;
  pendingActions: number;
  actionsWithPhotos: number;
  actionsWithGps: number;
  actionsWithMission: number;
  pointsAwardedActions: number;
  evidenceAuditLogs: number;
  pointsNotifications: number;
};

export type ActionEvidenceDetailCard = {
  actionId: string;
  supporterId: string;
  username: string;
  displayName: string;
  clubId: string;
  clubName: string;
  missionId: string | null;
  missionTitle: string | null;
  fixtureId: string | null;
  actionType: string;
  actionCategory: string;
  description: string;
  photoUrls: string[];
  photoCount: number;
  gpsLatitude: number;
  gpsLongitude: number;
  gpsAccuracyMetres: number;
  actionDate: string;
  submittedAt: string;
  verificationStatus: string;
  verificationTier: string;
  basePoints: number;
  finalPointsAwarded: number;
  xpAwarded: number;
  legacyPointsAwarded: number;
  fraudScore: number;
  isFraudulent: boolean;
};

export type EvidenceProofTrail = {
  actionId: string;
  auditLogCount: number;
  notificationCount: number;
  hasSubmissionEvidence: boolean;
  hasGpsEvidence: boolean;
  hasPhotoEvidence: boolean;
  hasPointsAward: boolean;
  hasMissionContext: boolean;
};

export type EvidenceDetailReadiness = {
  missionCatalogueAccepted: true;
  submittedActionAvailable: boolean;
  approvedActionAvailable: boolean;
  photoEvidenceAvailable: boolean;
  gpsEvidenceAvailable: boolean;
  missionContextAvailable: boolean;
  pointsAwardEvidenceAvailable: boolean;
  auditTrailAvailable: boolean;
};

export type EvidenceDetailSnapshot = {
  generatedAt: string;
  headline: string;
  counts: EvidenceDetailCounts;
  actions: ActionEvidenceDetailCard[];
  proofTrails: EvidenceProofTrail[];
  readiness: EvidenceDetailReadiness;
};