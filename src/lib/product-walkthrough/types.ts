export type ProductWalkthroughStatus = 'ready' | 'review' | 'blocked';

export type ProductWalkthroughStage = {
  step: number;
  area: string;
  route: string;
  actor: string;
  walkthroughIntent: string;
  expectedEvidence: string;
  status: ProductWalkthroughStatus;
};

export type PersonaJourneyItem = {
  persona: string;
  entryRoute: string;
  primaryGoal: string;
  successPath: string[];
  proofOutput: string;
  status: ProductWalkthroughStatus;
};

export type ProductWalkthroughSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  stages: ProductWalkthroughStage[];
  personas: PersonaJourneyItem[];
  reviewDecision: {
    acceptanceChainReady: boolean;
    finalPackReady: boolean;
    walkthroughPackReady: boolean;
    productReviewBlocked: boolean;
  };
};