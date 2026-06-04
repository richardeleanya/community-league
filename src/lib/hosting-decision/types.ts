export type HostingDecisionStatus = 'selected' | 'candidate' | 'rejected' | 'blocked';

export type HostingTargetCandidate = {
  key: string;
  name: string;
  decisionStatus: HostingDecisionStatus;
  fitReason: string;
  requiredInputs: string[];
  risks: string[];
  nextAction: string;
};

export type HostingConnectorDecision = {
  selectedTarget: string;
  selectedTargetKey: string;
  reason: string;
  connectorMode: 'manual-git-import' | 'cli-assisted' | 'docker-service';
  productionSecretsRequired: boolean;
  publicDeploymentBlocked: boolean;
};

export type HostingDecisionSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  candidates: HostingTargetCandidate[];
  decision: HostingConnectorDecision;
  readiness: {
    localReleaseCandidateAccepted: boolean;
    productionEnvironmentContractAccepted: boolean;
    gitRequired: boolean;
    deploymentTargetSelected: boolean;
    hostingDecisionBlocked: boolean;
    recommendedNextStep: 'PREPARE_VERCEL_PROJECT_IMPORT' | 'HOLD';
  };
};