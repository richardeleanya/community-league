export type ProductionContractStatus = 'required' | 'ready' | 'attention' | 'blocked';

export type ProductionEnvironmentRequirement = {
  key: string;
  area: string;
  requirement: string;
  localEvidence: string;
  productionInputRequired: string;
  status: ProductionContractStatus;
};

export type DeploymentTargetOption = {
  key: string;
  target: string;
  fit: string;
  prerequisites: string[];
  notes: string;
  status: ProductionContractStatus;
};

export type ProductionSecretRequirement = {
  key: string;
  variableName: string;
  purpose: string;
  source: string;
  requiredForLaunch: boolean;
  status: ProductionContractStatus;
};

export type ProductionEnvironmentContractSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  requirements: ProductionEnvironmentRequirement[];
  targetOptions: DeploymentTargetOption[];
  secrets: ProductionSecretRequirement[];
  contractDecision: {
    localReleaseCandidateAccepted: boolean;
    productionSecretsMustRemainExternal: boolean;
    targetSelectionRequired: boolean;
    contractBlocked: boolean;
    recommendedNextStep: 'SELECT_DEPLOYMENT_TARGET' | 'HOLD';
  };
};