export type ReleaseReadinessStatus = 'accepted' | 'review' | 'blocked';

export type ReleaseReadinessPhase = {
  step: number;
  code: string;
  title: string;
  area: string;
  status: ReleaseReadinessStatus;
};

export type ProductQaRegisterItem = {
  key: string;
  area: string;
  controlQuestion: string;
  evidence: string;
  status: ReleaseReadinessStatus;
};

export type RouteSurfaceRegisterItem = {
  path: string;
  type: 'page' | 'api';
  area: string;
  runtimeSmokeRequired: boolean;
};

export type ReleaseReadinessEvidencePack = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  phases: ReleaseReadinessPhase[];
  qaRegister: ProductQaRegisterItem[];
  routeSurfaceRegister: RouteSurfaceRegisterItem[];
  readiness: {
    databaseFoundationLocked: boolean;
    applicationFoundationLocked: boolean;
    productSurfacesLocked: boolean;
    visualShellLocked: boolean;
    runtimeSmokeLocked: boolean;
    qaRegisterReady: boolean;
    releaseEvidenceReady: boolean;
    releaseBlocked: boolean;
  };
};