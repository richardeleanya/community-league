CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND is_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION is_moderator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND (is_moderator = true OR is_admin = true)
  );
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_moderator() TO authenticated;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_level_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_map_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_self_or_moderator
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid() OR is_moderator());

CREATE POLICY users_admin_all
ON users
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY supporter_profiles_public_select_public
ON supporter_profiles
FOR SELECT
TO anon, authenticated
USING (is_public = true);

CREATE POLICY supporter_profiles_select_self_or_moderator
ON supporter_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_moderator());

CREATE POLICY supporter_profiles_update_self
ON supporter_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY supporter_profiles_admin_all
ON supporter_profiles
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY clubs_public_select_active
ON clubs
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY clubs_moderator_select_all
ON clubs
FOR SELECT
TO authenticated
USING (is_moderator());

CREATE POLICY clubs_admin_all
ON clubs
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY leagues_public_select_active
ON leagues
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY leagues_moderator_select_all
ON leagues
FOR SELECT
TO authenticated
USING (is_moderator());

CREATE POLICY leagues_admin_all
ON leagues
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY seasons_public_select_all
ON seasons
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY seasons_admin_all
ON seasons
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY fixtures_public_select_all
ON fixtures
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY fixtures_admin_all
ON fixtures
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY missions_public_select_active
ON missions
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY missions_moderator_select_all
ON missions
FOR SELECT
TO authenticated
USING (is_moderator());

CREATE POLICY missions_admin_all
ON missions
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY community_actions_select_self_or_moderator
ON community_actions
FOR SELECT
TO authenticated
USING (
  supporter_id IN (
    SELECT id
    FROM supporter_profiles
    WHERE user_id = auth.uid()
  )
  OR is_moderator()
);

CREATE POLICY community_actions_insert_self
ON community_actions
FOR INSERT
TO authenticated
WITH CHECK (
  supporter_id IN (
    SELECT id
    FROM supporter_profiles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY community_actions_moderator_update
ON community_actions
FOR UPDATE
TO authenticated
USING (is_moderator())
WITH CHECK (is_moderator());

CREATE POLICY community_actions_admin_all
ON community_actions
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY peer_validations_select_assigned_or_moderator
ON peer_validations
FOR SELECT
TO authenticated
USING (
  validator_supporter_id IN (
    SELECT id
    FROM supporter_profiles
    WHERE user_id = auth.uid()
  )
  OR is_moderator()
);

CREATE POLICY peer_validations_insert_own
ON peer_validations
FOR INSERT
TO authenticated
WITH CHECK (
  validator_supporter_id IN (
    SELECT id
    FROM supporter_profiles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY peer_validations_admin_all
ON peer_validations
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY fraud_reports_insert_own
ON fraud_reports
FOR INSERT
TO authenticated
WITH CHECK (
  reporting_supporter_id IN (
    SELECT id
    FROM supporter_profiles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY fraud_reports_moderator_select_all
ON fraud_reports
FOR SELECT
TO authenticated
USING (is_moderator());

CREATE POLICY fraud_reports_moderator_update
ON fraud_reports
FOR UPDATE
TO authenticated
USING (is_moderator())
WITH CHECK (is_moderator());

CREATE POLICY fraud_reports_admin_all
ON fraud_reports
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY penalties_select_self_or_moderator
ON penalties
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_moderator());

CREATE POLICY penalties_admin_all
ON penalties
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY xp_level_thresholds_public_select_all
ON xp_level_thresholds
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY xp_level_thresholds_admin_all
ON xp_level_thresholds
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY league_tables_public_select_all
ON league_tables
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY league_tables_admin_all
ON league_tables
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY individual_rankings_public_select_all
ON individual_rankings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY individual_rankings_admin_all
ON individual_rankings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY awards_public_select_published
ON awards
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY awards_moderator_select_all
ON awards
FOR SELECT
TO authenticated
USING (is_moderator());

CREATE POLICY awards_moderator_insert
ON awards
FOR INSERT
TO authenticated
WITH CHECK (is_moderator());

CREATE POLICY awards_admin_all
ON awards
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY legacy_projects_public_select_all
ON legacy_projects
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY legacy_projects_admin_all
ON legacy_projects
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY legacy_map_pins_public_select_all
ON legacy_map_pins
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY legacy_map_pins_admin_all
ON legacy_map_pins
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY club_news_public_select_published
ON club_news
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY club_news_moderator_select_all
ON club_news
FOR SELECT
TO authenticated
USING (is_moderator());

CREATE POLICY club_news_moderator_insert
ON club_news
FOR INSERT
TO authenticated
WITH CHECK (is_moderator());

CREATE POLICY club_news_admin_all
ON club_news
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY notifications_select_own
ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY notifications_update_own
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_admin_all
ON notifications
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY audit_logs_moderator_select_all
ON audit_logs
FOR SELECT
TO authenticated
USING (is_moderator());

CREATE POLICY platform_settings_public_select_whitelisted
ON platform_settings
FOR SELECT
TO anon, authenticated
USING (key IN ('points_multiplier_table'));

CREATE POLICY platform_settings_moderator_select_all
ON platform_settings
FOR SELECT
TO authenticated
USING (is_moderator());

CREATE POLICY platform_settings_admin_all
ON platform_settings
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
