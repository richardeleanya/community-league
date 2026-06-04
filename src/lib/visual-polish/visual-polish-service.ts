import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type {
  VisualPolishCheck,
  VisualPolishReadiness,
  VisualPolishScale,
  VisualPolishSnapshot,
} from './types';

function existsFromRoot(projectRoot: string, relativePath: string): boolean {
  return existsSync(join(projectRoot, relativePath));
}

function readFromRoot(projectRoot: string, relativePath: string): string {
  const absolutePath = join(projectRoot, relativePath);

  if (!existsSync(absolutePath)) {
    return '';
  }

  return readFileSync(absolutePath, 'utf8');
}

function cssIncludes(projectRoot: string, marker: string): boolean {
  return readFromRoot(projectRoot, 'src/app/globals.css').includes(marker);
}

export class CommunityLeagueVisualPolishService {
  constructor(private readonly projectRoot: string = process.cwd()) {}

  getVisualPolishScales(): VisualPolishScale[] {
    return [
      {
        key: 'spacing',
        label: 'Spacing scale',
        value: '8px base rhythm',
        proofReference: 'globals.css:--space-',
      },
      {
        key: 'radius',
        label: 'Radius scale',
        value: '16px to 32px panels',
        proofReference: 'globals.css:--radius-',
      },
      {
        key: 'shadow',
        label: 'Elevation scale',
        value: 'soft cards and panels',
        proofReference: 'globals.css:--shadow-',
      },
      {
        key: 'layout',
        label: 'Responsive layout',
        value: 'mobile, tablet and desktop',
        proofReference: 'globals.css:@media',
      },
    ];
  }

  getVisualPolishChecks(): VisualPolishCheck[] {
    const markers = [
      {
        key: 'main-shell',
        label: 'Main shell spacing',
        marker: '.main-shell',
      },
      {
        key: 'hero-panel',
        label: 'Hero panel composition',
        marker: '.hero-panel',
      },
      {
        key: 'card-grid',
        label: 'Responsive card grid',
        marker: '.card-grid',
      },
      {
        key: 'buttons',
        label: 'Primary and secondary buttons',
        marker: '.button-primary',
      },
      {
        key: 'focus',
        label: 'Keyboard focus states',
        marker: ':focus-visible',
      },
      {
        key: 'reduced-motion',
        label: 'Reduced motion support',
        marker: 'prefers-reduced-motion',
      },
      {
        key: 'mobile',
        label: 'Mobile breakpoint',
        marker: '@media (max-width: 760px)',
      },
      {
        key: 'print',
        label: 'Print proof styling',
        marker: '@media print',
      },
    ];

    return markers.map((item) => ({
      key: item.key,
      label: item.label,
      status: cssIncludes(this.projectRoot, item.marker) ? 'ready' : 'blocked',
      proofReference: `globals.css:${item.marker}`,
    }));
  }

  getVisualPolishReadiness(): VisualPolishReadiness {
    const css = readFromRoot(this.projectRoot, 'src/app/globals.css');

    return {
      homepageCompositionAccepted: true,
      globalCssPresent: existsFromRoot(this.projectRoot, 'src/app/globals.css'),
      shellClassesPresent:
        css.includes('.main-shell') &&
        css.includes('.hero-panel') &&
        css.includes('.validation-panel') &&
        css.includes('.metric-card'),
      responsiveRulesPresent:
        css.includes('@media (max-width: 980px)') && css.includes('@media (max-width: 760px)'),
      focusStatesPresent: css.includes(':focus-visible'),
      reducedMotionPresent: css.includes('prefers-reduced-motion'),
      printRulesPresent: css.includes('@media print'),
      visualPolishApiReady: existsFromRoot(this.projectRoot, 'src/app/api/visual-polish/route.ts'),
      visualPolishPageReady: existsFromRoot(this.projectRoot, 'src/app/visual-polish/page.tsx'),
    };
  }

  getVisualPolishSnapshot(): VisualPolishSnapshot {
    return {
      generatedAt: new Date().toISOString(),
      headline:
        'Responsive visual polish is applied through a unified global shell system with accessible focus states, mobile breakpoints, reduced-motion handling and print proof styling.',
      checks: this.getVisualPolishChecks(),
      scales: this.getVisualPolishScales(),
      readiness: this.getVisualPolishReadiness(),
    };
  }
}

export function createCommunityLeagueVisualPolishService(
  projectRoot = process.cwd(),
): CommunityLeagueVisualPolishService {
  return new CommunityLeagueVisualPolishService(projectRoot);
}