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
    throw new Error(`Missing legacy impact file: ${path}`);
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

  const { createCommunityLeagueLegacyImpactMapService } = await import('../lib/impact');
  const service = createCommunityLeagueLegacyImpactMapService();

  const counts = await service.getLegacyImpactCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeClubs < 1) {
    throw new Error(`Expected active clubs, received ${counts.activeClubs}`);
  }

  if (counts.approvedActions < 1) {
    throw new Error(`Expected approved actions, received ${counts.approvedActions}`);
  }

  if (counts.actionsWithGps < 1) {
    throw new Error(`Expected GPS-backed actions, received ${counts.actionsWithGps}`);
  }

  if (counts.projectTypes < 1) {
    throw new Error(`Expected project type enum values, received ${counts.projectTypes}`);
  }

  if (counts.projectStatuses < 1) {
    throw new Error(`Expected project status enum values, received ${counts.projectStatuses}`);
  }

  if (counts.actionTypes < 1) {
    throw new Error(`Expected action type enum values, received ${counts.actionTypes}`);
  }

  const projects = await service.getLegacyProjectCards();

  if (!Array.isArray(projects)) {
    throw new Error('Legacy project cards must be returned as an array.');
  }

  const pins = await service.getImpactMapPins();

  if (pins.length < 1) {
    throw new Error('Expected at least 1 legacy impact map pin from map pins or approved GPS actions.');
  }

  if (!pins.every((pin) => pin.proofReference.includes(':'))) {
    throw new Error('Every impact pin must expose a proof reference.');
  }

  if (!pins.every((pin) => Number.isFinite(pin.latitude) && Number.isFinite(pin.longitude))) {
    throw new Error('Every impact pin must expose numeric latitude and longitude.');
  }

  if (!pins.some((pin) => pin.source === 'community_action' || pin.source === 'legacy_map_pin')) {
    throw new Error('Impact pins must expose a recognised source.');
  }

  const readiness = await service.getLegacyImpactReadiness();

  if (!readiness.awardsFoundationAccepted) {
    throw new Error('Awards foundation must be accepted before legacy impact.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Current season legacy impact readiness failed.');
  }

  if (!readiness.projectEnumsAvailable) {
    throw new Error('Project enum readiness failed.');
  }

  if (!readiness.legacyProjectTableReadable) {
    throw new Error('Legacy project table readiness failed.');
  }

  if (!readiness.legacyMapPinTableReadable) {
    throw new Error('Legacy map pin table readiness failed.');
  }

  if (!readiness.approvedActionImpactAvailable) {
    throw new Error('Approved action impact readiness failed.');
  }

  if (!readiness.gpsImpactAvailable) {
    throw new Error('GPS impact readiness failed.');
  }

  if (!readiness.impactPinReadable) {
    throw new Error('Impact pin readiness failed.');
  }

  const snapshot = await service.getLegacyImpactSnapshot();

  if (snapshot.pins.length < 1) {
    throw new Error('Legacy impact snapshot must include at least 1 impact pin.');
  }

  assertFileMarkers('src/lib/impact/types.ts', [
    'LegacyImpactSnapshot',
    'LegacyProjectCard',
    'ImpactMapPin',
  ]);
  assertFileMarkers('src/lib/impact/legacy-impact-map-service.ts', [
    'CommunityLeagueLegacyImpactMapService',
    'getLegacyImpactSnapshot',
    'getLegacyProjectCards',
    'getImpactMapPins',
  ]);
  assertFileMarkers('src/lib/impact/index.ts', [
    'createCommunityLeagueLegacyImpactMapService',
  ]);
  assertFileMarkers('src/app/api/legacy-impact/route.ts', [
    'community-league-legacy-impact-map',
    'getLegacyImpactSnapshot',
  ]);
  assertFileMarkers('src/app/impact-map/page.tsx', [
    'Legacy project and impact map surface.',
    '/api/legacy-impact',
  ]);

  process.stdout.write(
    `CL-019A legacy project / impact map validation passed: pins=${pins.length}, projects=${projects.length}, approved_actions=${counts.approvedActions}, gps_actions=${counts.actionsWithGps}, project_types=${counts.projectTypes}, project_statuses=${counts.projectStatuses}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-019A legacy project / impact map validation failed: ${message}\n`);
  process.exit(1);
});