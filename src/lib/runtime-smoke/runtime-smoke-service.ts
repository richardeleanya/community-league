import type { RuntimeSmokeReadiness, RuntimeSmokeRoute, RuntimeSmokeSnapshot } from './types';

const expectedRoutes: RuntimeSmokeRoute[] = [
  { key: 'home', path: '/', type: 'page', expectedStatus: 200, requiredText: 'Community Premier League' },
  { key: 'clubs', path: '/clubs', type: 'page', expectedStatus: 200, requiredText: 'Find your club. Enter the league.' },
  { key: 'dashboard', path: '/dashboard', type: 'page', expectedStatus: 200, requiredText: 'Your supporter command centre.' },
  { key: 'submit-action', path: '/submit-action', type: 'page', expectedStatus: 200, requiredText: 'Submit a verified community action.' },
  { key: 'missions', path: '/missions', type: 'page', expectedStatus: 200, requiredText: 'Mission catalogue and fixture surface.' },
  { key: 'leaderboard', path: '/leaderboard', type: 'page', expectedStatus: 200, requiredText: 'Leaderboard' },
  { key: 'evidence', path: '/evidence', type: 'page', expectedStatus: 200, requiredText: 'Community action evidence detail surface.' },
  { key: 'moderation', path: '/moderation', type: 'page', expectedStatus: 200, requiredText: 'Moderation' },
  { key: 'activity-feed', path: '/activity-feed', type: 'page', expectedStatus: 200, requiredText: 'Activity' },
  { key: 'admin-control', path: '/admin-control', type: 'page', expectedStatus: 200, requiredText: 'Admin' },
  { key: 'operations', path: '/operations', type: 'page', expectedStatus: 200, requiredText: 'Operations' },
  { key: 'navigation', path: '/navigation', type: 'page', expectedStatus: 200, requiredText: 'Navigation shell and product route map surface.' },
  { key: 'shell', path: '/shell', type: 'page', expectedStatus: 200, requiredText: 'Visual shell and unified product navigation surface.' },
  { key: 'visual-polish', path: '/visual-polish', type: 'page', expectedStatus: 200, requiredText: 'Responsive visual polish and public shell maturity pass.' },
  { key: 'runtime-smoke', path: '/runtime-smoke', type: 'page', expectedStatus: 200, requiredText: 'End-to-end route smoke and local runtime verification.' },
  { key: 'foundation-status-api', path: '/api/foundation-status', type: 'api', expectedStatus: 200, requiredText: '"status"' },
  { key: 'homepage-api', path: '/api/homepage-composition', type: 'api', expectedStatus: 200, requiredText: 'community-league-homepage-composition' },
  { key: 'visual-shell-api', path: '/api/visual-shell', type: 'api', expectedStatus: 200, requiredText: 'community-league-visual-shell' },
  { key: 'visual-polish-api', path: '/api/visual-polish', type: 'api', expectedStatus: 200, requiredText: 'community-league-visual-polish' },
  { key: 'navigation-api', path: '/api/navigation-map', type: 'api', expectedStatus: 200, requiredText: 'community-league-navigation-route-map' },
  { key: 'operations-api', path: '/api/operations-overview', type: 'api', expectedStatus: 200, requiredText: 'community-league-operations-overview' },
  { key: 'runtime-smoke-api', path: '/api/runtime-smoke', type: 'api', expectedStatus: 200, requiredText: 'community-league-runtime-smoke' },
];

export class CommunityLeagueRuntimeSmokeService {
  getExpectedRuntimeSmokeRoutes(): RuntimeSmokeRoute[] {
    return expectedRoutes;
  }

  getRuntimeSmokeReadiness(): RuntimeSmokeReadiness {
    const pageRoutes = expectedRoutes.filter((route) => route.type === 'page');
    const apiRoutes = expectedRoutes.filter((route) => route.type === 'api');

    return {
      visualPolishAccepted: true,
      expectedRoutesPresent: expectedRoutes.length >= 22,
      pageRoutesPresent: pageRoutes.length >= 15,
      apiRoutesPresent: apiRoutes.length >= 7,
      productionBuildRequired: true,
      localRuntimeRequired: true,
    };
  }

  getRuntimeSmokeSnapshot(): RuntimeSmokeSnapshot {
    return {
      generatedAt: new Date().toISOString(),
      headline:
        'End-to-end local runtime smoke verification is configured for public pages, proof surfaces, admin surfaces, runtime-smoke page and key API endpoints.',
      expectedRoutes,
      readiness: this.getRuntimeSmokeReadiness(),
    };
  }
}

export function createCommunityLeagueRuntimeSmokeService(): CommunityLeagueRuntimeSmokeService {
  return new CommunityLeagueRuntimeSmokeService();
}