import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueProductRouteMapService } from '@/lib/navigation';

import type {
  VisualShellNavItem,
  VisualShellReadiness,
  VisualShellSnapshot,
  VisualShellStatusPanel,
  VisualShellZone,
  VisualShellZoneKey,
} from './types';

const zoneDescriptions: Record<VisualShellZoneKey, { label: string; description: string }> = {
  foundation: {
    label: 'Foundation',
    description: 'Account, onboarding and platform foundation surfaces.',
  },
  supporter: {
    label: 'Supporter Journey',
    description: 'Club discovery, dashboard, action submission and profile surfaces.',
  },
  competition: {
    label: 'Competition Engine',
    description: 'Mission, verification, points, leaderboard and recognition surfaces.',
  },
  proof: {
    label: 'Proof and Trust',
    description: 'Evidence, moderation, impact and activity proof surfaces.',
  },
  admin: {
    label: 'Admin Command',
    description: 'Admin controls, operations overview and navigation shell surfaces.',
  },
};

const primaryRouteKeys = new Set([
  'dashboard',
  'submit-action',
  'missions',
  'leaderboard',
  'activity-feed',
  'operations',
  'navigation',
]);

function existsFromRoot(projectRoot: string, relativePath: string): boolean {
  return existsSync(join(projectRoot, relativePath));
}

export class CommunityLeagueVisualShellService {
  constructor(private readonly projectRoot: string = process.cwd()) {}

  getVisualShellNavItems(): VisualShellNavItem[] {
    const routeMap = createCommunityLeagueProductRouteMapService(this.projectRoot);
    const routes = routeMap.getProductRoutes();

    return routes
      .filter((route) => route.status === 'present')
      .map((route) => ({
        key: route.key,
        label: route.label,
        path: route.path,
        apiPath: route.apiPath,
        zone: route.productArea as VisualShellZoneKey,
        step: route.step,
        isPrimary: primaryRouteKeys.has(route.key),
        proofReference: route.proofReference,
      }))
      .sort((left, right) => left.step - right.step || left.label.localeCompare(right.label));
  }

  getVisualShellZones(): VisualShellZone[] {
    const navItems = this.getVisualShellNavItems();
    const zoneKeys = Object.keys(zoneDescriptions) as VisualShellZoneKey[];

    return zoneKeys.map((key) => {
      const items = navItems.filter((item) => item.zone === key);
      const description = zoneDescriptions[key];

      return {
        key,
        label: description.label,
        description: description.description,
        navItems: items,
        readyItems: items.length,
        totalItems: items.length,
      };
    });
  }

  getVisualShellStatusPanels(): VisualShellStatusPanel[] {
    const routeMap = createCommunityLeagueProductRouteMapService(this.projectRoot);
    const counts = routeMap.getNavigationRouteMapCounts();
    const navItems = this.getVisualShellNavItems();
    const zones = this.getVisualShellZones();

    return [
      {
        key: 'route-map',
        label: 'Page routes',
        value: `${counts.presentPageRoutes}/${counts.expectedPageRoutes}`,
        state: counts.presentPageRoutes === counts.expectedPageRoutes ? 'ready' : 'blocked',
        proofReference: 'navigation:getNavigationRouteMapCounts',
      },
      {
        key: 'api-map',
        label: 'API routes',
        value: `${counts.presentApiRoutes}/${counts.expectedApiRoutes}`,
        state: counts.presentApiRoutes === counts.expectedApiRoutes ? 'ready' : 'blocked',
        proofReference: 'navigation:getNavigationRouteMapCounts',
      },
      {
        key: 'primary-nav',
        label: 'Primary navigation',
        value: `${navItems.filter((item) => item.isPrimary).length}`,
        state: navItems.filter((item) => item.isPrimary).length >= 7 ? 'ready' : 'attention',
        proofReference: 'visual-shell:primaryRouteKeys',
      },
      {
        key: 'product-zones',
        label: 'Product zones',
        value: `${zones.length}`,
        state: zones.length >= 5 ? 'ready' : 'blocked',
        proofReference: 'visual-shell:zoneDescriptions',
      },
    ];
  }

  getVisualShellReadiness(): VisualShellReadiness {
    const routeMap = createCommunityLeagueProductRouteMapService(this.projectRoot);
    const routeReadiness = routeMap.getNavigationRouteMapReadiness();
    const navItems = this.getVisualShellNavItems();
    const zones = this.getVisualShellZones();

    return {
      navigationRouteMapAccepted: true,
      productZonesPresent: zones.length >= 5 && zones.every((zone) => zone.totalItems >= 1),
      primaryNavigationPresent: navItems.filter((item) => item.isPrimary).length >= 7,
      routeMapComplete: routeReadiness.allPageRoutesPresent,
      apiMapComplete: routeReadiness.allApiRoutesPresent,
      operationsSurfacePresent: navItems.some((item) => item.path === '/operations'),
      adminSurfacePresent: navItems.some((item) => item.path === '/admin-control'),
      shellComponentPresent: existsFromRoot(this.projectRoot, 'src/components/community-league-shell.tsx'),
      shellPagePresent: existsFromRoot(this.projectRoot, 'src/app/shell/page.tsx'),
      shellApiPresent: existsFromRoot(this.projectRoot, 'src/app/api/visual-shell/route.ts'),
    };
  }

  getVisualShellSnapshot(): VisualShellSnapshot {
    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Visual shell and unified product navigation is connected to the accepted route map, product zones, primary navigation, operations and admin surfaces.',
      navItems: this.getVisualShellNavItems(),
      zones: this.getVisualShellZones(),
      statusPanels: this.getVisualShellStatusPanels(),
      readiness: this.getVisualShellReadiness(),
    };
  }
}

export function createCommunityLeagueVisualShellService(
  projectRoot = process.cwd(),
): CommunityLeagueVisualShellService {
  return new CommunityLeagueVisualShellService(projectRoot);
}