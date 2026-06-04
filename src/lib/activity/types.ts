export type ActivityFeedCounts = {
  currentSeasons: number;
  notifications: number;
  unreadNotifications: number;
  notificationTypes: number;
  auditLogs: number;
  actionAuditLogs: number;
  submittedActions: number;
  approvedActions: number;
  supporterProfiles: number;
  activeClubs: number;
};

export type ActivityNotificationItem = {
  notificationId: string;
  userId: string;
  type: string;
  label: string;
  isRead: boolean;
  createdAt: string;
  proofReference: string;
};

export type ActivityAuditEvent = {
  auditLogId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  label: string;
  createdAt: string;
  proofReference: string;
};

export type ActivityActionEvent = {
  actionId: string;
  username: string;
  displayName: string;
  clubName: string;
  actionType: string;
  verificationStatus: string;
  finalPointsAwarded: number;
  submittedAt: string;
  label: string;
  proofReference: string;
};

export type ActivityFeedReadiness = {
  legacyImpactFoundationAccepted: true;
  currentSeasonAvailable: boolean;
  notificationEnumAvailable: boolean;
  notificationFeedReadable: boolean;
  auditFeedReadable: boolean;
  actionFeedReadable: boolean;
  approvedActionAvailable: boolean;
};

export type ActivityFeedSnapshot = {
  generatedAt: string;
  headline: string;
  counts: ActivityFeedCounts;
  notifications: ActivityNotificationItem[];
  auditEvents: ActivityAuditEvent[];
  actionEvents: ActivityActionEvent[];
  readiness: ActivityFeedReadiness;
};