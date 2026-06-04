import type {
  ProductionSupabaseContractSnapshot,
  SupabaseMigrationRequirement,
  SupabaseProductionValidationCheck,
  SupabaseProjectPreparationStep,
} from './types';

const preparationSteps: SupabaseProjectPreparationStep[] = [
  {
    key: 'create-project',
    order: 1,
    title: 'Create production Supabase project',
    instruction:
      'Create a dedicated production Supabase project for Community Premier League. Do not reuse local development keys.',
    evidence: 'CL-037 production Supabase contract requires a production project reference.',
    status: 'requires_input',
  },
  {
    key: 'capture-secrets',
    order: 2,
    title: 'Capture production connection values securely',
    instruction:
      'Record project URL, anon key, service role key and database URL only in the deployment host secret manager or secure operator vault.',
    evidence: 'supabase.production.env.template contains placeholders only.',
    status: 'requires_input',
  },
  {
    key: 'apply-migrations',
    order: 3,
    title: 'Apply accepted migration sequence',
    instruction:
      'Apply migrations 001 through 007 to the production Supabase database in the accepted order.',
    evidence: 'CL-001 database foundation was live-validated locally before acceptance.',
    status: 'requires_input',
  },
  {
    key: 'run-validation',
    order: 4,
    title: 'Run production validation SQL',
    instruction:
      'Run production_foundation_validation.sql and confirm counts match the accepted foundation contract.',
    evidence: 'production_foundation_validation.sql is written for the production operator.',
    status: 'requires_input',
  },
  {
    key: 'configure-auth',
    order: 5,
    title: 'Configure production auth URLs',
    instruction:
      'Set Supabase auth site URL and redirect URLs after Vercel deployment URL or custom domain is known.',
    evidence: 'CL-036 Vercel preparation records NEXT_PUBLIC_SITE_URL as production input.',
    status: 'requires_input',
  },
  {
    key: 'configure-storage',
    order: 6,
    title: 'Configure production evidence storage',
    instruction:
      'Create production storage bucket and policies for community action evidence photos before live uploads.',
    evidence: 'CL-034 production environment contract requires production evidence storage.',
    status: 'requires_input',
  },
  {
    key: 'update-vercel',
    order: 7,
    title: 'Update Vercel environment variables',
    instruction:
      'Add production Supabase values to Vercel Project Settings. Do not commit production secrets.',
    evidence: 'CL-036 Vercel production variable template is accepted.',
    status: 'requires_input',
  },
];

const migrations: SupabaseMigrationRequirement[] = [
  {
    key: '001',
    migrationFile: '001_enums.sql',
    purpose: 'Create public enum contract.',
    expectedMarker: 'verification_status_enum',
    expectedRuntimeEffect: '17 enum types available.',
    status: 'ready',
  },
  {
    key: '002',
    migrationFile: '002_tables.sql',
    purpose: 'Create foundation tables and constraints.',
    expectedMarker: 'CREATE TABLE community_actions',
    expectedRuntimeEffect: '21 public foundation tables available.',
    status: 'ready',
  },
  {
    key: '003',
    migrationFile: '003_indexes.sql',
    purpose: 'Create foundation indexes.',
    expectedMarker: 'idx_seasons_one_current',
    expectedRuntimeEffect: '94 named idx_* indexes available.',
    status: 'ready',
  },
  {
    key: '004',
    migrationFile: '004_rls.sql',
    purpose: 'Enable RLS and access policies.',
    expectedMarker: 'CREATE POLICY community_actions_insert_self',
    expectedRuntimeEffect: '21 RLS-enabled tables and 57 policies available.',
    status: 'ready',
  },
  {
    key: '005',
    migrationFile: '005_triggers.sql',
    purpose: 'Create auth sync and updated_at triggers.',
    expectedMarker: 'on_auth_user_created',
    expectedRuntimeEffect: 'Foundation triggers available.',
    status: 'ready',
  },
  {
    key: '006',
    migrationFile: '006_functions.sql',
    purpose: 'Create points, XP, league table and cache functions.',
    expectedMarker: 'process_approved_action_after_status_change',
    expectedRuntimeEffect: 'Public foundation functions available.',
    status: 'ready',
  },
  {
    key: '007',
    migrationFile: '007_seed.sql',
    purpose: 'Seed XP thresholds and platform settings.',
    expectedMarker: 'generate_series(1, 100)',
    expectedRuntimeEffect: '100 XP thresholds and 30 platform settings available.',
    status: 'ready',
  },
];

const validationChecks: SupabaseProductionValidationCheck[] = [
  { key: 'enum_types', expectedCount: 17, source: 'pg_type public enum count', status: 'ready' },
  { key: 'public_foundation_tables', expectedCount: 21, source: 'information_schema public tables', status: 'ready' },
  { key: 'named_idx_indexes', expectedCount: 94, source: 'pg_indexes idx_* count', status: 'ready' },
  { key: 'rls_enabled_tables', expectedCount: 21, source: 'pg_class relrowsecurity', status: 'ready' },
  { key: 'rls_policies', expectedCount: 57, source: 'pg_policies public policies', status: 'ready' },
  { key: 'xp_level_thresholds', expectedCount: 100, source: 'public.xp_level_thresholds', status: 'ready' },
  { key: 'platform_settings', expectedCount: 30, source: 'public.platform_settings', status: 'ready' },
];

export class CommunityLeagueProductionSupabaseContractService {
  getPreparationSteps(): SupabaseProjectPreparationStep[] {
    return preparationSteps;
  }

  getMigrations(): SupabaseMigrationRequirement[] {
    return migrations;
  }

  getValidationChecks(): SupabaseProductionValidationCheck[] {
    return validationChecks;
  }

  getProductionSupabaseContractSnapshot(): ProductionSupabaseContractSnapshot {
    const contractBlocked =
      preparationSteps.some((step) => step.status === 'blocked') ||
      migrations.some((migration) => migration.status === 'blocked') ||
      validationChecks.some((check) => check.status === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League production Supabase project contract prepares the production database, migration sequence, validation SQL, auth/storage inputs and Vercel secret handoff without embedding production secrets.',
      acceptedStepCount: 36,
      requiredStepCount: 36,
      preparationSteps,
      migrations,
      validationChecks,
      decision: {
        productionProjectRequired: true,
        productionSecretsEmbedded: false,
        migrationExecutionAllowedAfterProjectSelection: true,
        contractBlocked,
        recommendedNextStep: contractBlocked
          ? 'HOLD'
          : 'CREATE_PRODUCTION_SUPABASE_PROJECT_AND_APPLY_MIGRATIONS',
      },
    };
  }
}

export function createCommunityLeagueProductionSupabaseContractService(): CommunityLeagueProductionSupabaseContractService {
  return new CommunityLeagueProductionSupabaseContractService();
}