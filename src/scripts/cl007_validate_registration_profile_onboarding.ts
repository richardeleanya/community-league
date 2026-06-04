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
    throw new Error(`Missing onboarding foundation file: ${path}`);
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

  const { createCommunityLeagueOnboardingService } = await import('../lib/onboarding');
  const service = createCommunityLeagueOnboardingService();

  const counts = await service.getOnboardingCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.activeLeagues < 1) {
    throw new Error(`Expected at least 1 active league, received ${counts.activeLeagues}`);
  }

  if (counts.activeClubs < 2) {
    throw new Error(`Expected at least 2 active clubs, received ${counts.activeClubs}`);
  }

  const readiness = await service.getOnboardingReadiness();

  if (!readiness.accountFoundationAccepted) {
    throw new Error('Account foundation must be accepted before onboarding.');
  }

  if (!readiness.usersTableReady) {
    throw new Error('Users table readiness failed.');
  }

  if (!readiness.supporterProfilesTableReady) {
    throw new Error('Supporter profiles table readiness failed.');
  }

  if (!readiness.clubsAvailableForSelection) {
    throw new Error('Clubs must be available for onboarding selection.');
  }

  if (!readiness.xpLevelsSeeded) {
    throw new Error('XP levels must be seeded before onboarding.');
  }

  if (!readiness.onboardingSettingsAvailable) {
    throw new Error('Onboarding settings must be available.');
  }

  const usernameProbe = await service.checkUsernameAvailability('Test_User_007');

  if (!usernameProbe.isFormatValid) {
    throw new Error('Username format validation failed for Test_User_007.');
  }

  if (usernameProbe.normalisedUsername !== 'test_user_007') {
    throw new Error(`Username normalisation failed: ${usernameProbe.normalisedUsername}`);
  }

  const badUsernameProbe = await service.checkUsernameAvailability('bad username with spaces');

  if (badUsernameProbe.isFormatValid) {
    throw new Error('Invalid username with spaces must fail format validation.');
  }

  const snapshot = await service.getOnboardingFoundationSnapshot();

  if (!snapshot.usernameRules.pattern.includes('a-z0-9_')) {
    throw new Error('Username rule pattern is missing expected character set.');
  }

  if (snapshot.readiness.accountFoundationAccepted !== true) {
    throw new Error('Snapshot must confirm account foundation acceptance.');
  }

  if (snapshot.availableClubs.length < 2) {
    throw new Error(`Expected at least 2 club selection options, received ${snapshot.availableClubs.length}`);
  }

  assertFileMarkers('src/lib/onboarding/types.ts', [
    'OnboardingFoundationSnapshot',
    'UsernameAvailability',
  ]);
  assertFileMarkers('src/lib/onboarding/registration-profile-service.ts', [
    'CommunityLeagueOnboardingService',
    'checkUsernameAvailability',
    'getOnboardingFoundationSnapshot',
  ]);
  assertFileMarkers('src/lib/onboarding/index.ts', [
    'createCommunityLeagueOnboardingService',
  ]);
  assertFileMarkers('src/app/api/onboarding-foundation/route.ts', [
    'community-league-onboarding-foundation',
    'usernameAvailability',
  ]);
  assertFileMarkers('src/app/onboarding/page.tsx', [
    'Registration and profile onboarding',
    '/api/onboarding-foundation',
  ]);
  assertFileMarkers('src/scripts/cl007a2_seed_onboarding_baseline.ts', [
    'CL-007A2 onboarding baseline seed repair passed',
    'community-premier-league',
  ]);

  process.stdout.write('CL-007A2 registration/profile onboarding foundation validation passed\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-007A2 registration/profile onboarding validation failed: ${message}\n`);
  process.exit(1);
});