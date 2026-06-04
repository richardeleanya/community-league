export type LaunchDecisionStatus = 'go' | 'hold' | 'blocked';

export type FounderReviewNote = {
  key: string;
  area: string;
  reviewQuestion: string;
  reviewAnswer: string;
  evidence: string;
  status: LaunchDecisionStatus;
};

export type LaunchDecisionCriterion = {
  key: string;
  area: string;
  criterion: string;
  evidence: string;
  status: LaunchDecisionStatus;
};

export type LaunchDecisionSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  founderReviewNotes: FounderReviewNote[];
  launchCriteria: LaunchDecisionCriterion[];
  decision: {
    acceptanceChainReady: boolean;
    walkthroughAccepted: boolean;
    buildValidated: boolean;
    launchBlocked: boolean;
    recommendedDecision: 'GO_FOR_FOUNDER_REVIEW' | 'HOLD';
  };
};