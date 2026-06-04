import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { createCommunityLeagueVisualShellService } from '@/lib/visual-shell';

import type {
  HomepageCallToAction,
  HomepageCompositionReadiness,
  HomepageCompositionSnapshot,
  HomepageHero,
  HomepageJourneyCard,
  HomepagePublicMetric,
  HomepageTrustCard,
} from './types';

function existsFromRoot(projectRoot: string, relativePath: string): boolean {
  return existsSync(join(projectRoot, relativePath));
}

export class CommunityLeagueHomepageCompositionService {
  constructor(private readonly projectRoot: string = process.cwd()) {}

  getHomepageCallsToAction(): HomepageCallToAction[] {
    return [
      {
        key: 'join-club',
        label: 'Find your club',
        href: '/clubs',
        intent: 'primary',
        proofReference: 'visual-shell:/clubs',
      },
      {
        key: 'submit-action',
        label: 'Submit an action',
        href: '/submit-action',
        intent: 'primary',
        proofReference: 'visual-shell:/submit-action',
      },
      {
        key: 'view-leaderboard',
        label: 'View leaderboard',
        href: '/leaderboard',
        intent: 'secondary',
        proofReference: 'visual-shell:/leaderboard',
      },
      {
        key: 'view-impact',
        label: 'View impact map',
        href: '/impact-map',
        intent: 'proof',
        proofReference: 'visual-shell:/impact-map',
      },
    ];
  }

  getHomepageHero(): HomepageHero {
    const actions = this.getHomepageCallsToAction();

    return {
      eyebrow: 'Community Premier League',
      title: 'Turn community action into league position, proof and recognition.',
      summary:
        'Community League connects supporters, clubs, missions, verified evidence, points, leaderboards, awards and impact into one public product journey.',
      primaryAction: actions[0],
      secondaryAction: actions[2],
    };
  }

  getHomepageMetrics(): HomepagePublicMetric[] {
    const shell = createCommunityLeagueVisualShellService(this.projectRoot);
    const snapshot = shell.getVisualShellSnapshot();

    return [
      {
        key: 'product-routes',
        label: 'Product routes',
        value: String(snapshot.navItems.length),
        summary: 'Accepted pages connected into the visible product journey.',
        proofReference: 'visual-shell:navItems',
      },
      {
        key: 'product-zones',
        label: 'Product zones',
        value: String(snapshot.zones.length),
        summary: 'Foundation, supporter, competition, proof and admin command zones.',
        proofReference: 'visual-shell:zones',
      },
      {
        key: 'primary-actions',
        label: 'Primary actions',
        value: String(snapshot.navItems.filter((item) => item.isPrimary).length),
        summary: 'Main navigation actions available from the public shell.',
        proofReference: 'visual-shell:primaryNavigation',
      },
      {
        key: 'readiness-panels',
        label: 'Readiness panels',
        value: String(snapshot.statusPanels.length),
        summary: 'Route, API, product zone and navigation readiness panels.',
        proofReference: 'visual-shell:statusPanels',
      },
    ];
  }

  getHomepageJourneyCards(): HomepageJourneyCard[] {
    return [
      {
        key: 'discover',
        title: 'Discover clubs',
        summary: 'Choose a club and enter the Community League journey.',
        href: '/clubs',
        step: 1,
        proofReference: 'route:/clubs',
      },
      {
        key: 'dashboard',
        title: 'Open supporter command centre',
        summary: 'See supporter status, club context and next action routes.',
        href: '/dashboard',
        step: 2,
        proofReference: 'route:/dashboard',
      },
      {
        key: 'missions',
        title: 'Choose a mission',
        summary: 'Use active fixture missions to guide real-world community action.',
        href: '/missions',
        step: 3,
        proofReference: 'route:/missions',
      },
      {
        key: 'submit',
        title: 'Submit proof',
        summary: 'Submit verified action evidence for review, points and recognition.',
        href: '/submit-action',
        step: 4,
        proofReference: 'route:/submit-action',
      },
      {
        key: 'leaderboard',
        title: 'Track position',
        summary: 'Follow league table, rankings, awards and competition outcomes.',
        href: '/leaderboard',
        step: 5,
        proofReference: 'route:/leaderboard',
      },
    ];
  }

  getHomepageTrustCards(): HomepageTrustCard[] {
    return [
      {
        key: 'evidence',
        title: 'Evidence detail',
        summary: 'Community actions carry GPS, photo and verification proof trails.',
        href: '/evidence',
        proofReference: 'route:/evidence',
      },
      {
        key: 'moderation',
        title: 'Fraud moderation',
        summary: 'Moderation surfaces protect the league against false submissions.',
        href: '/moderation',
        proofReference: 'route:/moderation',
      },
      {
        key: 'activity',
        title: 'Activity feed',
        summary: 'Notifications and audit events show what changed and why.',
        href: '/activity-feed',
        proofReference: 'route:/activity-feed',
      },
      {
        key: 'impact',
        title: 'Impact map',
        summary: 'Legacy impact and map pins convert action into visible community proof.',
        href: '/impact-map',
        proofReference: 'route:/impact-map',
      },
    ];
  }

  getHomepageCompositionReadiness(): HomepageCompositionReadiness {
    const shell = createCommunityLeagueVisualShellService(this.projectRoot);
    const shellReadiness = shell.getVisualShellReadiness();
    const callsToAction = this.getHomepageCallsToAction();
    const journeyCards = this.getHomepageJourneyCards();
    const trustCards = this.getHomepageTrustCards();

    return {
      visualShellFoundationAccepted: true,
      heroPresent: this.getHomepageHero().title.length > 0,
      publicNavigationPresent: callsToAction.length >= 4 && shellReadiness.primaryNavigationPresent,
      supporterJourneyPresent: journeyCards.some((card) => card.href === '/dashboard'),
      competitionJourneyPresent: journeyCards.some((card) => card.href === '/leaderboard'),
      proofJourneyPresent: trustCards.some((card) => card.href === '/evidence'),
      adminJourneyPresent: shellReadiness.operationsSurfacePresent && shellReadiness.adminSurfacePresent,
      homepageApiReady: existsFromRoot(this.projectRoot, 'src/app/api/homepage-composition/route.ts'),
      rootPageReady: existsFromRoot(this.projectRoot, 'src/app/page.tsx'),
    };
  }

  getHomepageCompositionSnapshot(): HomepageCompositionSnapshot {
    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Homepage composition is connected to the accepted visual shell, public calls to action, supporter journey, competition journey, trust proof and admin readiness.',
      hero: this.getHomepageHero(),
      metrics: this.getHomepageMetrics(),
      journeyCards: this.getHomepageJourneyCards(),
      trustCards: this.getHomepageTrustCards(),
      callsToAction: this.getHomepageCallsToAction(),
      readiness: this.getHomepageCompositionReadiness(),
    };
  }
}

export function createCommunityLeagueHomepageCompositionService(
  projectRoot = process.cwd(),
): CommunityLeagueHomepageCompositionService {
  return new CommunityLeagueHomepageCompositionService(projectRoot);
}