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

CREATE OR REPLACE FUNCTION public.calculate_streak(p_supporter_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  action_day date;
  expected_day date;
  calculated_streak integer := 0;
BEGIN
  expected_day := current_date;

  FOR action_day IN
    SELECT DISTINCT (action_date AT TIME ZONE 'UTC')::date AS approved_day
    FROM community_actions
    WHERE supporter_id = p_supporter_id
      AND verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
    ORDER BY approved_day DESC
  LOOP
    IF calculated_streak = 0 AND action_day = expected_day THEN
      calculated_streak := 1;
      expected_day := expected_day - 1;
    ELSIF calculated_streak = 0 AND action_day = expected_day - 1 THEN
      calculated_streak := 1;
      expected_day := expected_day - 2;
    ELSIF action_day = expected_day THEN
      calculated_streak := calculated_streak + 1;
      expected_day := expected_day - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN calculated_streak;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_league_table(p_league_id uuid, p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS community_league_old_positions (
    club_id uuid PRIMARY KEY,
    old_position integer
  ) ON COMMIT DROP;

  TRUNCATE community_league_old_positions;

  INSERT INTO community_league_old_positions (club_id, old_position)
  SELECT club_id, position
  FROM league_tables
  WHERE league_id = p_league_id
    AND season_id = p_season_id;

  INSERT INTO league_tables (
    season_id,
    league_id,
    club_id,
    position,
    played,
    won,
    drawn,
    lost,
    community_tasks_completed,
    community_points_for,
    community_points_against,
    community_difference,
    points,
    form,
    updated_at
  )
  SELECT
    p_season_id,
    p_league_id,
    c.id,
    ROW_NUMBER() OVER (ORDER BY c.name ASC),
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    ARRAY[]::text[],
    now()
  FROM clubs c
  WHERE c.league_id = p_league_id
  ON CONFLICT (season_id, league_id, club_id) DO NOTHING;

  WITH fixture_stats AS (
    SELECT
      c.id AS club_id,
      COUNT(f.id) FILTER (WHERE f.status = 'completed')::integer AS played,
      COUNT(f.id) FILTER (WHERE f.status = 'completed' AND f.winner_club_id = c.id)::integer AS won,
      COUNT(f.id) FILTER (WHERE f.status = 'completed' AND f.is_draw = true)::integer AS drawn,
      COUNT(f.id) FILTER (
        WHERE f.status = 'completed'
          AND f.is_draw = false
          AND f.winner_club_id IS NOT NULL
          AND f.winner_club_id <> c.id
      )::integer AS lost,
      COALESCE(SUM(
        CASE
          WHEN f.status = 'completed' AND f.home_club_id = c.id THEN f.away_community_points
          WHEN f.status = 'completed' AND f.away_club_id = c.id THEN f.home_community_points
          ELSE 0
        END
      ), 0)::integer AS community_points_against
    FROM clubs c
    LEFT JOIN fixtures f
      ON f.league_id = p_league_id
     AND f.season_id = p_season_id
     AND (f.home_club_id = c.id OR f.away_club_id = c.id)
    WHERE c.league_id = p_league_id
    GROUP BY c.id
  ),
  action_stats AS (
    SELECT
      ca.club_id,
      COUNT(ca.id)::integer AS community_tasks_completed,
      COALESCE(SUM(ca.final_points_awarded), 0)::integer AS community_points_for
    FROM community_actions ca
    WHERE ca.season_id = p_season_id
      AND ca.verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
    GROUP BY ca.club_id
  ),
  form_stats AS (
    SELECT
      c.id AS club_id,
      ARRAY(
        SELECT
          CASE
            WHEN f.is_draw = true THEN 'D'
            WHEN f.winner_club_id = c.id THEN 'W'
            ELSE 'L'
          END
        FROM fixtures f
        WHERE f.league_id = p_league_id
          AND f.season_id = p_season_id
          AND f.status = 'completed'
          AND (f.home_club_id = c.id OR f.away_club_id = c.id)
        ORDER BY f.match_date DESC
        LIMIT 5
      )::text[] AS form
    FROM clubs c
    WHERE c.league_id = p_league_id
  ),
  compiled AS (
    SELECT
      c.id AS club_id,
      COALESCE(fs.played, 0) AS played,
      COALESCE(fs.won, 0) AS won,
      COALESCE(fs.drawn, 0) AS drawn,
      COALESCE(fs.lost, 0) AS lost,
      COALESCE(ast.community_tasks_completed, 0) AS community_tasks_completed,
      COALESCE(ast.community_points_for, 0) AS community_points_for,
      COALESCE(fs.community_points_against, 0) AS community_points_against,
      COALESCE(ast.community_points_for, 0) - COALESCE(fs.community_points_against, 0) AS community_difference,
      (COALESCE(fs.won, 0) * 3) + COALESCE(fs.drawn, 0) AS points,
      COALESCE(fos.form, ARRAY[]::text[]) AS form
    FROM clubs c
    LEFT JOIN fixture_stats fs ON fs.club_id = c.id
    LEFT JOIN action_stats ast ON ast.club_id = c.id
    LEFT JOIN form_stats fos ON fos.club_id = c.id
    WHERE c.league_id = p_league_id
  )
  UPDATE league_tables lt
  SET
    played = compiled.played,
    won = compiled.won,
    drawn = compiled.drawn,
    lost = compiled.lost,
    community_tasks_completed = compiled.community_tasks_completed,
    community_points_for = compiled.community_points_for,
    community_points_against = compiled.community_points_against,
    community_difference = compiled.community_difference,
    points = compiled.points,
    form = compiled.form,
    updated_at = now()
  FROM compiled
  WHERE lt.club_id = compiled.club_id
    AND lt.league_id = p_league_id
    AND lt.season_id = p_season_id;

  WITH ranked AS (
    SELECT
      id,
      club_id,
      ROW_NUMBER() OVER (
        ORDER BY
          points DESC,
          community_difference DESC,
          community_points_for DESC,
          community_tasks_completed DESC,
          won DESC,
          club_id ASC
      ) AS new_position
    FROM league_tables
    WHERE league_id = p_league_id
      AND season_id = p_season_id
  )
  UPDATE league_tables lt
  SET
    position = ranked.new_position,
    updated_at = now()
  FROM ranked
  WHERE lt.id = ranked.id;

  UPDATE clubs c
  SET
    season_position = lt.position,
    season_wins = lt.won,
    season_draws = lt.drawn,
    season_losses = lt.lost,
    season_points = lt.points,
    updated_at = now()
  FROM league_tables lt
  WHERE lt.club_id = c.id
    AND lt.league_id = p_league_id
    AND lt.season_id = p_season_id;

  INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
  SELECT
    sp.user_id,
    'league_position_change'::notification_type_enum,
    'League position changed',
    c.name || ' moved from #' || old.old_position || ' to #' || lt.position || '.',
    '/leagues/' || l.slug,
    false,
    now()
  FROM community_league_old_positions old
  JOIN league_tables lt
    ON lt.club_id = old.club_id
   AND lt.league_id = p_league_id
   AND lt.season_id = p_season_id
  JOIN clubs c ON c.id = lt.club_id
  JOIN leagues l ON l.id = lt.league_id
  JOIN supporter_profiles sp ON sp.club_id = lt.club_id
  WHERE old.old_position IS NOT NULL
    AND ABS(old.old_position - lt.position) >= 3;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_approved_action(p_action_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_record community_actions%ROWTYPE;
  base_points_value integer;
  base_xp_value integer;
  base_legacy_value integer;
  applied_multiplier numeric(3,1) := 1.0;
  matched_fixture_id uuid;
  matched_league_id uuid;
  final_points_value integer;
  xp_awarded_value integer;
  legacy_awarded_value integer;
  supporter_level integer;
  supporter_xp integer;
  next_level_record xp_level_thresholds%ROWTYPE;
  legacy_pin_id uuid;
  affected_cache_keys text[];
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_action_id::text));

  SELECT *
  INTO action_record
  FROM community_actions
  WHERE id = p_action_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'community action % does not exist', p_action_id;
  END IF;

  IF action_record.verification_status NOT IN ('tier1_approved', 'tier2_approved', 'tier3_approved') THEN
    RETURN;
  END IF;

  IF action_record.final_points_awarded > 0
     OR action_record.xp_awarded > 0
     OR action_record.legacy_points_awarded > 0 THEN
    RETURN;
  END IF;

  base_points_value := CASE action_record.action_type
    WHEN 'litter_collection' THEN 10
    WHEN 'recycling_activity' THEN 15
    WHEN 'food_donation' THEN 50
    WHEN 'tree_planting' THEN 75
    WHEN 'volunteer_hour' THEN 100
    WHEN 'blood_donation' THEN 250
    WHEN 'event_leadership' THEN 500
    WHEN 'youth_mentoring' THEN 150
    WHEN 'elderly_assistance' THEN 100
    WHEN 'homeless_outreach' THEN 150
    WHEN 'playground_build' THEN 400
    WHEN 'park_restoration' THEN 300
    WHEN 'community_centre' THEN 500
    WHEN 'coaching_session' THEN 150
  END;

  base_xp_value := CASE action_record.action_type
    WHEN 'litter_collection' THEN 20
    WHEN 'recycling_activity' THEN 25
    WHEN 'food_donation' THEN 50
    WHEN 'tree_planting' THEN 100
    WHEN 'volunteer_hour' THEN 150
    WHEN 'blood_donation' THEN 200
    WHEN 'event_leadership' THEN 500
    WHEN 'youth_mentoring' THEN 200
    WHEN 'elderly_assistance' THEN 150
    WHEN 'homeless_outreach' THEN 175
    WHEN 'playground_build' THEN 400
    WHEN 'park_restoration' THEN 300
    WHEN 'community_centre' THEN 500
    WHEN 'coaching_session' THEN 175
  END;

  base_legacy_value := CASE action_record.action_type
    WHEN 'litter_collection' THEN 5
    WHEN 'recycling_activity' THEN 7
    WHEN 'food_donation' THEN 25
    WHEN 'tree_planting' THEN 40
    WHEN 'volunteer_hour' THEN 50
    WHEN 'blood_donation' THEN 100
    WHEN 'event_leadership' THEN 200
    WHEN 'youth_mentoring' THEN 75
    WHEN 'elderly_assistance' THEN 50
    WHEN 'homeless_outreach' THEN 60
    WHEN 'playground_build' THEN 175
    WHEN 'park_restoration' THEN 125
    WHEN 'community_centre' THEN 200
    WHEN 'coaching_session' THEN 65
  END;

  SELECT f.id, f.point_multiplier
  INTO matched_fixture_id, applied_multiplier
  FROM fixtures f
  WHERE (f.home_club_id = action_record.club_id OR f.away_club_id = action_record.club_id)
    AND f.status = 'active'
    AND f.mission_start_at <= action_record.action_date
    AND f.mission_end_at >= action_record.action_date
  ORDER BY f.point_multiplier DESC, f.match_date ASC
  LIMIT 1;

  IF matched_fixture_id IS NULL THEN
    applied_multiplier := 1.0;
  END IF;

  final_points_value := FLOOR(base_points_value * applied_multiplier);
  xp_awarded_value := FLOOR(base_xp_value * LEAST(applied_multiplier, 2.0));
  legacy_awarded_value := base_legacy_value;

  SELECT league_id
  INTO matched_league_id
  FROM clubs
  WHERE id = action_record.club_id;

  UPDATE community_actions
  SET
    base_points = base_points_value,
    final_points_awarded = final_points_value,
    xp_awarded = xp_awarded_value,
    legacy_points_awarded = legacy_awarded_value,
    multiplier_applied = applied_multiplier,
    fixture_id = COALESCE(matched_fixture_id, fixture_id),
    verified_at = COALESCE(verified_at, now()),
    updated_at = now()
  WHERE id = action_record.id;

  UPDATE supporter_profiles
  SET
    community_points_season = community_points_season + final_points_value,
    community_points_alltime = community_points_alltime + final_points_value,
    legacy_score = legacy_score + legacy_awarded_value,
    current_xp = current_xp + xp_awarded_value,
    total_xp_ever = total_xp_ever + xp_awarded_value,
    actions_completed_total = actions_completed_total + 1,
    actions_completed_season = actions_completed_season + 1,
    last_action_at = now(),
    volunteer_hours_total = volunteer_hours_total + action_record.volunteer_hours,
    trees_planted_total = trees_planted_total + action_record.trees_count,
    food_donations_total = food_donations_total + action_record.food_items_count,
    streak_current_days = public.calculate_streak(action_record.supporter_id),
    streak_longest_days = GREATEST(streak_longest_days, public.calculate_streak(action_record.supporter_id)),
    updated_at = now()
  WHERE id = action_record.supporter_id;

  UPDATE clubs
  SET
    community_points_season = community_points_season + final_points_value,
    community_points_alltime = community_points_alltime + final_points_value,
    legacy_score = legacy_score + legacy_awarded_value,
    actions_completed_season = actions_completed_season + 1,
    actions_completed_alltime = actions_completed_alltime + 1,
    volunteer_hours_season = volunteer_hours_season + action_record.volunteer_hours,
    trees_planted_season = trees_planted_season + action_record.trees_count,
    updated_at = now()
  WHERE id = action_record.club_id;

  SELECT current_level, current_xp
  INTO supporter_level, supporter_xp
  FROM supporter_profiles
  WHERE id = action_record.supporter_id;

  LOOP
    SELECT *
    INTO next_level_record
    FROM xp_level_thresholds
    WHERE level > supporter_level
      AND xp_required <= supporter_xp
    ORDER BY level ASC
    LIMIT 1;

    EXIT WHEN NOT FOUND;

    UPDATE supporter_profiles
    SET
      current_level = next_level_record.level,
      updated_at = now()
    WHERE id = action_record.supporter_id;

    INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
    SELECT
      sp.user_id,
      'level_up'::notification_type_enum,
      'Level up',
      'You reached Level ' || next_level_record.level || ': ' || next_level_record.title || '.',
      '/profile',
      false,
      now()
    FROM supporter_profiles sp
    WHERE sp.id = action_record.supporter_id;

    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, created_at)
    SELECT
      sp.user_id,
      'supporter.level_up',
      'supporter_profile',
      sp.id,
      jsonb_build_object('previous_level', supporter_level),
      jsonb_build_object('new_level', next_level_record.level, 'title', next_level_record.title),
      now()
    FROM supporter_profiles sp
    WHERE sp.id = action_record.supporter_id;

    supporter_level := next_level_record.level;
  END LOOP;

  PERFORM public.recalculate_league_table(matched_league_id, action_record.season_id);

  INSERT INTO individual_rankings (
    season_id,
    supporter_id,
    club_id,
    community_points,
    legacy_score,
    actions_count,
    volunteer_hours,
    trees_planted,
    food_donated,
    updated_at
  )
  SELECT
    action_record.season_id,
    sp.id,
    sp.club_id,
    COALESCE(SUM(ca.final_points_awarded), 0)::integer,
    sp.legacy_score,
    COUNT(ca.id)::integer,
    COALESCE(SUM(ca.volunteer_hours), 0),
    COALESCE(SUM(ca.trees_count), 0)::integer,
    COALESCE(SUM(ca.food_items_count), 0)::integer,
    now()
  FROM supporter_profiles sp
  LEFT JOIN community_actions ca
    ON ca.supporter_id = sp.id
   AND ca.season_id = action_record.season_id
   AND ca.verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved')
  WHERE sp.club_id IS NOT NULL
  GROUP BY sp.id, sp.club_id, sp.legacy_score
  ON CONFLICT (season_id, supporter_id) DO UPDATE
  SET
    club_id = EXCLUDED.club_id,
    community_points = EXCLUDED.community_points,
    legacy_score = EXCLUDED.legacy_score,
    actions_count = EXCLUDED.actions_count,
    volunteer_hours = EXCLUDED.volunteer_hours,
    trees_planted = EXCLUDED.trees_planted,
    food_donated = EXCLUDED.food_donated,
    updated_at = now();

  WITH ranked_overall AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY community_points DESC, legacy_score DESC, actions_count DESC, supporter_id ASC
      ) AS new_rank
    FROM individual_rankings
    WHERE season_id = action_record.season_id
  )
  UPDATE individual_rankings ir
  SET
    rank_overall = ranked_overall.new_rank,
    updated_at = now()
  FROM ranked_overall
  WHERE ir.id = ranked_overall.id;

  WITH ranked_club AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY club_id
        ORDER BY community_points DESC, legacy_score DESC, actions_count DESC, supporter_id ASC
      ) AS new_rank
    FROM individual_rankings
    WHERE season_id = action_record.season_id
  )
  UPDATE individual_rankings ir
  SET
    rank_in_club = ranked_club.new_rank,
    updated_at = now()
  FROM ranked_club
  WHERE ir.id = ranked_club.id;

  IF matched_fixture_id IS NOT NULL THEN
    UPDATE fixtures
    SET
      home_community_points = CASE
        WHEN home_club_id = action_record.club_id THEN home_community_points + final_points_value
        ELSE home_community_points
      END,
      away_community_points = CASE
        WHEN away_club_id = action_record.club_id THEN away_community_points + final_points_value
        ELSE away_community_points
      END,
      home_actions_count = CASE
        WHEN home_club_id = action_record.club_id THEN home_actions_count + 1
        ELSE home_actions_count
      END,
      away_actions_count = CASE
        WHEN away_club_id = action_record.club_id THEN away_actions_count + 1
        ELSE away_actions_count
      END,
      updated_at = now()
    WHERE id = matched_fixture_id;
  END IF;

  SELECT id
  INTO legacy_pin_id
  FROM legacy_map_pins
  WHERE club_id = action_record.club_id
    AND action_type = action_record.action_type
    AND ABS(latitude - ROUND(action_record.gps_latitude, 3)) <= 0.5
    AND ABS(longitude - ROUND(action_record.gps_longitude, 3)) <= 0.5
  ORDER BY
    ABS(latitude - ROUND(action_record.gps_latitude, 3)) + ABS(longitude - ROUND(action_record.gps_longitude, 3)) ASC
  LIMIT 1
  FOR UPDATE;

  IF legacy_pin_id IS NULL THEN
    INSERT INTO legacy_map_pins (
      club_id,
      action_type,
      latitude,
      longitude,
      count,
      description,
      created_at,
      updated_at
    )
    VALUES (
      action_record.club_id,
      action_record.action_type,
      ROUND(action_record.gps_latitude, 3),
      ROUND(action_record.gps_longitude, 3),
      1,
      action_record.gps_location_name,
      now(),
      now()
    );
  ELSE
    UPDATE legacy_map_pins
    SET
      count = count + 1,
      updated_at = now()
    WHERE id = legacy_pin_id;
  END IF;

  INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
  SELECT
    sp.user_id,
    'points_awarded'::notification_type_enum,
    'Points awarded',
    final_points_value || ' points awarded for your ' || replace(action_record.action_type::text, '_', ' ') || ' action.',
    '/my-actions/' || action_record.id,
    false,
    now()
  FROM supporter_profiles sp
  WHERE sp.id = action_record.supporter_id;

  affected_cache_keys := ARRAY[
    'league:table:' || matched_league_id || ':' || action_record.season_id,
    'leaderboard:global:' || action_record.season_id,
    'leaderboard:club:' || action_record.club_id || ':' || action_record.season_id
  ];

  PERFORM pg_notify(
    'community_league_cache_invalidation',
    jsonb_build_object(
      'keys', affected_cache_keys,
      'actionId', action_record.id,
      'clubId', action_record.club_id,
      'leagueId', matched_league_id,
      'seasonId', action_record.season_id
    )::text
  );

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, created_at)
  SELECT
    sp.user_id,
    'action.points_awarded',
    'community_action',
    action_record.id,
    NULL,
    jsonb_build_object(
      'base_points', base_points_value,
      'base_xp', base_xp_value,
      'base_legacy', base_legacy_value,
      'multiplier', applied_multiplier,
      'final_points_awarded', final_points_value,
      'xp_awarded', xp_awarded_value,
      'legacy_points_awarded', legacy_awarded_value,
      'fixture_id', matched_fixture_id,
      'cache_keys', affected_cache_keys
    ),
    now()
  FROM supporter_profiles sp
  WHERE sp.id = action_record.supporter_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_approved_action_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status
     AND NEW.verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved') THEN
    PERFORM public.process_approved_action(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER process_approved_action_after_status_change
AFTER UPDATE OF verification_status ON community_actions
FOR EACH ROW
WHEN (NEW.verification_status IN ('tier1_approved', 'tier2_approved', 'tier3_approved'))
EXECUTE FUNCTION public.handle_approved_action_status_change();
