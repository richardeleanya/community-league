WITH milestone_levels AS (
  SELECT *
  FROM (
    VALUES
      (1, 'Supporter', 0, '#9999BB', ARRAY[]::text[]),
      (5, 'Contributor', 2500, '#6C63FF', ARRAY['early_mission_access']::text[]),
      (10, 'Volunteer', 8000, '#00E5A0', ARRAY['peer_validation_eligible', 'profile_badge']::text[]),
      (20, 'Community Captain', 25000, '#FFB547', ARRAY['mission_creation_suggestions', 'club_ambassador_status']::text[]),
      (35, 'Community Champion', 75000, '#FF4D6D', ARRAY['legacy_project_voting', 'hall_of_fame_eligible']::text[]),
      (50, 'Club Legend', 175000, '#FFD700', ARRAY['exclusive_events', 'mentor_program_access']::text[]),
      (75, 'Civic Icon', 400000, '#9D97FF', ARRAY['regional_ambassador', 'platform_advisory']::text[]),
      (100, 'Legacy Builder', 1000000, '#F0F0FF', ARRAY['lifetime_recognition', 'founding_member_status']::text[])
  ) AS milestone(level, title, xp_required, colour, perks)
),
level_bounds AS (
  SELECT
    level AS start_level,
    title AS start_title,
    xp_required AS start_xp,
    colour AS start_colour,
    perks AS start_perks,
    lead(level) OVER (ORDER BY level) AS end_level,
    lead(xp_required) OVER (ORDER BY level) AS end_xp
  FROM milestone_levels
),
interpolated_levels AS (
  SELECT
    generated_level.level,
    CASE
      WHEN generated_level.level = milestone_levels.level THEN milestone_levels.title
      ELSE level_bounds.start_title
    END AS title,
    CASE
      WHEN generated_level.level = milestone_levels.level THEN milestone_levels.xp_required
      WHEN level_bounds.end_level IS NULL THEN level_bounds.start_xp
      ELSE ROUND(
        level_bounds.start_xp
        + (
          (level_bounds.end_xp - level_bounds.start_xp)::numeric
          * ((generated_level.level - level_bounds.start_level)::numeric / (level_bounds.end_level - level_bounds.start_level)::numeric)
        )
      )::integer
    END AS xp_required,
    CASE
      WHEN generated_level.level = milestone_levels.level THEN milestone_levels.colour
      ELSE level_bounds.start_colour
    END AS colour,
    CASE
      WHEN generated_level.level = milestone_levels.level THEN milestone_levels.perks
      ELSE ARRAY[]::text[]
    END AS perks
  FROM generate_series(1, 100) AS generated_level(level)
  JOIN level_bounds
    ON generated_level.level >= level_bounds.start_level
   AND (
      generated_level.level < level_bounds.end_level
      OR level_bounds.end_level IS NULL
   )
  LEFT JOIN milestone_levels
    ON milestone_levels.level = generated_level.level
)
INSERT INTO xp_level_thresholds (
  level,
  title,
  xp_required,
  colour,
  perks
)
SELECT
  level,
  title,
  xp_required,
  colour,
  perks
FROM interpolated_levels
ORDER BY level
ON CONFLICT (level) DO UPDATE
SET
  title = EXCLUDED.title,
  xp_required = EXCLUDED.xp_required,
  colour = EXCLUDED.colour,
  perks = EXCLUDED.perks;

INSERT INTO platform_settings (key, value, description)
VALUES
  (
    'fraud_gps_accuracy_threshold',
    '{"max_metres":500}'::jsonb,
    'GPS accuracy threshold for spoof detection'
  ),
  (
    'fraud_max_actions_per_hour',
    '{"limit":3}'::jsonb,
    'Maximum actions per device per hour'
  ),
  (
    'fraud_max_actions_per_day',
    '{"limit":8}'::jsonb,
    'Maximum approved actions per supporter per day'
  ),
  (
    'fraud_same_type_24h_limit',
    '{"limit":3}'::jsonb,
    'Maximum same-type actions per supporter in 24 hours'
  ),
  (
    'fraud_velocity_increase_threshold',
    '{"percentage":300}'::jsonb,
    'Submission velocity increase threshold before fixture review'
  ),
  (
    'fraud_device_account_limit',
    '{"limit":3}'::jsonb,
    'Maximum accounts per device fingerprint before review'
  ),
  (
    'fraud_score_auto_flag',
    '{"threshold":70}'::jsonb,
    'Fraud score threshold for automatic flagging'
  ),
  (
    'fraud_score_review',
    '{"threshold":40}'::jsonb,
    'Fraud score threshold for manual review'
  ),
  (
    'fraud_duplicate_hamming_distance',
    '{"distance":10}'::jsonb,
    'Perceptual hash similarity threshold for duplicate image detection'
  ),
  (
    'fraud_phash_window_days',
    '{"days":90}'::jsonb,
    'Days to search for duplicate image pHash matches'
  ),
  (
    'fraud_location_distance_km',
    '{"km":500}'::jsonb,
    'Maximum kilometres between submissions in a four-hour travel window'
  ),
  (
    'fraud_old_photo_days',
    '{"days":7}'::jsonb,
    'Maximum acceptable source photo age based on EXIF date'
  ),
  (
    'verification_peer_timeout_hours',
    '{"hours":48}'::jsonb,
    'Peer validation response timeout'
  ),
  (
    'verification_institution_timeout_days',
    '{"days":7}'::jsonb,
    'Institution verification response timeout'
  ),
  (
    'verification_peer_validators_required',
    '{"count":3}'::jsonb,
    'Validators assigned per tier two action'
  ),
  (
    'verification_peer_approvals_needed',
    '{"count":2}'::jsonb,
    'Approvals needed from assigned peer validators'
  ),
  (
    'verification_auto_approve_min_score',
    '{"score":0.80}'::jsonb,
    'AI score required for automatic tier one approval'
  ),
  (
    'verification_manual_review_score',
    '{"score":0.65}'::jsonb,
    'AI score below which manual review is required'
  ),
  (
    'points_multiplier_table',
    '{"league":1.0,"cup":3.0,"derby":2.0,"continental":4.0,"final":5.0}'::jsonb,
    'Fixture type point multipliers'
  ),
  (
    'points_xp_max_multiplier',
    '{"max":2.0}'::jsonb,
    'Maximum multiplier applied to XP awards'
  ),
  (
    'session_inactivity_days',
    '{"days":30}'::jsonb,
    'Session expiry after inactivity'
  ),
  (
    'max_login_attempts',
    '{"count":5}'::jsonb,
    'Failed login attempts before account lockout'
  ),
  (
    'lockout_duration_minutes',
    '{"minutes":15}'::jsonb,
    'Account lockout duration after failed login threshold'
  ),
  (
    'referral_bonus_points',
    '{"points":100}'::jsonb,
    'Points awarded after a valid referred user completes their first approved action'
  ),
  (
    'action_description_min_chars',
    '{"chars":50}'::jsonb,
    'Minimum action description character count'
  ),
  (
    'action_description_max_chars',
    '{"chars":500}'::jsonb,
    'Maximum action description character count'
  ),
  (
    'action_max_photos',
    '{"count":10}'::jsonb,
    'Maximum photos per action submission'
  ),
  (
    'action_photo_max_mb',
    '{"mb":2}'::jsonb,
    'Maximum photo size after client-side compression'
  ),
  (
    'action_max_days_past',
    '{"days":7}'::jsonb,
    'Maximum number of past days an action can be dated'
  ),
  (
    'public_settings_whitelist',
    '{"keys":["points_multiplier_table"]}'::jsonb,
    'Platform setting keys accessible without authentication'
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();
