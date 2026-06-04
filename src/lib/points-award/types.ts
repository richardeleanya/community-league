export type PointsAwardCounts = {
  approvedActions: number;
  pendingActions: number;
  totalFinalPointsAwarded: number;
  totalXpAwarded: number;
  totalLegacyAwarded: number;
  leagueTableRows: number;
  individualRankingRows: number;
  legacyMapPins: number;
  pointsAwardedNotifications: number;
  pointsAuditLogs: number;
  awardFunctions: number;
  awardTriggers: number;
};

export type AwardedActionCard = {
  id: string;
  supporterId: string;
  username: string;
  clubId: string;
  clubName: string;
  actionType: string;
  verificationStatus: string;
  basePoints: number;
  multiplierApplied: number;
  finalPointsAwarded: number;
  xpAwarded: number;
  legacyPointsAwarded: number;
  verifiedAt: string | null;
};

export type LeagueTableAwardRow = {
  clubId: string;
  clubName: string;
  position: number;
  communityTasksCompleted: number;
  communityPointsFor: number;
  communityPointsAgainst: number;
  communityDifference: number;
  points: number;
};

export type PointsAwardReadiness = {
  verificationQueueFoundationAccepted: true;
  processApprovedActionFunctionAvailable: boolean;
  approvedActionTriggerAvailable: boolean;
  approvedActionAvailable: boolean;
  leagueTableAvailable: boolean;
  individualRankingAvailable: boolean;
  notificationAwardAvailable: boolean;
  auditAwardAvailable: boolean;
};

export type PointsAwardDecisionDraft = {
  actionId: string;
  approvalStatus: 'tier1_approved' | 'tier2_approved' | 'tier3_approved';
  verifiedBy: string;
  note: string;
};

export type PointsAwardDecisionValidation = {
  valid: boolean;
  errors: string[];
  data: PointsAwardDecisionDraft | null;
};

export type PointsAwardFoundationSnapshot = {
  generatedAt: string;
  headline: string;
  counts: PointsAwardCounts;
  awardedActions: AwardedActionCard[];
  leagueTable: LeagueTableAwardRow[];
  readiness: PointsAwardReadiness;
};