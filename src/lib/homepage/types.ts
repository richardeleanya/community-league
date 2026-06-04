export type HomepageCallToAction = {
  key: string;
  label: string;
  href: string;
  intent: 'primary' | 'secondary' | 'proof';
  proofReference: string;
};

export type HomepageHero = {
  eyebrow: string;
  title: string;
  summary: string;
  primaryAction: HomepageCallToAction;
  secondaryAction: HomepageCallToAction;
};

export type HomepagePublicMetric = {
  key: string;
  label: string;
  value: string;
  summary: string;
  proofReference: string;
};

export type HomepageJourneyCard = {
  key: string;
  title: string;
  summary: string;
  href: string;
  step: number;
  proofReference: string;
};

export type HomepageTrustCard = {
  key: string;
  title: string;
  summary: string;
  href: string;
  proofReference: string;
};

export type HomepageCompositionReadiness = {
  visualShellFoundationAccepted: true;
  heroPresent: boolean;
  publicNavigationPresent: boolean;
  supporterJourneyPresent: boolean;
  competitionJourneyPresent: boolean;
  proofJourneyPresent: boolean;
  adminJourneyPresent: boolean;
  homepageApiReady: boolean;
  rootPageReady: boolean;
};

export type HomepageCompositionSnapshot = {
  generatedAt: string;
  headline: string;
  hero: HomepageHero;
  metrics: HomepagePublicMetric[];
  journeyCards: HomepageJourneyCard[];
  trustCards: HomepageTrustCard[];
  callsToAction: HomepageCallToAction[];
  readiness: HomepageCompositionReadiness;
};