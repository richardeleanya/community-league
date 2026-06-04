import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueProductionEnvironmentContractService } from '../lib/production-environment-contract';

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
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing production environment contract file: ${path}`);
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

function writeProductionEnvironmentEvidence(evidenceDir: string, locks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueProductionEnvironmentContractService();
  const snapshot = service.getProductionEnvironmentContractSnapshot();

  const productionContract = [
    '# Production Environment Contract',
    '',
    `Generated At: ${snapshot.generatedAt}`,
    `Accepted Steps: ${snapshot.acceptedStepCount}/${snapshot.requiredStepCount}`,
    `Contract Blocked: ${snapshot.contractDecision.contractBlocked ? 'YES' : 'NO'}`,
    `Recommended Next Step: ${snapshot.contractDecision.recommendedNextStep}`,
    '',
    '## Requirements',
    ...snapshot.requirements.map(
      (item) =>
        `- ${item.key} | ${item.area} | ${item.status} | Requirement: ${item.requirement} | Local Evidence: ${item.localEvidence} | Production Input: ${item.productionInputRequired}`,
    ),
    '',
  ].join('\n');

  const targetOptions = [
    '# Deployment Target Options',
    '',
    ...snapshot.targetOptions.map(
      (item) =>
        `## ${item.target}\nFit: ${item.fit}\nStatus: ${item.status}\nPrerequisites: ${item.prerequisites.join(', ')}\nNotes: ${item.notes}\n`,
    ),
  ].join('\n');

  const secretRegister = [
    '# Secret Requirements Register',
    '',
    'Production secrets must stay outside repository files and must be configured through the chosen deployment target secret manager.',
    '',
    ...snapshot.secrets.map(
      (secret) =>
        `- ${secret.variableName} | ${secret.status} | Required: ${secret.requiredForLaunch ? 'YES' : 'NO'} | Purpose: ${secret.purpose} | Source: ${secret.source}`,
    ),
    '',
  ].join('\n');

  const commandContract = [
    '# Pre-Deployment Command Contract',
    '',
    'Local verification commands before deployment target selection:',
    '',
    '```powershell',
    'cd C:\\Users\\HP\\community-league',
    'npm run typecheck',
    'npm run deployment:validate',
    'npm run environment:contract',
    'npm run app:build',
    '```',
    '',
    `Prior Acceptance Locks: ${locks.length}`,
    '',
  ].join('\n');

  writeFileSync(join(evidenceDir, 'production_environment_contract.md'), productionContract, 'utf8');
  writeFileSync(join(evidenceDir, 'deployment_target_options.md'), targetOptions, 'utf8');
  writeFileSync(join(evidenceDir, 'secret_requirements_register.md'), secretRegister, 'utf8');
  writeFileSync(join(evidenceDir, 'pre_deployment_command_contract.md'), commandContract, 'utf8');
}

async function main(): Promise<void> {
  const locks = findAcceptedLocks();

  if (locks.length !== 33) {
    throw new Error(`Expected 33 accepted prior locks, received ${locks.length}`);
  }

  const service = createCommunityLeagueProductionEnvironmentContractService();
  const snapshot = service.getProductionEnvironmentContractSnapshot();

  if (snapshot.acceptedStepCount !== 33) {
    throw new Error(`Expected acceptedStepCount 33, received ${snapshot.acceptedStepCount}`);
  }

  if (snapshot.requiredStepCount !== 33) {
    throw new Error(`Expected requiredStepCount 33, received ${snapshot.requiredStepCount}`);
  }

  if (snapshot.requirements.length < 8) {
    throw new Error(`Expected at least 8 production requirements, received ${snapshot.requirements.length}`);
  }

  if (snapshot.targetOptions.length < 4) {
    throw new Error(`Expected at least 4 deployment target options, received ${snapshot.targetOptions.length}`);
  }

  if (snapshot.secrets.length < 6) {
    throw new Error(`Expected at least 6 production secret requirements, received ${snapshot.secrets.length}`);
  }

  if (!snapshot.contractDecision.localReleaseCandidateAccepted) {
    throw new Error('Local release candidate accepted flag failed.');
  }

  if (!snapshot.contractDecision.productionSecretsMustRemainExternal) {
    throw new Error('Production secrets external-management flag failed.');
  }

  if (!snapshot.contractDecision.targetSelectionRequired) {
    throw new Error('Target selection required flag failed.');
  }

  if (snapshot.contractDecision.contractBlocked) {
    throw new Error('Production environment contract is blocked.');
  }

  if (snapshot.contractDecision.recommendedNextStep !== 'SELECT_DEPLOYMENT_TARGET') {
    throw new Error(`Unexpected recommended next step: ${snapshot.contractDecision.recommendedNextStep}`);
  }

  assertFileMarkers('src/lib/production-environment-contract/types.ts', [
    'ProductionEnvironmentContractSnapshot',
    'ProductionEnvironmentRequirement',
    'ProductionSecretRequirement',
  ]);

  assertFileMarkers('src/lib/production-environment-contract/production-environment-contract-service.ts', [
    'CommunityLeagueProductionEnvironmentContractService',
    'getProductionEnvironmentContractSnapshot',
    'Community Premier League production environment contract defines the deployment target',
  ]);

  assertFileMarkers('src/lib/production-environment-contract/index.ts', [
    'createCommunityLeagueProductionEnvironmentContractService',
  ]);

  assertFileMarkers('src/app/api/production-environment-contract/route.ts', [
    'community-league-production-environment-contract',
  ]);

  assertFileMarkers('src/app/production-environment-contract/page.tsx', [
    'Deployment target preparation and production environment contract.',
  ]);

  const evidenceDir = process.env.CL_PRODUCTION_ENVIRONMENT_CONTRACT_EVIDENCE_DIR;

  if (evidenceDir) {
    writeProductionEnvironmentEvidence(evidenceDir, locks);
  }

  process.stdout.write(
    `CL-034A deployment target preparation / production environment contract validation passed: locks=${locks.length}, requirements=${snapshot.requirements.length}, targets=${snapshot.targetOptions.length}, secrets=${snapshot.secrets.length}, blocked=${snapshot.contractDecision.contractBlocked ? 1 : 0}, next=${snapshot.contractDecision.recommendedNextStep}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-034A deployment target preparation / production environment contract validation failed: ${message}\n`);
  process.exit(1);
});