export type VisualShellZoneKey =
  | 'foundation'
  | 'supporter'
  | 'competition'
  | 'proof'
  | 'admin';

export type VisualShellNavItem = {
  key: string;
  label: string;
  path: string;
  apiPath: string | null;
  zone: VisualShellZoneKey;
  step: number;
  isPrimary: boolean;
  proofReference: string;
};

export type VisualShellZone = {
  key: VisualShellZoneKey;
  label: string;
  description: string;
  navItems: VisualShellNavItem[];
  readyItems: number;
  totalItems: number;
};

export type VisualShellStatusPanel = {
  key: string;
  label: string;
  value: string;
  state: 'ready' | 'attention' | 'blocked';
  proofReference: string;
};

export type VisualShellReadiness = {
  navigationRouteMapAccepted: true;
  productZonesPresent: boolean;
  primaryNavigationPresent: boolean;
  routeMapComplete: boolean;
  apiMapComplete: boolean;
  operationsSurfacePresent: boolean;
  adminSurfacePresent: boolean;
  shellComponentPresent: boolean;
  shellPagePresent: boolean;
  shellApiPresent: boolean;
};

export type VisualShellSnapshot = {
  generatedAt: string;
  headline: string;
  navItems: VisualShellNavItem[];
  zones: VisualShellZone[];
  statusPanels: VisualShellStatusPanel[];
  readiness: VisualShellReadiness;
};