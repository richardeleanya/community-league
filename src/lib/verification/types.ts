export type VerificationQueueCounts = {
  totalActions: number;
  pendingActions: number;
  underReviewActions: number;
  flaggedActions: number;
  approvedActions: number;
  rejectedActions: number;
  openPeerValidations: number;
  openFraudReports: number;
  moderators: number;
};

export type VerificationQueueItem = {
  id: string;
  supporterId: string;
  username: string;
  clubId: string;
  clubName: string;
  missionTitle: string | null;
  actionType: string;
  actionCategory: string;
  verificationStatus: string;
  verificationTier: string;
  fraudScore: number;
  basePoints: number;
  submittedAt: string;
  actionDate: string;
  description: string;
};

export type VerificationDecisionDraft = {
  actionId: string;
  decision: 'approve_tier_1' | 'approve_tier_2' | 'approve_tier_3' | 'reject' | 'flag' | 'send_under_review';
  moderatorNote: string;
  rejectionReason?: string | null;
};

export type VerificationDecisionValidation = {
  valid: boolean;
  errors: string[];
  data: VerificationDecisionDraft | null;
};

export type VerificationQueueReadiness = {
  actionSubmissionFoundationAccepted: true;
  pendingQueueAvailable: boolean;
  statusEnumAvailable: boolean;
  queueTablesAvailable: boolean;
  moderationAccessLayerAvailable: boolean;
  decisionValidationReady: boolean;
  auditTrailTargetAvailable: boolean;
};

export type VerificationQueueFoundationSnapshot = {
  generatedAt: string;
  headline: string;
  counts: VerificationQueueCounts;
  queue: VerificationQueueItem[];
  readiness: VerificationQueueReadiness;
};