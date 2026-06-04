import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueReleaseReadinessService } from '../lib/release-readiness';

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
];

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing release readiness file: ${path}`);
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

function writeEvidencePackFiles(evidenceDir: string, acceptedLocks: string[]): void {
  mkdirSync(evidenceDir, { recursive: true });

  const service = createCommunityLeagueReleaseReadinessService();
  const evidencePack = service.getReleaseReadinessEvidencePack();

  const manifest = [
    '# Community League Release Readiness Evidence Manifest',
    '',
    `Generated At: ${evidencePack.generatedAt}`,
    `Accepted Steps: ${evidencePack.acceptedStepCount}/${evidencePack.requiredStepCount}`,
    `Release Blocked: ${evidencePack.readiness.releaseBlocked ? 'YES' : 'NO'}`,
    '',
    '## Acceptance Locks',
    ...acceptedLocks.map((lock) => `- ${lock}`),
    '',
    '## QA Controls',
    ...evidencePack.qaRegister.map((item) => `- ${item.key} | ${item.status} | ${item.evidence}`),
    '',
  ].join('\n');

  const qaRegister = [
    '# Product QA Register',
    '',
    ...evidencePack.qaRegister.map(
      (item) =>
        `## ${item.key}\nArea: ${item.area}\nStatus: ${item.status}\nQuestion: ${item.controlQuestion}\nEvidence: ${item.evidence}\n`,
    ),
  ].join('\n');

  const routeRegister = [
    '# Route Surface Register',
    '',
    ...evidencePack.routeSurfaceRegister.map(
      (route) =>
        `- ${route.type.toUpperCase()} ${route.path} | ${route.area} | runtimeSmokeRequired=${route.runtimeSmokeRequired}`,
    ),
    '',
  ].join('\n');

  writeFileSync(join(evidenceDir, 'release_readiness_evidence_manifest.md'), manifest, 'utf8');
  writeFileSync(join(evidenceDir, 'product_qa_register.md'), qaRegister, 'utf8');
  writeFileSync(join(evidenceDir, 'route_surface_register.md'), routeRegister, 'utf8');
}

async function main(): Promise<void> {
  const acceptedLocks = findAcceptedLocks();

  if (acceptedLocks.length !== 27) {
    throw new Error(`Expected 27 accepted phase locks, received ${acceptedLocks.length}`);
  }

  const service = createCommunityLeagueReleaseReadinessService();
  const evidencePack = service.getReleaseReadinessEvidencePack();

  if (evidencePack.acceptedStepCount !== 27) {
    throw new Error(`Expected acceptedStepCount 27, received ${evidencePack.acceptedStepCount}`);
  }

  if (evidencePack.requiredStepCount !== 27) {
    throw new Error(`Expected requiredStepCount 27, received ${evidencePack.requiredStepCount}`);
  }

  if (evidencePack.qaRegister.length < 12) {
    throw new Error(`Expected at least 12 QA register items, received ${evidencePack.qaRegister.length}`);
  }

  if (evidencePack.routeSurfaceRegister.length < 20) {
    throw new Error(`Expected at least 20 route surface register items, received ${evidencePack.routeSurfaceRegister.length}`);
  }

  if (!evidencePack.readiness.databaseFoundationLocked) {
    throw new Error('Database foundation readiness is not locked.');
  }

  if (!evidencePack.readiness.applicationFoundationLocked) {
    throw new Error('Application foundation readiness is not locked.');
  }

  if (!evidencePack.readiness.productSurfacesLocked) {
    throw new Error('Product surfaces readiness is not locked.');
  }

  if (!evidencePack.readiness.visualShellLocked) {
    throw new Error('Visual shell readiness is not locked.');
  }

  if (!evidencePack.readiness.runtimeSmokeLocked) {
    throw new Error('Runtime smoke readiness is not locked.');
  }

  if (!evidencePack.readiness.qaRegisterReady) {
    throw new Error('QA register readiness failed.');
  }

  if (!evidencePack.readiness.releaseEvidenceReady) {
    throw new Error('Release evidence readiness failed.');
  }

  if (evidencePack.readiness.releaseBlocked) {
    throw new Error('Release readiness evidence pack reports a blocked state.');
  }

  assertFileMarkers('src/lib/release-readiness/types.ts', [
    'ReleaseReadinessEvidencePack',
    'ProductQaRegisterItem',
    'RouteSurfaceRegisterItem',
  ]);

  assertFileMarkers('src/lib/release-readiness/release-readiness-service.ts', [
    'CommunityLeagueReleaseReadinessService',
    'getReleaseReadinessEvidencePack',
    'CL-027 acceptance lock with 22 route smoke results.',
  ]);

  assertFileMarkers('src/lib/release-readiness/index.ts', [
    'createCommunityLeagueReleaseReadinessService',
  ]);

  assertFileMarkers('src/app/api/release-readiness/route.ts', [
    'community-league-release-readiness',
  ]);

  assertFileMarkers('src/app/release-readiness/page.tsx', [
    'Product QA register and release readiness evidence pack.',
  ]);

  const evidenceDir = process.env.CL_RELEASE_EVIDENCE_DIR;

  if (evidenceDir) {
    writeEvidencePackFiles(evidenceDir, acceptedLocks);
  }

  process.stdout.write(
    `CL-028A product QA register / release readiness evidence pack validation passed: locks=${acceptedLocks.length}, qa=${evidencePack.qaRegister.length}, routes=${evidencePack.routeSurfaceRegister.length}, blocked=${evidencePack.readiness.releaseBlocked ? 1 : 0}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-028A product QA register / release readiness evidence pack validation failed: ${message}\n`);
  process.exit(1);
});