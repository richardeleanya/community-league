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
    throw new Error(`Missing moderation file: ${path}`);
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

  const { createCommunityLeagueFraudModerationService } = await import('../lib/moderation');
  const service = createCommunityLeagueFraudModerationService();

  const counts = await service.getModerationReviewCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.submittedActions < 1) {
    throw new Error(`Expected at least 1 submitted action, received ${counts.submittedActions}`);
  }

  if (counts.approvedActions < 1) {
    throw new Error(`Expected at least 1 approved action, received ${counts.approvedActions}`);
  }

  if (counts.reportTypes < 1) {
    throw new Error(`Expected report type enums, received ${counts.reportTypes}`);
  }

  if (counts.reportStatuses < 1) {
    throw new Error(`Expected report status enums, received ${counts.reportStatuses}`);
  }

  const reviewItems = await service.getModerationReviewItems();

  if (reviewItems.length < 1) {
    throw new Error('Expected at least 1 moderation review item.');
  }

  if (!reviewItems.every((item) => item.username.length > 0 && item.clubName.length > 0)) {
    throw new Error('Every moderation item must expose supporter and club identity.');
  }

  if (!reviewItems.every((item) => item.description.length >= 50)) {
    throw new Error('Every moderation item must expose action description evidence.');
  }

  if (!reviewItems.some((item) => item.photoCount >= 1)) {
    throw new Error('Expected at least 1 moderation item with photo evidence.');
  }

  if (!reviewItems.some((item) => item.gpsAccuracyMetres >= 0)) {
    throw new Error('Expected moderation items to expose GPS accuracy.');
  }

  const riskSignals = await service.getModerationRiskSignals();

  if (riskSignals.length < 1) {
    throw new Error('Expected at least 1 moderation risk signal.');
  }

  if (!riskSignals.every((signal) => ['low', 'review', 'high'].includes(signal.riskBand))) {
    throw new Error('Every moderation risk signal must expose a valid risk band.');
  }

  if (!riskSignals.some((signal) => signal.photoEvidencePresent && signal.gpsEvidencePresent)) {
    throw new Error('Expected at least 1 risk signal with photo and GPS evidence.');
  }

  const readiness = await service.getModerationReviewReadiness();

  if (!readiness.evidenceDetailAccepted) {
    throw new Error('Evidence detail must be accepted before moderation review.');
  }

  if (!readiness.submittedActionsAvailable) {
    throw new Error('Submitted action moderation readiness failed.');
  }

  if (!readiness.fraudScoringColumnsAvailable) {
    throw new Error('Fraud scoring column readiness failed.');
  }

  if (!readiness.moderationEnumsAvailable) {
    throw new Error('Moderation enum readiness failed.');
  }

  if (!readiness.moderationQueueReadable) {
    throw new Error('Moderation queue readiness failed.');
  }

  if (!readiness.riskSignalReadable) {
    throw new Error('Risk signal readiness failed.');
  }

  if (!readiness.reportTableAvailable) {
    throw new Error('Fraud report table readiness failed.');
  }

  if (!readiness.penaltyTableAvailable) {
    throw new Error('Penalty table readiness failed.');
  }

  const snapshot = await service.getModerationReviewSnapshot();

  if (snapshot.reviewItems.length < 1 || snapshot.riskSignals.length < 1) {
    throw new Error('Moderation snapshot must include review items and risk signals.');
  }

  assertFileMarkers('src/lib/moderation/types.ts', [
    'ModerationReviewSnapshot',
    'ModerationReviewItem',
    'ModerationRiskSignal',
  ]);
  assertFileMarkers('src/lib/moderation/fraud-moderation-service.ts', [
    'CommunityLeagueFraudModerationService',
    'getModerationReviewSnapshot',
    'getModerationReviewItems',
    'getModerationRiskSignals',
  ]);
  assertFileMarkers('src/lib/moderation/index.ts', [
    'createCommunityLeagueFraudModerationService',
  ]);
  assertFileMarkers('src/app/api/moderation/route.ts', [
    'community-league-fraud-moderation',
    'getModerationReviewSnapshot',
  ]);
  assertFileMarkers('src/app/moderation/page.tsx', [
    'Fraud and moderation review surface.',
    '/api/moderation',
  ]);

  process.stdout.write(
    `CL-017A fraud / moderation review validation passed: review_items=${reviewItems.length}, risk_signals=${riskSignals.length}, report_types=${counts.reportTypes}, report_statuses=${counts.reportStatuses}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-017A fraud / moderation review validation failed: ${message}\n`);
  process.exit(1);
});