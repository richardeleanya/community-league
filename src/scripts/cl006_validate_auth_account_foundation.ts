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
    throw new Error(`Missing account foundation file: ${path}`);
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

  const { createCommunityLeagueAccountService } = await import('../lib/auth');
  const service = createCommunityLeagueAccountService();

  const counts = await service.getAccountCounts();

  if (counts.users < 0) {
    throw new Error('User count cannot be negative.');
  }

  if (counts.supporterProfiles < 0) {
    throw new Error('Supporter profile count cannot be negative.');
  }

  const policy = await service.getPolicySnapshot();

  if (!policy.maxLoginAttempts) {
    throw new Error('max_login_attempts policy setting must be available.');
  }

  if (!policy.lockoutDurationMinutes) {
    throw new Error('lockout_duration_minutes policy setting must be available.');
  }

  if (!policy.sessionInactivityDays) {
    throw new Error('session_inactivity_days policy setting must be available.');
  }

  const readiness = await service.getReadiness();

  if (!readiness.authUserTableSynced) {
    throw new Error('Auth user table readiness failed.');
  }

  if (!readiness.supporterProfileLinkAvailable) {
    throw new Error('Supporter profile link readiness failed.');
  }

  if (!readiness.accountStatusPolicyAvailable) {
    throw new Error('Account status policy readiness failed.');
  }

  if (!readiness.adminModeratorFlagsAvailable) {
    throw new Error('Admin/moderator flag readiness failed.');
  }

  if (!readiness.authSettingsAvailable) {
    throw new Error('Authentication settings readiness failed.');
  }

  const snapshot = await service.getAccountFoundationSnapshot();

  if (snapshot.session.status !== 'anonymous' && snapshot.session.status !== 'authenticated') {
    throw new Error('Invalid account session status.');
  }

  assertFileMarkers('src/lib/auth/types.ts', [
    'AccountFoundationSnapshot',
    'AccountSessionState',
  ]);
  assertFileMarkers('src/lib/auth/account-service.ts', [
    'CommunityLeagueAccountService',
    'getAccountFoundationSnapshot',
    'createSupabaseServerClient',
  ]);
  assertFileMarkers('src/lib/auth/index.ts', ['createCommunityLeagueAccountService']);
  assertFileMarkers('src/app/api/account-foundation/route.ts', [
    'community-league-account-foundation',
    'getAccountFoundationSnapshot',
  ]);
  assertFileMarkers('src/app/account/page.tsx', [
    'Authentication and account readiness',
    '/api/account-foundation',
  ]);

  process.stdout.write('CL-006A authentication/account foundation validation passed\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-006A authentication/account foundation validation failed: ${message}\n`);
  process.exit(1);
});