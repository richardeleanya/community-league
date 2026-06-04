CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  account_status account_status_enum NOT NULL DEFAULT 'pending_verification',
  is_admin boolean NOT NULL DEFAULT false,
  is_moderator boolean NOT NULL DEFAULT false,
  referral_code text NOT NULL UNIQUE,
  referred_by uuid REFERENCES users(id),
  email_verification_token text UNIQUE,
  password_reset_token text UNIQUE,
  email_verification_expires_at timestamptz,
  password_reset_expires_at timestamptz,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  notification_email_weekly boolean NOT NULL DEFAULT true,
  notification_email_actions boolean NOT NULL DEFAULT true,
  notification_email_security boolean NOT NULL DEFAULT true,
  CONSTRAINT chk_users_failed_login_attempts_non_negative CHECK (failed_login_attempts >= 0)
);

CREATE TABLE seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_seasons_date_order CHECK (end_date > start_date)
);

CREATE TABLE leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country text NOT NULL,
  tier integer NOT NULL,
  season_id uuid NOT NULL REFERENCES seasons(id),
  logo_url text,
  primary_colour text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  max_clubs integer NOT NULL DEFAULT 20,
  promotion_spots integer NOT NULL DEFAULT 3,
  relegation_spots integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_leagues_country_alpha2 CHECK (char_length(country) = 2),
  CONSTRAINT chk_leagues_tier_positive CHECK (tier >= 1),
  CONSTRAINT chk_leagues_max_clubs_positive CHECK (max_clubs > 0),
  CONSTRAINT chk_leagues_promotion_spots_non_negative CHECK (promotion_spots >= 0),
  CONSTRAINT chk_leagues_relegation_spots_non_negative CHECK (relegation_spots >= 0)
);

CREATE TABLE clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country text NOT NULL,
  league_id uuid NOT NULL REFERENCES leagues(id),
  badge_url text,
  primary_colour text NOT NULL,
  secondary_colour text NOT NULL,
  founded_year integer,
  stadium_name text,
  city text NOT NULL,
  description text,
  website_url text,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  total_supporters integer NOT NULL DEFAULT 0,
  community_points_season integer NOT NULL DEFAULT 0,
  community_points_alltime integer NOT NULL DEFAULT 0,
  legacy_score integer NOT NULL DEFAULT 0,
  actions_completed_season integer NOT NULL DEFAULT 0,
  actions_completed_alltime integer NOT NULL DEFAULT 0,
  volunteer_hours_season numeric(10,2) NOT NULL DEFAULT 0,
  trees_planted_season integer NOT NULL DEFAULT 0,
  season_position integer,
  season_wins integer NOT NULL DEFAULT 0,
  season_draws integer NOT NULL DEFAULT 0,
  season_losses integer NOT NULL DEFAULT 0,
  season_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_clubs_short_name_max_3 CHECK (char_length(short_name) <= 3),
  CONSTRAINT chk_clubs_country_alpha2 CHECK (char_length(country) = 2),
  CONSTRAINT chk_clubs_total_supporters_non_negative CHECK (total_supporters >= 0),
  CONSTRAINT chk_clubs_points_non_negative CHECK (
    community_points_season >= 0
    AND community_points_alltime >= 0
    AND legacy_score >= 0
    AND season_points >= 0
  ),
  CONSTRAINT chk_clubs_counts_non_negative CHECK (
    actions_completed_season >= 0
    AND actions_completed_alltime >= 0
    AND volunteer_hours_season >= 0
    AND trees_planted_season >= 0
    AND season_wins >= 0
    AND season_draws >= 0
    AND season_losses >= 0
  )
);

CREATE TABLE supporter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  username text NOT NULL UNIQUE,
  avatar_url text,
  bio text,
  club_id uuid REFERENCES clubs(id),
  club_joined_at timestamptz,
  specialist_path specialist_path_enum,
  specialist_path_set_at timestamptz,
  current_level integer NOT NULL DEFAULT 1,
  current_xp integer NOT NULL DEFAULT 0,
  total_xp_ever integer NOT NULL DEFAULT 0,
  community_points_season integer NOT NULL DEFAULT 0,
  community_points_alltime integer NOT NULL DEFAULT 0,
  legacy_score integer NOT NULL DEFAULT 0,
  volunteer_hours_total numeric(10,2) NOT NULL DEFAULT 0,
  trees_planted_total integer NOT NULL DEFAULT 0,
  food_donations_total integer NOT NULL DEFAULT 0,
  actions_completed_total integer NOT NULL DEFAULT 0,
  actions_completed_season integer NOT NULL DEFAULT 0,
  streak_current_days integer NOT NULL DEFAULT 0,
  streak_longest_days integer NOT NULL DEFAULT 0,
  last_action_at timestamptz,
  location_city text,
  location_country text NOT NULL DEFAULT 'GB',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_supporter_profiles_username_format CHECK (username ~ '^[a-z0-9_]{3,20}$'),
  CONSTRAINT chk_supporter_profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 280),
  CONSTRAINT chk_supporter_profiles_location_country_alpha2 CHECK (char_length(location_country) = 2),
  CONSTRAINT chk_supporter_profiles_level_positive CHECK (current_level >= 1),
  CONSTRAINT chk_supporter_profiles_non_negative_totals CHECK (
    current_xp >= 0
    AND total_xp_ever >= 0
    AND community_points_season >= 0
    AND community_points_alltime >= 0
    AND legacy_score >= 0
    AND volunteer_hours_total >= 0
    AND trees_planted_total >= 0
    AND food_donations_total >= 0
    AND actions_completed_total >= 0
    AND actions_completed_season >= 0
    AND streak_current_days >= 0
    AND streak_longest_days >= 0
  )
);

CREATE TABLE fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id),
  league_id uuid NOT NULL REFERENCES leagues(id),
  home_club_id uuid NOT NULL REFERENCES clubs(id),
  away_club_id uuid NOT NULL REFERENCES clubs(id),
  match_date timestamptz NOT NULL,
  match_week integer NOT NULL,
  fixture_type fixture_type_enum NOT NULL,
  point_multiplier numeric(3,1) NOT NULL DEFAULT 1.0,
  status fixture_status_enum NOT NULL DEFAULT 'upcoming',
  home_community_points integer NOT NULL DEFAULT 0,
  away_community_points integer NOT NULL DEFAULT 0,
  home_actions_count integer NOT NULL DEFAULT 0,
  away_actions_count integer NOT NULL DEFAULT 0,
  winner_club_id uuid REFERENCES clubs(id),
  is_draw boolean NOT NULL DEFAULT false,
  mission_week_active boolean NOT NULL DEFAULT false,
  mission_start_at timestamptz,
  mission_end_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_fixtures_distinct_clubs CHECK (home_club_id <> away_club_id),
  CONSTRAINT chk_fixtures_match_week_positive CHECK (match_week >= 1),
  CONSTRAINT chk_fixtures_points_non_negative CHECK (
    home_community_points >= 0
    AND away_community_points >= 0
    AND home_actions_count >= 0
    AND away_actions_count >= 0
  ),
  CONSTRAINT chk_fixtures_mission_window_order CHECK (
    mission_start_at IS NULL
    OR mission_end_at IS NULL
    OR mission_end_at > mission_start_at
  ),
  CONSTRAINT chk_fixtures_multiplier_by_type CHECK (
    (fixture_type = 'league' AND point_multiplier = 1.0)
    OR (fixture_type = 'derby' AND point_multiplier = 2.0)
    OR (fixture_type = 'cup' AND point_multiplier = 3.0)
    OR (fixture_type = 'continental' AND point_multiplier = 4.0)
    OR (fixture_type = 'final' AND point_multiplier = 5.0)
  )
);

CREATE TABLE missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id uuid REFERENCES fixtures(id),
  title text NOT NULL,
  description text NOT NULL,
  action_category action_category_enum NOT NULL,
  action_type action_type_enum NOT NULL,
  base_points integer NOT NULL,
  base_xp integer NOT NULL,
  multiplier_override numeric(3,1),
  verification_tier_required verification_tier_enum NOT NULL,
  max_completions_per_user integer,
  max_completions_total integer,
  completions_count integer NOT NULL DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_missions_points_positive CHECK (base_points > 0 AND base_xp > 0),
  CONSTRAINT chk_missions_completion_limits_positive CHECK (
    (max_completions_per_user IS NULL OR max_completions_per_user > 0)
    AND (max_completions_total IS NULL OR max_completions_total > 0)
  ),
  CONSTRAINT chk_missions_completions_non_negative CHECK (completions_count >= 0),
  CONSTRAINT chk_missions_date_order CHECK (end_date > start_date),
  CONSTRAINT chk_missions_multiplier_override_valid CHECK (
    multiplier_override IS NULL OR multiplier_override IN (1.0, 2.0, 3.0, 4.0, 5.0)
  )
);

CREATE TABLE community_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id uuid NOT NULL REFERENCES supporter_profiles(id),
  club_id uuid NOT NULL REFERENCES clubs(id),
  mission_id uuid REFERENCES missions(id),
  fixture_id uuid REFERENCES fixtures(id),
  season_id uuid NOT NULL REFERENCES seasons(id),
  action_type action_type_enum NOT NULL,
  action_category action_category_enum NOT NULL,
  description text NOT NULL,
  photo_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
  gps_latitude numeric(10,7) NOT NULL,
  gps_longitude numeric(10,7) NOT NULL,
  gps_accuracy_metres numeric(8,2) NOT NULL,
  gps_location_name text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  action_date timestamptz NOT NULL,
  verification_status verification_status_enum NOT NULL DEFAULT 'pending',
  verification_tier verification_tier_enum NOT NULL,
  verified_at timestamptz,
  verified_by uuid REFERENCES users(id),
  rejection_reason text,
  base_points integer NOT NULL,
  multiplier_applied numeric(3,1) NOT NULL DEFAULT 1.0,
  final_points_awarded integer NOT NULL DEFAULT 0,
  xp_awarded integer NOT NULL DEFAULT 0,
  legacy_points_awarded integer NOT NULL DEFAULT 0,
  volunteer_hours numeric(5,2) NOT NULL DEFAULT 0,
  trees_count integer NOT NULL DEFAULT 0,
  food_items_count integer NOT NULL DEFAULT 0,
  ai_analysis_score numeric(5,4),
  ai_flags text[],
  fraud_score integer NOT NULL DEFAULT 0,
  duplicate_hash text,
  device_fingerprint text,
  ip_address text,
  ip_country text,
  is_fraudulent boolean NOT NULL DEFAULT false,
  fraud_reason text,
  peer_validations_required integer NOT NULL DEFAULT 0,
  peer_validations_received integer NOT NULL DEFAULT 0,
  peer_validations_approved integer NOT NULL DEFAULT 0,
  peer_validations_rejected integer NOT NULL DEFAULT 0,
  institution_name text,
  institution_contact text,
  institution_verification_token text UNIQUE,
  institution_verified boolean NOT NULL DEFAULT false,
  institution_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_community_actions_description_length CHECK (char_length(description) >= 50 AND char_length(description) <= 500),
  CONSTRAINT chk_community_actions_photo_count CHECK (cardinality(photo_urls) <= 10),
  CONSTRAINT chk_community_actions_latitude_range CHECK (gps_latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_community_actions_longitude_range CHECK (gps_longitude BETWEEN -180 AND 180),
  CONSTRAINT chk_community_actions_gps_accuracy_non_negative CHECK (gps_accuracy_metres >= 0),
  CONSTRAINT chk_community_actions_points_non_negative CHECK (
    base_points > 0
    AND final_points_awarded >= 0
    AND xp_awarded >= 0
    AND legacy_points_awarded >= 0
  ),
  CONSTRAINT chk_community_actions_multiplier_valid CHECK (multiplier_applied IN (1.0, 2.0, 3.0, 4.0, 5.0)),
  CONSTRAINT chk_community_actions_counts_non_negative CHECK (
    volunteer_hours >= 0
    AND trees_count >= 0
    AND food_items_count >= 0
    AND fraud_score >= 0
    AND peer_validations_required >= 0
    AND peer_validations_received >= 0
    AND peer_validations_approved >= 0
    AND peer_validations_rejected >= 0
  ),
  CONSTRAINT chk_community_actions_ai_score_range CHECK (ai_analysis_score IS NULL OR ai_analysis_score BETWEEN 0 AND 1),
  CONSTRAINT chk_community_actions_rejection_reason_required CHECK (
    verification_status <> 'rejected'
    OR (rejection_reason IS NOT NULL AND char_length(rejection_reason) >= 20)
  )
);

CREATE TABLE peer_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES community_actions(id) ON DELETE CASCADE,
  validator_supporter_id uuid NOT NULL REFERENCES supporter_profiles(id),
  validation_result validation_result_enum NOT NULL,
  notes text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_peer_validations_action_validator UNIQUE (action_id, validator_supporter_id),
  CONSTRAINT chk_peer_validations_expiry_after_assignment CHECK (expires_at > assigned_at),
  CONSTRAINT chk_peer_validations_response_after_assignment CHECK (responded_at IS NULL OR responded_at >= assigned_at)
);

CREATE TABLE fraud_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_action_id uuid REFERENCES community_actions(id),
  reported_user_id uuid REFERENCES users(id),
  reporting_supporter_id uuid NOT NULL REFERENCES supporter_profiles(id),
  report_type report_type_enum NOT NULL,
  description text NOT NULL,
  evidence_urls text[],
  status report_status_enum NOT NULL DEFAULT 'open',
  reviewed_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_fraud_reports_target_present CHECK (reported_action_id IS NOT NULL OR reported_user_id IS NOT NULL),
  CONSTRAINT chk_fraud_reports_description_present CHECK (char_length(description) > 0)
);

CREATE TABLE penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  club_id uuid REFERENCES clubs(id),
  penalty_type penalty_type_enum NOT NULL,
  reason text NOT NULL,
  points_deducted integer NOT NULL DEFAULT 0,
  suspension_days integer,
  issued_by uuid NOT NULL REFERENCES users(id),
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  appeal_status appeal_status_enum NOT NULL DEFAULT 'none',
  appeal_submitted_at timestamptz,
  appeal_resolved_by uuid REFERENCES users(id),
  appeal_resolution_notes text,
  CONSTRAINT chk_penalties_reason_present CHECK (char_length(reason) > 0),
  CONSTRAINT chk_penalties_points_deducted_non_negative CHECK (points_deducted >= 0),
  CONSTRAINT chk_penalties_suspension_days_positive CHECK (suspension_days IS NULL OR suspension_days > 0),
  CONSTRAINT chk_penalties_expiry_after_issue CHECK (expires_at IS NULL OR expires_at > issued_at)
);

CREATE TABLE xp_level_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer NOT NULL UNIQUE,
  title text NOT NULL,
  xp_required integer NOT NULL,
  badge_url text,
  colour text NOT NULL,
  perks text[],
  CONSTRAINT chk_xp_level_thresholds_level_positive CHECK (level >= 1),
  CONSTRAINT chk_xp_level_thresholds_xp_non_negative CHECK (xp_required >= 0)
);

CREATE TABLE league_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id),
  league_id uuid NOT NULL REFERENCES leagues(id),
  club_id uuid NOT NULL REFERENCES clubs(id),
  position integer NOT NULL,
  played integer NOT NULL DEFAULT 0,
  won integer NOT NULL DEFAULT 0,
  drawn integer NOT NULL DEFAULT 0,
  lost integer NOT NULL DEFAULT 0,
  community_tasks_completed integer NOT NULL DEFAULT 0,
  community_points_for integer NOT NULL DEFAULT 0,
  community_points_against integer NOT NULL DEFAULT 0,
  community_difference integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  form text[] NOT NULL DEFAULT ARRAY[]::text[],
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_league_tables_season_league_club UNIQUE (season_id, league_id, club_id),
  CONSTRAINT chk_league_tables_position_positive CHECK (position >= 1),
  CONSTRAINT chk_league_tables_non_negative_counts CHECK (
    played >= 0
    AND won >= 0
    AND drawn >= 0
    AND lost >= 0
    AND community_tasks_completed >= 0
    AND community_points_for >= 0
    AND community_points_against >= 0
    AND points >= 0
  ),
  CONSTRAINT chk_league_tables_form_length CHECK (cardinality(form) <= 5)
);

CREATE TABLE individual_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id),
  supporter_id uuid NOT NULL REFERENCES supporter_profiles(id),
  club_id uuid NOT NULL REFERENCES clubs(id),
  rank_overall integer,
  rank_in_club integer,
  rank_by_category jsonb,
  community_points integer NOT NULL DEFAULT 0,
  legacy_score integer NOT NULL DEFAULT 0,
  actions_count integer NOT NULL DEFAULT 0,
  volunteer_hours numeric(10,2) NOT NULL DEFAULT 0,
  trees_planted integer NOT NULL DEFAULT 0,
  food_donated integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_individual_rankings_season_supporter UNIQUE (season_id, supporter_id),
  CONSTRAINT chk_individual_rankings_rank_positive CHECK (
    (rank_overall IS NULL OR rank_overall >= 1)
    AND (rank_in_club IS NULL OR rank_in_club >= 1)
  ),
  CONSTRAINT chk_individual_rankings_non_negative_totals CHECK (
    community_points >= 0
    AND legacy_score >= 0
    AND actions_count >= 0
    AND volunteer_hours >= 0
    AND trees_planted >= 0
    AND food_donated >= 0
  )
);

CREATE TABLE awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id),
  award_type award_type_enum NOT NULL,
  winner_supporter_id uuid REFERENCES supporter_profiles(id),
  winner_club_id uuid REFERENCES clubs(id),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  citation text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  CONSTRAINT chk_awards_winner_present CHECK (winner_supporter_id IS NOT NULL OR winner_club_id IS NOT NULL),
  CONSTRAINT chk_awards_citation_present CHECK (char_length(citation) > 0)
);

CREATE TABLE legacy_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id),
  season_id uuid NOT NULL REFERENCES seasons(id),
  project_type project_type_enum NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location_name text NOT NULL,
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  status project_status_enum NOT NULL DEFAULT 'proposed',
  legacy_score_threshold integer NOT NULL,
  current_legacy_score integer NOT NULL DEFAULT 0,
  completion_date date,
  cover_image_url text,
  gallery_urls text[],
  council_partner text,
  sponsor_partner text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_legacy_projects_latitude_range CHECK (location_lat IS NULL OR location_lat BETWEEN -90 AND 90),
  CONSTRAINT chk_legacy_projects_longitude_range CHECK (location_lng IS NULL OR location_lng BETWEEN -180 AND 180),
  CONSTRAINT chk_legacy_projects_score_non_negative CHECK (legacy_score_threshold >= 0 AND current_legacy_score >= 0)
);

CREATE TABLE legacy_map_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id),
  action_type action_type_enum NOT NULL,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  count integer NOT NULL DEFAULT 1,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_legacy_map_pins_latitude_range CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_legacy_map_pins_longitude_range CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT chk_legacy_map_pins_count_positive CHECK (count >= 1)
);

CREATE TABLE club_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id),
  author_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  cover_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_club_news_views_non_negative CHECK (views_count >= 0),
  CONSTRAINT chk_club_news_published_at_required CHECK (is_published = false OR published_at IS NOT NULL)
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_audit_logs_action_present CHECK (char_length(action) > 0),
  CONSTRAINT chk_audit_logs_entity_type_present CHECK (char_length(entity_type) > 0)
);

CREATE TABLE platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_platform_settings_key_present CHECK (char_length(key) > 0)
);
