export type OnboardingStage =
  | 'account_created'
  | 'email_verified'
  | 'profile_required'
  | 'club_selection_required'
  | 'ready_for_actions';

export type UsernameAvailability = {
  username: string;
  normalisedUsername: string;
  isFormatValid: boolean;
  isAvailable: boolean;
  reason: string | null;
};

export type ClubSelectionOption = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  badgeUrl: string | null;
  communityPointsSeason: number;
};

export type OnboardingFoundationCounts = {
  users: number;
  supporterProfiles: number;
  activeUsers: number;
  pendingVerificationUsers: number;
  activeClubs: number;
  activeLeagues: number;
  currentSeasons: number;
};

export type OnboardingReadiness = {
  accountFoundationAccepted: true;
  usersTableReady: boolean;
  supporterProfilesTableReady: boolean;
  clubsAvailableForSelection: boolean;
  xpLevelsSeeded: boolean;
  onboardingSettingsAvailable: boolean;
};

export type OnboardingFoundationSnapshot = {
  generatedAt: string;
  stage: OnboardingStage;
  counts: OnboardingFoundationCounts;
  usernameRules: {
    minLength: number;
    maxLength: number;
    pattern: string;
  };
  availableClubs: ClubSelectionOption[];
  readiness: OnboardingReadiness;
};