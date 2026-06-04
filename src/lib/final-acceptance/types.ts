export type FinalAcceptanceStatus = 'accepted' | 'blocked';

export type FinalAcceptanceProofItem = {
  key: string;
  area: string;
  proof: string;
  status: FinalAcceptanceStatus;
};

export type FinalRuntimeProofRoute = {
  path: string;
  type: 'page' | 'api';
  marker: string;
};

export type FinalAcceptanceSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  proofItems: FinalAcceptanceProofItem[];
  runtimeProofRoutes: FinalRuntimeProofRoute[];
  readiness: {
    allPriorStepsAccepted: boolean;
    releaseReadinessAccepted: boolean;
    hardeningAccepted: boolean;
    finalRuntimeProofRequired: boolean;
    finalAcceptanceBlocked: boolean;
  };
};