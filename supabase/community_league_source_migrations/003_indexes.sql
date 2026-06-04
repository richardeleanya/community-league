CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX idx_users_locked_until ON users(locked_until) WHERE locked_until IS NOT NULL;

CREATE INDEX idx_supporter_profiles_user_id ON supporter_profiles(user_id);
CREATE INDEX idx_supporter_profiles_username ON supporter_profiles(username);
CREATE INDEX idx_supporter_profiles_club_id ON supporter_profiles(club_id);
CREATE INDEX idx_supporter_profiles_current_level ON supporter_profiles(current_level);
CREATE INDEX idx_supporter_profiles_community_points_season ON supporter_profiles(community_points_season DESC);
CREATE INDEX idx_supporter_profiles_community_points_alltime ON supporter_profiles(community_points_alltime DESC);
CREATE INDEX idx_supporter_profiles_legacy_score ON supporter_profiles(legacy_score DESC);
CREATE INDEX idx_supporter_profiles_last_action ON supporter_profiles(last_action_at DESC);

CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_league_id ON clubs(league_id);
CREATE INDEX idx_clubs_country ON clubs(country);
CREATE INDEX idx_clubs_community_points_season ON clubs(community_points_season DESC);
CREATE INDEX idx_clubs_is_active ON clubs(is_active);

CREATE INDEX idx_leagues_slug ON leagues(slug);
CREATE INDEX idx_leagues_country ON leagues(country);
CREATE INDEX idx_leagues_season_id ON leagues(season_id);
CREATE INDEX idx_leagues_is_active ON leagues(is_active);

CREATE INDEX idx_seasons_slug ON seasons(slug);
CREATE INDEX idx_seasons_is_current ON seasons(is_current);
CREATE UNIQUE INDEX idx_seasons_one_current ON seasons(is_current) WHERE is_current = true;

CREATE INDEX idx_fixtures_season_id ON fixtures(season_id);
CREATE INDEX idx_fixtures_league_id ON fixtures(league_id);
CREATE INDEX idx_fixtures_home_club_id ON fixtures(home_club_id);
CREATE INDEX idx_fixtures_away_club_id ON fixtures(away_club_id);
CREATE INDEX idx_fixtures_match_date ON fixtures(match_date);
CREATE INDEX idx_fixtures_status ON fixtures(status);
CREATE INDEX idx_fixtures_winner_club_id ON fixtures(winner_club_id) WHERE winner_club_id IS NOT NULL;
CREATE INDEX idx_fixtures_active_window ON fixtures(home_club_id, away_club_id, mission_start_at, mission_end_at) WHERE status = 'active';

CREATE INDEX idx_missions_fixture_id ON missions(fixture_id);
CREATE INDEX idx_missions_action_type ON missions(action_type);
CREATE INDEX idx_missions_is_active ON missions(is_active);
CREATE INDEX idx_missions_active_window ON missions(start_date, end_date) WHERE is_active = true;

CREATE INDEX idx_community_actions_supporter_id ON community_actions(supporter_id);
CREATE INDEX idx_community_actions_club_id ON community_actions(club_id);
CREATE INDEX idx_community_actions_mission_id ON community_actions(mission_id);
CREATE INDEX idx_community_actions_fixture_id ON community_actions(fixture_id);
CREATE INDEX idx_community_actions_season_id ON community_actions(season_id);
CREATE INDEX idx_community_actions_verification_status ON community_actions(verification_status);
CREATE INDEX idx_community_actions_submitted_at ON community_actions(submitted_at DESC);
CREATE INDEX idx_community_actions_action_date ON community_actions(action_date DESC);
CREATE INDEX idx_community_actions_duplicate_hash ON community_actions(duplicate_hash) WHERE duplicate_hash IS NOT NULL;
CREATE INDEX idx_community_actions_is_fraudulent ON community_actions(is_fraudulent) WHERE is_fraudulent = true;
CREATE INDEX idx_community_actions_fraud_score ON community_actions(fraud_score DESC);
CREATE INDEX idx_community_actions_device_fingerprint ON community_actions(device_fingerprint) WHERE device_fingerprint IS NOT NULL;
CREATE INDEX idx_community_actions_pending ON community_actions(submitted_at) WHERE verification_status = 'pending';
CREATE INDEX idx_community_actions_under_review ON community_actions(fraud_score DESC) WHERE verification_status = 'under_review';

CREATE INDEX idx_peer_validations_action_id ON peer_validations(action_id);
CREATE INDEX idx_peer_validations_validator_id ON peer_validations(validator_supporter_id);
CREATE INDEX idx_peer_validations_expires ON peer_validations(expires_at) WHERE responded_at IS NULL;

CREATE INDEX idx_fraud_reports_reported_action ON fraud_reports(reported_action_id);
CREATE INDEX idx_fraud_reports_reported_user ON fraud_reports(reported_user_id);
CREATE INDEX idx_fraud_reports_reporting_supporter ON fraud_reports(reporting_supporter_id);
CREATE INDEX idx_fraud_reports_status ON fraud_reports(status);
CREATE INDEX idx_fraud_reports_open ON fraud_reports(created_at DESC) WHERE status = 'open';

CREATE INDEX idx_penalties_user_id ON penalties(user_id);
CREATE INDEX idx_penalties_club_id ON penalties(club_id) WHERE club_id IS NOT NULL;
CREATE INDEX idx_penalties_is_active ON penalties(user_id, is_active) WHERE is_active = true;

CREATE INDEX idx_league_tables_season_league ON league_tables(season_id, league_id);
CREATE INDEX idx_league_tables_club ON league_tables(club_id);
CREATE INDEX idx_league_tables_position ON league_tables(season_id, league_id, position);
CREATE INDEX idx_league_tables_points ON league_tables(season_id, league_id, points DESC, community_difference DESC);

CREATE INDEX idx_individual_rankings_season ON individual_rankings(season_id);
CREATE INDEX idx_individual_rankings_supporter ON individual_rankings(supporter_id);
CREATE INDEX idx_individual_rankings_club ON individual_rankings(club_id);
CREATE INDEX idx_individual_rankings_overall ON individual_rankings(season_id, rank_overall);
CREATE INDEX idx_individual_rankings_in_club ON individual_rankings(season_id, club_id, rank_in_club);
CREATE INDEX idx_individual_rankings_points ON individual_rankings(season_id, community_points DESC);

CREATE INDEX idx_awards_season ON awards(season_id);
CREATE INDEX idx_awards_type ON awards(award_type);
CREATE INDEX idx_awards_published ON awards(season_id, is_published) WHERE is_published = true;

CREATE INDEX idx_legacy_projects_club ON legacy_projects(club_id);
CREATE INDEX idx_legacy_projects_status ON legacy_projects(status);
CREATE INDEX idx_legacy_projects_season ON legacy_projects(season_id);

CREATE INDEX idx_legacy_map_pins_club ON legacy_map_pins(club_id);
CREATE INDEX idx_legacy_map_pins_location ON legacy_map_pins(latitude, longitude);
CREATE INDEX idx_legacy_map_pins_action_type ON legacy_map_pins(action_type);
CREATE INDEX idx_legacy_map_pins_bbox ON legacy_map_pins(latitude, longitude, action_type, club_id);

CREATE INDEX idx_club_news_club ON club_news(club_id);
CREATE INDEX idx_club_news_slug ON club_news(slug);
CREATE INDEX idx_club_news_published ON club_news(club_id, is_published, published_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

CREATE INDEX idx_platform_settings_key ON platform_settings(key);
