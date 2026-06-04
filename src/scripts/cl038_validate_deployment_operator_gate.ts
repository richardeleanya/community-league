import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueDeploymentOperatorGateService } from '../lib/deployment-operator-gate';

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
  'cl_037_step37_production_supabase_project_preparation_migration_execution_contract_ACCEPTED_',
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing deployment operator gate file: ${path}`);
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

function writeOperatorGateEvidence(evidenceDir: string, locks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueDeploymentOperatorGateService();
  const snapshot = service.getDeploymentOperatorGateSnapshot();

  const externalGate = [
    '# External Operator Action Gate',
    '',
    `Generated At: ${snapshot.generatedAt}`,
    `Accepted Steps: ${snapshot.acceptedStepCount}/${snapshot.requiredStepCount}`,
    `Local Release Candidate Accepted: ${snapshot.decision.localReleaseCandidateAccepted}`,
    `Production Secrets Embedded: ${snapshot.decision.productionSecretsEmbedded}`,
    `External Actions Required: ${snapshot.decision.externalActionsRequired}`,
    `Local Work Blocked: ${snapshot.decision.localWorkBlocked}`,
    `Recommended Next Step: ${snapshot.decision.recommendedNextStep}`,
    '',
  ].join('\n');

  const deploymentChecklist = [
    '# Production Deployment Operator Checklist',
    '',
    ...snapshot.checklist.map(
      (item) =>
        `- ${item.order}. ${item.area} | ${item.status} | Action: ${item.action} | Evidence required: ${item.evidenceRequired}`,
    ),
    '',
  ].join('\n');

  const manualActionRegister = [
    '# Manual Action Register',
    '',
    ...snapshot.manualActions.map(
      (item) =>
        `- ${item.key} | Owner: ${item.owner} | Status: ${item.status} | Required before public launch: ${item.requiredBeforePublicLaunch ? 'YES' : 'NO'} | Action: ${item.action} | Reason: ${item.systemCannotPerformReason}`,
    ),
    '',
  ].join('\n');

  const goNoGoDecision = [
    '# External Action GO / NO-GO Decision',
    '',
    'Decision: GO_FOR_EXTERNAL_OPERATOR_ACTIONS',
    '',
    'Reason: Local release-candidate work through CL-037 is accepted. Remaining actions require external account access, Git/Vercel/Supabase dashboards and production secret handling.',
    '',
    'No public launch is approved until CL-039 live deployment readback and CL-040 public launch decision are complete.',
    '',
  ].join('\n');

  const postDeploymentSmokePlan = [
    '# Post-Deployment Smoke Plan',
    '',
    'After Vercel deployment, return with:',
    '',
    '- Live deployment URL.',
    '- Vercel build log outcome.',
    '- Production Supabase migration validation output.',
    '- Supabase auth URL/redirect configuration confirmation.',
    '- Evidence upload/storage configuration confirmation.',
    '',
    'CL-039 will verify live URLs and API routes from the returned deployment URL.',
    '',
    `Prior Acceptance Locks: ${locks.length}`,
    '',
  ].join('\n');

  writeFileSync(join(evidenceDir, 'external_operator_action_gate.md'), externalGate, 'utf8');
  writeFileSync(join(evidenceDir, 'production_deployment_operator_checklist.md'), deploymentChecklist, 'utf8');
  writeFileSync(join(evidenceDir, 'manual_action_register.md'), manualActionRegister, 'utf8');
  writeFileSync(join(evidenceDir, 'external_action_go_no_go_decision.md'), goNoGoDecision, 'utf8');
  writeFileSync(join(evidenceDir, 'post_deployment_smoke_plan.md'), postDeploymentSmokePlan, 'utf8');
}

async function main(): Promise<void> {
  const locks = findAcceptedLocks();

  if (locks.length !== 37) {
    throw new Error(`Expected 37 accepted prior locks, received ${locks.length}`);
  }

  const service = createCommunityLeagueDeploymentOperatorGateService();
  const snapshot = service.getDeploymentOperatorGateSnapshot();

  if (snapshot.acceptedStepCount !== 37) {
    throw new Error(`Expected acceptedStepCount 37, received ${snapshot.acceptedStepCount}`);
  }

  if (snapshot.requiredStepCount !== 37) {
    throw new Error(`Expected requiredStepCount 37, received ${snapshot.requiredStepCount}`);
  }

  if (snapshot.checklist.length < 8) {
    throw new Error(`Expected at least 8 checklist items, received ${snapshot.checklist.length}`);
  }

  if (snapshot.manualActions.length < 5) {
    throw new Error(`Expected at least 5 manual actions, received ${snapshot.manualActions.length}`);
  }

  if (!snapshot.decision.localReleaseCandidateAccepted) {
    throw new Error('Local release candidate accepted flag failed.');
  }

  if (snapshot.decision.productionSecretsEmbedded) {
    throw new Error('Production secrets must not be embedded.');
  }

  if (!snapshot.decision.externalActionsRequired) {
    throw new Error('External actions required flag failed.');
  }

  if (snapshot.decision.localWorkBlocked) {
    throw new Error('Local work is blocked.');
  }

  if (snapshot.decision.recommendedNextStep !== 'PERFORM_EXTERNAL_DEPLOYMENT_ACTIONS_AND_RETURN_LIVE_READBACK') {
    throw new Error(`Unexpected recommended next step: ${snapshot.decision.recommendedNextStep}`);
  }

  assertFileMarkers('CL_DEPLOYMENT_TEMPLATES/operator-gate/operator_external_action_commands.md', [
    'Production Deployment Operator External Action Commands',
    'git init',
    'npx supabase db push',
  ]);

  assertFileMarkers('src/lib/deployment-operator-gate/types.ts', [
    'DeploymentOperatorGateSnapshot',
    'DeploymentOperatorChecklistItem',
    'ExternalManualAction',
  ]);

  assertFileMarkers('src/lib/deployment-operator-gate/deployment-operator-gate-service.ts', [
    'CommunityLeagueDeploymentOperatorGateService',
    'getDeploymentOperatorGateSnapshot',
    'Community Premier League production deployment operator gate',
  ]);

  assertFileMarkers('src/lib/deployment-operator-gate/index.ts', [
    'createCommunityLeagueDeploymentOperatorGateService',
  ]);

  assertFileMarkers('src/app/api/deployment-operator-gate/route.ts', [
    'community-league-deployment-operator-gate',
  ]);

  assertFileMarkers('src/app/deployment-operator-gate/page.tsx', [
    'Production deployment operator checklist and external action gate.',
  ]);

  const evidenceDir = process.env.CL_DEPLOYMENT_OPERATOR_GATE_EVIDENCE_DIR;

  if (evidenceDir) {
    writeOperatorGateEvidence(evidenceDir, locks);
  }

  process.stdout.write(
    `CL-038A production deployment operator checklist / external action gate validation passed: locks=${locks.length}, checklist=${snapshot.checklist.length}, manualActions=${snapshot.manualActions.length}, localBlocked=${snapshot.decision.localWorkBlocked ? 1 : 0}, secretsEmbedded=${snapshot.decision.productionSecretsEmbedded ? 1 : 0}, next=${snapshot.decision.recommendedNextStep}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-038A production deployment operator checklist / external action gate validation failed: ${message}\n`);
  process.exit(1);
});