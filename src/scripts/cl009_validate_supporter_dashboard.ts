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
    throw new Error(`Missing supporter dashboard file: ${path}`);
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

  const { createCommunityLeagueSupporterDashboardService } = await import('../lib/dashboard');
  const service = createCommunityLeagueSupporterDashboardService();

  const counts = await service.getDashboardCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeLeagues < 1) {
    throw new Error(`Expected at least 1 active league, received ${counts.activeLeagues}`);
  }

  if (counts.activeClubs < 2) {
    throw new Error(`Expected at least 2 active clubs, received ${counts.activeClubs}`);
  }

  if (counts.xpLevels !== 100) {
    throw new Error(`Expected 100 XP levels, received ${counts.xpLevels}`);
  }

  const featuredClubs = await service.getFeaturedClubStandings();

  if (featuredClubs.length < 2) {
    throw new Error(`Expected at least 2 featured clubs, received ${featuredClubs.length}`);
  }

  if (!featuredClubs.every((club) => club.clubSlug && club.clubName && club.leagueName)) {
    throw new Error('Every featured club must expose clubSlug, clubName and leagueName.');
  }

  const progressBands = await service.getProgressBands();

  if (progressBands.length !== 8) {
    throw new Error(`Expected 8 progress bands, received ${progressBands.length}`);
  }

  const readiness = await service.getDashboardReadiness();

  if (!readiness.discoveryFoundationAccepted) {
    throw new Error('Discovery foundation must be accepted before dashboard.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Current season availability readiness failed.');
  }

  if (!readiness.clubLeagueDiscoveryAvailable) {
    throw new Error('Club/league discovery readiness failed.');
  }

  if (!readiness.supporterProgressAvailable) {
    throw new Error('Supporter progress readiness failed.');
  }

  if (!readiness.pointsEngineBaselineAvailable) {
    throw new Error('Points engine baseline readiness failed.');
  }

  if (!readiness.dashboardApiReady) {
    throw new Error('Dashboard API readiness failed.');
  }

  const snapshot = await service.getSupporterDashboardSnapshot();

  if (snapshot.metrics.length !== 4) {
    throw new Error(`Expected 4 dashboard proof metrics, received ${snapshot.metrics.length}`);
  }

  if (snapshot.featuredClubs.length < 2) {
    throw new Error('Dashboard snapshot must include at least 2 featured clubs.');
  }

  if (snapshot.progressBands.length !== 8) {
    throw new Error('Dashboard snapshot must include 8 progress bands.');
  }

  assertFileMarkers('src/lib/dashboard/types.ts', [
    'SupporterDashboardSnapshot',
    'SupporterDashboardMetric',
  ]);
  assertFileMarkers('src/lib/dashboard/supporter-dashboard-service.ts', [
    'CommunityLeagueSupporterDashboardService',
    'getSupporterDashboardSnapshot',
    'getFeaturedClubStandings',
  ]);
  assertFileMarkers('src/lib/dashboard/index.ts', [
    'createCommunityLeagueSupporterDashboardService',
  ]);
  assertFileMarkers('src/app/api/supporter-dashboard/route.ts', [
    'community-league-supporter-dashboard',
    'getSupporterDashboardSnapshot',
  ]);
  assertFileMarkers('src/app/dashboard/page.tsx', [
    'Your supporter command centre.',
    '/api/supporter-dashboard',
  ]);

  process.stdout.write('CL-009A supporter dashboard foundation validation passed\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-009A supporter dashboard validation failed: ${message}\n`);
  process.exit(1);
});