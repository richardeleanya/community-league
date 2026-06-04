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
    throw new Error(`Missing discovery foundation file: ${path}`);
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

  const { createCommunityLeagueDiscoveryService } = await import('../lib/discovery');
  const service = createCommunityLeagueDiscoveryService();

  const counts = await service.getDiscoveryCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeLeagues < 1) {
    throw new Error(`Expected at least 1 active league, received ${counts.activeLeagues}`);
  }

  if (counts.activeClubs < 2) {
    throw new Error(`Expected at least 2 active clubs, received ${counts.activeClubs}`);
  }

  const currentSeason = await service.getCurrentSeason();

  if (!currentSeason) {
    throw new Error('Current season discovery returned null.');
  }

  if (!currentSeason.isCurrent) {
    throw new Error('Current season discovery did not return an active current season.');
  }

  const leagues = await service.getActiveLeagues();

  if (leagues.length < 1) {
    throw new Error('Expected at least 1 active league discovery row.');
  }

  if (leagues[0].activeClubCount < 2) {
    throw new Error(`Expected active league to expose at least 2 clubs, received ${leagues[0].activeClubCount}`);
  }

  const clubs = await service.getFeaturedClubs();

  if (clubs.length < 2) {
    throw new Error(`Expected at least 2 featured clubs, received ${clubs.length}`);
  }

  if (!clubs.every((club) => club.slug && club.name && club.leagueSlug && club.leagueName)) {
    throw new Error('Every featured club must expose slug, name, leagueSlug and leagueName.');
  }

  const readiness = await service.getDiscoveryReadiness();

  if (!readiness.onboardingFoundationAccepted) {
    throw new Error('Onboarding foundation must be accepted before discovery.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Current season availability readiness failed.');
  }

  if (!readiness.leagueDiscoveryAvailable) {
    throw new Error('League discovery readiness failed.');
  }

  if (!readiness.clubDiscoveryAvailable) {
    throw new Error('Club discovery readiness failed.');
  }

  if (!readiness.clubSelectionDataComplete) {
    throw new Error('Club selection data completeness readiness failed.');
  }

  const snapshot = await service.getDiscoveryFoundationSnapshot();

  if (!snapshot.currentSeason) {
    throw new Error('Discovery snapshot must include current season.');
  }

  if (snapshot.featuredClubs.length < 2) {
    throw new Error('Discovery snapshot must include at least 2 featured clubs.');
  }

  assertFileMarkers('src/lib/discovery/types.ts', [
    'DiscoveryFoundationSnapshot',
    'ClubDiscoveryCard',
  ]);
  assertFileMarkers('src/lib/discovery/club-league-discovery-service.ts', [
    'CommunityLeagueDiscoveryService',
    'getDiscoveryFoundationSnapshot',
    'getFeaturedClubs',
  ]);
  assertFileMarkers('src/lib/discovery/index.ts', [
    'createCommunityLeagueDiscoveryService',
  ]);
  assertFileMarkers('src/app/api/discovery-foundation/route.ts', [
    'community-league-discovery-foundation',
    'getDiscoveryFoundationSnapshot',
  ]);
  assertFileMarkers('src/app/clubs/page.tsx', [
    'Find your club. Enter the league.',
    '/api/discovery-foundation',
  ]);

  process.stdout.write('CL-008A club/league discovery foundation validation passed\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-008A club/league discovery validation failed: ${message}\n`);
  process.exit(1);
});