export type RuntimeSmokeRouteType = 'page' | 'api';

export type RuntimeSmokeRoute = {
  key: string;
  path: string;
  type: RuntimeSmokeRouteType;
  expectedStatus: number;
  requiredText: string;
};

export type RuntimeSmokeResult = {
  key: string;
  path: string;
  type: RuntimeSmokeRouteType;
  status: number;
  passed: boolean;
  proofReference: string;
};

export type RuntimeSmokeReadiness = {
  visualPolishAccepted: true;
  expectedRoutesPresent: boolean;
  pageRoutesPresent: boolean;
  apiRoutesPresent: boolean;
  productionBuildRequired: boolean;
  localRuntimeRequired: boolean;
};

export type RuntimeSmokeSnapshot = {
  generatedAt: string;
  headline: string;
  expectedRoutes: RuntimeSmokeRoute[];
  readiness: RuntimeSmokeReadiness;
};