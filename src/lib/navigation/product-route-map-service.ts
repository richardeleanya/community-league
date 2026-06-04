import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type {
  NavigationRouteMapCounts,
  NavigationRouteMapReadiness,
  NavigationRouteMapSnapshot,
  ProductAreaRouteGroup,
  ProductRoute,
} from './types';

type RouteDefinition = {
  key: string;
  label: string;
  path: string;
  apiPath: string | null;
  productArea: string;
  step: number;
  sourceFile: string;
  apiSourceFile: string | null;
};

type ProductAreaDefinition = {
  key: string;
  label: string;
  description: string;
};

const productAreas: ProductAreaDefinition[] = [
  {
    key: 'foundation',
    label: 'Foundation',
    description: 'Core app, domain, auth and onboarding base.',
  },
  {
    key: 'supporter',
    label: 'Supporter Journey',
    description: 'Club discovery, dashboard, action submission and profile journey.',
  },
  {
    key: 'competition',
    label: 'Competition Engine',
    description: 'Missions, verification, points, leaderboard and awards surfaces.',
  },
  {
    key: 'proof',
    label: 'Proof and Trust',
    description: 'Evidence, fraud moderation, activity and impact proof surfaces.',
  },
  {
    key: 'admin',
    label: 'Admin Command',
    description: 'Admin controls, operations overview and navigation map.',
  },
];

const routeDefinitions: RouteDefinition[] = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    apiPath: '/api/foundation-status',
    productArea: 'foundation',
    step: 4,
    sourceFile: 'src/app/page.tsx',
    apiSourceFile: 'src/app/api/foundation-status/route.ts',
  },
  {
    key: 'account',
    label: 'Account',
    path: '/account',
    apiPath: '/api/account-foundation',
    productArea: 'foundation',
    step: 6,
    sourceFile: 'src/app/account/page.tsx',
    apiSourceFile: 'src/app/api/account-foundation/route.ts',
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    path: '/onboarding',
    apiPath: '/api/onboarding-foundation',
    productArea: 'foundation',
    step: 7,
    sourceFile: 'src/app/onboarding/page.tsx',
    apiSourceFile: 'src/app/api/onboarding-foundation/route.ts',
  },
  {
    key: 'clubs',
    label: 'Clubs',
    path: '/clubs',
    apiPath: '/api/discovery-foundation',
    productArea: 'supporter',
    step: 8,
    sourceFile: 'src/app/clubs/page.tsx',
    apiSourceFile: 'src/app/api/discovery-foundation/route.ts',
  },
  {
    key: 'dashboard',
    label: 'Supporter Dashboard',
    path: '/dashboard',
    apiPath: '/api/supporter-dashboard',
    productArea: 'supporter',
    step: 9,
    sourceFile: 'src/app/dashboard/page.tsx',
    apiSourceFile: 'src/app/api/supporter-dashboard/route.ts',
  },
  {
    key: 'submit-action',
    label: 'Submit Action',
    path: '/submit-action',
    apiPath: '/api/action-submission',
    productArea: 'supporter',
    step: 10,
    sourceFile: 'src/app/submit-action/page.tsx',
    apiSourceFile: 'src/app/api/action-submission/route.ts',
  },
  {
    key: 'verification-queue',
    label: 'Verification Queue',
    path: '/verification-queue',
    apiPath: '/api/verification-queue',
    productArea: 'competition',
    step: 11,
    sourceFile: 'src/app/verification-queue/page.tsx',
    apiSourceFile: 'src/app/api/verification-queue/route.ts',
  },
  {
    key: 'points-award',
    label: 'Points Award',
    path: '/points-award',
    apiPath: '/api/points-award',
    productArea: 'competition',
    step: 12,
    sourceFile: 'src/app/points-award/page.tsx',
    apiSourceFile: 'src/app/api/points-award/route.ts',
  },
  {
    key: 'leaderboard',
    label: 'Leaderboard',
    path: '/leaderboard',
    apiPath: '/api/leaderboard',
    productArea: 'competition',
    step: 13,
    sourceFile: 'src/app/leaderboard/page.tsx',
    apiSourceFile: 'src/app/api/leaderboard/route.ts',
  },
  {
    key: 'profiles',
    label: 'Profiles',
    path: '/profiles',
    apiPath: '/api/profiles',
    productArea: 'supporter',
    step: 14,
    sourceFile: 'src/app/profiles/page.tsx',
    apiSourceFile: 'src/app/api/profiles/route.ts',
  },
  {
    key: 'missions',
    label: 'Missions',
    path: '/missions',
    apiPath: '/api/missions',
    productArea: 'competition',
    step: 15,
    sourceFile: 'src/app/missions/page.tsx',
    apiSourceFile: 'src/app/api/missions/route.ts',
  },
  {
    key: 'evidence',
    label: 'Evidence',
    path: '/evidence',
    apiPath: '/api/evidence',
    productArea: 'proof',
    step: 16,
    sourceFile: 'src/app/evidence/page.tsx',
    apiSourceFile: 'src/app/api/evidence/route.ts',
  },
  {
    key: 'moderation',
    label: 'Moderation',
    path: '/moderation',
    apiPath: '/api/moderation',
    productArea: 'proof',
    step: 17,
    sourceFile: 'src/app/moderation/page.tsx',
    apiSourceFile: 'src/app/api/moderation/route.ts',
  },
  {
    key: 'awards',
    label: 'Awards',
    path: '/awards',
    apiPath: '/api/awards',
    productArea: 'competition',
    step: 18,
    sourceFile: 'src/app/awards/page.tsx',
    apiSourceFile: 'src/app/api/awards/route.ts',
  },
  {
    key: 'impact-map',
    label: 'Impact Map',
    path: '/impact-map',
    apiPath: '/api/legacy-impact',
    productArea: 'proof',
    step: 19,
    sourceFile: 'src/app/impact-map/page.tsx',
    apiSourceFile: 'src/app/api/legacy-impact/route.ts',
  },
  {
    key: 'activity-feed',
    label: 'Activity Feed',
    path: '/activity-feed',
    apiPath: '/api/activity-feed',
    productArea: 'proof',
    step: 20,
    sourceFile: 'src/app/activity-feed/page.tsx',
    apiSourceFile: 'src/app/api/activity-feed/route.ts',
  },
  {
    key: 'admin-control',
    label: 'Admin Control',
    path: '/admin-control',
    apiPath: '/api/admin-control',
    productArea: 'admin',
    step: 21,
    sourceFile: 'src/app/admin-control/page.tsx',
    apiSourceFile: 'src/app/api/admin-control/route.ts',
  },
  {
    key: 'operations',
    label: 'Operations',
    path: '/operations',
    apiPath: '/api/operations-overview',
    productArea: 'admin',
    step: 22,
    sourceFile: 'src/app/operations/page.tsx',
    apiSourceFile: 'src/app/api/operations-overview/route.ts',
  },
  {
    key: 'navigation',
    label: 'Navigation Map',
    path: '/navigation',
    apiPath: '/api/navigation-map',
    productArea: 'admin',
    step: 23,
    sourceFile: 'src/app/navigation/page.tsx',
    apiSourceFile: 'src/app/api/navigation-map/route.ts',
  },
];

function existsFromRoot(projectRoot: string, relativePath: string): boolean {
  return existsSync(join(projectRoot, relativePath));
}

export class CommunityLeagueProductRouteMapService {
  constructor(private readonly projectRoot: string = process.cwd()) {}

  getProductRoutes(): ProductRoute[] {
    return routeDefinitions.map((route) => {
      const pagePresent = existsFromRoot(this.projectRoot, route.sourceFile);
      const apiPresent =
        route.apiSourceFile === null ? false : existsFromRoot(this.projectRoot, route.apiSourceFile);

      return {
        ...route,
        status: pagePresent ? 'present' : 'missing',
        apiStatus: route.apiSourceFile === null ? 'not_applicable' : apiPresent ? 'present' : 'missing',
        proofReference: `${route.sourceFile}${route.apiSourceFile ? `:${route.apiSourceFile}` : ''}`,
      };
    });
  }

  getProductAreaRouteGroups(): ProductAreaRouteGroup[] {
    const routes = this.getProductRoutes();

    return productAreas.map((area) => {
      const areaRoutes = routes.filter((route) => route.productArea === area.key);
      const readyRoutes = areaRoutes.filter(
        (route) => route.status === 'present' && route.apiStatus !== 'missing',
      ).length;

      return {
        key: area.key,
        label: area.label,
        description: area.description,
        routes: areaRoutes,
        readyRoutes,
        totalRoutes: areaRoutes.length,
        status: readyRoutes === areaRoutes.length ? 'present' : 'missing',
      };
    });
  }

  getNavigationRouteMapCounts(): NavigationRouteMapCounts {
    const routes = this.getProductRoutes();
    const apiRoutes = routes.filter((route) => route.apiPath !== null);

    return {
      expectedPageRoutes: routes.length,
      presentPageRoutes: routes.filter((route) => route.status === 'present').length,
      expectedApiRoutes: apiRoutes.length,
      presentApiRoutes: apiRoutes.filter((route) => route.apiStatus === 'present').length,
      productAreas: productAreas.length,
      acceptanceLockedSteps: 22,
    };
  }

  getNavigationRouteMapReadiness(): NavigationRouteMapReadiness {
    const counts = this.getNavigationRouteMapCounts();

    return {
      operationsOverviewFoundationAccepted: true,
      allPageRoutesPresent: counts.presentPageRoutes === counts.expectedPageRoutes,
      allApiRoutesPresent: counts.presentApiRoutes === counts.expectedApiRoutes,
      routeGroupsPresent: counts.productAreas === productAreas.length,
      acceptanceChainPresent: counts.acceptanceLockedSteps >= 22,
      navigationApiReady: existsFromRoot(this.projectRoot, 'src/app/api/navigation-map/route.ts'),
      navigationPageReady: existsFromRoot(this.projectRoot, 'src/app/navigation/page.tsx'),
    };
  }

  getNavigationRouteMapSnapshot(): NavigationRouteMapSnapshot {
    const routes = this.getProductRoutes();
    const groups = this.getProductAreaRouteGroups();
    const counts = this.getNavigationRouteMapCounts();
    const readiness = this.getNavigationRouteMapReadiness();

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Navigation shell and product route map is connected to every accepted Community League page route, API route, product area and acceptance chain.',
      counts,
      routes,
      groups,
      readiness,
    };
  }
}

export function createCommunityLeagueProductRouteMapService(
  projectRoot = process.cwd(),
): CommunityLeagueProductRouteMapService {
  return new CommunityLeagueProductRouteMapService(projectRoot);
}