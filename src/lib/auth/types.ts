export type AccountSessionStatus = 'anonymous' | 'authenticated';

export type AccountSessionState = {
  status: AccountSessionStatus;
  userId: string | null;
  email: string | null;
};

export type AccountFoundationCounts = {
  users: number;
  supporterProfiles: number;
  activeUsers: number;
  pendingVerificationUsers: number;
  adminUsers: number;
  moderatorUsers: number;
};

export type AccountPolicySnapshot = {
  maxLoginAttempts: unknown;
  lockoutDurationMinutes: unknown;
  sessionInactivityDays: unknown;
};

export type AccountFoundationReadiness = {
  authUserTableSynced: boolean;
  supporterProfileLinkAvailable: boolean;
  accountStatusPolicyAvailable: boolean;
  adminModeratorFlagsAvailable: boolean;
  authSettingsAvailable: boolean;
};

export type AccountFoundationSnapshot = {
  generatedAt: string;
  session: AccountSessionState;
  counts: AccountFoundationCounts;
  policy: AccountPolicySnapshot;
  readiness: AccountFoundationReadiness;
};