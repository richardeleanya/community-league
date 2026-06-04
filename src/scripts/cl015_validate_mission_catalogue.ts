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
    throw new Error(`Missing mission catalogue file: ${path}`);
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

  const { createCommunityLeagueMissionCatalogueService } = await import('../lib/missions');
  const service = createCommunityLeagueMissionCatalogueService();

  const counts = await service.getMissionCatalogueCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeLeagues < 1) {
    throw new Error(`Expected at least 1 active league, received ${counts.activeLeagues}`);
  }

  if (counts.activeClubs < 2) {
    throw new Error(`Expected at least 2 active clubs, received ${counts.activeClubs}`);
  }

  if (counts.activeFixtures < 1) {
    throw new Error(`Expected at least 1 active fixture, received ${counts.activeFixtures}`);
  }

  if (counts.activeMissionWindows < 1) {
    throw new Error(`Expected at least 1 active mission window, received ${counts.activeMissionWindows}`);
  }

  if (counts.activeMissions < 1) {
    throw new Error(`Expected at least 1 active mission, received ${counts.activeMissions}`);
  }

  if (counts.actionTypes < 14) {
    throw new Error(`Expected at least 14 action types, received ${counts.actionTypes}`);
  }

  if (counts.missionCategories < 4) {
    throw new Error(`Expected at least 4 mission categories, received ${counts.missionCategories}`);
  }

  if (counts.approvedActions < 1 || counts.submittedActions < 1) {
    throw new Error('Expected accepted submission and points-award context.');
  }

  const fixtures = await service.getFixtureMissionCards();

  if (fixtures.length < 1) {
    throw new Error('Expected at least 1 fixture mission card.');
  }

  if (!fixtures.some((fixture) => fixture.status === 'active' && fixture.activeMissionCount >= 1)) {
    throw new Error('Expected at least 1 active fixture with active missions.');
  }

  if (!fixtures.every((fixture) => fixture.homeClubName.length > 0 && fixture.awayClubName.length > 0)) {
    throw new Error('Every fixture card must expose home and away club names.');
  }

  const missions = await service.getMissionCatalogueCards();

  if (missions.length < 1) {
    throw new Error('Expected at least 1 mission catalogue card.');
  }

  if (!missions.some((mission) => mission.basePoints >= 1 && mission.baseXp >= 1)) {
    throw new Error('Expected mission points and XP values to be visible.');
  }

  if (!missions.every((mission) => mission.actionType.length > 0 && mission.actionCategory.length > 0)) {
    throw new Error('Every mission card must expose action type and action category.');
  }

  if (!missions.some((mission) => mission.homeClubName && mission.awayClubName)) {
    throw new Error('Expected at least 1 mission card connected to fixture club context.');
  }

  const readiness = await service.getMissionCatalogueReadiness();

  if (!readiness.profileFoundationAccepted) {
    throw new Error('Profile foundation must be accepted before mission catalogue surface.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Mission current season readiness failed.');
  }

  if (!readiness.activeFixtureAvailable) {
    throw new Error('Mission active fixture readiness failed.');
  }

  if (!readiness.activeMissionWindowAvailable) {
    throw new Error('Mission active window readiness failed.');
  }

  if (!readiness.activeMissionAvailable) {
    throw new Error('Mission active mission readiness failed.');
  }

  if (!readiness.actionTypeCoverageAvailable) {
    throw new Error('Mission action type coverage readiness failed.');
  }

  if (!readiness.missionCategoryCoverageAvailable) {
    throw new Error('Mission category coverage readiness failed.');
  }

  if (!readiness.pointsAwardContextAvailable) {
    throw new Error('Mission points-award context readiness failed.');
  }

  const snapshot = await service.getMissionCatalogueSnapshot();

  if (snapshot.fixtures.length < 1 || snapshot.missions.length < 1) {
    throw new Error('Mission catalogue snapshot must include fixture and mission cards.');
  }

  assertFileMarkers('src/lib/missions/types.ts', [
    'MissionCatalogueSnapshot',
    'FixtureMissionCard',
    'MissionCatalogueCard',
  ]);
  assertFileMarkers('src/lib/missions/mission-catalogue-service.ts', [
    'CommunityLeagueMissionCatalogueService',
    'getMissionCatalogueSnapshot',
    'getFixtureMissionCards',
    'getMissionCatalogueCards',
  ]);
  assertFileMarkers('src/lib/missions/index.ts', [
    'createCommunityLeagueMissionCatalogueService',
  ]);
  assertFileMarkers('src/app/api/missions/route.ts', [
    'community-league-missions',
    'getMissionCatalogueSnapshot',
  ]);
  assertFileMarkers('src/app/missions/page.tsx', [
    'Mission catalogue and fixture surface.',
    '/api/missions',
  ]);

  process.stdout.write(
    `CL-015A mission catalogue / fixture mission surface validation passed: fixtures=${fixtures.length}, missions=${missions.length}, active_windows=${counts.activeMissionWindows}, action_types=${counts.actionTypes}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-015A mission catalogue validation failed: ${message}\n`);
  process.exit(1);
});