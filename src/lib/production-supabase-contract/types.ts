export type ProductionSupabaseStatus = 'ready' | 'requires_input' | 'blocked';

export type SupabaseProjectPreparationStep = {
  key: string;
  order: number;
  title: string;
  instruction: string;
  evidence: string;
  status: ProductionSupabaseStatus;
};

export type SupabaseMigrationRequirement = {
  key: string;
  migrationFile: string;
  purpose: string;
  expectedMarker: string;
  expectedRuntimeEffect: string;
  status: ProductionSupabaseStatus;
};

export type SupabaseProductionValidationCheck = {
  key: string;
  expectedCount: number;
  source: string;
  status: ProductionSupabaseStatus;
};

export type ProductionSupabaseContractSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  preparationSteps: SupabaseProjectPreparationStep[];
  migrations: SupabaseMigrationRequirement[];
  validationChecks: SupabaseProductionValidationCheck[];
  decision: {
    productionProjectRequired: boolean;
    productionSecretsEmbedded: boolean;
    migrationExecutionAllowedAfterProjectSelection: boolean;
    contractBlocked: boolean;
    recommendedNextStep:
      | 'CREATE_PRODUCTION_SUPABASE_PROJECT_AND_APPLY_MIGRATIONS'
      | 'HOLD';
  };
};