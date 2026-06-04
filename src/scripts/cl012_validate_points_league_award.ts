import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const validationVerifierId = '00000000-0000-4000-8000-000000012012';

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
    throw new Error(`Missing points award file: ${path}`);
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

  const { createCommunityLeaguePointsAwardService } = await import('../lib/points-award');
  const service = createCommunityLeaguePointsAwardService();

  const counts = await service.getPointsAwardCounts();

  if (counts.awardFunctions < 3) {
    throw new Error(`Expected 3 points/league functions, received ${counts.awardFunctions}`);
  }

  if (counts.awardTriggers !== 1) {
    throw new Error(`Expected 1 approved-action trigger, received ${counts.awardTriggers}`);
  }

  if (counts.approvedActions < 1) {
    throw new Error(`Expected at least 1 approved action, received ${counts.approvedActions}`);
  }

  if (counts.totalFinalPointsAwarded < 10) {
    throw new Error(`Expected final points awarded >= 10, received ${counts.totalFinalPointsAwarded}`);
  }

  if (counts.totalXpAwarded < 20) {
    throw new Error(`Expected XP awarded >= 20, received ${counts.totalXpAwarded}`);
  }

  if (counts.totalLegacyAwarded < 5) {
    throw new Error(`Expected legacy awarded >= 5, received ${counts.totalLegacyAwarded}`);
  }

  if (counts.leagueTableRows < 1) {
    throw new Error('Expected at least 1 league table row.');
  }

  if (counts.individualRankingRows < 1) {
    throw new Error('Expected at least 1 individual ranking row.');
  }

  if (counts.legacyMapPins < 1) {
    throw new Error('Expected at least 1 legacy map pin.');
  }

  if (counts.pointsAwardedNotifications < 1) {
    throw new Error('Expected at least 1 points_awarded notification.');
  }

  if (counts.pointsAuditLogs < 1) {
    throw new Error('Expected at least 1 action.points_awarded audit log.');
  }

  const awardedActions = await service.getAwardedActions();

  if (awardedActions.length < 1) {
    throw new Error('Expected at least 1 awarded action card.');
  }

  const firstAction = awardedActions[0];

  if (firstAction.finalPointsAwarded < 10 || firstAction.xpAwarded < 20 || firstAction.legacyPointsAwarded < 5) {
    throw new Error('Awarded action card does not expose expected award values.');
  }

  const leagueRows = await service.getLeagueTableRows();

  if (leagueRows.length < 1) {
    throw new Error('Expected at least 1 league table row.');
  }

  const positions = new Set(leagueRows.map((row) => row.position));

  if (positions.size !== leagueRows.length) {
    throw new Error('League table positions must be unique within the returned table snapshot.');
  }

  const readiness = await service.getPointsAwardReadiness();

  if (!readiness.verificationQueueFoundationAccepted) {
    throw new Error('Verification queue foundation must be accepted before points award.');
  }

  if (!readiness.processApprovedActionFunctionAvailable) {
    throw new Error('process_approved_action/recalculate/calculate_streak readiness failed.');
  }

  if (!readiness.approvedActionTriggerAvailable) {
    throw new Error('Approved-action trigger readiness failed.');
  }

  if (!readiness.approvedActionAvailable) {
    throw new Error('Approved action readiness failed.');
  }

  if (!readiness.leagueTableAvailable) {
    throw new Error('League table readiness failed.');
  }

  if (!readiness.individualRankingAvailable) {
    throw new Error('Individual ranking readiness failed.');
  }

  if (!readiness.notificationAwardAvailable) {
    throw new Error('Points notification readiness failed.');
  }

  if (!readiness.auditAwardAvailable) {
    throw new Error('Points audit log readiness failed.');
  }

  const validDecision = service.validateDecisionDraft({
    actionId: firstAction.id,
    approvalStatus: 'tier1_approved',
    verifiedBy: validationVerifierId,
    note: 'Approved for points award validation after evidence review.',
  });

  if (!validDecision.valid) {
    throw new Error(`Expected valid points award decision, received: ${validDecision.errors.join('; ')}`);
  }

  const invalidDecision = service.validateDecisionDraft({
    actionId: firstAction.id,
    approvalStatus: 'approved',
    verifiedBy: 'not-a-uuid',
    note: 'short',
  });

  if (invalidDecision.valid) {
    throw new Error('Invalid points award decision must fail validation.');
  }

  const snapshot = await service.getPointsAwardFoundationSnapshot();

  if (snapshot.awardedActions.length < 1 || snapshot.leagueTable.length < 1) {
    throw new Error('Points award snapshot must include awarded actions and league table rows.');
  }

  assertFileMarkers('src/lib/points-award/types.ts', [
    'PointsAwardFoundationSnapshot',
    'LeagueTableAwardRow',
  ]);
  assertFileMarkers('src/lib/points-award/schema.ts', [
    'pointsAwardDecisionSchema',
    'validatePointsAwardDecisionDraft',
  ]);
  assertFileMarkers('src/lib/points-award/points-award-service.ts', [
    'CommunityLeaguePointsAwardService',
    'getPointsAwardFoundationSnapshot',
    'getLeagueTableRows',
  ]);
  assertFileMarkers('src/lib/points-award/index.ts', [
    'createCommunityLeaguePointsAwardService',
  ]);
  assertFileMarkers('src/app/api/points-award/route.ts', [
    'community-league-points-award',
    'validateDecisionDraft',
  ]);
  assertFileMarkers('src/app/points-award/page.tsx', [
    'Award points and refresh the league table.',
    '/api/points-award',
  ]);
  assertFileMarkers('src/scripts/cl012_seed_points_award_baseline.ts', [
    'CL-012A points award baseline passed',
    'CL-012 Points Award Baseline Action',
  ]);

  process.stdout.write(`CL-012A2 points and league table award foundation validation passed using verifier=${validationVerifierId}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-012A2 points and league table award validation failed: ${message}\n`);
  process.exit(1);
});