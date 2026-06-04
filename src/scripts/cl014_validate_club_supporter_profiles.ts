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
    throw new Error(`Missing profile surface file: ${path}`);
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

  const { createCommunityLeagueProfileSurfaceService } = await import('../lib/profiles');
  const service = createCommunityLeagueProfileSurfaceService();

  const counts = await service.getProfileSurfaceCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeClubs < 2) {
    throw new Error(`Expected at least 2 active clubs, received ${counts.activeClubs}`);
  }

  if (counts.supporterProfiles < 1) {
    throw new Error(`Expected at least 1 supporter profile, received ${counts.supporterProfiles}`);
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

  if (counts.topClubCommunityPoints < 1) {
    throw new Error('Expected club community points to be visible.');
  }

  if (counts.topSupporterCommunityPoints < 1) {
    throw new Error('Expected supporter community points to be visible.');
  }

  const clubs = await service.getClubProfiles();

  if (clubs.length < 2) {
    throw new Error(`Expected at least 2 club profile cards, received ${clubs.length}`);
  }

  if (!clubs.some((club) => club.communityPoints >= 1)) {
    throw new Error('Expected at least 1 club profile with awarded community points.');
  }

  if (!clubs.every((club) => club.name.length > 0 && club.slug.length > 0)) {
    throw new Error('Every club profile must expose name and slug.');
  }

  const supporters = await service.getSupporterProfiles();

  if (supporters.length < 1) {
    throw new Error('Expected at least 1 supporter profile card.');
  }

  if (!supporters.some((supporter) => supporter.rankingCommunityPoints >= 1)) {
    throw new Error('Expected at least 1 supporter profile with ranking community points.');
  }

  if (!supporters.every((supporter) => supporter.username.length > 0 && supporter.clubName.length > 0)) {
    throw new Error('Every supporter profile must expose username and club name.');
  }

  const readiness = await service.getProfileSurfaceReadiness();

  if (!readiness.leaderboardFoundationAccepted) {
    throw new Error('Leaderboard foundation must be accepted before profile surface.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Profile current season readiness failed.');
  }

  if (!readiness.clubProfilesAvailable) {
    throw new Error('Club profile readiness failed.');
  }

  if (!readiness.supporterProfilesAvailable) {
    throw new Error('Supporter profile readiness failed.');
  }

  if (!readiness.leaguePositionAvailable) {
    throw new Error('League position readiness failed.');
  }

  if (!readiness.supporterRankingAvailable) {
    throw new Error('Supporter ranking readiness failed.');
  }

  if (!readiness.communityPointsVisible) {
    throw new Error('Profile community points visibility failed.');
  }

  const snapshot = await service.getProfileSurfaceSnapshot();

  if (snapshot.clubs.length < 2 || snapshot.supporters.length < 1) {
    throw new Error('Profile snapshot must include club and supporter profile cards.');
  }

  assertFileMarkers('src/lib/profiles/types.ts', [
    'ProfileSurfaceSnapshot',
    'ClubProfileSummary',
    'SupporterProfileSummary',
  ]);
  assertFileMarkers('src/lib/profiles/profile-surface-service.ts', [
    'CommunityLeagueProfileSurfaceService',
    'getProfileSurfaceSnapshot',
    'getClubProfiles',
    'getSupporterProfiles',
  ]);
  assertFileMarkers('src/lib/profiles/index.ts', [
    'createCommunityLeagueProfileSurfaceService',
  ]);
  assertFileMarkers('src/app/api/profiles/route.ts', [
    'community-league-profiles',
    'getProfileSurfaceSnapshot',
  ]);
  assertFileMarkers('src/app/profiles/page.tsx', [
    'Club and supporter profile surface.',
    '/api/profiles',
  ]);

  process.stdout.write(
    `CL-014A club/supporter profile surface validation passed: clubs=${clubs.length}, supporters=${supporters.length}, top_club_points=${counts.topClubCommunityPoints}, top_supporter_points=${counts.topSupporterCommunityPoints}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-014A club/supporter profile validation failed: ${message}\n`);
  process.exit(1);
});