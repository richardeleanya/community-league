import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing visual shell file: ${path}`);
  }

  const content = readFileSync(filePath, 'utf8');

  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`File ${path} missing marker: ${marker}`);
    }
  }
}

async function main(): Promise<void> {
  const { createCommunityLeagueVisualShellService } = await import('../lib/visual-shell');
  const service = createCommunityLeagueVisualShellService(process.cwd());

  const navItems = service.getVisualShellNavItems();

  if (navItems.length < 19) {
    throw new Error(`Expected at least 19 visual shell navigation items, received ${navItems.length}`);
  }

  const primaryItems = navItems.filter((item) => item.isPrimary);

  if (primaryItems.length < 7) {
    throw new Error(`Expected at least 7 primary navigation items, received ${primaryItems.length}`);
  }

  const requiredPrimaryPaths = [
    '/dashboard',
    '/submit-action',
    '/missions',
    '/leaderboard',
    '/activity-feed',
    '/operations',
    '/navigation',
  ];

  for (const path of requiredPrimaryPaths) {
    if (!primaryItems.some((item) => item.path === path)) {
      throw new Error(`Required primary navigation path missing: ${path}`);
    }
  }

  const zones = service.getVisualShellZones();

  if (zones.length < 5) {
    throw new Error(`Expected at least 5 visual shell zones, received ${zones.length}`);
  }

  if (!zones.every((zone) => zone.totalItems >= 1)) {
    throw new Error(`Every visual shell zone must contain at least one item: ${zones.map((zone) => `${zone.key}:${zone.totalItems}`).join(', ')}`);
  }

  const statusPanels = service.getVisualShellStatusPanels();

  if (statusPanels.length < 4) {
    throw new Error(`Expected at least 4 status panels, received ${statusPanels.length}`);
  }

  if (!statusPanels.every((panel) => panel.proofReference.includes(':'))) {
    throw new Error('Every visual shell status panel must expose a proof reference.');
  }

  const readiness = service.getVisualShellReadiness();

  if (!readiness.navigationRouteMapAccepted) {
    throw new Error('Navigation route map foundation must be accepted before visual shell.');
  }

  if (!readiness.productZonesPresent) {
    throw new Error('Visual shell product zone readiness failed.');
  }

  if (!readiness.primaryNavigationPresent) {
    throw new Error('Visual shell primary navigation readiness failed.');
  }

  if (!readiness.routeMapComplete) {
    throw new Error('Visual shell page route map readiness failed.');
  }

  if (!readiness.apiMapComplete) {
    throw new Error('Visual shell API route map readiness failed.');
  }

  if (!readiness.operationsSurfacePresent) {
    throw new Error('Operations surface must be visible in visual shell navigation.');
  }

  if (!readiness.adminSurfacePresent) {
    throw new Error('Admin surface must be visible in visual shell navigation.');
  }

  if (!readiness.shellComponentPresent) {
    throw new Error('Visual shell component readiness failed.');
  }

  if (!readiness.shellPagePresent) {
    throw new Error('Visual shell page readiness failed.');
  }

  if (!readiness.shellApiPresent) {
    throw new Error('Visual shell API readiness failed.');
  }

  const snapshot = service.getVisualShellSnapshot();

  if (snapshot.navItems.length < 19 || snapshot.zones.length < 5 || snapshot.statusPanels.length < 4) {
    throw new Error('Visual shell snapshot must include nav items, zones and status panels.');
  }

  assertFileMarkers('src/lib/visual-shell/types.ts', [
    'VisualShellSnapshot',
    'VisualShellNavItem',
    'VisualShellZone',
    'VisualShellStatusPanel',
  ]);
  assertFileMarkers('src/lib/visual-shell/visual-shell-service.ts', [
    'CommunityLeagueVisualShellService',
    'getVisualShellSnapshot',
    'getVisualShellNavItems',
    'getVisualShellZones',
    'getVisualShellStatusPanels',
  ]);
  assertFileMarkers('src/lib/visual-shell/index.ts', [
    'createCommunityLeagueVisualShellService',
  ]);
  assertFileMarkers('src/components/community-league-shell.tsx', [
    'CommunityLeagueShell',
    'Primary Community League navigation',
    'Unified Product Shell',
  ]);
  assertFileMarkers('src/app/api/visual-shell/route.ts', [
    'community-league-visual-shell',
    'getVisualShellSnapshot',
  ]);
  assertFileMarkers('src/app/shell/page.tsx', [
    'Visual shell and unified product navigation surface.',
    '/api/visual-shell',
  ]);

  process.stdout.write(
    `CL-024A visual shell / unified product navigation validation passed: nav_items=${navItems.length}, primary=${primaryItems.length}, zones=${zones.length}, panels=${statusPanels.length}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-024A visual shell / unified product navigation validation failed: ${message}\n`);
  process.exit(1);
});