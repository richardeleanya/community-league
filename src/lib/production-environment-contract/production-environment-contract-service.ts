import type {
  DeploymentTargetOption,
  ProductionEnvironmentContractSnapshot,
  ProductionEnvironmentRequirement,
  ProductionSecretRequirement,
} from './types';

const requirements: ProductionEnvironmentRequirement[] = [
  {
    key: 'accepted-release-candidate',
    area: 'Release governance',
    requirement: 'The local release candidate must have all accepted locks through deployment readiness.',
    localEvidence: 'CL-033 acceptance lock confirms launch checklist and deployment readiness register.',
    productionInputRequired: 'None before target selection.',
    status: 'ready',
  },
  {
    key: 'database-target',
    area: 'Database',
    requirement: 'Production Postgres/Supabase database target must be selected before public launch.',
    localEvidence: 'Local Supabase database foundation is accepted and validated.',
    productionInputRequired: 'Production Supabase project URL, database URL and migration execution plan.',
    status: 'attention',
  },
  {
    key: 'auth-target',
    area: 'Authentication',
    requirement: 'Production auth site URL, redirect URLs and email settings must match the public deployment URL.',
    localEvidence: 'Authentication/account foundation is accepted locally.',
    productionInputRequired: 'Production public URL and auth provider settings.',
    status: 'attention',
  },
  {
    key: 'storage-target',
    area: 'Evidence storage',
    requirement: 'Production evidence/photo storage must be configured before live uploads.',
    localEvidence: 'Evidence surfaces, submission flow and local Supabase storage path are represented.',
    productionInputRequired: 'Production storage bucket, upload policy and access policy.',
    status: 'attention',
  },
  {
    key: 'environment-secrets',
    area: 'Secrets',
    requirement: 'Production secrets must be injected through host secret management and must not be committed.',
    localEvidence: 'Local .env and .env.local are used for local validation only.',
    productionInputRequired: 'Host-managed production variables.',
    status: 'attention',
  },
  {
    key: 'hosting-target',
    area: 'Hosting',
    requirement: 'Deployment platform must support Next.js production build/start or hosted Next runtime.',
    localEvidence: 'Next production build and local runtime smoke passed.',
    productionInputRequired: 'Vercel, Render, Railway, Azure, Docker host or equivalent selection.',
    status: 'attention',
  },
  {
    key: 'domain-dns',
    area: 'Public access',
    requirement: 'Domain and DNS must point to selected deployment target before public release.',
    localEvidence: 'No public DNS was needed for local release candidate acceptance.',
    productionInputRequired: 'Domain name, DNS provider and target host records.',
    status: 'attention',
  },
  {
    key: 'monitoring-rollback',
    area: 'Operations',
    requirement: 'Production monitoring and rollback/version tag process must be prepared.',
    localEvidence: 'Phase backups, reports and acceptance locks exist for every controlled phase.',
    productionInputRequired: 'Deployment version tag, rollback target and monitoring method.',
    status: 'attention',
  },
];

const targetOptions: DeploymentTargetOption[] = [
  {
    key: 'vercel',
    target: 'Vercel',
    fit: 'Strong fit for Next.js application runtime and preview deployments.',
    prerequisites: ['Git repository connection', 'Environment variables', 'Production Supabase target'],
    notes: 'Best default option when using hosted Next.js with managed previews.',
    status: 'required',
  },
  {
    key: 'render',
    target: 'Render',
    fit: 'Good fit for Node/Next app with service-based deployment.',
    prerequisites: ['Build command', 'Start command', 'Environment variables'],
    notes: 'Useful when a service-style deployment and logs are preferred.',
    status: 'required',
  },
  {
    key: 'railway',
    target: 'Railway',
    fit: 'Good fit for fast Node deployment with environment variable management.',
    prerequisites: ['Project import', 'Environment variables', 'Build/start command confirmation'],
    notes: 'Useful for rapid deployment once production database is selected.',
    status: 'required',
  },
  {
    key: 'docker-vps',
    target: 'Docker / VPS',
    fit: 'Maximum control but higher operational responsibility.',
    prerequisites: ['Dockerfile/compose contract', 'Server hardening', 'TLS/domain setup'],
    notes: 'Not recommended as first deployment unless full server operations are intended.',
    status: 'required',
  },
];

const secrets: ProductionSecretRequirement[] = [
  {
    key: 'database-url',
    variableName: 'DATABASE_URL',
    purpose: 'Production Prisma/Postgres database connection.',
    source: 'Production Supabase or Postgres provider.',
    requiredForLaunch: true,
    status: 'required',
  },
  {
    key: 'supabase-url',
    variableName: 'NEXT_PUBLIC_SUPABASE_URL',
    purpose: 'Browser/client Supabase project URL.',
    source: 'Production Supabase project.',
    requiredForLaunch: true,
    status: 'required',
  },
  {
    key: 'supabase-anon',
    variableName: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    purpose: 'Browser-safe Supabase anonymous key.',
    source: 'Production Supabase project API settings.',
    requiredForLaunch: true,
    status: 'required',
  },
  {
    key: 'supabase-service-role',
    variableName: 'SUPABASE_SERVICE_ROLE_KEY',
    purpose: 'Server-side administrative Supabase operations where required.',
    source: 'Production Supabase project API settings.',
    requiredForLaunch: true,
    status: 'required',
  },
  {
    key: 'site-url',
    variableName: 'NEXT_PUBLIC_SITE_URL',
    purpose: 'Canonical public site URL and auth redirect alignment.',
    source: 'Selected deployment domain.',
    requiredForLaunch: true,
    status: 'required',
  },
  {
    key: 'node-env',
    variableName: 'NODE_ENV',
    purpose: 'Production runtime mode.',
    source: 'Deployment platform.',
    requiredForLaunch: true,
    status: 'required',
  },
];

export class CommunityLeagueProductionEnvironmentContractService {
  getRequirements(): ProductionEnvironmentRequirement[] {
    return requirements;
  }

  getTargetOptions(): DeploymentTargetOption[] {
    return targetOptions;
  }

  getSecrets(): ProductionSecretRequirement[] {
    return secrets;
  }

  getProductionEnvironmentContractSnapshot(): ProductionEnvironmentContractSnapshot {
    const contractBlocked =
      requirements.some((item) => item.status === 'blocked') ||
      targetOptions.some((item) => item.status === 'blocked') ||
      secrets.some((item) => item.status === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League production environment contract defines the deployment target, database, auth, storage, secrets, domain and rollback requirements without embedding production secrets.',
      acceptedStepCount: 33,
      requiredStepCount: 33,
      requirements,
      targetOptions,
      secrets,
      contractDecision: {
        localReleaseCandidateAccepted: true,
        productionSecretsMustRemainExternal: true,
        targetSelectionRequired: true,
        contractBlocked,
        recommendedNextStep: contractBlocked ? 'HOLD' : 'SELECT_DEPLOYMENT_TARGET',
      },
    };
  }
}

export function createCommunityLeagueProductionEnvironmentContractService(): CommunityLeagueProductionEnvironmentContractService {
  return new CommunityLeagueProductionEnvironmentContractService();
}