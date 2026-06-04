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
    throw new Error(`Missing domain service file: ${path}`);
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

  const { createCommunityLeagueDomainService } = await import('../lib/domain');
  const service = createCommunityLeagueDomainService();

  const counts = await service.getFoundationCounts();

  if (counts.xpLevelThresholds !== 100) {
    throw new Error(`Expected 100 XP level thresholds, received ${counts.xpLevelThresholds}`);
  }

  if (counts.platformSettings !== 30) {
    throw new Error(`Expected 30 platform settings, received ${counts.platformSettings}`);
  }

  const snapshot = await service.getFoundationSnapshot();

  if (snapshot.readiness.databaseFoundation !== 'accepted') {
    throw new Error('Database foundation readiness must be accepted.');
  }

  if (snapshot.readiness.prismaFoundation !== 'accepted') {
    throw new Error('Prisma foundation readiness must be accepted.');
  }

  if (snapshot.readiness.supabaseClientFoundation !== 'accepted') {
    throw new Error('Supabase client foundation readiness must be accepted.');
  }

  if (snapshot.readiness.appSurfaceFoundation !== 'accepted') {
    throw new Error('App surface foundation readiness must be accepted.');
  }

  if (snapshot.readiness.domainServiceLayer !== 'active') {
    throw new Error('Domain service layer readiness must be active.');
  }

  if (snapshot.xpPreview.length < 8) {
    throw new Error(`Expected at least 8 XP preview rows, received ${snapshot.xpPreview.length}`);
  }

  if (!snapshot.settings.pointsMultiplierTable) {
    throw new Error('points_multiplier_table setting must be available through the domain service.');
  }

  assertFileMarkers('src/lib/domain/types.ts', ['CommunityLeagueCounts', 'DomainFoundationSnapshot']);
  assertFileMarkers('src/lib/domain/community-league-service.ts', [
    'CommunityLeagueDomainService',
    'getFoundationCounts',
    'getFoundationSnapshot',
  ]);
  assertFileMarkers('src/lib/domain/index.ts', ['createCommunityLeagueDomainService']);
  assertFileMarkers('src/app/api/domain-summary/route.ts', [
    'createCommunityLeagueDomainService',
    'domain-summary',
  ]);

  process.stdout.write('CL-005A domain data access/service layer validation passed\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-005A domain service validation failed: ${message}\n`);
  process.exit(1);
});