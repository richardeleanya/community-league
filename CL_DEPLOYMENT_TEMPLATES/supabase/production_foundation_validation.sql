-- Community Premier League - Production Foundation Validation SQL
-- Run only after applying the accepted migration sequence to the production Supabase project.

SELECT 'enum_types' AS check_name, count(*)::int AS actual_count
FROM pg_type
WHERE typnamespace = 'public'::regnamespace
  AND typtype = 'e';

SELECT 'public_foundation_tables' AS check_name, count(*)::int AS actual_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

SELECT 'named_idx_indexes' AS check_name, count(*)::int AS actual_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

SELECT 'rls_enabled_tables' AS check_name, count(*)::int AS actual_count
FROM pg_class c
JOIN pg_namespace n
  ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true;

SELECT 'rls_policies' AS check_name, count(*)::int AS actual_count
FROM pg_policies
WHERE schemaname = 'public';

SELECT 'foundation_triggers' AS check_name, count(*)::int AS actual_count
FROM information_schema.triggers
WHERE trigger_schema = 'public';

SELECT 'public_functions' AS check_name, count(*)::int AS actual_count
FROM pg_proc p
JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE n.nspname = 'public';

SELECT 'xp_level_thresholds' AS check_name, count(*)::int AS actual_count
FROM public.xp_level_thresholds;

SELECT 'platform_settings' AS check_name, count(*)::int AS actual_count
FROM public.platform_settings;