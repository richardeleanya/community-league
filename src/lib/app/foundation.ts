export type FoundationStepState = 'accepted' | 'active' | 'next';

export type FoundationStep = {
  id: string;
  label: string;
  state: FoundationStepState;
  summary: string;
  proof: string;
};

export const foundationSteps: FoundationStep[] = [
  {
    id: 'CL-001',
    label: 'Database Foundation',
    state: 'accepted',
    summary: 'Supabase/Postgres schema, RLS, functions, seed data and live validation are locked.',
    proof: '17 enums, 21 tables, 94 indexes, 57 policies, 14 triggers, 10 functions, 100 XP levels and 30 settings.',
  },
  {
    id: 'CL-002',
    label: 'Prisma Type Foundation',
    state: 'accepted',
    summary: 'Prisma 6 schema, client generation and model delegates are locked.',
    proof: '21 Prisma models, 17 Prisma enums, typecheck and delegate validation passed.',
  },
  {
    id: 'CL-003',
    label: 'Supabase Client Foundation',
    state: 'accepted',
    summary: 'Typed Supabase browser, server and proxy session-refresh clients are locked.',
    proof: 'Generated database types, browser/server clients, proxy helper and typed auth validation passed.',
  },
  {
    id: 'CL-004',
    label: 'Application Route Scaffold',
    state: 'active',
    summary: 'First Next.js app surface, health route and operational shell scaffold are being created.',
    proof: 'App route scaffold must pass typecheck, validation and production build before acceptance.',
  },
];

export const applicationSurface = {
  name: 'Community Premier League',
  operatingMode: 'Foundation Build',
  productPromise:
    'A football-inspired community action platform where verified civic action becomes league performance, supporter progress and club legacy.',
  primaryRoute: '/',
  healthRoute: '/api/foundation-status',
} as const;

export function getAcceptedStepCount(): number {
  return foundationSteps.filter((step) => step.state === 'accepted').length;
}