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
    throw new Error(`Missing leaderboard file: ${path}`);
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

  const { createCommunityLeagueLeaderboardService } = await import('../lib/leaderboard');
  const service = createCommunityLeagueLeaderboardService();

  const counts = await service.getLeaderboardCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeLeagues < 1) {
    throw new Error(`Expected at least 1 active league, received ${counts.activeLeagues}`);
  }

  if (counts.activeClubs < 2) {
    throw new Error(`Expected at least 2 active clubs, received ${counts.activeClubs}`);
  }

  if (counts.approvedActions < 1) {
    throw new Error(`Expected at least 1 approved action, received ${counts.approvedActions}`);
  }

  if (counts.leagueTableRows < 1) {
    throw new Error('Expected at least 1 league table row.');
  }

  if (counts.individualRankingRows < 1) {
    throw new Error('Expected at least 1 individual ranking row.');
  }

  if (counts.topClubPoints < 1) {
    throw new Error('Expected top club community points to be at least 1.');
  }

  if (counts.topSupporterPoints < 1) {
    throw new Error('Expected top supporter points to be at least 1.');
  }

  if (counts.pointsAwardedNotifications < 1) {
    throw new Error('Expected points_awarded notification proof.');
  }

  if (counts.pointsAuditLogs < 1) {
    throw new Error('Expected action.points_awarded audit proof.');
  }

  const leagueTable = await service.getLeagueTable();

  if (leagueTable.length < 1) {
    throw new Error('League table output must include at least 1 club.');
  }

  if (!leagueTable.some((row) => row.communityPointsFor >= 1)) {
    throw new Error('League table must expose community points movement.');
  }

  const individualLeaderboard = await service.getIndividualLeaderboard();

  if (individualLeaderboard.length < 1) {
    throw new Error('Individual leaderboard output must include at least 1 supporter.');
  }

  if (!individualLeaderboard.some((row) => row.communityPoints >= 1)) {
    throw new Error('Individual leaderboard must expose community points movement.');
  }

  const readiness = await service.getLeaderboardReadiness();

  if (!readiness.pointsAwardFoundationAccepted) {
    throw new Error('Points award foundation must be accepted before leaderboard surface.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Leaderboard current season readiness failed.');
  }

  if (!readiness.activeLeagueAvailable) {
    throw new Error('Leaderboard active league readiness failed.');
  }

  if (!readiness.leagueTableAvailable) {
    throw new Error('League table readiness failed.');
  }

  if (!readiness.individualLeaderboardAvailable) {
    throw new Error('Individual leaderboard readiness failed.');
  }

  if (!readiness.approvedActionAvailable) {
    throw new Error('Approved action readiness failed.');
  }

  if (!readiness.pointsNotificationAvailable) {
    throw new Error('Points notification readiness failed.');
  }

  if (!readiness.pointsAuditAvailable) {
    throw new Error('Points audit readiness failed.');
  }

  const snapshot = await service.getLeaderboardFoundationSnapshot();

  if (snapshot.leagueTable.length < 1 || snapshot.individualLeaderboard.length < 1) {
    throw new Error('Leaderboard snapshot must include league table and individual leaderboard rows.');
  }

  assertFileMarkers('src/lib/leaderboard/types.ts', [
    'LeaderboardFoundationSnapshot',
    'LeagueTableLeaderboardRow',
    'IndividualLeaderboardRow',
  ]);
  assertFileMarkers('src/lib/leaderboard/leaderboard-service.ts', [
    'CommunityLeagueLeaderboardService',
    'getLeaderboardFoundationSnapshot',
    'MAX(community_points_for)',
    'ORDER BY',
  ]);
  assertFileMarkers('src/lib/leaderboard/index.ts', [
    'createCommunityLeagueLeaderboardService',
  ]);
  assertFileMarkers('src/app/api/leaderboard/route.ts', [
    'community-league-leaderboard',
    'getLeaderboardFoundationSnapshot',
  ]);
  assertFileMarkers('src/app/leaderboard/page.tsx', [
    'League table and leaderboard surface.',
    '/api/leaderboard',
  ]);

  process.stdout.write(
    `CL-013A2 league table and leaderboard community points validation passed: top_club_community_points=${counts.topClubPoints}, top_supporter_points=${counts.topSupporterPoints}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-013A2 league table and leaderboard validation failed: ${message}\n`);
  process.exit(1);
});