import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueProductionSupabaseContractService } from '../lib/production-supabase-contract';

const acceptanceFilters = [
  'cl_001_step1_database_foundation_ACCEPTED_',
  'cl_002_step2_prisma_schema_type_generation_ACCEPTED_',
  'cl_003_step3_supabase_client_middleware_ACCEPTED_',
  'cl_004_step4_app_route_scaffold_first_surface_ACCEPTED_',
  'cl_005_step5_domain_data_access_service_layer_ACCEPTED_',
  'cl_006_step6_authentication_account_foundation_ACCEPTED_',
  'cl_007_step7_registration_profile_onboarding_ACCEPTED_',
  'cl_008_step8_club_league_discovery_foundation_ACCEPTED_',
  'cl_009_step9_supporter_dashboard_foundation_ACCEPTED_',
  'cl_010_step10_community_action_submission_foundation_ACCEPTED_',
  'cl_011_step11_verification_queue_foundation_ACCEPTED_',
  'cl_012_step12_points_league_award_foundation_ACCEPTED_',
  'cl_013_step13_league_table_leaderboard_surface_ACCEPTED_',
  'cl_014_step14_club_supporter_profile_surface_ACCEPTED_',
  'cl_015_step15_mission_catalogue_fixture_surface_ACCEPTED_',
  'cl_016_step16_community_action_evidence_detail_surface_ACCEPTED_',
  'cl_017_step17_fraud_moderation_review_surface_ACCEPTED_',
  'cl_018_step18_awards_recognition_surface_ACCEPTED_',
  'cl_019_step19_legacy_project_impact_map_surface_ACCEPTED_',
  'cl_020_step20_notification_activity_feed_surface_ACCEPTED_',
  'cl_021_step21_platform_settings_admin_control_surface_ACCEPTED_',
  'cl_022_step22_admin_dashboard_operations_overview_surface_ACCEPTED_',
  'cl_023_step23_navigation_shell_product_route_map_ACCEPTED_',
  'cl_024_step24_visual_shell_unified_product_navigation_surface_ACCEPTED_',
  'cl_025_step25_homepage_composition_public_landing_surface_ACCEPTED_',
  'cl_026_step26_responsive_visual_polish_public_shell_maturity_pass_ACCEPTED_',
  'cl_027_step27_end_to_end_route_smoke_local_runtime_verification_ACCEPTED_',
  'cl_028_step28_product_qa_register_release_readiness_evidence_pack_ACCEPTED_',
  'cl_029_step29_release_candidate_hardening_defect_closure_ACCEPTED_',
  'cl_030_step30_release_candidate_runtime_proof_final_acceptance_pack_ACCEPTED_',
  'cl_031_step31_release_candidate_review_product_walkthrough_ACCEPTED_',
  'cl_032_step32_founder_product_review_notes_launch_decision_register_ACCEPTED_',
  'cl_033_step33_launch_checklist_deployment_readiness_register_ACCEPTED_',
  'cl_034_step34_deployment_target_preparation_production_environment_contract_ACCEPTED_',
  'cl_035_step35_deployment_target_selection_hosting_connector_decision_ACCEPTED_',
  'cl_036_step36_vercel_project_import_preparation_production_variable_template_ACCEPTED_',
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing production Supabase contract file: ${path}`);
  }

  const content = readFileSync(filePath, 'utf8');

  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`File ${path} missing marker: ${marker}`);
    }
  }
}

function findAcceptedLocks(): string[] {
  const acceptanceDir = join(process.cwd(), 'CL_ACCEPTANCE');

  if (!existsSync(acceptanceDir)) {
    throw new Error('CL_ACCEPTANCE directory is missing.');
  }

  const files = readdirSync(acceptanceDir);
  const matches: string[] = [];

  for (const filter of acceptanceFilters) {
    const match = files.find((file) => file.startsWith(filter) && file.endsWith('.md'));

    if (!match) {
      throw new Error(`Missing acceptance lock for filter: ${filter}`);
    }

    matches.push(match);
  }

  return matches;
}

function assertNoProductionSecretsInTemplate(): void {
  const templatePath = join(process.cwd(), 'CL_DEPLOYMENT_TEMPLATES', 'supabase', 'supabase.production.env.template');

  if (!existsSync(templatePath)) {
    throw new Error('Supabase production environment template is missing.');
  }

  const content = readFileSync(templatePath, 'utf8');

  const requiredMarkers = [
    'SUPABASE_PROJECT_REF=__PRODUCTION_SUPABASE_PROJECT_REF__',
    'SUPABASE_DB_PASSWORD=__PRODUCTION_SUPABASE_DATABASE_PASSWORD__',
    'DATABASE_URL=__PRODUCTION_DATABASE_URL__',
    'NEXT_PUBLIC_SUPABASE_URL=__PRODUCTION_SUPABASE_PROJECT_URL__',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=__PRODUCTION_SUPABASE_ANON_KEY__',
    'SUPABASE_SERVICE_ROLE_KEY=__PRODUCTION_SUPABASE_SERVICE_ROLE_KEY__',
  ];

  for (const marker of requiredMarkers) {
    if (!content.includes(marker)) {
      throw new Error(`Supabase production template missing required placeholder: ${marker}`);
    }
  }

  const forbiddenMarkers = [
    'sb_secret_',
    'sb_publishable_',
    'postgresql://postgres:postgres@127.0.0.1',
    '127.0.0.1:54321',
    '127.0.0.1:54322',
  ];

  for (const marker of forbiddenMarkers) {
    if (content.includes(marker)) {
      throw new Error(`Supabase production template contains forbidden local/secret marker: ${marker}`);
    }
  }
}

function writeProductionSupabaseEvidence(evidenceDir: string, locks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueProductionSupabaseContractService();
  const snapshot = service.getProductionSupabaseContractSnapshot();

  const projectContract = [
    '# Production Supabase Project Contract',
    '',
    `Generated At: ${snapshot.generatedAt}`,
    `Accepted Steps: ${snapshot.acceptedStepCount}/${snapshot.requiredStepCount}`,
    `Production Project Required: ${snapshot.decision.productionProjectRequired}`,
    `Production Secrets Embedded: ${snapshot.decision.productionSecretsEmbedded}`,
    `Contract Blocked: ${snapshot.decision.contractBlocked ? 'YES' : 'NO'}`,
    `Recommended Next Step: ${snapshot.decision.recommendedNextStep}`,
    '',
    '## Preparation Steps',
    ...snapshot.preparationSteps.map(
      (step) =>
        `- ${step.order}. ${step.title} | ${step.status} | ${step.instruction} | Evidence: ${step.evidence}`,
    ),
    '',
  ].join('\n');

  const migrationRunbook = [
    '# Production Migration Execution Runbook',
    '',
    'Do not run production migrations until the production Supabase project is selected and backed up.',
    '',
    'Migration order:',
    ...snapshot.migrations.map(
      (migration) =>
        `- ${migration.migrationFile} | ${migration.status} | ${migration.purpose} | Marker: ${migration.expectedMarker} | Runtime effect: ${migration.expectedRuntimeEffect}`,
    ),
    '',
    'Suggested operator commands after production project selection:',
    '',
    '```powershell',
    'cd C:\\Users\\HP\\community-league',
    'npx supabase login',
    'npx supabase link --project-ref <PRODUCTION_PROJECT_REF>',
    'npx supabase db push',
    '```',
    '',
    'After migration execution, run CL_DEPLOYMENT_TEMPLATES/supabase/production_foundation_validation.sql against production.',
    '',
  ].join('\n');

  const secretMapping = [
    '# Supabase Secret Mapping',
    '',
    'Production secrets must stay outside the repository.',
    '',
    '- SUPABASE_PROJECT_REF -> Supabase project reference.',
    '- SUPABASE_DB_PASSWORD -> Supabase production database password.',
    '- DATABASE_URL -> Production pooled or direct database URL required by the app.',
    '- DIRECT_URL -> Optional direct database URL if provider requires it.',
    '- NEXT_PUBLIC_SUPABASE_URL -> Production Supabase project URL.',
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY -> Browser-safe anon key.',
    '- SUPABASE_SERVICE_ROLE_KEY -> Server-side key only.',
    '- NEXT_PUBLIC_SITE_URL -> Vercel or custom public URL.',
    '',
  ].join('\n');

  const rollbackGuardrails = [
    '# Production Database Rollback Guardrails',
    '',
    '- Create a production database backup before migration execution.',
    '- Do not run migrations against production from an uncommitted source tree.',
    '- Confirm all 7 migration files match the accepted CL-001 foundation sequence.',
    '- Stop before public traffic if any validation count differs from the accepted contract.',
    '- Record production migration timestamp, project ref and validation result in release evidence.',
    '',
    `Prior Acceptance Locks: ${locks.length}`,
    '',
  ].join('\n');

  const validationSql = readFileSync(
    join(process.cwd(), 'CL_DEPLOYMENT_TEMPLATES', 'supabase', 'production_foundation_validation.sql'),
    'utf8',
  );

  writeFileSync(join(evidenceDir, 'production_supabase_project_contract.md'), projectContract, 'utf8');
  writeFileSync(join(evidenceDir, 'production_migration_execution_runbook.md'), migrationRunbook, 'utf8');
  writeFileSync(join(evidenceDir, 'production_validation_queries.sql'), validationSql, 'utf8');
  writeFileSync(join(evidenceDir, 'supabase_secret_mapping.md'), secretMapping, 'utf8');
  writeFileSync(join(evidenceDir, 'production_database_rollback_guardrails.md'), rollbackGuardrails, 'utf8');
}

async function main(): Promise<void> {
  const locks = findAcceptedLocks();

  if (locks.length !== 36) {
    throw new Error(`Expected 36 accepted prior locks, received ${locks.length}`);
  }

  assertNoProductionSecretsInTemplate();

  const service = createCommunityLeagueProductionSupabaseContractService();
  const snapshot = service.getProductionSupabaseContractSnapshot();

  if (snapshot.acceptedStepCount !== 36) {
    throw new Error(`Expected acceptedStepCount 36, received ${snapshot.acceptedStepCount}`);
  }

  if (snapshot.requiredStepCount !== 36) {
    throw new Error(`Expected requiredStepCount 36, received ${snapshot.requiredStepCount}`);
  }

  if (snapshot.preparationSteps.length < 7) {
    throw new Error(`Expected at least 7 preparation steps, received ${snapshot.preparationSteps.length}`);
  }

  if (snapshot.migrations.length !== 7) {
    throw new Error(`Expected 7 migration requirements, received ${snapshot.migrations.length}`);
  }

  if (snapshot.validationChecks.length < 7) {
    throw new Error(`Expected at least 7 validation checks, received ${snapshot.validationChecks.length}`);
  }

  if (!snapshot.decision.productionProjectRequired) {
    throw new Error('Production project required flag failed.');
  }

  if (snapshot.decision.productionSecretsEmbedded) {
    throw new Error('Production secrets must not be embedded.');
  }

  if (!snapshot.decision.migrationExecutionAllowedAfterProjectSelection) {
    throw new Error('Migration execution allowed-after-project-selection flag failed.');
  }

  if (snapshot.decision.contractBlocked) {
    throw new Error('Production Supabase contract is blocked.');
  }

  if (snapshot.decision.recommendedNextStep !== 'CREATE_PRODUCTION_SUPABASE_PROJECT_AND_APPLY_MIGRATIONS') {
    throw new Error(`Unexpected recommended next step: ${snapshot.decision.recommendedNextStep}`);
  }

  assertFileMarkers('CL_DEPLOYMENT_TEMPLATES/supabase/supabase.production.env.template', [
    'DO NOT paste real production secrets into this template file.',
    'SUPABASE_PROJECT_REF=__PRODUCTION_SUPABASE_PROJECT_REF__',
  ]);

  assertFileMarkers('CL_DEPLOYMENT_TEMPLATES/supabase/production_foundation_validation.sql', [
    "SELECT 'enum_types' AS check_name",
    "SELECT 'platform_settings' AS check_name",
  ]);

  assertFileMarkers('src/lib/production-supabase-contract/types.ts', [
    'ProductionSupabaseContractSnapshot',
    'SupabaseMigrationRequirement',
    'SupabaseProductionValidationCheck',
  ]);

  assertFileMarkers('src/lib/production-supabase-contract/production-supabase-contract-service.ts', [
    'CommunityLeagueProductionSupabaseContractService',
    'getProductionSupabaseContractSnapshot',
    'Community Premier League production Supabase project contract',
  ]);

  assertFileMarkers('src/lib/production-supabase-contract/index.ts', [
    'createCommunityLeagueProductionSupabaseContractService',
  ]);

  assertFileMarkers('src/app/api/production-supabase-contract/route.ts', [
    'community-league-production-supabase-contract',
  ]);

  assertFileMarkers('src/app/production-supabase-contract/page.tsx', [
    'Production Supabase project preparation and migration execution contract.',
  ]);

  const evidenceDir = process.env.CL_PRODUCTION_SUPABASE_CONTRACT_EVIDENCE_DIR;

  if (evidenceDir) {
    writeProductionSupabaseEvidence(evidenceDir, locks);
  }

  process.stdout.write(
    `CL-037A production Supabase project preparation / migration execution contract validation passed: locks=${locks.length}, steps=${snapshot.preparationSteps.length}, migrations=${snapshot.migrations.length}, checks=${snapshot.validationChecks.length}, secretsEmbedded=${snapshot.decision.productionSecretsEmbedded ? 1 : 0}, next=${snapshot.decision.recommendedNextStep}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-037A production Supabase project preparation / migration execution contract validation failed: ${message}\n`);
  process.exit(1);
});