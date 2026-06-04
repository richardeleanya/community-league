export type NavigationRouteStatus = 'present' | 'missing';

export type ProductRoute = {
  key: string;
  label: string;
  path: string;
  apiPath: string | null;
  productArea: string;
  step: number;
  sourceFile: string;
  apiSourceFile: string | null;
  status: NavigationRouteStatus;
  apiStatus: NavigationRouteStatus | 'not_applicable';
  proofReference: string;
};

export type ProductAreaRouteGroup = {
  key: string;
  label: string;
  description: string;
  routes: ProductRoute[];
  readyRoutes: number;
  totalRoutes: number;
  status: NavigationRouteStatus;
};

export type NavigationRouteMapCounts = {
  expectedPageRoutes: number;
  presentPageRoutes: number;
  expectedApiRoutes: number;
  presentApiRoutes: number;
  productAreas: number;
  acceptanceLockedSteps: number;
};

export type NavigationRouteMapReadiness = {
  operationsOverviewFoundationAccepted: true;
  allPageRoutesPresent: boolean;
  allApiRoutesPresent: boolean;
  routeGroupsPresent: boolean;
  acceptanceChainPresent: boolean;
  navigationApiReady: boolean;
  navigationPageReady: boolean;
};

export type NavigationRouteMapSnapshot = {
  generatedAt: string;
  headline: string;
  counts: NavigationRouteMapCounts;
  routes: ProductRoute[];
  groups: ProductAreaRouteGroup[];
  readiness: NavigationRouteMapReadiness;
};