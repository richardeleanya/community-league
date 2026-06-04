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
    throw new Error(`Missing admin control file: ${path}`);
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

  const { createCommunityLeagueAdminControlService } = await import('../lib/admin-control');
  const service = createCommunityLeagueAdminControlService();

  const counts = await service.getAdminControlCounts();

  if (counts.platformSettings < 30) {
    throw new Error(`Expected at least 30 platform settings, received ${counts.platformSettings}`);
  }

  if (counts.publicSettings < 2) {
    throw new Error(`Expected public settings whitelist and multiplier settings, received ${counts.publicSettings}`);
  }

  if (counts.fraudSettings < 10) {
    throw new Error(`Expected fraud settings, received ${counts.fraudSettings}`);
  }

  if (counts.verificationSettings < 5) {
    throw new Error(`Expected verification settings, received ${counts.verificationSettings}`);
  }

  if (counts.actionSettings < 5) {
    throw new Error(`Expected action settings, received ${counts.actionSettings}`);
  }

  if (counts.authSettings < 3) {
    throw new Error(`Expected auth/session settings, received ${counts.authSettings}`);
  }

  if (counts.pointsSettings < 3) {
    throw new Error(`Expected points settings, received ${counts.pointsSettings}`);
  }

  if (counts.auditLogs < 1) {
    throw new Error(`Expected audit logs, received ${counts.auditLogs}`);
  }

  const settings = await service.getPlatformSettingCards();

  if (settings.length < 30) {
    throw new Error(`Expected at least 30 setting cards, received ${settings.length}`);
  }

  if (!settings.some((setting) => setting.key === 'points_multiplier_table')) {
    throw new Error('points_multiplier_table missing from admin control setting cards.');
  }

  if (!settings.some((setting) => setting.key === 'public_settings_whitelist')) {
    throw new Error('public_settings_whitelist missing from admin control setting cards.');
  }

  if (!settings.every((setting) => setting.proofReference.startsWith('platform_settings:'))) {
    throw new Error('Every setting card must expose a platform setting proof reference.');
  }

  if (!settings.some((setting) => setting.group === 'fraud')) {
    throw new Error('Expected at least one fraud setting group card.');
  }

  if (!settings.some((setting) => setting.group === 'verification')) {
    throw new Error('Expected at least one verification setting group card.');
  }

  if (!settings.some((setting) => setting.group === 'action')) {
    throw new Error('Expected at least one action setting group card.');
  }

  const roles = await service.getAdminRoleSummary();

  if (roles.users < 0 || roles.adminUsers < 0 || roles.moderatorUsers < 0) {
    throw new Error('Admin role summary returned invalid negative counts.');
  }

  const readiness = await service.getAdminControlReadiness();

  if (!readiness.activityFeedFoundationAccepted) {
    throw new Error('Activity feed foundation must be accepted before admin control.');
  }

  if (!readiness.platformSettingsAvailable) {
    throw new Error('Platform settings readiness failed.');
  }

  if (!readiness.publicWhitelistAvailable) {
    throw new Error('Public whitelist readiness failed.');
  }

  if (!readiness.fraudSettingsAvailable) {
    throw new Error('Fraud settings readiness failed.');
  }

  if (!readiness.verificationSettingsAvailable) {
    throw new Error('Verification settings readiness failed.');
  }

  if (!readiness.actionSettingsAvailable) {
    throw new Error('Action settings readiness failed.');
  }

  if (!readiness.authSettingsAvailable) {
    throw new Error('Auth settings readiness failed.');
  }

  if (!readiness.pointsSettingsAvailable) {
    throw new Error('Points settings readiness failed.');
  }

  if (!readiness.userAdminColumnsReadable) {
    throw new Error('User admin column readability failed.');
  }

  if (!readiness.auditLogReadable) {
    throw new Error('Audit log readability failed.');
  }

  const snapshot = await service.getAdminControlSnapshot();

  if (snapshot.settings.length < 30) {
    throw new Error('Admin control snapshot must include setting cards.');
  }

  assertFileMarkers('src/lib/admin-control/types.ts', [
    'AdminControlSnapshot',
    'PlatformSettingCard',
    'AdminRoleSummary',
  ]);
  assertFileMarkers('src/lib/admin-control/admin-control-service.ts', [
    'CommunityLeagueAdminControlService',
    'getAdminControlSnapshot',
    'getPlatformSettingCards',
    'getAdminRoleSummary',
  ]);
  assertFileMarkers('src/lib/admin-control/index.ts', [
    'createCommunityLeagueAdminControlService',
  ]);
  assertFileMarkers('src/app/api/admin-control/route.ts', [
    'community-league-admin-control',
    'getAdminControlSnapshot',
  ]);
  assertFileMarkers('src/app/admin-control/page.tsx', [
    'Platform settings and admin control surface.',
    '/api/admin-control',
  ]);

  process.stdout.write(
    `CL-021A platform settings / admin control validation passed: settings=${settings.length}, fraud=${counts.fraudSettings}, verification=${counts.verificationSettings}, action=${counts.actionSettings}, auth=${counts.authSettings}, points=${counts.pointsSettings}, audit_logs=${counts.auditLogs}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-021A platform settings / admin control validation failed: ${message}\n`);
  process.exit(1);
});