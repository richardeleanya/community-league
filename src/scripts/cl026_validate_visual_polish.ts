import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing visual polish file: ${path}`);
  }

  const content = readFileSync(filePath, 'utf8');

  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`File ${path} missing marker: ${marker}`);
    }
  }
}

async function main(): Promise<void> {
  const { createCommunityLeagueVisualPolishService } = await import('../lib/visual-polish');
  const service = createCommunityLeagueVisualPolishService(process.cwd());

  const scales = service.getVisualPolishScales();

  if (scales.length < 4) {
    throw new Error(`Expected at least 4 visual polish scales, received ${scales.length}`);
  }

  const checks = service.getVisualPolishChecks();

  if (checks.length < 8) {
    throw new Error(`Expected at least 8 visual polish checks, received ${checks.length}`);
  }

  const blocked = checks.filter((check) => check.status === 'blocked');

  if (blocked.length > 0) {
    throw new Error(`Visual polish checks blocked: ${blocked.map((check) => check.key).join(', ')}`);
  }

  if (!checks.every((check) => check.proofReference.includes('globals.css:'))) {
    throw new Error('Every visual polish check must expose a globals.css proof reference.');
  }

  const readiness = service.getVisualPolishReadiness();

  if (!readiness.homepageCompositionAccepted) {
    throw new Error('Homepage composition must be accepted before visual polish.');
  }

  if (!readiness.globalCssPresent) {
    throw new Error('Global CSS readiness failed.');
  }

  if (!readiness.shellClassesPresent) {
    throw new Error('Shell class readiness failed.');
  }

  if (!readiness.responsiveRulesPresent) {
    throw new Error('Responsive rule readiness failed.');
  }

  if (!readiness.focusStatesPresent) {
    throw new Error('Focus state readiness failed.');
  }

  if (!readiness.reducedMotionPresent) {
    throw new Error('Reduced motion readiness failed.');
  }

  if (!readiness.printRulesPresent) {
    throw new Error('Print proof readiness failed.');
  }

  if (!readiness.visualPolishApiReady) {
    throw new Error('Visual polish API readiness failed.');
  }

  if (!readiness.visualPolishPageReady) {
    throw new Error('Visual polish page readiness failed.');
  }

  const snapshot = service.getVisualPolishSnapshot();

  if (snapshot.scales.length < 4 || snapshot.checks.length < 8) {
    throw new Error('Visual polish snapshot must include scales and checks.');
  }

  assertFileMarkers('src/lib/visual-polish/types.ts', [
    'VisualPolishSnapshot',
    'VisualPolishReadiness',
    'VisualPolishCheck',
    'VisualPolishScale',
  ]);
  assertFileMarkers('src/lib/visual-polish/visual-polish-service.ts', [
    'CommunityLeagueVisualPolishService',
    'getVisualPolishSnapshot',
    'getVisualPolishChecks',
    'getVisualPolishReadiness',
  ]);
  assertFileMarkers('src/lib/visual-polish/index.ts', [
    'createCommunityLeagueVisualPolishService',
  ]);
  assertFileMarkers('src/app/globals.css', [
    'CL-026A responsive visual polish / public shell maturity pass',
    '.main-shell',
    '.hero-panel',
    '.validation-panel',
    '.metric-card',
    '@media (max-width: 980px)',
    '@media (max-width: 760px)',
    ':focus-visible',
    'prefers-reduced-motion',
    '@media print',
  ]);
  assertFileMarkers('src/app/api/visual-polish/route.ts', [
    'community-league-visual-polish',
    'getVisualPolishSnapshot',
  ]);
  assertFileMarkers('src/app/visual-polish/page.tsx', [
    'Responsive visual polish and public shell maturity pass.',
    'Maturity Checks',
  ]);

  process.stdout.write(
    `CL-026A responsive visual polish / public shell maturity validation passed: checks=${checks.length}, scales=${scales.length}, blocked=${blocked.length}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-026A responsive visual polish / public shell maturity validation failed: ${message}\n`);
  process.exit(1);
});