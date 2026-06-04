import type {
  DeploymentReadinessItem,
  DeploymentReadinessSnapshot,
  LaunchChecklistItem,
} from './types';

const launchChecklist: LaunchChecklistItem[] = [
  {
    key: 'accepted-chain',
    area: 'Governance',
    item: 'Step 1 through Step 32 acceptance locks are present.',
    owner: 'Product Owner',
    evidence: 'CL_ACCEPTANCE lock chain through CL-032.',
    status: 'ready',
  },
  {
    key: 'database-local',
    area: 'Database',
    item: 'Local Supabase database foundation is validated and acceptance-locked.',
    owner: 'Technical Owner',
    evidence: 'CL-001 live database validation and acceptance lock.',
    status: 'ready',
  },
  {
    key: 'app-build',
    area: 'Application',
    item: 'Next production build passes after launch decision register.',
    owner: 'Technical Owner',
    evidence: 'CL-032 build passed and CL-033 will re-run build.',
    status: 'ready',
  },
  {
    key: 'runtime-proof',
    area: 'Runtime',
    item: 'Final local runtime proof route set passed.',
    owner: 'Technical Owner',
    evidence: 'CL-030 final runtime proof register.',
    status: 'ready',
  },
  {
    key: 'product-walkthrough',
    area: 'Product',
    item: 'Product walkthrough and persona journey register are accepted.',
    owner: 'Product Owner',
    evidence: 'CL-031 product walkthrough evidence pack.',
    status: 'ready',
  },
  {
    key: 'founder-review',
    area: 'Launch decision',
    item: 'Founder/product review notes and launch decision are accepted.',
    owner: 'Founder',
    evidence: 'CL-032 launch decision evidence pack.',
    status: 'ready',
  },
  {
    key: 'external-secrets',
    area: 'Deployment',
    item: 'External deployment secrets must be provided for non-local deployment.',
    owner: 'Deployment Owner',
    evidence: 'Local .env exists, production secrets are intentionally not embedded in repository.',
    status: 'attention',
  },
  {
    key: 'hosting-target',
    area: 'Deployment',
    item: 'Hosting target must be selected before live internet deployment.',
    owner: 'Deployment Owner',
    evidence: 'Local release candidate is ready; external target selection remains a launch deployment decision.',
    status: 'attention',
  },
  {
    key: 'domain-dns',
    area: 'Deployment',
    item: 'Domain, DNS and public URL must be selected before public release.',
    owner: 'Deployment Owner',
    evidence: 'No public domain is required for local acceptance; public launch requires DNS decision.',
    status: 'attention',
  },
  {
    key: 'monitoring',
    area: 'Operations',
    item: 'Post-deployment monitoring and rollback notes must be created for production launch.',
    owner: 'Operations Owner',
    evidence: 'Local QA and evidence packs exist; production monitoring is environment-specific.',
    status: 'attention',
  },
];

const deploymentReadiness: DeploymentReadinessItem[] = [
  {
    key: 'node-runtime',
    environmentArea: 'Runtime',
    requirement: 'Node/npm must be available on deployment/build environment.',
    localEvidence: 'Node and npm were used successfully through accepted build gates.',
    deploymentNote: 'Pin deployment image/runtime to the project-supported Node version before production launch.',
    status: 'ready',
  },
  {
    key: 'supabase-database',
    environmentArea: 'Database',
    requirement: 'Production Supabase project or equivalent Postgres target must be available.',
    localEvidence: 'Local Supabase foundation is validated and accepted.',
    deploymentNote: 'Apply migration sequence and verify counts before pointing production application at the database.',
    status: 'attention',
  },
  {
    key: 'environment-variables',
    environmentArea: 'Secrets',
    requirement: 'DATABASE_URL, Supabase URL and keys must be configured in the target environment.',
    localEvidence: '.env and .env.local supported local validation.',
    deploymentNote: 'Never commit production secrets; add them through host secret management.',
    status: 'attention',
  },
  {
    key: 'storage',
    environmentArea: 'Evidence storage',
    requirement: 'Storage bucket policy must support community action evidence photos.',
    localEvidence: 'Storage was part of local Supabase environment output.',
    deploymentNote: 'Create production storage bucket and policy before accepting live evidence uploads.',
    status: 'attention',
  },
  {
    key: 'auth',
    environmentArea: 'Authentication',
    requirement: 'Auth redirects, site URL and email settings must match the public deployment URL.',
    localEvidence: 'Auth/account foundation is accepted locally.',
    deploymentNote: 'Configure production auth redirect URLs after domain selection.',
    status: 'attention',
  },
  {
    key: 'build-command',
    environmentArea: 'Build',
    requirement: 'Deployment build command must run next build successfully.',
    localEvidence: 'npm run app:build passed through release gates.',
    deploymentNote: 'Use npm install then npm run app:build on deployment target.',
    status: 'ready',
  },
  {
    key: 'start-command',
    environmentArea: 'Runtime',
    requirement: 'Deployment start command must run next start or platform equivalent.',
    localEvidence: 'CL-030 local next start runtime proof passed.',
    deploymentNote: 'Use npm run app:start or host-provided Next runtime.',
    status: 'ready',
  },
  {
    key: 'rollback',
    environmentArea: 'Operations',
    requirement: 'Rollback point must be available before public launch.',
    localEvidence: 'Backups and acceptance locks are available for every controlled phase.',
    deploymentNote: 'Create deployment artifact/version tag before public launch.',
    status: 'attention',
  },
];

export class CommunityLeagueDeploymentReadinessService {
  getLaunchChecklist(): LaunchChecklistItem[] {
    return launchChecklist;
  }

  getDeploymentReadiness(): DeploymentReadinessItem[] {
    return deploymentReadiness;
  }

  getDeploymentReadinessSnapshot(): DeploymentReadinessSnapshot {
    const deploymentBlocked =
      launchChecklist.some((item) => item.status === 'blocked') ||
      deploymentReadiness.some((item) => item.status === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League launch checklist and deployment readiness register separates accepted local release-candidate readiness from external hosting, secrets, DNS and production environment decisions.',
      acceptedStepCount: 32,
      requiredStepCount: 32,
      launchChecklist,
      deploymentReadiness,
      handoff: {
        localReleaseCandidateReady: true,
        externalDeploymentRequiresSecrets: true,
        deploymentBlocked,
        recommendedNextStep: deploymentBlocked ? 'HOLD' : 'PREPARE_DEPLOYMENT_TARGET',
      },
    };
  }
}

export function createCommunityLeagueDeploymentReadinessService(): CommunityLeagueDeploymentReadinessService {
  return new CommunityLeagueDeploymentReadinessService();
}