export type ModerationReviewCounts = {
  currentSeasons: number;
  submittedActions: number;
  approvedActions: number;
  pendingActions: number;
  underReviewActions: number;
  flaggedActions: number;
  fraudulentActions: number;
  actionsWithFraudScore: number;
  fraudReportRows: number;
  openFraudReports: number;
  reportTypes: number;
  reportStatuses: number;
  activePenalties: number;
};

export type ModerationReviewItem = {
  actionId: string;
  supporterId: string;
  username: string;
  displayName: string;
  clubId: string;
  clubName: string;
  missionId: string | null;
  missionTitle: string | null;
  actionType: string;
  actionCategory: string;
  description: string;
  photoCount: number;
  gpsAccuracyMetres: number;
  verificationStatus: string;
  verificationTier: string;
  fraudScore: number;
  isFraudulent: boolean;
  duplicateHashPresent: boolean;
  deviceFingerprintPresent: boolean;
  submittedAt: string;
  finalPointsAwarded: number;
};

export type ModerationRiskSignal = {
  actionId: string;
  riskBand: 'low' | 'review' | 'high';
  fraudScore: number;
  gpsEvidencePresent: boolean;
  photoEvidencePresent: boolean;
  duplicateHashPresent: boolean;
  deviceFingerprintPresent: boolean;
  isFraudulent: boolean;
  verificationStatus: string;
};

export type ModerationReviewReadiness = {
  evidenceDetailAccepted: true;
  submittedActionsAvailable: boolean;
  fraudScoringColumnsAvailable: boolean;
  moderationEnumsAvailable: boolean;
  moderationQueueReadable: boolean;
  riskSignalReadable: boolean;
  reportTableAvailable: boolean;
  penaltyTableAvailable: boolean;
};

export type ModerationReviewSnapshot = {
  generatedAt: string;
  headline: string;
  counts: ModerationReviewCounts;
  reviewItems: ModerationReviewItem[];
  riskSignals: ModerationRiskSignal[];
  readiness: ModerationReviewReadiness;
};