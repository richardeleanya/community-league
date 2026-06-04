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
    throw new Error(`Missing evidence detail file: ${path}`);
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

  const { createCommunityLeagueActionEvidenceDetailService } = await import('../lib/evidence');
  const service = createCommunityLeagueActionEvidenceDetailService();

  const counts = await service.getEvidenceDetailCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.submittedActions < 1) {
    throw new Error(`Expected at least 1 submitted action, received ${counts.submittedActions}`);
  }

  if (counts.approvedActions < 1) {
    throw new Error(`Expected at least 1 approved action, received ${counts.approvedActions}`);
  }

  if (counts.actionsWithPhotos < 1) {
    throw new Error('Expected at least 1 action with photo evidence.');
  }

  if (counts.actionsWithGps < 1) {
    throw new Error('Expected at least 1 action with GPS evidence.');
  }

  if (counts.actionsWithMission < 1) {
    throw new Error('Expected at least 1 action with mission context.');
  }

  if (counts.pointsAwardedActions < 1) {
    throw new Error('Expected at least 1 action with points and XP award evidence.');
  }

  if (counts.evidenceAuditLogs < 1) {
    throw new Error('Expected at least 1 evidence audit log.');
  }

  if (counts.pointsNotifications < 1) {
    throw new Error('Expected at least 1 points notification proof.');
  }

  const actions = await service.getActionEvidenceDetails();

  if (actions.length < 1) {
    throw new Error('Expected at least 1 action evidence detail card.');
  }

  if (!actions.some((action) => action.photoCount >= 1)) {
    throw new Error('Expected at least 1 action detail card with photo evidence.');
  }

  if (!actions.some((action) => action.finalPointsAwarded >= 1 && action.xpAwarded >= 1)) {
    throw new Error('Expected at least 1 action detail card with points and XP award.');
  }

  if (!actions.every((action) => action.username.length > 0 && action.clubName.length > 0)) {
    throw new Error('Every action evidence card must expose supporter and club identity.');
  }

  if (!actions.every((action) => action.description.length >= 50)) {
    throw new Error('Every evidence detail card must expose submission description proof.');
  }

  const proofTrails = await service.getEvidenceProofTrails();

  if (proofTrails.length < 1) {
    throw new Error('Expected at least 1 evidence proof trail.');
  }

  if (!proofTrails.some((trail) => trail.hasPhotoEvidence && trail.hasGpsEvidence)) {
    throw new Error('Expected at least 1 proof trail with photo and GPS evidence.');
  }

  if (!proofTrails.some((trail) => trail.hasPointsAward && trail.notificationCount >= 1)) {
    throw new Error('Expected at least 1 proof trail with points award and notification proof.');
  }

  const readiness = await service.getEvidenceDetailReadiness();

  if (!readiness.missionCatalogueAccepted) {
    throw new Error('Mission catalogue must be accepted before evidence detail surface.');
  }

  if (!readiness.submittedActionAvailable) {
    throw new Error('Submitted action readiness failed.');
  }

  if (!readiness.approvedActionAvailable) {
    throw new Error('Approved action readiness failed.');
  }

  if (!readiness.photoEvidenceAvailable) {
    throw new Error('Photo evidence readiness failed.');
  }

  if (!readiness.gpsEvidenceAvailable) {
    throw new Error('GPS evidence readiness failed.');
  }

  if (!readiness.missionContextAvailable) {
    throw new Error('Mission context readiness failed.');
  }

  if (!readiness.pointsAwardEvidenceAvailable) {
    throw new Error('Points award evidence readiness failed.');
  }

  if (!readiness.auditTrailAvailable) {
    throw new Error('Audit trail readiness failed.');
  }

  const snapshot = await service.getEvidenceDetailSnapshot();

  if (snapshot.actions.length < 1 || snapshot.proofTrails.length < 1) {
    throw new Error('Evidence detail snapshot must include action details and proof trails.');
  }

  assertFileMarkers('src/lib/evidence/types.ts', [
    'EvidenceDetailSnapshot',
    'ActionEvidenceDetailCard',
    'EvidenceProofTrail',
  ]);
  assertFileMarkers('src/lib/evidence/action-evidence-detail-service.ts', [
    'CommunityLeagueActionEvidenceDetailService',
    'getEvidenceDetailSnapshot',
    'getActionEvidenceDetails',
    'getEvidenceProofTrails',
  ]);
  assertFileMarkers('src/lib/evidence/index.ts', [
    'createCommunityLeagueActionEvidenceDetailService',
  ]);
  assertFileMarkers('src/app/api/evidence/route.ts', [
    'community-league-action-evidence-detail',
    'getEvidenceDetailSnapshot',
  ]);
  assertFileMarkers('src/app/evidence/page.tsx', [
    'Community action evidence detail surface.',
    '/api/evidence',
  ]);

  process.stdout.write(
    `CL-016A community action evidence detail validation passed: actions=${actions.length}, proof_trails=${proofTrails.length}, photos=${counts.actionsWithPhotos}, gps=${counts.actionsWithGps}, awarded=${counts.pointsAwardedActions}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-016A community action evidence detail validation failed: ${message}\n`);
  process.exit(1);
});