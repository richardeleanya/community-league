import type {
  HostingConnectorDecision,
  HostingDecisionSnapshot,
  HostingTargetCandidate,
} from './types';

const candidates: HostingTargetCandidate[] = [
  {
    key: 'vercel',
    name: 'Vercel',
    decisionStatus: 'selected',
    fitReason:
      'Selected first target because this release candidate is a Next.js application and the deployment path should minimise infrastructure work before product review.',
    requiredInputs: [
      'Git repository connected to the Vercel project import flow',
      'Production Supabase project',
      'Production environment variables',
      'Production domain decision',
    ],
    risks: [
      'Production secrets must be entered only in host secret management',
      'Auth redirect URLs must match the final public URL',
      'Production database migrations must be validated before public launch',
    ],
    nextAction: 'Prepare Vercel project import and environment variable checklist.',
  },
  {
    key: 'render',
    name: 'Render',
    decisionStatus: 'candidate',
    fitReason:
      'Useful as a service-style Node deployment target if Vercel is not selected.',
    requiredInputs: ['Build command', 'Start command', 'Environment variables', 'Production database'],
    risks: ['Service runtime configuration must be managed explicitly'],
    nextAction: 'Hold as fallback target.',
  },
  {
    key: 'railway',
    name: 'Railway',
    decisionStatus: 'candidate',
    fitReason:
      'Useful as a fast deployment target if the team wants project-level environment management.',
    requiredInputs: ['Project import', 'Environment variables', 'Production database'],
    risks: ['Production runtime and scaling settings must be checked before launch'],
    nextAction: 'Hold as fallback target.',
  },
  {
    key: 'docker-vps',
    name: 'Docker / VPS',
    decisionStatus: 'candidate',
    fitReason:
      'Maximum operational control but more server responsibility than required for first product review.',
    requiredInputs: ['Server', 'TLS/domain', 'Dockerfile or compose', 'Monitoring', 'Rollback process'],
    risks: ['Higher operations burden', 'Manual security and patching responsibility'],
    nextAction: 'Do not use for first deployment unless full server operations are required.',
  },
];

const decision: HostingConnectorDecision = {
  selectedTarget: 'Vercel',
  selectedTargetKey: 'vercel',
  reason:
    'Vercel is selected as the first controlled hosting connector target for the Community Premier League release candidate because it aligns with the accepted Next.js application surface and allows deployment target preparation without changing the product codebase.',
  connectorMode: 'manual-git-import',
  productionSecretsRequired: true,
  publicDeploymentBlocked: false,
};

export class CommunityLeagueHostingDecisionService {
  getCandidates(): HostingTargetCandidate[] {
    return candidates;
  }

  getDecision(): HostingConnectorDecision {
    return decision;
  }

  getHostingDecisionSnapshot(): HostingDecisionSnapshot {
    const hostingDecisionBlocked =
      decision.publicDeploymentBlocked ||
      candidates.some((candidate) => candidate.decisionStatus === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League hosting connector decision selects the first deployment target and preserves production secret safety before any live deployment action.',
      acceptedStepCount: 34,
      requiredStepCount: 34,
      candidates,
      decision,
      readiness: {
        localReleaseCandidateAccepted: true,
        productionEnvironmentContractAccepted: true,
        gitRequired: true,
        deploymentTargetSelected: decision.selectedTargetKey === 'vercel',
        hostingDecisionBlocked,
        recommendedNextStep: hostingDecisionBlocked ? 'HOLD' : 'PREPARE_VERCEL_PROJECT_IMPORT',
      },
    };
  }
}

export function createCommunityLeagueHostingDecisionService(): CommunityLeagueHostingDecisionService {
  return new CommunityLeagueHostingDecisionService();
}