import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function assertFileMarkers(path: string, markers: string[]): void {
  const filePath = join(process.cwd(), path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing homepage composition file: ${path}`);
  }

  const content = readFileSync(filePath, 'utf8');

  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`File ${path} missing marker: ${marker}`);
    }
  }
}

async function main(): Promise<void> {
  const { createCommunityLeagueHomepageCompositionService } = await import('../lib/homepage');
  const service = createCommunityLeagueHomepageCompositionService(process.cwd());

  const hero = service.getHomepageHero();

  if (!hero.title.includes('community action')) {
    throw new Error('Homepage hero must explain community action value.');
  }

  if (hero.primaryAction.href !== '/clubs') {
    throw new Error(`Expected primary homepage action to point to /clubs, received ${hero.primaryAction.href}`);
  }

  const callsToAction = service.getHomepageCallsToAction();

  if (callsToAction.length < 4) {
    throw new Error(`Expected at least 4 homepage calls to action, received ${callsToAction.length}`);
  }

  const requiredActionHrefs = ['/clubs', '/submit-action', '/leaderboard', '/impact-map'];

  for (const href of requiredActionHrefs) {
    if (!callsToAction.some((action) => action.href === href)) {
      throw new Error(`Required homepage call to action missing: ${href}`);
    }
  }

  const metrics = service.getHomepageMetrics();

  if (metrics.length < 4) {
    throw new Error(`Expected at least 4 homepage metrics, received ${metrics.length}`);
  }

  if (!metrics.every((metric) => metric.proofReference.includes(':'))) {
    throw new Error('Every homepage metric must expose a proof reference.');
  }

  const journeyCards = service.getHomepageJourneyCards();

  if (journeyCards.length < 5) {
    throw new Error(`Expected at least 5 homepage journey cards, received ${journeyCards.length}`);
  }

  const requiredJourneyHrefs = ['/clubs', '/dashboard', '/missions', '/submit-action', '/leaderboard'];

  for (const href of requiredJourneyHrefs) {
    if (!journeyCards.some((card) => card.href === href)) {
      throw new Error(`Required homepage journey card missing: ${href}`);
    }
  }

  const trustCards = service.getHomepageTrustCards();

  if (trustCards.length < 4) {
    throw new Error(`Expected at least 4 homepage trust cards, received ${trustCards.length}`);
  }

  const requiredTrustHrefs = ['/evidence', '/moderation', '/activity-feed', '/impact-map'];

  for (const href of requiredTrustHrefs) {
    if (!trustCards.some((card) => card.href === href)) {
      throw new Error(`Required homepage trust card missing: ${href}`);
    }
  }

  const readiness = service.getHomepageCompositionReadiness();

  if (!readiness.visualShellFoundationAccepted) {
    throw new Error('Visual shell foundation must be accepted before homepage composition.');
  }

  if (!readiness.heroPresent) {
    throw new Error('Homepage hero readiness failed.');
  }

  if (!readiness.publicNavigationPresent) {
    throw new Error('Homepage public navigation readiness failed.');
  }

  if (!readiness.supporterJourneyPresent) {
    throw new Error('Homepage supporter journey readiness failed.');
  }

  if (!readiness.competitionJourneyPresent) {
    throw new Error('Homepage competition journey readiness failed.');
  }

  if (!readiness.proofJourneyPresent) {
    throw new Error('Homepage proof journey readiness failed.');
  }

  if (!readiness.adminJourneyPresent) {
    throw new Error('Homepage admin journey readiness failed.');
  }

  if (!readiness.homepageApiReady) {
    throw new Error('Homepage composition API readiness failed.');
  }

  if (!readiness.rootPageReady) {
    throw new Error('Homepage root page readiness failed.');
  }

  const snapshot = service.getHomepageCompositionSnapshot();

  if (snapshot.metrics.length < 4 || snapshot.journeyCards.length < 5 || snapshot.trustCards.length < 4) {
    throw new Error('Homepage composition snapshot must include metrics, journey cards and trust cards.');
  }

  assertFileMarkers('src/lib/homepage/types.ts', [
    'HomepageCompositionSnapshot',
    'HomepageHero',
    'HomepageJourneyCard',
    'HomepageTrustCard',
  ]);
  assertFileMarkers('src/lib/homepage/homepage-composition-service.ts', [
    'CommunityLeagueHomepageCompositionService',
    'getHomepageCompositionSnapshot',
    'getHomepageHero',
    'getHomepageJourneyCards',
    'getHomepageTrustCards',
  ]);
  assertFileMarkers('src/lib/homepage/index.ts', [
    'createCommunityLeagueHomepageCompositionService',
  ]);
  assertFileMarkers('src/app/api/homepage-composition/route.ts', [
    'community-league-homepage-composition',
    'getHomepageCompositionSnapshot',
  ]);
  assertFileMarkers('src/app/page.tsx', [
    'CommunityLeagueHomepage',
    'Public Landing Foundation',
    'Trust and Proof',
  ]);

  process.stdout.write(
    `CL-025A homepage composition / public landing validation passed: ctas=${callsToAction.length}, metrics=${metrics.length}, journey=${journeyCards.length}, trust=${trustCards.length}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-025A homepage composition / public landing validation failed: ${message}\n`);
  process.exit(1);
});