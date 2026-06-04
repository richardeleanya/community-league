export type VisualPolishCheck = {
  key: string;
  label: string;
  status: 'ready' | 'attention' | 'blocked';
  proofReference: string;
};

export type VisualPolishScale = {
  key: string;
  label: string;
  value: string;
  proofReference: string;
};

export type VisualPolishReadiness = {
  homepageCompositionAccepted: true;
  globalCssPresent: boolean;
  shellClassesPresent: boolean;
  responsiveRulesPresent: boolean;
  focusStatesPresent: boolean;
  reducedMotionPresent: boolean;
  printRulesPresent: boolean;
  visualPolishApiReady: boolean;
  visualPolishPageReady: boolean;
};

export type VisualPolishSnapshot = {
  generatedAt: string;
  headline: string;
  checks: VisualPolishCheck[];
  scales: VisualPolishScale[];
  readiness: VisualPolishReadiness;
};