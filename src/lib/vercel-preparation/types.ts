export type VercelPreparationStatus = 'ready' | 'requires_input' | 'blocked';

export type VercelImportStep = {
  key: string;
  order: number;
  title: string;
  instruction: string;
  evidence: string;
  status: VercelPreparationStatus;
};

export type VercelProductionVariable = {
  key: string;
  required: boolean;
  environment: 'production' | 'preview-and-production';
  purpose: string;
  source: string;
  valuePolicy: 'placeholder-only' | 'host-secret-only';
  status: VercelPreparationStatus;
};

export type VercelPreparationSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  selectedTarget: 'vercel';
  importSteps: VercelImportStep[];
  productionVariables: VercelProductionVariable[];
  decision: {
    vercelConfigWritten: boolean;
    variableTemplateWritten: boolean;
    productionSecretsEmbedded: boolean;
    projectImportBlocked: boolean;
    recommendedNextStep: 'CREATE_VERCEL_PROJECT_AND_ADD_ENVIRONMENT_VARIABLES' | 'HOLD';
  };
};