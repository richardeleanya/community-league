export type HardeningStatus = 'closed' | 'monitor' | 'blocked';

export type ReleaseCandidateHardeningCheck = {
  key: string;
  area: string;
  requirement: string;
  evidence: string;
  status: HardeningStatus;
};

export type DefectClosureItem = {
  key: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  area: string;
  finding: string;
  closureDecision: string;
  evidence: string;
  status: HardeningStatus;
};

export type ReleaseCandidateManifestItem = {
  key: string;
  artefact: string;
  evidencePath: string;
  status: HardeningStatus;
};

export type ReleaseCandidateHardeningSnapshot = {
  generatedAt: string;
  headline: string;
  acceptedStepCount: number;
  requiredStepCount: number;
  hardeningChecks: ReleaseCandidateHardeningCheck[];
  defectClosures: DefectClosureItem[];
  manifest: ReleaseCandidateManifestItem[];
  readiness: {
    previousReleaseEvidenceLocked: boolean;
    criticalDefectsClosed: boolean;
    highDefectsClosed: boolean;
    buildStillPassing: boolean;
    typecheckStillPassing: boolean;
    releaseCandidateBlocked: boolean;
  };
};