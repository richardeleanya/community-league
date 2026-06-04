import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function loadEnvFile(fileName: string): void {
  const filePath = join(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing action submission file: ${path}`);
  }

  const content = readFileSync(filePath, 'utf8');

  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`File ${path} missing marker: ${marker}`);
    }
  }
}

async function main(): Promise<void> {
  loadEnvFile('.env');
  loadEnvFile('.env.local');

  const { createCommunityLeagueActionSubmissionService } = await import('../lib/action-submission');
  const service = createCommunityLeagueActionSubmissionService();

  const counts = await service.getSubmissionCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeClubs < 2) {
    throw new Error(`Expected at least 2 active clubs, received ${counts.activeClubs}`);
  }

  if (counts.activeMissions < 1) {
    throw new Error(`Expected at least 1 active mission, received ${counts.activeMissions}`);
  }

  if (counts.actionTypes < 14) {
    throw new Error(`Expected at least 14 action types, received ${counts.actionTypes}`);
  }

  if (counts.platformSettings !== 5) {
    throw new Error(`Expected 5 action submission platform settings, received ${counts.platformSettings}`);
  }

  if (counts.communityActionColumns < 21) {
    throw new Error(`Expected community_actions required columns, received ${counts.communityActionColumns}`);
  }

  if (counts.communityActionConstraints < 7) {
    throw new Error(`Expected community_actions required constraints, received ${counts.communityActionConstraints}`);
  }

  const limits = await service.getSubmissionLimits();

  if (limits.descriptionMinChars !== 50 || limits.descriptionMaxChars !== 500) {
    throw new Error(`Unexpected description limits: ${limits.descriptionMinChars}-${limits.descriptionMaxChars}`);
  }

  if (limits.maxPhotos !== 10 || limits.maxPhotoMb !== 2 || limits.maxDaysPast !== 7) {
    throw new Error('Unexpected photo or action-date submission limits.');
  }

  const actionTypes = await service.getActionTypeOptions();

  if (!actionTypes.some((option) => option.value === 'litter_collection')) {
    throw new Error('litter_collection action type missing from action type options.');
  }

  const missions = await service.getActiveMissionCards();

  if (missions.length < 1) {
    throw new Error('Expected at least 1 active mission card.');
  }

  const readiness = await service.getSubmissionReadiness();

  if (!readiness.dashboardFoundationAccepted) {
    throw new Error('Dashboard foundation must be accepted before action submission.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Current season submission readiness failed.');
  }

  if (!readiness.clubSelectionAvailable) {
    throw new Error('Club selection submission readiness failed.');
  }

  if (!readiness.actionTypeEnumAvailable) {
    throw new Error('Action type enum readiness failed.');
  }

  if (!readiness.missionBaselineAvailable) {
    throw new Error('Mission baseline readiness failed.');
  }

  if (!readiness.submissionSettingsAvailable) {
    throw new Error('Submission settings readiness failed.');
  }

  if (!readiness.communityActionTableReady) {
    throw new Error('Community action table readiness failed.');
  }

  const validDraft = service.validateDraft({
    actionType: 'litter_collection',
    actionCategory: 'environment',
    missionId: missions[0].id,
    description:
      'Collected litter across the local park and surrounding footpaths with clear before and after evidence for community validation.',
    photoUrls: ['https://example.com/community-action-photo.jpg'],
    gpsLatitude: 53.4808,
    gpsLongitude: -2.2426,
    gpsAccuracyMetres: 12,
    actionDate: new Date().toISOString(),
    volunteerHours: 1,
    treesCount: 0,
    foodItemsCount: 0,
  });

  if (!validDraft.valid) {
    throw new Error(`Expected valid draft, received errors: ${validDraft.errors.join('; ')}`);
  }

  const invalidDraft = service.validateDraft({
    actionType: 'litter_collection',
    actionCategory: 'environment',
    description: 'Too short',
    photoUrls: [],
    gpsLatitude: 200,
    gpsLongitude: 0,
    gpsAccuracyMetres: -1,
    actionDate: new Date().toISOString(),
  });

  if (invalidDraft.valid) {
    throw new Error('Invalid draft must fail server validation.');
  }

  const snapshot = await service.getActionSubmissionFoundationSnapshot();

  if (snapshot.activeMissions.length < 1) {
    throw new Error('Action submission snapshot must include at least 1 active mission.');
  }

  if (snapshot.actionTypes.length < 14) {
    throw new Error('Action submission snapshot must include action type options.');
  }

  assertFileMarkers('src/lib/action-submission/types.ts', [
    'ActionSubmissionFoundationSnapshot',
    'MissionSubmissionCard',
  ]);
  assertFileMarkers('src/lib/action-submission/schema.ts', [
    'zod',
    'validateActionSubmissionDraft',
  ]);
  assertFileMarkers('src/lib/action-submission/action-submission-service.ts', [
    'CommunityLeagueActionSubmissionService',
    'getActionSubmissionFoundationSnapshot',
    'getActiveMissionCards',
  ]);
  assertFileMarkers('src/lib/action-submission/index.ts', [
    'createCommunityLeagueActionSubmissionService',
  ]);
  assertFileMarkers('src/app/api/action-submission/route.ts', [
    'community-league-action-submission',
    'validateDraft',
  ]);
  assertFileMarkers('src/app/submit-action/page.tsx', [
    'Submit a verified community action.',
    '/api/action-submission',
  ]);
  assertFileMarkers('src/scripts/cl010_seed_action_submission_baseline.ts', [
    'CL-010A action submission baseline seed passed',
    'Opening Weekend Litter Mission',
  ]);

  process.stdout.write('CL-010A community action submission foundation validation passed\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-010A community action submission validation failed: ${message}\n`);
  process.exit(1);
});