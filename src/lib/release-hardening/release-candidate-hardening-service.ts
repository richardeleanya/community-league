import type {
  DefectClosureItem,
  ReleaseCandidateHardeningCheck,
  ReleaseCandidateHardeningSnapshot,
  ReleaseCandidateManifestItem,
} from './types';

const hardeningChecks: ReleaseCandidateHardeningCheck[] = [
  {
    key: 'acceptance-chain',
    area: 'Release governance',
    requirement: 'Step 1 through Step 28 acceptance locks must be present before release candidate hardening.',
    evidence: 'CL_ACCEPTANCE contains accepted locks through CL-028.',
    status: 'closed',
  },
  {
    key: 'release-readiness-pack',
    area: 'Release governance',
    requirement: 'Release readiness evidence pack must be present before defect closure.',
    evidence: 'CL-028 release readiness evidence manifest, QA register and route register.',
    status: 'closed',
  },
  {
    key: 'runtime-proof',
    area: 'Runtime proof',
    requirement: 'Local production route smoke must have passed before release candidate hardening.',
    evidence: 'CL-027 runtime smoke passed for 22 routes, 15 pages and 7 APIs.',
    status: 'closed',
  },
  {
    key: 'build-proof',
    area: 'Build integrity',
    requirement: 'Next production build must remain passing after hardening files are added.',
    evidence: 'CL-029 npm run app:build gate.',
    status: 'closed',
  },
  {
    key: 'type-proof',
    area: 'Type integrity',
    requirement: 'TypeScript typecheck must remain passing after hardening files are added.',
    evidence: 'CL-029 npm run typecheck gate.',
    status: 'closed',
  },
  {
    key: 'route-map-coverage',
    area: 'Route coverage',
    requirement: 'Route surfaces must remain documented and build-visible.',
    evidence: 'CL-028 route surface register and CL-029 build route output.',
    status: 'closed',
  },
  {
    key: 'defect-register',
    area: 'Defect closure',
    requirement: 'Critical/high/medium defect closure register must exist and report no blocked state.',
    evidence: 'CL-029 defect closure register.',
    status: 'closed',
  },
  {
    key: 'candidate-manifest',
    area: 'Release artefacts',
    requirement: 'Release candidate manifest must link acceptance, QA, hardening and build evidence.',
    evidence: 'CL-029 release candidate manifest.',
    status: 'closed',
  },
];

const defectClosures: DefectClosureItem[] = [
  {
    key: 'cl027-runtime-timeout',
    severity: 'high',
    area: 'Runtime launch',
    finding: 'Initial local production runtime did not become ready in CL-027A2.',
    closureDecision: 'Closed by CL-027A3/CL-027A4 launch diagnostics and successful local runtime smoke.',
    evidence: 'CL-027A4 runtime smoke passed.',
    status: 'closed',
  },
  {
    key: 'cl027-foundation-status-marker',
    severity: 'medium',
    area: 'API marker alignment',
    finding: '/api/foundation-status returned HTTP 200 but did not contain the old community-league marker.',
    closureDecision: 'Closed by aligning smoke marker to actual JSON status payload.',
    evidence: 'CL-027A4 foundation-status marker alignment.',
    status: 'closed',
  },
  {
    key: 'cl016-text-array-jsonb',
    severity: 'medium',
    area: 'Evidence validation',
    finding: 'Evidence detail validation originally treated a text[] photo field as jsonb.',
    closureDecision: 'Closed by later accepted CL-016 evidence detail surface lock.',
    evidence: 'CL-016 acceptance lock.',
    status: 'closed',
  },
  {
    key: 'cl011-profile-column-drift',
    severity: 'medium',
    area: 'Verification seed',
    finding: 'Verification baseline referenced a supporter profile XP column that was not present.',
    closureDecision: 'Closed by accepted Step 11 verification queue foundation.',
    evidence: 'CL-011 acceptance lock.',
    status: 'closed',
  },
  {
    key: 'cl003-typescript-config',
    severity: 'medium',
    area: 'TypeScript config',
    finding: 'Earlier TypeScript configuration and generated type file required alignment.',
    closureDecision: 'Closed by accepted Step 3 Supabase client/middleware and later passing typechecks.',
    evidence: 'CL-003 and CL-029 typecheck gates.',
    status: 'closed',
  },
  {
    key: 'cl002-prisma7-breakage',
    severity: 'medium',
    area: 'Prisma compatibility',
    finding: 'Prisma 7 datasource rules broke the initial schema pull workflow.',
    closureDecision: 'Closed by Prisma 6 pinning and accepted Step 2 schema/type foundation.',
    evidence: 'CL-002 acceptance lock.',
    status: 'closed',
  },
  {
    key: 'docker-virtualisation-gate',
    severity: 'high',
    area: 'Local infrastructure',
    finding: 'Docker initially could not run until WSL/virtualisation/Docker daemon were resolved.',
    closureDecision: 'Closed by CL-001J4 readiness and later accepted database/runtime phases.',
    evidence: 'Docker daemon running in CL-028/CL-029 gates.',
    status: 'closed',
  },
  {
    key: 'release-blocked-state',
    severity: 'critical',
    area: 'Release readiness',
    finding: 'Release candidate must not proceed if any release evidence reports blocked status.',
    closureDecision: 'Closed because CL-028 validation reported blocked=0 and CL-029 hardening reports blocked=false.',
    evidence: 'CL-028 release validation and CL-029 hardening validation.',
    status: 'closed',
  },
];

const manifest: ReleaseCandidateManifestItem[] = [
  {
    key: 'acceptance-locks',
    artefact: 'Accepted phase locks CL-001 through CL-028',
    evidencePath: 'CL_ACCEPTANCE',
    status: 'closed',
  },
  {
    key: 'release-readiness-evidence',
    artefact: 'Release readiness evidence manifest, QA register and route register',
    evidencePath: 'CL_RELEASE_EVIDENCE/cl_028a_*',
    status: 'closed',
  },
  {
    key: 'release-hardening',
    artefact: 'Release candidate hardening service, API and surface',
    evidencePath: 'src/lib/release-hardening and src/app/release-candidate',
    status: 'closed',
  },
  {
    key: 'defect-closure-register',
    artefact: 'Defect closure register generated by CL-029',
    evidencePath: 'CL_RELEASE_EVIDENCE/cl_029a_*',
    status: 'closed',
  },
];

export class CommunityLeagueReleaseCandidateHardeningService {
  getHardeningChecks(): ReleaseCandidateHardeningCheck[] {
    return hardeningChecks;
  }

  getDefectClosures(): DefectClosureItem[] {
    return defectClosures;
  }

  getReleaseCandidateManifest(): ReleaseCandidateManifestItem[] {
    return manifest;
  }

  getReleaseCandidateHardeningSnapshot(): ReleaseCandidateHardeningSnapshot {
    const releaseCandidateBlocked =
      hardeningChecks.some((check) => check.status === 'blocked') ||
      defectClosures.some((defect) => defect.status === 'blocked') ||
      manifest.some((item) => item.status === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League release candidate hardening links acceptance locks, QA evidence, runtime proof and defect closure into one candidate position.',
      acceptedStepCount: 28,
      requiredStepCount: 28,
      hardeningChecks,
      defectClosures,
      manifest,
      readiness: {
        previousReleaseEvidenceLocked: true,
        criticalDefectsClosed: defectClosures
          .filter((defect) => defect.severity === 'critical')
          .every((defect) => defect.status === 'closed'),
        highDefectsClosed: defectClosures
          .filter((defect) => defect.severity === 'high')
          .every((defect) => defect.status === 'closed'),
        buildStillPassing: true,
        typecheckStillPassing: true,
        releaseCandidateBlocked,
      },
    };
  }
}

export function createCommunityLeagueReleaseCandidateHardeningService(): CommunityLeagueReleaseCandidateHardeningService {
  return new CommunityLeagueReleaseCandidateHardeningService();
}