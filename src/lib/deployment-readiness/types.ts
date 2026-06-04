export type DeploymentReadinessStatus = 'ready' | 'attention' | 'blocked';

export type LaunchChecklistItem = {
  key: string;
  area: string;
  item: string;
  owner: string;
  evidence: string;
  status: DeploymentReadinessStatus;
};

export type DeploymentReadinessItem = {
  key: string;
  environmentArea: string;
  requirement: string;
  localEvidence: string;
  deploymentNote: string;
  status: DeploymentReadinessStatus;
};

export type DeploymentReadinessSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  launchChecklist: LaunchChecklistItem[];
  deploymentReadiness: DeploymentReadinessItem[];
  handoff: {
    localReleaseCandidateReady: boolean;
    externalDeploymentRequiresSecrets: boolean;
    deploymentBlocked: boolean;
    recommendedNextStep: 'PREPARE_DEPLOYMENT_TARGET' | 'HOLD';
  };
};