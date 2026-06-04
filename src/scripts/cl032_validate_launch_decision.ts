import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueLaunchDecisionService } from '../lib/launch-decision';

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
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing launch decision file: ${path}`);
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

function writeLaunchDecisionEvidence(evidenceDir: string, locks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueLaunchDecisionService();
  const snapshot = service.getLaunchDecisionSnapshot();

  const founderReviewNotes = [
    '# Founder / Product Review Notes',
    '',
    `Generated At: ${snapshot.generatedAt}`,
    `Recommended Decision: ${snapshot.decision.recommendedDecision}`,
    `Launch Blocked: ${snapshot.decision.launchBlocked ? 'YES' : 'NO'}`,
    '',
    '## Review Notes',
    ...snapshot.founderReviewNotes.map(
      (note) =>
        `## ${note.key}\nArea: ${note.area}\nQuestion: ${note.reviewQuestion}\nAnswer: ${note.reviewAnswer}\nEvidence: ${note.evidence}\nStatus: ${note.status}\n`,
    ),
  ].join('\n');

  const launchDecisionRegister = [
    '# Launch Decision Register',
    '',
    `Accepted Steps: ${snapshot.acceptedStepCount}/${snapshot.requiredStepCount}`,
    `Acceptance Chain Ready: ${snapshot.decision.acceptanceChainReady}`,
    `Walkthrough Accepted: ${snapshot.decision.walkthroughAccepted}`,
    `Build Validated: ${snapshot.decision.buildValidated}`,
    `Launch Blocked: ${snapshot.decision.launchBlocked}`,
    `Recommended Decision: ${snapshot.decision.recommendedDecision}`,
    '',
    '## Launch Criteria',
    ...snapshot.launchCriteria.map(
      (criterion) =>
        `- ${criterion.key} | ${criterion.area} | ${criterion.status} | ${criterion.criterion} | Evidence: ${criterion.evidence}`,
    ),
    '',
  ].join('\n');

  const launchReadinessPosition = [
    '# Launch Readiness Position',
    '',
    'Position: READY_FOR_FOUNDER_REVIEW',
    `Launch Blocked: ${snapshot.decision.launchBlocked ? 'YES' : 'NO'}`,
    `Prior Acceptance Locks: ${locks.length}`,
    '',
    'Decision: The release candidate is ready for founder/product review, launch discussion and next controlled decision.',
    '',
  ].join('\n');

  writeFileSync(join(evidenceDir, 'founder_product_review_notes.md'), founderReviewNotes, 'utf8');
  writeFileSync(join(evidenceDir, 'launch_decision_register.md'), launchDecisionRegister, 'utf8');
  writeFileSync(join(evidenceDir, 'launch_readiness_position.md'), launchReadinessPosition, 'utf8');
}

async function main(): Promise<void> {
  const locks = findAcceptedLocks();

  if (locks.length !== 31) {
    throw new Error(`Expected 31 accepted prior locks, received ${locks.length}`);
  }

  const service = createCommunityLeagueLaunchDecisionService();
  const snapshot = service.getLaunchDecisionSnapshot();

  if (snapshot.acceptedStepCount !== 31) {
    throw new Error(`Expected acceptedStepCount 31, received ${snapshot.acceptedStepCount}`);
  }

  if (snapshot.requiredStepCount !== 31) {
    throw new Error(`Expected requiredStepCount 31, received ${snapshot.requiredStepCount}`);
  }

  if (snapshot.founderReviewNotes.length < 8) {
    throw new Error(`Expected at least 8 founder review notes, received ${snapshot.founderReviewNotes.length}`);
  }

  if (snapshot.launchCriteria.length < 10) {
    throw new Error(`Expected at least 10 launch criteria, received ${snapshot.launchCriteria.length}`);
  }

  if (!snapshot.decision.acceptanceChainReady) {
    throw new Error('Acceptance chain readiness failed.');
  }

  if (!snapshot.decision.walkthroughAccepted) {
    throw new Error('Walkthrough acceptance failed.');
  }

  if (!snapshot.decision.buildValidated) {
    throw new Error('Build validation readiness failed.');
  }

  if (snapshot.decision.launchBlocked) {
    throw new Error('Launch decision is blocked.');
  }

  if (snapshot.decision.recommendedDecision !== 'GO_FOR_FOUNDER_REVIEW') {
    throw new Error(`Unexpected recommended decision: ${snapshot.decision.recommendedDecision}`);
  }

  assertFileMarkers('src/lib/launch-decision/types.ts', [
    'LaunchDecisionSnapshot',
    'FounderReviewNote',
    'LaunchDecisionCriterion',
  ]);

  assertFileMarkers('src/lib/launch-decision/launch-decision-service.ts', [
    'CommunityLeagueLaunchDecisionService',
    'getLaunchDecisionSnapshot',
    'Community Premier League launch decision register converts the accepted release candidate walkthrough',
  ]);

  assertFileMarkers('src/lib/launch-decision/index.ts', [
    'createCommunityLeagueLaunchDecisionService',
  ]);

  assertFileMarkers('src/app/api/launch-decision/route.ts', [
    'community-league-launch-decision',
  ]);

  assertFileMarkers('src/app/launch-decision/page.tsx', [
    'Founder review notes and launch decision register.',
  ]);

  const evidenceDir = process.env.CL_LAUNCH_DECISION_EVIDENCE_DIR;

  if (evidenceDir) {
    writeLaunchDecisionEvidence(evidenceDir, locks);
  }

  process.stdout.write(
    `CL-032A founder/product review notes and launch decision register validation passed: locks=${locks.length}, notes=${snapshot.founderReviewNotes.length}, criteria=${snapshot.launchCriteria.length}, blocked=${snapshot.decision.launchBlocked ? 1 : 0}, decision=${snapshot.decision.recommendedDecision}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-032A founder/product review notes and launch decision register validation failed: ${message}\n`);
  process.exit(1);
});