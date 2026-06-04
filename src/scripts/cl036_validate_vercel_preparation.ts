import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueVercelPreparationService } from '../lib/vercel-preparation';

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
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing Vercel preparation file: ${path}`);
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

function assertNoRealSecretsInTemplate(): void {
  const templatePath = join(process.cwd(), 'CL_DEPLOYMENT_TEMPLATES', 'vercel', 'vercel.production.env.template');

  if (!existsSync(templatePath)) {
    throw new Error('Vercel production environment template is missing.');
  }

  const content = readFileSync(templatePath, 'utf8');

  const requiredMarkers = [
    'DATABASE_URL=__PRODUCTION_DATABASE_URL__',
    'NEXT_PUBLIC_SUPABASE_URL=__PRODUCTION_SUPABASE_PROJECT_URL__',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=__PRODUCTION_SUPABASE_ANON_KEY__',
    'SUPABASE_SERVICE_ROLE_KEY=__PRODUCTION_SUPABASE_SERVICE_ROLE_KEY__',
    'NEXT_PUBLIC_SITE_URL=__PRODUCTION_PUBLIC_SITE_URL__',
    'NODE_ENV=production',
  ];

  for (const marker of requiredMarkers) {
    if (!content.includes(marker)) {
      throw new Error(`Template missing required placeholder: ${marker}`);
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
      throw new Error(`Template contains forbidden local/secret marker: ${marker}`);
    }
  }
}

function writeVercelPreparationEvidence(evidenceDir: string, locks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueVercelPreparationService();
  const snapshot = service.getVercelPreparationSnapshot();

  const importChecklist = [
    '# Vercel Project Import Checklist',
    '',
    `Generated At: ${snapshot.generatedAt}`,
    `Accepted Steps: ${snapshot.acceptedStepCount}/${snapshot.requiredStepCount}`,
    `Selected Target: ${snapshot.selectedTarget}`,
    `Project Import Blocked: ${snapshot.decision.projectImportBlocked ? 'YES' : 'NO'}`,
    `Recommended Next Step: ${snapshot.decision.recommendedNextStep}`,
    '',
    '## Import Steps',
    ...snapshot.importSteps.map(
      (step) =>
        `- ${step.order}. ${step.title} | ${step.status} | ${step.instruction} | Evidence: ${step.evidence}`,
    ),
    '',
  ].join('\n');

  const variableTemplate = [
    '# Production Variable Template',
    '',
    'Real production values must be entered in Vercel Project Settings only.',
    '',
    ...snapshot.productionVariables.map(
      (variable) =>
        `- ${variable.key} | Required: ${variable.required ? 'YES' : 'NO'} | Environment: ${variable.environment} | Policy: ${variable.valuePolicy} | Source: ${variable.source}`,
    ),
    '',
  ].join('\n');

  const runbook = [
    '# Vercel Deployment Runbook',
    '',
    'Local preflight before Vercel import:',
    '',
    '```powershell',
    'cd C:\\Users\\HP\\community-league',
    'npm run typecheck',
    'npm run hosting:decision',
    'npm run vercel:prepare',
    'npm run app:build',
    '```',
    '',
    'Vercel manual steps:',
    '1. Commit source to the Git repository.',
    '2. Import repository into Vercel as a Next.js project.',
    '3. Confirm install command: npm install.',
    '4. Confirm build command: npm run app:build.',
    '5. Add production environment variables from CL_DEPLOYMENT_TEMPLATES/vercel/vercel.production.env.template.',
    '6. Deploy preview.',
    '7. Run post-deployment smoke before public release.',
    '',
  ].join('\n');

  const preflight = [
    '# Preflight Validation Evidence',
    '',
    `Prior Acceptance Locks: ${locks.length}`,
    `Vercel Config Written: ${snapshot.decision.vercelConfigWritten}`,
    `Variable Template Written: ${snapshot.decision.variableTemplateWritten}`,
    `Production Secrets Embedded: ${snapshot.decision.productionSecretsEmbedded}`,
    `Project Import Blocked: ${snapshot.decision.projectImportBlocked}`,
    '',
  ].join('\n');

  writeFileSync(join(evidenceDir, 'vercel_project_import_checklist.md'), importChecklist, 'utf8');
  writeFileSync(join(evidenceDir, 'production_variable_template.md'), variableTemplate, 'utf8');
  writeFileSync(join(evidenceDir, 'vercel_deployment_runbook.md'), runbook, 'utf8');
  writeFileSync(join(evidenceDir, 'preflight_validation_evidence.md'), preflight, 'utf8');
}

async function main(): Promise<void> {
  const locks = findAcceptedLocks();

  if (locks.length !== 35) {
    throw new Error(`Expected 35 accepted prior locks, received ${locks.length}`);
  }

  assertNoRealSecretsInTemplate();

  const service = createCommunityLeagueVercelPreparationService();
  const snapshot = service.getVercelPreparationSnapshot();

  if (snapshot.acceptedStepCount !== 35) {
    throw new Error(`Expected acceptedStepCount 35, received ${snapshot.acceptedStepCount}`);
  }

  if (snapshot.requiredStepCount !== 35) {
    throw new Error(`Expected requiredStepCount 35, received ${snapshot.requiredStepCount}`);
  }

  if (snapshot.selectedTarget !== 'vercel') {
    throw new Error(`Expected selected target vercel, received ${snapshot.selectedTarget}`);
  }

  if (snapshot.importSteps.length < 6) {
    throw new Error(`Expected at least 6 import steps, received ${snapshot.importSteps.length}`);
  }

  if (snapshot.productionVariables.length < 6) {
    throw new Error(`Expected at least 6 production variables, received ${snapshot.productionVariables.length}`);
  }

  if (!snapshot.decision.vercelConfigWritten) {
    throw new Error('Vercel config written flag failed.');
  }

  if (!snapshot.decision.variableTemplateWritten) {
    throw new Error('Variable template written flag failed.');
  }

  if (snapshot.decision.productionSecretsEmbedded) {
    throw new Error('Production secrets must not be embedded.');
  }

  if (snapshot.decision.projectImportBlocked) {
    throw new Error('Vercel project import preparation is blocked.');
  }

  if (snapshot.decision.recommendedNextStep !== 'CREATE_VERCEL_PROJECT_AND_ADD_ENVIRONMENT_VARIABLES') {
    throw new Error(`Unexpected recommended next step: ${snapshot.decision.recommendedNextStep}`);
  }

  assertFileMarkers('vercel.json', [
    '"framework": "nextjs"',
    '"buildCommand": "npm run app:build"',
  ]);

  assertFileMarkers('CL_DEPLOYMENT_TEMPLATES/vercel/vercel.production.env.template', [
    'DO NOT paste real production secrets into this template file.',
    'DATABASE_URL=__PRODUCTION_DATABASE_URL__',
  ]);

  assertFileMarkers('src/lib/vercel-preparation/types.ts', [
    'VercelPreparationSnapshot',
    'VercelProductionVariable',
    'VercelImportStep',
  ]);

  assertFileMarkers('src/lib/vercel-preparation/vercel-preparation-service.ts', [
    'CommunityLeagueVercelPreparationService',
    'getVercelPreparationSnapshot',
    'Community Premier League Vercel project import preparation',
  ]);

  assertFileMarkers('src/lib/vercel-preparation/index.ts', [
    'createCommunityLeagueVercelPreparationService',
  ]);

  assertFileMarkers('src/app/api/vercel-preparation/route.ts', [
    'community-league-vercel-preparation',
  ]);

  assertFileMarkers('src/app/vercel-preparation/page.tsx', [
    'Vercel project import preparation and production variable template.',
  ]);

  const evidenceDir = process.env.CL_VERCEL_PREPARATION_EVIDENCE_DIR;

  if (evidenceDir) {
    writeVercelPreparationEvidence(evidenceDir, locks);
  }

  process.stdout.write(
    `CL-036A Vercel project import preparation / production variable template validation passed: locks=${locks.length}, target=${snapshot.selectedTarget}, importSteps=${snapshot.importSteps.length}, variables=${snapshot.productionVariables.length}, secretsEmbedded=${snapshot.decision.productionSecretsEmbedded ? 1 : 0}, next=${snapshot.decision.recommendedNextStep}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-036A Vercel project import preparation / production variable template validation failed: ${message}\n`);
  process.exit(1);
});