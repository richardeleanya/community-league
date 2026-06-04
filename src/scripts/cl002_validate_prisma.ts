import { PrismaClient } from '@prisma/client';
import type {
  audit_logs,
  awards,
  club_news,
  clubs,
  community_actions,
  fixtures,
  fraud_reports,
  individual_rankings,
  leagues,
  league_tables,
  legacy_map_pins,
  legacy_projects,
  missions,
  notifications,
  penalties,
  peer_validations,
  platform_settings,
  seasons,
  supporter_profiles,
  users,
  xp_level_thresholds,
} from '@prisma/client';

type RequiredModelTypes =
  | audit_logs
  | awards
  | club_news
  | clubs
  | community_actions
  | fixtures
  | fraud_reports
  | individual_rankings
  | leagues
  | league_tables
  | legacy_map_pins
  | legacy_projects
  | missions
  | notifications
  | penalties
  | peer_validations
  | platform_settings
  | seasons
  | supporter_profiles
  | users
  | xp_level_thresholds;

const requiredDelegates = [
  'audit_logs',
  'awards',
  'club_news',
  'clubs',
  'community_actions',
  'fixtures',
  'fraud_reports',
  'individual_rankings',
  'leagues',
  'league_tables',
  'legacy_map_pins',
  'legacy_projects',
  'missions',
  'notifications',
  'penalties',
  'peer_validations',
  'platform_settings',
  'seasons',
  'supporter_profiles',
  'users',
  'xp_level_thresholds',
] as const;

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const typeProbe: RequiredModelTypes | null = null;
    void typeProbe;

    for (const delegateName of requiredDelegates) {
      const delegate = prisma[delegateName as keyof PrismaClient];

      if (typeof delegate !== 'object' || delegate === null) {
        throw new Error(`Missing Prisma delegate: ${delegateName}`);
      }
    }

    const tableRows = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT count(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `;

    const tableCount = tableRows[0]?.count ?? 0;

    if (tableCount < 21) {
      throw new Error(`Expected at least 21 public tables, received ${tableCount}`);
    }

    process.stdout.write('CL-002A2 Prisma import and model type validation passed\n');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-002A2 Prisma validation failed: ${message}\n`);
  process.exit(1);
});