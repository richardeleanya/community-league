import type {
  DeploymentOperatorChecklistItem,
  DeploymentOperatorGateSnapshot,
  ExternalManualAction,
} from './types';

const checklist: DeploymentOperatorChecklistItem[] = [
  {
    key: 'local-release-candidate',
    order: 1,
    area: 'Local release candidate',
    action: 'Confirm CL-037 accepted lock and production Supabase contract evidence are present.',
    evidenceRequired: 'CL-037 acceptance lock and CL_RELEASE_EVIDENCE production Supabase contract folder.',
    status: 'ready',
  },
  {
    key: 'git-repository',
    order: 2,
    area: 'Git repository',
    action: 'Create or confirm Git repository and commit accepted source before deployment import.',
    evidenceRequired: 'Git remote URL and commit hash.',
    status: 'external_action_required',
  },
  {
    key: 'production-supabase',
    order: 3,
    area: 'Production database',
    action: 'Create production Supabase project and apply accepted migration sequence.',
    evidenceRequired: 'Production project reference and validation query readback.',
    status: 'external_action_required',
  },
  {
    key: 'production-secrets',
    order: 4,
    area: 'Secret management',
    action: 'Add production environment variables only through Vercel/Supabase secret management.',
    evidenceRequired: 'Host environment variable names confirmed without values.',
    status: 'external_action_required',
  },
  {
    key: 'vercel-import',
    order: 5,
    area: 'Vercel',
    action: 'Import committed Git repository into Vercel as a Next.js project.',
    evidenceRequired: 'Vercel project name, deployment URL and build log outcome.',
    status: 'external_action_required',
  },
  {
    key: 'auth-urls',
    order: 6,
    area: 'Supabase auth',
    action: 'Set production site URL and redirect URLs once deployment URL is known.',
    evidenceRequired: 'Auth URL configuration readback.',
    status: 'external_action_required',
  },
  {
    key: 'post-deployment-smoke',
    order: 7,
    area: 'Runtime proof',
    action: 'Run post-deployment route/API smoke against the live deployment URL.',
    evidenceRequired: 'CL-039 live URL smoke readback.',
    status: 'external_action_required',
  },
  {
    key: 'public-launch-decision',
    order: 8,
    area: 'Launch governance',
    action: 'Confirm GO/NO-GO after live deployment smoke, auth and database checks.',
    evidenceRequired: 'CL-040 public launch acceptance decision.',
    status: 'external_action_required',
  },
];

const manualActions: ExternalManualAction[] = [
  {
    key: 'create-git-remote',
    owner: 'operator',
    action: 'Initialise/connect Git repository and push release candidate source.',
    systemCannotPerformReason:
      'Repository hosting requires user account permissions and local Git remote choice.',
    requiredBeforePublicLaunch: true,
    status: 'external_action_required',
  },
  {
    key: 'create-production-supabase',
    owner: 'operator',
    action: 'Create production Supabase project and apply migrations.',
    systemCannotPerformReason:
      'Production Supabase project creation requires external account access and secret handling.',
    requiredBeforePublicLaunch: true,
    status: 'external_action_required',
  },
  {
    key: 'enter-production-secrets',
    owner: 'operator',
    action: 'Enter production secrets into Vercel/Supabase dashboards.',
    systemCannotPerformReason:
      'Production secrets must not be embedded in scripts, chat output, or repository files.',
    requiredBeforePublicLaunch: true,
    status: 'external_action_required',
  },
  {
    key: 'import-vercel-project',
    owner: 'deployment-host',
    action: 'Import project into Vercel and run deployment.',
    systemCannotPerformReason:
      'Vercel deployment requires external platform access and selected repository connection.',
    requiredBeforePublicLaunch: true,
    status: 'external_action_required',
  },
  {
    key: 'return-live-readback',
    owner: 'founder',
    action: 'Paste live deployment URL, Vercel build output and Supabase validation output back into the controlled workflow.',
    systemCannotPerformReason:
      'Live external results must be captured after manual deployment actions are completed.',
    requiredBeforePublicLaunch: true,
    status: 'external_action_required',
  },
];

export class CommunityLeagueDeploymentOperatorGateService {
  getChecklist(): DeploymentOperatorChecklistItem[] {
    return checklist;
  }

  getManualActions(): ExternalManualAction[] {
    return manualActions;
  }

  getDeploymentOperatorGateSnapshot(): DeploymentOperatorGateSnapshot {
    const localWorkBlocked =
      checklist.some((item) => item.status === 'blocked') ||
      manualActions.some((item) => item.status === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League production deployment operator gate separates completed local release-candidate work from external deployment actions that must be performed in Git, Supabase and Vercel without exposing production secrets.',
      acceptedStepCount: 37,
      requiredStepCount: 37,
      checklist,
      manualActions,
      decision: {
        localReleaseCandidateAccepted: true,
        productionSecretsEmbedded: false,
        externalActionsRequired: true,
        localWorkBlocked,
        recommendedNextStep: localWorkBlocked
          ? 'HOLD'
          : 'PERFORM_EXTERNAL_DEPLOYMENT_ACTIONS_AND_RETURN_LIVE_READBACK',
      },
    };
  }
}

export function createCommunityLeagueDeploymentOperatorGateService(): CommunityLeagueDeploymentOperatorGateService {
  return new CommunityLeagueDeploymentOperatorGateService();
}