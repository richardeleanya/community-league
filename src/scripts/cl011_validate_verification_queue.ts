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
    throw new Error(`Missing verification queue file: ${path}`);
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

  const { createCommunityLeagueVerificationQueueService } = await import('../lib/verification');
  const service = createCommunityLeagueVerificationQueueService();

  const counts = await service.getVerificationQueueCounts();

  if (counts.pendingActions < 1) {
    throw new Error(`Expected at least 1 pending action, received ${counts.pendingActions}`);
  }

  if (counts.totalActions < 1) {
    throw new Error(`Expected at least 1 total action, received ${counts.totalActions}`);
  }

  if (counts.moderators < 1) {
    throw new Error(`Expected at least 1 moderator/admin, received ${counts.moderators}`);
  }

  const queue = await service.getQueueItems();

  if (queue.length < 1) {
    throw new Error('Expected at least 1 verification queue item.');
  }

  const firstItem = queue[0];

  if (!firstItem.id || !firstItem.supporterId || !firstItem.username || !firstItem.clubName) {
    throw new Error('Verification queue item must expose action, supporter, username and club details.');
  }

  const readiness = await service.getVerificationQueueReadiness();

  if (!readiness.actionSubmissionFoundationAccepted) {
    throw new Error('Action submission foundation must be accepted before verification queue.');
  }

  if (!readiness.pendingQueueAvailable) {
    throw new Error('Pending queue readiness failed.');
  }

  if (!readiness.statusEnumAvailable) {
    throw new Error('Verification status enum readiness failed.');
  }

  if (!readiness.queueTablesAvailable) {
    throw new Error('Verification queue table readiness failed.');
  }

  if (!readiness.moderationAccessLayerAvailable) {
    throw new Error('Moderation access layer readiness failed.');
  }

  if (!readiness.decisionValidationReady) {
    throw new Error('Decision validation readiness failed.');
  }

  if (!readiness.auditTrailTargetAvailable) {
    throw new Error('Audit trail target readiness failed.');
  }

  const approveDraft = service.validateDecisionDraft({
    actionId: firstItem.id,
    decision: 'approve_tier_1',
    moderatorNote: 'Evidence and location are sufficient for tier one approval.',
  });

  if (!approveDraft.valid) {
    throw new Error(`Expected approval draft to be valid, received: ${approveDraft.errors.join('; ')}`);
  }

  const invalidRejectDraft = service.validateDecisionDraft({
    actionId: firstItem.id,
    decision: 'reject',
    moderatorNote: 'Evidence rejected.',
  });

  if (invalidRejectDraft.valid) {
    throw new Error('Reject decision without rejectionReason must fail validation.');
  }

  const validRejectDraft = service.validateDecisionDraft({
    actionId: firstItem.id,
    decision: 'reject',
    moderatorNote: 'Evidence was reviewed and does not meet verification requirements.',
    rejectionReason: 'Photo evidence is not sufficient to prove the submitted community action.',
  });

  if (!validRejectDraft.valid) {
    throw new Error(`Expected rejection draft with reason to be valid, received: ${validRejectDraft.errors.join('; ')}`);
  }

  const snapshot = await service.getVerificationQueueFoundationSnapshot();

  if (snapshot.queue.length < 1) {
    throw new Error('Verification queue snapshot must include at least 1 queue row.');
  }

  assertFileMarkers('src/lib/verification/types.ts', [
    'VerificationQueueFoundationSnapshot',
    'VerificationDecisionValidation',
  ]);
  assertFileMarkers('src/lib/verification/schema.ts', [
    'verificationDecisionSchema',
    'validateVerificationDecisionDraft',
  ]);
  assertFileMarkers('src/lib/verification/verification-queue-service.ts', [
    'CommunityLeagueVerificationQueueService',
    'getVerificationQueueFoundationSnapshot',
    'getQueueItems',
  ]);
  assertFileMarkers('src/lib/verification/index.ts', [
    'createCommunityLeagueVerificationQueueService',
  ]);
  assertFileMarkers('src/app/api/verification-queue/route.ts', [
    'community-league-verification-queue',
    'validateDecisionDraft',
  ]);
  assertFileMarkers('src/app/verification-queue/page.tsx', [
    'Review community actions before points are released.',
    '/api/verification-queue',
  ]);
  assertFileMarkers('src/scripts/cl011_seed_verification_queue_baseline.ts', [
    'CL-011A3 verification queue baseline seed passed',
    'Verification Queue Baseline Action',
  ]);

  process.stdout.write('CL-011A verification queue foundation validation passed\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-011A verification queue validation failed: ${message}\n`);
  process.exit(1);
});