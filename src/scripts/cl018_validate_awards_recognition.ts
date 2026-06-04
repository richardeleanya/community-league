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
    throw new Error(`Missing awards recognition file: ${path}`);
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

  const { createCommunityLeagueAwardsRecognitionService } = await import('../lib/recognition');
  const service = createCommunityLeagueAwardsRecognitionService();

  const counts = await service.getRecognitionCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.awardTypes < 1) {
    throw new Error(`Expected award type enum values, received ${counts.awardTypes}`);
  }

  if (counts.rankingRows < 1) {
    throw new Error(`Expected individual ranking rows, received ${counts.rankingRows}`);
  }

  if (counts.leagueTableRows < 1) {
    throw new Error(`Expected league table rows, received ${counts.leagueTableRows}`);
  }

  if (counts.approvedActions < 1) {
    throw new Error(`Expected approved actions, received ${counts.approvedActions}`);
  }

  if (counts.supporterProfiles < 1) {
    throw new Error(`Expected supporter profiles, received ${counts.supporterProfiles}`);
  }

  if (counts.clubs < 1) {
    throw new Error(`Expected active clubs, received ${counts.clubs}`);
  }

  const awardTypes = await service.getAwardTypeOptions();

  if (!awardTypes.some((award) => award.value === 'community_golden_boot')) {
    throw new Error('community_golden_boot award type missing from award options.');
  }

  if (!awardTypes.some((award) => award.value === 'league_champions')) {
    throw new Error('league_champions award type missing from award options.');
  }

  const supporterCandidates = await service.getSupporterRecognitionCandidates();

  if (supporterCandidates.length < 1) {
    throw new Error('Expected at least 1 supporter recognition candidate.');
  }

  if (!supporterCandidates.every((candidate) => candidate.recipientType === 'supporter')) {
    throw new Error('Supporter recognition candidates must be typed as supporter.');
  }

  const clubCandidates = await service.getClubRecognitionCandidates();

  if (clubCandidates.length < 1) {
    throw new Error('Expected at least 1 club recognition candidate.');
  }

  if (!clubCandidates.every((candidate) => candidate.recipientType === 'club')) {
    throw new Error('Club recognition candidates must be typed as club.');
  }

  const actionCandidates = await service.getActionRecognitionCandidates();

  if (actionCandidates.length < 1) {
    throw new Error('Expected at least 1 action recognition candidate.');
  }

  if (!actionCandidates.every((candidate) => candidate.recipientType === 'community_action')) {
    throw new Error('Action recognition candidates must be typed as community_action.');
  }

  const candidates = await service.getRecognitionCandidates();

  if (candidates.length < 3) {
    throw new Error(`Expected at least 3 recognition candidates, received ${candidates.length}`);
  }

  if (!candidates.every((candidate) => candidate.proofReference.includes(':'))) {
    throw new Error('Every recognition candidate must expose a proof reference.');
  }

  const readiness = await service.getRecognitionReadiness();

  if (!readiness.moderationFoundationAccepted) {
    throw new Error('Moderation foundation must be accepted before awards recognition.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Current season recognition readiness failed.');
  }

  if (!readiness.awardEnumAvailable) {
    throw new Error('Award enum readiness failed.');
  }

  if (!readiness.supporterRankingAvailable) {
    throw new Error('Supporter ranking readiness failed.');
  }

  if (!readiness.clubRankingAvailable) {
    throw new Error('Club ranking readiness failed.');
  }

  if (!readiness.approvedActionAvailable) {
    throw new Error('Approved action readiness failed.');
  }

  if (!readiness.recognitionCandidateReadable) {
    throw new Error('Recognition candidate readability failed.');
  }

  if (!readiness.awardsTableReadable) {
    throw new Error('Awards table readability failed.');
  }

  const snapshot = await service.getRecognitionSnapshot();

  if (snapshot.candidates.length < 3 || snapshot.awardTypes.length < 1) {
    throw new Error('Recognition snapshot must include award types and candidates.');
  }

  assertFileMarkers('src/lib/recognition/types.ts', [
    'RecognitionSnapshot',
    'RecognitionCandidate',
    'RecognitionAwardTypeOption',
  ]);
  assertFileMarkers('src/lib/recognition/awards-recognition-service.ts', [
    'CommunityLeagueAwardsRecognitionService',
    'getRecognitionSnapshot',
    'getRecognitionCandidates',
    'getAwardTypeOptions',
  ]);
  assertFileMarkers('src/lib/recognition/index.ts', [
    'createCommunityLeagueAwardsRecognitionService',
  ]);
  assertFileMarkers('src/app/api/awards/route.ts', [
    'community-league-awards-recognition',
    'getRecognitionSnapshot',
  ]);
  assertFileMarkers('src/app/awards/page.tsx', [
    'Awards and recognition surface.',
    '/api/awards',
  ]);

  process.stdout.write(
    `CL-018A awards / recognition validation passed: award_types=${awardTypes.length}, candidates=${candidates.length}, rankings=${counts.rankingRows}, league_rows=${counts.leagueTableRows}, approved_actions=${counts.approvedActions}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-018A awards / recognition validation failed: ${message}\n`);
  process.exit(1);
});