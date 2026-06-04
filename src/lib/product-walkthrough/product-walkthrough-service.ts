import type { PersonaJourneyItem, ProductWalkthroughSnapshot, ProductWalkthroughStage } from './types';

const stages: ProductWalkthroughStage[] = [
  {
    step: 1,
    area: 'Public entry',
    route: '/',
    actor: 'Visitor',
    walkthroughIntent: 'Understand the Community Premier League value proposition and enter the product.',
    expectedEvidence: 'Homepage composition and public landing surface accepted.',
    status: 'ready',
  },
  {
    step: 2,
    area: 'Club discovery',
    route: '/clubs',
    actor: 'Supporter',
    walkthroughIntent: 'Find a club and understand the league context.',
    expectedEvidence: 'Club and league discovery surface accepted.',
    status: 'ready',
  },
  {
    step: 3,
    area: 'Supporter command centre',
    route: '/dashboard',
    actor: 'Supporter',
    walkthroughIntent: 'View supporter points, club position, active missions and next action.',
    expectedEvidence: 'Supporter dashboard foundation accepted.',
    status: 'ready',
  },
  {
    step: 4,
    area: 'Mission participation',
    route: '/missions',
    actor: 'Supporter',
    walkthroughIntent: 'Choose a fixture mission and understand action requirements.',
    expectedEvidence: 'Mission catalogue and fixture mission surface accepted.',
    status: 'ready',
  },
  {
    step: 5,
    area: 'Action submission',
    route: '/submit-action',
    actor: 'Supporter',
    walkthroughIntent: 'Submit verified community action evidence with validation.',
    expectedEvidence: 'Community action submission foundation accepted.',
    status: 'ready',
  },
  {
    step: 6,
    area: 'Verification and evidence',
    route: '/verification-queue',
    actor: 'Moderator',
    walkthroughIntent: 'Review submitted actions before points are released.',
    expectedEvidence: 'Verification queue and evidence detail surfaces accepted.',
    status: 'ready',
  },
  {
    step: 7,
    area: 'Scoring and leaderboard',
    route: '/leaderboard',
    actor: 'Supporter / Club',
    walkthroughIntent: 'See league table movement and supporter rankings after awards.',
    expectedEvidence: 'Points award and leaderboard surfaces accepted.',
    status: 'ready',
  },
  {
    step: 8,
    area: 'Recognition and legacy',
    route: '/awards',
    actor: 'Community',
    walkthroughIntent: 'Review award and recognition outputs from community action.',
    expectedEvidence: 'Awards, recognition and legacy impact surfaces accepted.',
    status: 'ready',
  },
  {
    step: 9,
    area: 'Operations and admin',
    route: '/operations',
    actor: 'Admin',
    walkthroughIntent: 'Review platform operations overview, settings and activity feed.',
    expectedEvidence: 'Admin control, activity feed and operations overview accepted.',
    status: 'ready',
  },
  {
    step: 10,
    area: 'Release evidence',
    route: '/final-acceptance',
    actor: 'Product owner',
    walkthroughIntent: 'Review final acceptance proof chain and release candidate position.',
    expectedEvidence: 'Step 30 final acceptance pack accepted.',
    status: 'ready',
  },
];

const personas: PersonaJourneyItem[] = [
  {
    persona: 'New supporter',
    entryRoute: '/',
    primaryGoal: 'Join the community league through a club and understand the first action path.',
    successPath: ['/', '/clubs', '/onboarding', '/dashboard', '/missions', '/submit-action'],
    proofOutput: 'Registration, profile, dashboard and action submission foundations are represented.',
    status: 'ready',
  },
  {
    persona: 'Returning supporter',
    entryRoute: '/dashboard',
    primaryGoal: 'See current position and submit another community action.',
    successPath: ['/dashboard', '/missions', '/submit-action', '/profiles'],
    proofOutput: 'Dashboard, mission and profile surfaces are represented.',
    status: 'ready',
  },
  {
    persona: 'Moderator',
    entryRoute: '/verification-queue',
    primaryGoal: 'Verify submitted actions and handle suspect evidence.',
    successPath: ['/verification-queue', '/evidence', '/moderation', '/points-award'],
    proofOutput: 'Verification, evidence, moderation and points-award surfaces are represented.',
    status: 'ready',
  },
  {
    persona: 'Club representative',
    entryRoute: '/leaderboard',
    primaryGoal: 'Understand club position, supporter contribution and recognition outputs.',
    successPath: ['/leaderboard', '/profiles', '/awards', '/impact-map'],
    proofOutput: 'Leaderboard, profiles, awards and legacy impact surfaces are represented.',
    status: 'ready',
  },
  {
    persona: 'Platform operator',
    entryRoute: '/operations',
    primaryGoal: 'Review platform readiness, admin controls, settings and release evidence.',
    successPath: ['/operations', '/admin-control', '/activity-feed', '/release-readiness', '/release-candidate', '/final-acceptance'],
    proofOutput: 'Admin, activity, release readiness, hardening and final acceptance surfaces are represented.',
    status: 'ready',
  },
];

export class CommunityLeagueProductWalkthroughService {
  getStages(): ProductWalkthroughStage[] {
    return stages;
  }

  getPersonas(): PersonaJourneyItem[] {
    return personas;
  }

  getProductWalkthroughSnapshot(): ProductWalkthroughSnapshot {
    const productReviewBlocked =
      stages.some((stage) => stage.status === 'blocked') ||
      personas.some((persona) => persona.status === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Community Premier League release candidate review connects the accepted product surfaces into a guided product walkthrough and persona journey register.',
      acceptedStepCount: 30,
      requiredStepCount: 30,
      stages,
      personas,
      reviewDecision: {
        acceptanceChainReady: true,
        finalPackReady: true,
        walkthroughPackReady: true,
        productReviewBlocked,
      },
    };
  }
}

export function createCommunityLeagueProductWalkthroughService(): CommunityLeagueProductWalkthroughService {
  return new CommunityLeagueProductWalkthroughService();
}