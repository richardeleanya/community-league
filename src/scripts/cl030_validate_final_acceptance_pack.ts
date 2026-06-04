import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueFinalAcceptanceService } from '../lib/final-acceptance';

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
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing final acceptance file: ${path}`);
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

function writeFinalAcceptanceEvidenceFiles(evidenceDir: string, locks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueFinalAcceptanceService();
  const snapshot = service.getFinalAcceptanceSnapshot();

  const finalAcceptancePack = [
    '# Community League Final Acceptance Pack',
    '',
    `Generated At: ${snapshot.generatedAt}`,
    `Accepted Prior Steps: ${snapshot.acceptedStepCount}/${snapshot.requiredStepCount}`,
    `Final Acceptance Blocked: ${snapshot.readiness.finalAcceptanceBlocked ? 'YES' : 'NO'}`,
    '',
    '## Proof Items',
    ...snapshot.proofItems.map((item) => `- ${item.key} | ${item.status} | ${item.area} | ${item.proof}`),
    '',
    '## Prior Acceptance Locks',
    ...locks.map((lock) => `- ${lock}`),
    '',
  ].join('\n');

  const releaseCandidateSummary = [
    '# Release Candidate Summary',
    '',
    'The candidate has passed database foundation, application foundation, product surface creation, visual shell maturity, runtime route smoke, QA register creation, release readiness evidence, defect closure and final acceptance pack validation.',
    '',
    `Runtime Proof Routes Required: ${snapshot.runtimeProofRoutes.length}`,
    `Blocked: ${snapshot.readiness.finalAcceptanceBlocked ? 'YES' : 'NO'}`,
    '',
  ].join('\n');

  writeFileSync(join(evidenceDir, 'final_acceptance_pack.md'), finalAcceptancePack, 'utf8');
  writeFileSync(join(evidenceDir, 'release_candidate_summary.md'), releaseCandidateSummary, 'utf8');
}

async function main(): Promise<void> {
  const locks = findAcceptedLocks();

  if (locks.length !== 29) {
    throw new Error(`Expected 29 accepted prior locks, received ${locks.length}`);
  }

  const service = createCommunityLeagueFinalAcceptanceService();
  const snapshot = service.getFinalAcceptanceSnapshot();

  if (snapshot.acceptedStepCount !== 29) {
    throw new Error(`Expected acceptedStepCount 29, received ${snapshot.acceptedStepCount}`);
  }

  if (snapshot.requiredStepCount !== 29) {
    throw new Error(`Expected requiredStepCount 29, received ${snapshot.requiredStepCount}`);
  }

  if (snapshot.proofItems.length < 9) {
    throw new Error(`Expected at least 9 final proof items, received ${snapshot.proofItems.length}`);
  }

  if (snapshot.runtimeProofRoutes.length !== 9) {
    throw new Error(`Expected 9 final runtime proof routes, received ${snapshot.runtimeProofRoutes.length}`);
  }

  if (!snapshot.readiness.allPriorStepsAccepted) {
    throw new Error('All prior accepted steps readiness failed.');
  }

  if (!snapshot.readiness.releaseReadinessAccepted) {
    throw new Error('Release readiness acceptance failed.');
  }

  if (!snapshot.readiness.hardeningAccepted) {
    throw new Error('Hardening acceptance failed.');
  }

  if (!snapshot.readiness.finalRuntimeProofRequired) {
    throw new Error('Final runtime proof required flag failed.');
  }

  if (snapshot.readiness.finalAcceptanceBlocked) {
    throw new Error('Final acceptance is blocked.');
  }

  assertFileMarkers('src/lib/final-acceptance/types.ts', [
    'FinalAcceptanceSnapshot',
    'FinalAcceptanceProofItem',
    'FinalRuntimeProofRoute',
  ]);

  assertFileMarkers('src/lib/final-acceptance/final-acceptance-service.ts', [
    'CommunityLeagueFinalAcceptanceService',
    'getFinalAcceptanceSnapshot',
    'CL-027 local production route smoke passed for 22 routes, 15 pages and 7 APIs.',
  ]);

  assertFileMarkers('src/lib/final-acceptance/index.ts', [
    'createCommunityLeagueFinalAcceptanceService',
  ]);

  assertFileMarkers('src/app/api/final-acceptance/route.ts', [
    'community-league-final-acceptance',
  ]);

  assertFileMarkers('src/app/final-acceptance/page.tsx', [
    'Release candidate runtime proof and final acceptance pack.',
  ]);

  const evidenceDir = process.env.CL_FINAL_ACCEPTANCE_EVIDENCE_DIR;

  if (evidenceDir) {
    writeFinalAcceptanceEvidenceFiles(evidenceDir, locks);
  }

  process.stdout.write(
    `CL-030A final acceptance pack validation passed: locks=${locks.length}, proofItems=${snapshot.proofItems.length}, runtimeRoutes=${snapshot.runtimeProofRoutes.length}, blocked=${snapshot.readiness.finalAcceptanceBlocked ? 1 : 0}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-030A final acceptance pack validation failed: ${message}\n`);
  process.exit(1);
});