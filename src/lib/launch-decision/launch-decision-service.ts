import type { FounderReviewNote, LaunchDecisionCriterion, LaunchDecisionSnapshot } from './types';

const founderReviewNotes: FounderReviewNote[] = [
  {
    key: 'product-purpose',
    area: 'Purpose',
    reviewQuestion: 'Does the product clearly express Community Premier League as a supporter-led community action competition?',
    reviewAnswer: 'Yes. The accepted homepage, dashboard, missions, submission and leaderboard surfaces present the core purpose.',
    evidence: 'CL-025 homepage, CL-009 dashboard, CL-015 missions and CL-013 leaderboard locks.',
    status: 'go',
  },
  {
    key: 'supporter-journey',
    area: 'Supporter journey',
    reviewQuestion: 'Can a supporter understand the path from club discovery to action submission?',
    reviewAnswer: 'Yes. The walkthrough pack maps public entry, club discovery, onboarding, dashboard, missions and submit action.',
    evidence: 'CL-031 product walkthrough evidence.',
    status: 'go',
  },
  {
    key: 'verification-trust',
    area: 'Trust and verification',
    reviewQuestion: 'Is there a clear proof path before points are released?',
    reviewAnswer: 'Yes. Verification queue, evidence detail, moderation and points-award surfaces are accepted.',
    evidence: 'CL-011, CL-016, CL-017 and CL-012 acceptance locks.',
    status: 'go',
  },
  {
    key: 'competition-loop',
    area: 'Competition loop',
    reviewQuestion: 'Is the league table, ranking and recognition loop represented?',
    reviewAnswer: 'Yes. Points award, leaderboard, profiles, awards and legacy impact surfaces are accepted.',
    evidence: 'CL-012, CL-013, CL-014, CL-018 and CL-019 acceptance locks.',
    status: 'go',
  },
  {
    key: 'operator-control',
    area: 'Operations',
    reviewQuestion: 'Can an operator review platform state and admin controls?',
    reviewAnswer: 'Yes. Operations overview, admin control, platform settings and activity feed surfaces are accepted.',
    evidence: 'CL-020, CL-021 and CL-022 acceptance locks.',
    status: 'go',
  },
  {
    key: 'release-evidence',
    area: 'Release evidence',
    reviewQuestion: 'Is release readiness, hardening, final runtime proof and walkthrough evidence present?',
    reviewAnswer: 'Yes. Steps CL-028 through CL-031 provide QA, hardening, final acceptance and walkthrough evidence.',
    evidence: 'CL-028, CL-029, CL-030 and CL-031 acceptance locks.',
    status: 'go',
  },
  {
    key: 'technical-confidence',
    area: 'Technical confidence',
    reviewQuestion: 'Did typecheck, validation scripts and production builds pass across the release gates?',
    reviewAnswer: 'Yes. The release candidate passed typecheck, validation and production build gates through the final sequence.',
    evidence: 'CL-030 and CL-031 reports.',
    status: 'go',
  },
  {
    key: 'launch-position',
    area: 'Launch position',
    reviewQuestion: 'Is the product ready for founder review rather than further foundation scaffolding?',
    reviewAnswer: 'Yes. The foundation chain is complete through release candidate walkthrough and is ready for founder review notes.',
    evidence: 'CL-032 launch decision register.',
    status: 'go',
  },
];

const launchCriteria: LaunchDecisionCriterion[] = [
  {
    key: 'database-foundation',
    area: 'Foundation',
    criterion: 'Database foundation must be accepted, validated and locked.',
    evidence: 'CL-001 accepted live foundation.',
    status: 'go',
  },
  {
    key: 'application-foundation',
    area: 'Foundation',
    criterion: 'Application scaffold, Prisma, Supabase and domain services must be accepted.',
    evidence: 'CL-002 through CL-005 accepted.',
    status: 'go',
  },
  {
    key: 'account-onboarding',
    area: 'User foundation',
    criterion: 'Authentication/account and registration/profile onboarding foundations must be accepted.',
    evidence: 'CL-006 and CL-007 accepted.',
    status: 'go',
  },
  {
    key: 'core-supporter-flow',
    area: 'Supporter flow',
    criterion: 'Discovery, dashboard, mission and submission flow must be accepted.',
    evidence: 'CL-008, CL-009, CL-010 and CL-015 accepted.',
    status: 'go',
  },
  {
    key: 'verification-scoring',
    area: 'Trust and scoring',
    criterion: 'Verification, evidence, moderation, points and leaderboard flow must be accepted.',
    evidence: 'CL-011 through CL-017 accepted.',
    status: 'go',
  },
  {
    key: 'recognition-impact',
    area: 'Outcome',
    criterion: 'Recognition, legacy and activity outputs must be accepted.',
    evidence: 'CL-018, CL-019 and CL-020 accepted.',
    status: 'go',
  },
  {
    key: 'admin-operations',
    area: 'Operations',
    criterion: 'Settings, admin overview and route map must be accepted.',
    evidence: 'CL-021, CL-022 and CL-023 accepted.',
    status: 'go',
  },
  {
    key: 'visual-product-shell',
    area: 'Experience',
    criterion: 'Unified visual shell, homepage and responsive polish must be accepted.',
    evidence: 'CL-024, CL-025 and CL-026 accepted.',
    status: 'go',
  },
  {
    key: 'release-proof',
    area: 'Release',
    criterion: 'Runtime smoke, QA pack, hardening and final acceptance pack must be accepted.',
    evidence: 'CL-027, CL-028, CL-029 and CL-030 accepted.',
    status: 'go',
  },
  {
    key: 'walkthrough-proof',
    area: 'Review',
    criterion: 'Product walkthrough and persona journeys must be accepted.',
    evidence: 'CL-031 accepted.',
    status: 'go',
  },
];

export class CommunityLeagueLaunchDecisionService {
  getFounderReviewNotes(): FounderReviewNote[] {
    return founderReviewNotes;
  }

  getLaunchCriteria(): LaunchDecisionCriterion[] {
    return launchCriteria;
  }

  getLaunchDecisionSnapshot(): LaunchDecisionSnapshot {
    const launchBlocked =
      founderReviewNotes.some((note) => note.status === 'blocked') ||
      launchCriteria.some((criterion) => criterion.status === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League launch decision register converts the accepted release candidate walkthrough into founder review notes and a controlled launch decision position.',
      acceptedStepCount: 31,
      requiredStepCount: 31,
      founderReviewNotes,
      launchCriteria,
      decision: {
        acceptanceChainReady: true,
        walkthroughAccepted: true,
        buildValidated: true,
        launchBlocked,
        recommendedDecision: launchBlocked ? 'HOLD' : 'GO_FOR_FOUNDER_REVIEW',
      },
    };
  }
}

export function createCommunityLeagueLaunchDecisionService(): CommunityLeagueLaunchDecisionService {
  return new CommunityLeagueLaunchDecisionService();
}