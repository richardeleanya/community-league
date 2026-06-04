export type AdminControlCounts = {
  platformSettings: number;
  publicSettings: number;
  fraudSettings: number;
  verificationSettings: number;
  actionSettings: number;
  authSettings: number;
  pointsSettings: number;
  users: number;
  activeUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  auditLogs: number;
};

export type PlatformSettingCard = {
  key: string;
  group: string;
  description: string;
  value: unknown;
  isPublic: boolean;
  updatedAt: string;
  proofReference: string;
};

export type AdminRoleSummary = {
  users: number;
  activeUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  pendingVerificationUsers: number;
  suspendedUsers: number;
};

export type AdminControlReadiness = {
  activityFeedFoundationAccepted: true;
  platformSettingsAvailable: boolean;
  publicWhitelistAvailable: boolean;
  fraudSettingsAvailable: boolean;
  verificationSettingsAvailable: boolean;
  actionSettingsAvailable: boolean;
  authSettingsAvailable: boolean;
  pointsSettingsAvailable: boolean;
  userAdminColumnsReadable: boolean;
  auditLogReadable: boolean;
};

export type AdminControlSnapshot = {
  generatedAt: string;
  headline: string;
  counts: AdminControlCounts;
  settings: PlatformSettingCard[];
  roles: AdminRoleSummary;
  readiness: AdminControlReadiness;
};