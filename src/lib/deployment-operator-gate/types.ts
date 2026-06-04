export type OperatorGateStatus = 'ready' | 'external_action_required' | 'blocked';

export type DeploymentOperatorChecklistItem = {
  key: string;
  order: number;
  area: string;
  action: string;
  evidenceRequired: string;
  status: OperatorGateStatus;
};

export type ExternalManualAction = {
  key: string;
  owner: 'operator' | 'founder' | 'deployment-host';
  action: string;
  systemCannotPerformReason: string;
  requiredBeforePublicLaunch: boolean;
  status: OperatorGateStatus;
};

export type DeploymentOperatorGateSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  checklist: DeploymentOperatorChecklistItem[];
  manualActions: ExternalManualAction[];
  decision: {
    localReleaseCandidateAccepted: boolean;
    productionSecretsEmbedded: boolean;
    externalActionsRequired: boolean;
    localWorkBlocked: boolean;
    recommendedNextStep:
      | 'PERFORM_EXTERNAL_DEPLOYMENT_ACTIONS_AND_RETURN_LIVE_READBACK'
      | 'HOLD';
  };
};