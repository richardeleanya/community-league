import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing navigation route map file: ${path}`);
  }

  const content = readFileSync(filePath, 'utf8');

  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`File ${path} missing marker: ${marker}`);
    }
  }
}

async function main(): Promise<void> {
  const { createCommunityLeagueProductRouteMapService } = await import('../lib/navigation');
  const service = createCommunityLeagueProductRouteMapService(process.cwd());

  const routes = service.getProductRoutes();

  if (routes.length < 19) {
    throw new Error(`Expected at least 19 product routes, received ${routes.length}`);
  }

  const missingPages = routes.filter((route) => route.status !== 'present');

  if (missingPages.length > 0) {
    throw new Error(`Missing page routes: ${missingPages.map((route) => route.path).join(', ')}`);
  }

  const missingApis = routes.filter((route) => route.apiStatus === 'missing');

  if (missingApis.length > 0) {
    throw new Error(`Missing API routes: ${missingApis.map((route) => route.apiPath).join(', ')}`);
  }

  const requiredRoutes = [
    '/account',
    '/onboarding',
    '/clubs',
    '/dashboard',
    '/submit-action',
    '/verification-queue',
    '/points-award',
    '/leaderboard',
    '/profiles',
    '/missions',
    '/evidence',
    '/moderation',
    '/awards',
    '/impact-map',
    '/activity-feed',
    '/admin-control',
    '/operations',
    '/navigation',
  ];

  for (const requiredRoute of requiredRoutes) {
    if (!routes.some((route) => route.path === requiredRoute)) {
      throw new Error(`Required route missing from product route map: ${requiredRoute}`);
    }
  }

  const groups = service.getProductAreaRouteGroups();

  if (groups.length < 5) {
    throw new Error(`Expected at least 5 product area groups, received ${groups.length}`);
  }

  if (!groups.every((group) => group.status === 'present')) {
    throw new Error(`One or more product area groups are not fully present: ${groups.map((group) => `${group.key}:${group.status}`).join(', ')}`);
  }

  const counts = service.getNavigationRouteMapCounts();

  if (counts.expectedPageRoutes !== counts.presentPageRoutes) {
    throw new Error(`Page route count mismatch: ${counts.presentPageRoutes}/${counts.expectedPageRoutes}`);
  }

  if (counts.expectedApiRoutes !== counts.presentApiRoutes) {
    throw new Error(`API route count mismatch: ${counts.presentApiRoutes}/${counts.expectedApiRoutes}`);
  }

  if (counts.acceptanceLockedSteps < 22) {
    throw new Error(`Expected acceptance chain through Step 22, received ${counts.acceptanceLockedSteps}`);
  }

  const readiness = service.getNavigationRouteMapReadiness();

  if (!readiness.operationsOverviewFoundationAccepted) {
    throw new Error('Operations overview foundation must be accepted before navigation route map.');
  }

  if (!readiness.allPageRoutesPresent) {
    throw new Error('Navigation page route readiness failed.');
  }

  if (!readiness.allApiRoutesPresent) {
    throw new Error('Navigation API route readiness failed.');
  }

  if (!readiness.routeGroupsPresent) {
    throw new Error('Navigation route group readiness failed.');
  }

  if (!readiness.acceptanceChainPresent) {
    throw new Error('Navigation acceptance chain readiness failed.');
  }

  if (!readiness.navigationApiReady) {
    throw new Error('Navigation API route readiness failed.');
  }

  if (!readiness.navigationPageReady) {
    throw new Error('Navigation page readiness failed.');
  }

  const snapshot = service.getNavigationRouteMapSnapshot();

  if (snapshot.routes.length < 19 || snapshot.groups.length < 5) {
    throw new Error('Navigation route map snapshot must include routes and groups.');
  }

  if (!snapshot.routes.every((route) => route.proofReference.includes('src/app/'))) {
    throw new Error('Every route must expose a source proof reference.');
  }

  assertFileMarkers('src/lib/navigation/types.ts', [
    'NavigationRouteMapSnapshot',
    'ProductRoute',
    'ProductAreaRouteGroup',
  ]);
  assertFileMarkers('src/lib/navigation/product-route-map-service.ts', [
    'CommunityLeagueProductRouteMapService',
    'getNavigationRouteMapSnapshot',
    'getProductRoutes',
    'getProductAreaRouteGroups',
  ]);
  assertFileMarkers('src/lib/navigation/index.ts', [
    'createCommunityLeagueProductRouteMapService',
  ]);
  assertFileMarkers('src/app/api/navigation-map/route.ts', [
    'community-league-navigation-route-map',
    'getNavigationRouteMapSnapshot',
  ]);
  assertFileMarkers('src/app/navigation/page.tsx', [
    'Navigation shell and product route map surface.',
    '/api/navigation-map',
  ]);

  process.stdout.write(
    `CL-023A navigation shell / product route map validation passed: routes=${routes.length}, apis=${counts.presentApiRoutes}, groups=${groups.length}, accepted_steps=${counts.acceptanceLockedSteps}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-023A navigation shell / product route map validation failed: ${message}\n`);
  process.exit(1);
});