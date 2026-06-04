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
    throw new Error(`Missing operations overview file: ${path}`);
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

  const { createCommunityLeagueOperationsOverviewService } = await import('../lib/operations');
  const service = createCommunityLeagueOperationsOverviewService();

  const counts = await service.getOperationsOverviewCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeClubs < 1) {
    throw new Error(`Expected active clubs, received ${counts.activeClubs}`);
  }

  if (counts.activeMissions < 1) {
    throw new Error(`Expected active missions, received ${counts.activeMissions}`);
  }

  if (counts.fixturesActive < 1) {
    throw new Error(`Expected active fixture, received ${counts.fixturesActive}`);
  }

  if (counts.submittedActions < 1) {
    throw new Error(`Expected submitted actions, received ${counts.submittedActions}`);
  }

  if (counts.approvedActions < 1) {
    throw new Error(`Expected approved actions, received ${counts.approvedActions}`);
  }

  if (counts.notifications < 1) {
    throw new Error(`Expected notifications, received ${counts.notifications}`);
  }

  if (counts.auditLogs < 1) {
    throw new Error(`Expected audit logs, received ${counts.auditLogs}`);
  }

  if (counts.platformSettings < 30) {
    throw new Error(`Expected platform settings, received ${counts.platformSettings}`);
  }

  if (counts.leagueRows < 1) {
    throw new Error(`Expected league table rows, received ${counts.leagueRows}`);
  }

  if (counts.rankingRows < 1) {
    throw new Error(`Expected individual ranking rows, received ${counts.rankingRows}`);
  }

  if (counts.evidenceReadyActions < 1) {
    throw new Error(`Expected evidence-ready actions, received ${counts.evidenceReadyActions}`);
  }

  const metrics = service.buildMetricCards(counts);

  if (metrics.length < 8) {
    throw new Error(`Expected at least 8 operation metrics, received ${metrics.length}`);
  }

  if (!metrics.every((metric) => metric.proofReference.includes(':'))) {
    throw new Error('Every operations metric must expose a proof reference.');
  }

  if (!metrics.some((metric) => metric.key === 'platform-settings' && metric.state === 'ready')) {
    throw new Error('Platform settings metric must be ready.');
  }

  const workstreams = service.buildWorkstreams(counts);

  if (workstreams.length < 7) {
    throw new Error(`Expected at least 7 operations workstreams, received ${workstreams.length}`);
  }

  if (!workstreams.every((stream) => stream.proofReference.includes(':'))) {
    throw new Error('Every operations workstream must expose a proof reference.');
  }

  if (!workstreams.some((stream) => stream.key === 'admin' && stream.status === 'ready')) {
    throw new Error('Admin workstream must be ready.');
  }

  const readiness = await service.getOperationsOverviewReadiness();

  if (!readiness.adminControlFoundationAccepted) {
    throw new Error('Admin control foundation must be accepted before operations overview.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Current season operations readiness failed.');
  }

  if (!readiness.clubFoundationAvailable) {
    throw new Error('Club foundation operations readiness failed.');
  }

  if (!readiness.missionFoundationAvailable) {
    throw new Error('Mission foundation operations readiness failed.');
  }

  if (!readiness.actionPipelineAvailable) {
    throw new Error('Action pipeline operations readiness failed.');
  }

  if (!readiness.verificationPipelineAvailable) {
    throw new Error('Verification pipeline operations readiness failed.');
  }

  if (!readiness.moderationPipelineReadable) {
    throw new Error('Moderation pipeline readability failed.');
  }

  if (!readiness.activityPipelineReadable) {
    throw new Error('Activity pipeline readability failed.');
  }

  if (!readiness.adminSettingsReadable) {
    throw new Error('Admin settings readability failed.');
  }

  if (!readiness.leaderboardReadable) {
    throw new Error('Leaderboard readability failed.');
  }

  if (!readiness.evidenceReadable) {
    throw new Error('Evidence readability failed.');
  }

  const snapshot = await service.getOperationsOverviewSnapshot();

  if (snapshot.metrics.length < 8 || snapshot.workstreams.length < 7) {
    throw new Error('Operations overview snapshot must include metrics and workstreams.');
  }

  assertFileMarkers('src/lib/operations/types.ts', [
    'OperationsOverviewSnapshot',
    'OperationsMetricCard',
    'OperationsWorkstream',
  ]);
  assertFileMarkers('src/lib/operations/operations-overview-service.ts', [
    'CommunityLeagueOperationsOverviewService',
    'getOperationsOverviewSnapshot',
    'buildMetricCards',
    'buildWorkstreams',
  ]);
  assertFileMarkers('src/lib/operations/index.ts', [
    'createCommunityLeagueOperationsOverviewService',
  ]);
  assertFileMarkers('src/app/api/operations-overview/route.ts', [
    'community-league-operations-overview',
    'getOperationsOverviewSnapshot',
  ]);
  assertFileMarkers('src/app/operations/page.tsx', [
    'Admin dashboard and operations overview surface.',
    '/api/operations-overview',
  ]);

  process.stdout.write(
    `CL-022A admin dashboard / operations overview validation passed: metrics=${metrics.length}, workstreams=${workstreams.length}, clubs=${counts.activeClubs}, missions=${counts.activeMissions}, actions=${counts.submittedActions}, approved=${counts.approvedActions}, settings=${counts.platformSettings}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-022A admin dashboard / operations overview validation failed: ${message}\n`);
  process.exit(1);
});