CREATE TYPE account_status_enum AS ENUM (
  'active',
  'suspended',
  'banned',
  'pending_verification'
);

CREATE TYPE specialist_path_enum AS ENUM (
  'environmental_champion',
  'community_hero',
  'youth_mentor',
  'legacy_builder'
);

CREATE TYPE action_category_enum AS ENUM (
  'environment',
  'social_care',
  'youth_development',
  'community_regeneration'
);

CREATE TYPE action_type_enum AS ENUM (
  'litter_collection',
  'recycling_activity',
  'food_donation',
  'tree_planting',
  'volunteer_hour',
  'blood_donation',
  'event_leadership',
  'youth_mentoring',
  'elderly_assistance',
  'homeless_outreach',
  'playground_build',
  'park_restoration',
  'community_centre',
  'coaching_session'
);

CREATE TYPE fixture_type_enum AS ENUM (
  'league',
  'cup',
  'derby',
  'continental',
  'final'
);

CREATE TYPE fixture_status_enum AS ENUM (
  'upcoming',
  'active',
  'completed',
  'cancelled'
);

CREATE TYPE verification_status_enum AS ENUM (
  'pending',
  'tier1_approved',
  'tier2_approved',
  'tier3_approved',
  'rejected',
  'flagged',
  'under_review'
);

CREATE TYPE verification_tier_enum AS ENUM (
  'tier_1',
  'tier_2',
  'tier_3'
);

CREATE TYPE validation_result_enum AS ENUM (
  'approved',
  'rejected',
  'flagged'
);

CREATE TYPE report_type_enum AS ENUM (
  'duplicate_submission',
  'fake_photo',
  'wrong_location',
  'coordinated_fraud',
  'bot_activity',
  'other'
);

CREATE TYPE report_status_enum AS ENUM (
  'open',
  'under_review',
  'resolved_genuine',
  'resolved_fraudulent',
  'dismissed'
);

CREATE TYPE penalty_type_enum AS ENUM (
  'warning',
  'point_deduction',
  'account_suspension',
  'club_penalty',
  'permanent_ban'
);

CREATE TYPE appeal_status_enum AS ENUM (
  'none',
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE project_type_enum AS ENUM (
  'youth_pitch',
  'community_centre',
  'playground',
  'urban_forest',
  'regeneration_scheme',
  'community_garden'
);

CREATE TYPE project_status_enum AS ENUM (
  'proposed',
  'approved',
  'in_progress',
  'completed'
);

CREATE TYPE award_type_enum AS ENUM (
  'community_golden_boot',
  'community_playmaker',
  'community_iron_man',
  'community_green_boot',
  'community_heart_award',
  'community_rising_star',
  'community_captain_year',
  'legacy_ball',
  'league_champions',
  'community_club_year',
  'community_green_club',
  'community_heart_club',
  'legacy_project_year'
);

CREATE TYPE notification_type_enum AS ENUM (
  'action_approved',
  'action_rejected',
  'level_up',
  'points_awarded',
  'fixture_starting',
  'mission_available',
  'penalty_issued',
  'peer_validation_needed',
  'fraud_report_resolved',
  'award_won',
  'league_position_change',
  'club_news',
  'system_announcement'
);
