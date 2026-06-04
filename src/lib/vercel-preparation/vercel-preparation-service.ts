import type {
  VercelImportStep,
  VercelPreparationSnapshot,
  VercelProductionVariable,
} from './types';

const importSteps: VercelImportStep[] = [
  {
    key: 'commit-source',
    order: 1,
    title: 'Commit accepted release candidate source',
    instruction:
      'Commit the CL-035 accepted source, reports and deployment templates before importing into Vercel.',
    evidence: 'CL-035 acceptance lock and CL-036 Vercel preparation template.',
    status: 'requires_input',
  },
  {
    key: 'open-vercel',
    order: 2,
    title: 'Open Vercel and create project',
    instruction:
      'Create a new Vercel project using the Community League Git repository.',
    evidence: 'Selected target is Vercel from CL-035 hosting connector decision.',
    status: 'requires_input',
  },
  {
    key: 'configure-build',
    order: 3,
    title: 'Confirm build settings',
    instruction:
      'Use npm install as install command and npm run app:build as build command.',
    evidence: 'vercel.json is written with framework nextjs and npm run app:build.',
    status: 'ready',
  },
  {
    key: 'add-env-vars',
    order: 4,
    title: 'Add production environment variables',
    instruction:
      'Copy variable names from CL_DEPLOYMENT_TEMPLATES/vercel/vercel.production.env.template into Vercel Project Settings and replace placeholders with production values.',
    evidence: 'Production variable template written without real secrets.',
    status: 'requires_input',
  },
  {
    key: 'production-supabase',
    order: 5,
    title: 'Connect production Supabase',
    instruction:
      'Create or select the production Supabase project, apply migrations, then use production Supabase values in Vercel.',
    evidence: 'CL-034 production environment contract requires external production database and secrets.',
    status: 'requires_input',
  },
  {
    key: 'deploy-preview',
    order: 6,
    title: 'Deploy preview and verify runtime',
    instruction:
      'Deploy through Vercel, then run a post-deployment route smoke and auth/domain check before public launch.',
    evidence: 'Local runtime and build gates are accepted through CL-030 and CL-035.',
    status: 'requires_input',
  },
];

const productionVariables: VercelProductionVariable[] = [
  {
    key: 'DATABASE_URL',
    required: true,
    environment: 'production',
    purpose: 'Production Prisma/Postgres connection.',
    source: 'Production Supabase database settings.',
    valuePolicy: 'host-secret-only',
    status: 'requires_input',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    environment: 'preview-and-production',
    purpose: 'Browser/client Supabase project URL.',
    source: 'Production Supabase project API settings.',
    valuePolicy: 'host-secret-only',
    status: 'requires_input',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    environment: 'preview-and-production',
    purpose: 'Browser-safe Supabase anon key.',
    source: 'Production Supabase project API settings.',
    valuePolicy: 'host-secret-only',
    status: 'requires_input',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    environment: 'production',
    purpose: 'Server-side administrative Supabase operations where needed.',
    source: 'Production Supabase service role key.',
    valuePolicy: 'host-secret-only',
    status: 'requires_input',
  },
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    required: true,
    environment: 'preview-and-production',
    purpose: 'Canonical public site URL for links and auth redirects.',
    source: 'Selected Vercel deployment domain or custom domain.',
    valuePolicy: 'host-secret-only',
    status: 'requires_input',
  },
  {
    key: 'NODE_ENV',
    required: true,
    environment: 'production',
    purpose: 'Production runtime mode.',
    source: 'Vercel runtime setting.',
    valuePolicy: 'placeholder-only',
    status: 'ready',
  },
];

export class CommunityLeagueVercelPreparationService {
  getImportSteps(): VercelImportStep[] {
    return importSteps;
  }

  getProductionVariables(): VercelProductionVariable[] {
    return productionVariables;
  }

  getVercelPreparationSnapshot(): VercelPreparationSnapshot {
    const projectImportBlocked =
      importSteps.some((step) => step.status === 'blocked') ||
      productionVariables.some((variable) => variable.status === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League Vercel project import preparation converts the selected hosting decision into a safe Vercel import checklist and production variable template.',
      acceptedStepCount: 35,
      requiredStepCount: 35,
      selectedTarget: 'vercel',
      importSteps,
      productionVariables,
      decision: {
        vercelConfigWritten: true,
        variableTemplateWritten: true,
        productionSecretsEmbedded: false,
        projectImportBlocked,
        recommendedNextStep: projectImportBlocked
          ? 'HOLD'
          : 'CREATE_VERCEL_PROJECT_AND_ADD_ENVIRONMENT_VARIABLES',
      },
    };
  }
}

export function createCommunityLeagueVercelPreparationService(): CommunityLeagueVercelPreparationService {
  return new CommunityLeagueVercelPreparationService();
}