import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueProductWalkthroughService } from '../lib/product-walkthrough';

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
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing product walkthrough file: ${path}`);
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

function writeProductWalkthroughEvidence(evidenceDir: string, locks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueProductWalkthroughService();
  const snapshot = service.getProductWalkthroughSnapshot();

  const walkthroughPack = [
    '# Community League Product Walkthrough Pack',
    '',
    `Generated At: ${snapshot.generatedAt}`,
    `Accepted Steps: ${snapshot.acceptedStepCount}/${snapshot.requiredStepCount}`,
    `Product Review Blocked: ${snapshot.reviewDecision.productReviewBlocked ? 'YES' : 'NO'}`,
    '',
    '## Walkthrough Stages',
    ...snapshot.stages.map(
      (stage) =>
        `- ${stage.step}. ${stage.area} | ${stage.actor} | ${stage.route} | ${stage.status} | ${stage.walkthroughIntent}`,
    ),
    '',
  ].join('\n');

  const personaRegister = [
    '# Persona Journey Register',
    '',
    ...snapshot.personas.map(
      (persona) =>
        `## ${persona.persona}\nEntry Route: ${persona.entryRoute}\nGoal: ${persona.primaryGoal}\nSuccess Path: ${persona.successPath.join(' -> ')}\nProof Output: ${persona.proofOutput}\nStatus: ${persona.status}\n`,
    ),
  ].join('\n');

  const reviewDecision = [
    '# Release Candidate Review Decision',
    '',
    `Acceptance Chain Ready: ${snapshot.reviewDecision.acceptanceChainReady}`,
    `Final Pack Ready: ${snapshot.reviewDecision.finalPackReady}`,
    `Walkthrough Pack Ready: ${snapshot.reviewDecision.walkthroughPackReady}`,
    `Product Review Blocked: ${snapshot.reviewDecision.productReviewBlocked}`,
    '',
    `Prior Acceptance Locks: ${locks.length}`,
    '',
    'Decision: Product walkthrough pack is ready for review.',
    '',
  ].join('\n');

  writeFileSync(join(evidenceDir, 'product_walkthrough_pack.md'), walkthroughPack, 'utf8');
  writeFileSync(join(evidenceDir, 'persona_journey_register.md'), personaRegister, 'utf8');
  writeFileSync(join(evidenceDir, 'release_candidate_review_decision.md'), reviewDecision, 'utf8');
}

async function main(): Promise<void> {
  const locks = findAcceptedLocks();

  if (locks.length !== 30) {
    throw new Error(`Expected 30 accepted prior locks, received ${locks.length}`);
  }

  const service = createCommunityLeagueProductWalkthroughService();
  const snapshot = service.getProductWalkthroughSnapshot();

  if (snapshot.acceptedStepCount !== 30) {
    throw new Error(`Expected acceptedStepCount 30, received ${snapshot.acceptedStepCount}`);
  }

  if (snapshot.requiredStepCount !== 30) {
    throw new Error(`Expected requiredStepCount 30, received ${snapshot.requiredStepCount}`);
  }

  if (snapshot.stages.length < 10) {
    throw new Error(`Expected at least 10 walkthrough stages, received ${snapshot.stages.length}`);
  }

  if (snapshot.personas.length < 5) {
    throw new Error(`Expected at least 5 persona journeys, received ${snapshot.personas.length}`);
  }

  if (!snapshot.reviewDecision.acceptanceChainReady) {
    throw new Error('Acceptance chain readiness failed.');
  }

  if (!snapshot.reviewDecision.finalPackReady) {
    throw new Error('Final pack readiness failed.');
  }

  if (!snapshot.reviewDecision.walkthroughPackReady) {
    throw new Error('Walkthrough pack readiness failed.');
  }

  if (snapshot.reviewDecision.productReviewBlocked) {
    throw new Error('Product walkthrough review is blocked.');
  }

  assertFileMarkers('src/lib/product-walkthrough/types.ts', [
    'ProductWalkthroughSnapshot',
    'ProductWalkthroughStage',
    'PersonaJourneyItem',
  ]);

  assertFileMarkers('src/lib/product-walkthrough/product-walkthrough-service.ts', [
    'CommunityLeagueProductWalkthroughService',
    'getProductWalkthroughSnapshot',
    'Community Premier League release candidate review connects the accepted product surfaces',
  ]);

  assertFileMarkers('src/lib/product-walkthrough/index.ts', [
    'createCommunityLeagueProductWalkthroughService',
  ]);

  assertFileMarkers('src/app/api/product-walkthrough/route.ts', [
    'community-league-product-walkthrough',
  ]);

  assertFileMarkers('src/app/product-walkthrough/page.tsx', [
    'Release candidate review and product walkthrough.',
  ]);

  const evidenceDir = process.env.CL_PRODUCT_WALKTHROUGH_EVIDENCE_DIR;

  if (evidenceDir) {
    writeProductWalkthroughEvidence(evidenceDir, locks);
  }

  process.stdout.write(
    `CL-031A release candidate review / product walkthrough validation passed: locks=${locks.length}, stages=${snapshot.stages.length}, personas=${snapshot.personas.length}, blocked=${snapshot.reviewDecision.productReviewBlocked ? 1 : 0}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-031A release candidate review / product walkthrough validation failed: ${message}\n`);
  process.exit(1);
});