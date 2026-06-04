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
    throw new Error(`Missing activity feed file: ${path}`);
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

  const { createCommunityLeagueActivityFeedService } = await import('../lib/activity');
  const service = createCommunityLeagueActivityFeedService();

  const counts = await service.getActivityFeedCounts();

  if (counts.currentSeasons !== 1) {
    throw new Error(`Expected exactly 1 current season, received ${counts.currentSeasons}`);
  }

  if (counts.notificationTypes < 1) {
    throw new Error(`Expected notification type enum values, received ${counts.notificationTypes}`);
  }

  if (counts.notifications < 1) {
    throw new Error(`Expected at least 1 notification row, received ${counts.notifications}`);
  }

  if (counts.auditLogs < 1) {
    throw new Error(`Expected at least 1 audit log row, received ${counts.auditLogs}`);
  }

  if (counts.submittedActions < 1) {
    throw new Error(`Expected at least 1 submitted action, received ${counts.submittedActions}`);
  }

  if (counts.approvedActions < 1) {
    throw new Error(`Expected at least 1 approved action, received ${counts.approvedActions}`);
  }

  if (counts.supporterProfiles < 1) {
    throw new Error(`Expected supporter profiles, received ${counts.supporterProfiles}`);
  }

  if (counts.activeClubs < 1) {
    throw new Error(`Expected active clubs, received ${counts.activeClubs}`);
  }

  const notifications = await service.getRecentNotifications();

  if (notifications.length < 1) {
    throw new Error('Expected at least 1 activity notification.');
  }

  if (!notifications.every((item) => item.proofReference.startsWith('notifications:'))) {
    throw new Error('Every notification item must expose a notification proof reference.');
  }

  const auditEvents = await service.getRecentAuditEvents();

  if (auditEvents.length < 1) {
    throw new Error('Expected at least 1 activity audit event.');
  }

  if (!auditEvents.every((event) => event.proofReference.startsWith('audit_logs:'))) {
    throw new Error('Every audit event must expose an audit proof reference.');
  }

  const actionEvents = await service.getRecentActionEvents();

  if (actionEvents.length < 1) {
    throw new Error('Expected at least 1 community action event.');
  }

  if (!actionEvents.every((event) => event.proofReference.startsWith('community_actions:'))) {
    throw new Error('Every action event must expose a community action proof reference.');
  }

  const readiness = await service.getActivityFeedReadiness();

  if (!readiness.legacyImpactFoundationAccepted) {
    throw new Error('Legacy impact foundation must be accepted before activity feed.');
  }

  if (!readiness.currentSeasonAvailable) {
    throw new Error('Current season activity readiness failed.');
  }

  if (!readiness.notificationEnumAvailable) {
    throw new Error('Notification enum readiness failed.');
  }

  if (!readiness.notificationFeedReadable) {
    throw new Error('Notification feed readability failed.');
  }

  if (!readiness.auditFeedReadable) {
    throw new Error('Audit feed readability failed.');
  }

  if (!readiness.actionFeedReadable) {
    throw new Error('Action feed readability failed.');
  }

  if (!readiness.approvedActionAvailable) {
    throw new Error('Approved action activity readiness failed.');
  }

  const snapshot = await service.getActivityFeedSnapshot();

  if (
    snapshot.notifications.length < 1 ||
    snapshot.auditEvents.length < 1 ||
    snapshot.actionEvents.length < 1
  ) {
    throw new Error('Activity feed snapshot must include notification, audit and action events.');
  }

  assertFileMarkers('src/lib/activity/types.ts', [
    'ActivityFeedSnapshot',
    'ActivityNotificationItem',
    'ActivityAuditEvent',
    'ActivityActionEvent',
  ]);
  assertFileMarkers('src/lib/activity/activity-feed-service.ts', [
    'CommunityLeagueActivityFeedService',
    'getActivityFeedSnapshot',
    'getRecentNotifications',
    'getRecentAuditEvents',
    'getRecentActionEvents',
  ]);
  assertFileMarkers('src/lib/activity/index.ts', [
    'createCommunityLeagueActivityFeedService',
  ]);
  assertFileMarkers('src/app/api/activity-feed/route.ts', [
    'community-league-activity-feed',
    'getActivityFeedSnapshot',
  ]);
  assertFileMarkers('src/app/activity-feed/page.tsx', [
    'Notification and activity feed surface.',
    '/api/activity-feed',
  ]);

  process.stdout.write(
    `CL-020A notification / activity feed validation passed: notifications=${notifications.length}, audit_events=${auditEvents.length}, action_events=${actionEvents.length}, notification_types=${counts.notificationTypes}, audit_logs=${counts.auditLogs}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-020A notification / activity feed validation failed: ${message}\n`);
  process.exit(1);
});