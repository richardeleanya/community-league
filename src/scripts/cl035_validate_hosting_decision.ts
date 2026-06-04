import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueHostingDecisionService } from '../lib/hosting-decision';

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
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing hosting decision file: ${path}`);
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

function writeHostingDecisionEvidence(evidenceDir: string, locks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueHostingDecisionService();
  const snapshot = service.getHostingDecisionSnapshot();

  const hostingDecision = [
    '# Hosting Connector Decision',
    '',
    `Generated At: ${snapshot.generatedAt}`,
    `Accepted Steps: ${snapshot.acceptedStepCount}/${snapshot.requiredStepCount}`,
    `Selected Target: ${snapshot.decision.selectedTarget}`,
    `Connector Mode: ${snapshot.decision.connectorMode}`,
    `Public Deployment Blocked: ${snapshot.decision.publicDeploymentBlocked ? 'YES' : 'NO'}`,
    '',
    `Decision Reason: ${snapshot.decision.reason}`,
    '',
  ].join('\n');

  const targetRegister = [
    '# Selected Deployment Target Register',
    '',
    ...snapshot.candidates.map(
      (candidate) =>
        `## ${candidate.name}\nStatus: ${candidate.decisionStatus}\nFit: ${candidate.fitReason}\nRequired Inputs: ${candidate.requiredInputs.join(', ')}\nRisks: ${candidate.risks.join(', ')}\nNext Action: ${candidate.nextAction}\n`,
    ),
  ].join('\n');

  const nextActions = [
    '# Deployment Next Action Commands',
    '',
    'Run these local commands before any host import:',
    '',
    '```powershell',
    'cd C:\\Users\\HP\\community-league',
    'npm run typecheck',
    'npm run environment:contract',
    'npm run hosting:decision',
    'npm run app:build',
    '```',
    '',
    'Manual host action after this phase:',
    '- Prepare Vercel project import from the Git repository.',
    '- Add production environment variables through Vercel project settings only.',
    '- Do not paste production secrets into source files.',
    '',
    `Prior Acceptance Locks: ${locks.length}`,
    '',
  ].join('\n');

  const guardrails = [
    '# Production Secret Safety Guardrails',
    '',
    '- Production secrets must not be committed to the repository.',
    '- Local Supabase keys from development output must not be used as production secrets.',
    '- Production DATABASE_URL must be stored in hosting provider secret management.',
    '- Supabase service role key must stay server-side only.',
    '- Auth redirect URLs must be updated after the final public deployment URL is known.',
    '',
  ].join('\n');

  writeFileSync(join(evidenceDir, 'hosting_connector_decision.md'), hostingDecision, 'utf8');
  writeFileSync(join(evidenceDir, 'selected_deployment_target_register.md'), targetRegister, 'utf8');
  writeFileSync(join(evidenceDir, 'deployment_next_action_commands.md'), nextActions, 'utf8');
  writeFileSync(join(evidenceDir, 'production_secret_safety_guardrails.md'), guardrails, 'utf8');
}

async function main(): Promise<void> {
  const locks = findAcceptedLocks();

  if (locks.length !== 34) {
    throw new Error(`Expected 34 accepted prior locks, received ${locks.length}`);
  }

  const service = createCommunityLeagueHostingDecisionService();
  const snapshot = service.getHostingDecisionSnapshot();

  if (snapshot.acceptedStepCount !== 34) {
    throw new Error(`Expected acceptedStepCount 34, received ${snapshot.acceptedStepCount}`);
  }

  if (snapshot.requiredStepCount !== 34) {
    throw new Error(`Expected requiredStepCount 34, received ${snapshot.requiredStepCount}`);
  }

  if (snapshot.candidates.length < 4) {
    throw new Error(`Expected at least 4 hosting candidates, received ${snapshot.candidates.length}`);
  }

  if (snapshot.decision.selectedTargetKey !== 'vercel') {
    throw new Error(`Expected selected target key vercel, received ${snapshot.decision.selectedTargetKey}`);
  }

  if (!snapshot.decision.productionSecretsRequired) {
    throw new Error('Production secrets required flag failed.');
  }

  if (!snapshot.readiness.localReleaseCandidateAccepted) {
    throw new Error('Local release candidate acceptance readiness failed.');
  }

  if (!snapshot.readiness.productionEnvironmentContractAccepted) {
    throw new Error('Production environment contract readiness failed.');
  }

  if (!snapshot.readiness.gitRequired) {
    throw new Error('Git required flag failed.');
  }

  if (!snapshot.readiness.deploymentTargetSelected) {
    throw new Error('Deployment target selected flag failed.');
  }

  if (snapshot.readiness.hostingDecisionBlocked) {
    throw new Error('Hosting decision is blocked.');
  }

  if (snapshot.readiness.recommendedNextStep !== 'PREPARE_VERCEL_PROJECT_IMPORT') {
    throw new Error(`Unexpected recommended next step: ${snapshot.readiness.recommendedNextStep}`);
  }

  assertFileMarkers('src/lib/hosting-decision/types.ts', [
    'HostingDecisionSnapshot',
    'HostingTargetCandidate',
    'HostingConnectorDecision',
  ]);

  assertFileMarkers('src/lib/hosting-decision/hosting-decision-service.ts', [
    'CommunityLeagueHostingDecisionService',
    'getHostingDecisionSnapshot',
    'Community Premier League hosting connector decision selects the first deployment target',
  ]);

  assertFileMarkers('src/lib/hosting-decision/index.ts', [
    'createCommunityLeagueHostingDecisionService',
  ]);

  assertFileMarkers('src/app/api/hosting-decision/route.ts', [
    'community-league-hosting-decision',
  ]);

  assertFileMarkers('src/app/hosting-decision/page.tsx', [
    'Deployment target selection and hosting connector decision.',
  ]);

  const evidenceDir = process.env.CL_HOSTING_DECISION_EVIDENCE_DIR;

  if (evidenceDir) {
    writeHostingDecisionEvidence(evidenceDir, locks);
  }

  process.stdout.write(
    `CL-035A deployment target selection / hosting connector decision validation passed: locks=${locks.length}, selected=${snapshot.decision.selectedTargetKey}, candidates=${snapshot.candidates.length}, blocked=${snapshot.readiness.hostingDecisionBlocked ? 1 : 0}, next=${snapshot.readiness.recommendedNextStep}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-035A deployment target selection / hosting connector decision validation failed: ${message}\n`);
  process.exit(1);
});