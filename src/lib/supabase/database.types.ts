export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          award_type: Database["public"]["Enums"]["award_type_enum"]
          awarded_at: string
          citation: string
          id: string
          is_published: boolean
          season_id: string
          winner_club_id: string | null
          winner_supporter_id: string | null
        }
        Insert: {
          award_type: Database["public"]["Enums"]["award_type_enum"]
          awarded_at?: string
          citation: string
          id?: string
          is_published?: boolean
          season_id: string
          winner_club_id?: string | null
          winner_supporter_id?: string | null
        }
        Update: {
          award_type?: Database["public"]["Enums"]["award_type_enum"]
          awarded_at?: string
          citation?: string
          id?: string
          is_published?: boolean
          season_id?: string
          winner_club_id?: string | null
          winner_supporter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "awards_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_winner_club_id_fkey"
            columns: ["winner_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_winner_supporter_id_fkey"
            columns: ["winner_supporter_id"]
            isOneToOne: false
            referencedRelation: "supporter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_news: {
        Row: {
          author_id: string
          club_id: string
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id: string
          club_id: string
          content: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string
          club_id?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "club_news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_news_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          actions_completed_alltime: number
          actions_completed_season: number
          badge_url: string | null
          city: string
          community_points_alltime: number
          community_points_season: number
          country: string
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          is_active: boolean
          is_verified: boolean
          league_id: string
          legacy_score: number
          name: string
          primary_colour: string
          season_draws: number
          season_losses: number
          season_points: number
          season_position: number | null
          season_wins: number
          secondary_colour: string
          short_name: string
          slug: string
          stadium_name: string | null
          total_supporters: number
          trees_planted_season: number
          updated_at: string
          volunteer_hours_season: number
          website_url: string | null
        }
        Insert: {
          actions_completed_alltime?: number
          actions_completed_season?: number
          badge_url?: string | null
          city: string
          community_points_alltime?: number
          community_points_season?: number
          country: string
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          league_id: string
          legacy_score?: number
          name: string
          primary_colour: string
          season_draws?: number
          season_losses?: number
          season_points?: number
          season_position?: number | null
          season_wins?: number
          secondary_colour: string
          short_name: string
          slug: string
          stadium_name?: string | null
          total_supporters?: number
          trees_planted_season?: number
          updated_at?: string
          volunteer_hours_season?: number
          website_url?: string | null
        }
        Update: {
          actions_completed_alltime?: number
          actions_completed_season?: number
          badge_url?: string | null
          city?: string
          community_points_alltime?: number
          community_points_season?: number
          country?: string
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          league_id?: string
          legacy_score?: number
          name?: string
          primary_colour?: string
          season_draws?: number
          season_losses?: number
          season_points?: number
          season_position?: number | null
          season_wins?: number
          secondary_colour?: string
          short_name?: string
          slug?: string
          stadium_name?: string | null
          total_supporters?: number
          trees_planted_season?: number
          updated_at?: string
          volunteer_hours_season?: number
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      community_actions: {
        Row: {
          action_category: Database["public"]["Enums"]["action_category_enum"]
          action_date: string
          action_type: Database["public"]["Enums"]["action_type_enum"]
          ai_analysis_score: number | null
          ai_flags: string[] | null
          base_points: number
          club_id: string
          created_at: string
          description: string
          device_fingerprint: string | null
          duplicate_hash: string | null
          final_points_awarded: number
          fixture_id: string | null
          food_items_count: number
          fraud_reason: string | null
          fraud_score: number
          gps_accuracy_metres: number
          gps_latitude: number
          gps_location_name: string | null
          gps_longitude: number
          id: string
          institution_contact: string | null
          institution_name: string | null
          institution_verification_token: string | null
          institution_verified: boolean
          institution_verified_at: string | null
          ip_address: string | null
          ip_country: string | null
          is_fraudulent: boolean
          legacy_points_awarded: number
          mission_id: string | null
          multiplier_applied: number
          peer_validations_approved: number
          peer_validations_received: number
          peer_validations_rejected: number
          peer_validations_required: number
          photo_urls: string[]
          rejection_reason: string | null
          season_id: string
          submitted_at: string
          supporter_id: string
          trees_count: number
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status_enum"]
          verification_tier: Database["public"]["Enums"]["verification_tier_enum"]
          verified_at: string | null
          verified_by: string | null
          volunteer_hours: number
          xp_awarded: number
        }
        Insert: {
          action_category: Database["public"]["Enums"]["action_category_enum"]
          action_date: string
          action_type: Database["public"]["Enums"]["action_type_enum"]
          ai_analysis_score?: number | null
          ai_flags?: string[] | null
          base_points: number
          club_id: string
          created_at?: string
          description: string
          device_fingerprint?: string | null
          duplicate_hash?: string | null
          final_points_awarded?: number
          fixture_id?: string | null
          food_items_count?: number
          fraud_reason?: string | null
          fraud_score?: number
          gps_accuracy_metres: number
          gps_latitude: number
          gps_location_name?: string | null
          gps_longitude: number
          id?: string
          institution_contact?: string | null
          institution_name?: string | null
          institution_verification_token?: string | null
          institution_verified?: boolean
          institution_verified_at?: string | null
          ip_address?: string | null
          ip_country?: string | null
          is_fraudulent?: boolean
          legacy_points_awarded?: number
          mission_id?: string | null
          multiplier_applied?: number
          peer_validations_approved?: number
          peer_validations_received?: number
          peer_validations_rejected?: number
          peer_validations_required?: number
          photo_urls?: string[]
          rejection_reason?: string | null
          season_id: string
          submitted_at?: string
          supporter_id: string
          trees_count?: number
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status_enum"]
          verification_tier: Database["public"]["Enums"]["verification_tier_enum"]
          verified_at?: string | null
          verified_by?: string | null
          volunteer_hours?: number
          xp_awarded?: number
        }
        Update: {
          action_category?: Database["public"]["Enums"]["action_category_enum"]
          action_date?: string
          action_type?: Database["public"]["Enums"]["action_type_enum"]
          ai_analysis_score?: number | null
          ai_flags?: string[] | null
          base_points?: number
          club_id?: string
          created_at?: string
          description?: string
          device_fingerprint?: string | null
          duplicate_hash?: string | null
          final_points_awarded?: number
          fixture_id?: string | null
          food_items_count?: number
          fraud_reason?: string | null
          fraud_score?: number
          gps_accuracy_metres?: number
          gps_latitude?: number
          gps_location_name?: string | null
          gps_longitude?: number
          id?: string
          institution_contact?: string | null
          institution_name?: string | null
          institution_verification_token?: string | null
          institution_verified?: boolean
          institution_verified_at?: string | null
          ip_address?: string | null
          ip_country?: string | null
          is_fraudulent?: boolean
          legacy_points_awarded?: number
          mission_id?: string | null
          multiplier_applied?: number
          peer_validations_approved?: number
          peer_validations_received?: number
          peer_validations_rejected?: number
          peer_validations_required?: number
          photo_urls?: string[]
          rejection_reason?: string | null
          season_id?: string
          submitted_at?: string
          supporter_id?: string
          trees_count?: number
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status_enum"]
          verification_tier?: Database["public"]["Enums"]["verification_tier_enum"]
          verified_at?: string | null
          verified_by?: string | null
          volunteer_hours?: number
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_actions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_actions_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_actions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_actions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_actions_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "supporter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_actions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fixtures: {
        Row: {
          away_actions_count: number
          away_club_id: string
          away_community_points: number
          created_at: string
          fixture_type: Database["public"]["Enums"]["fixture_type_enum"]
          home_actions_count: number
          home_club_id: string
          home_community_points: number
          id: string
          is_draw: boolean
          league_id: string
          match_date: string
          match_week: number
          mission_end_at: string | null
          mission_start_at: string | null
          mission_week_active: boolean
          point_multiplier: number
          season_id: string
          status: Database["public"]["Enums"]["fixture_status_enum"]
          updated_at: string
          winner_club_id: string | null
        }
        Insert: {
          away_actions_count?: number
          away_club_id: string
          away_community_points?: number
          created_at?: string
          fixture_type: Database["public"]["Enums"]["fixture_type_enum"]
          home_actions_count?: number
          home_club_id: string
          home_community_points?: number
          id?: string
          is_draw?: boolean
          league_id: string
          match_date: string
          match_week: number
          mission_end_at?: string | null
          mission_start_at?: string | null
          mission_week_active?: boolean
          point_multiplier?: number
          season_id: string
          status?: Database["public"]["Enums"]["fixture_status_enum"]
          updated_at?: string
          winner_club_id?: string | null
        }
        Update: {
          away_actions_count?: number
          away_club_id?: string
          away_community_points?: number
          created_at?: string
          fixture_type?: Database["public"]["Enums"]["fixture_type_enum"]
          home_actions_count?: number
          home_club_id?: string
          home_community_points?: number
          id?: string
          is_draw?: boolean
          league_id?: string
          match_date?: string
          match_week?: number
          mission_end_at?: string | null
          mission_start_at?: string | null
          mission_week_active?: boolean
          point_multiplier?: number
          season_id?: string
          status?: Database["public"]["Enums"]["fixture_status_enum"]
          updated_at?: string
          winner_club_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_club_id_fkey"
            columns: ["away_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_home_club_id_fkey"
            columns: ["home_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_winner_club_id_fkey"
            columns: ["winner_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_reports: {
        Row: {
          created_at: string
          description: string
          evidence_urls: string[] | null
          id: string
          report_type: Database["public"]["Enums"]["report_type_enum"]
          reported_action_id: string | null
          reported_user_id: string | null
          reporting_supporter_id: string
          resolution_notes: string | null
          resolved_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status_enum"]
        }
        Insert: {
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          id?: string
          report_type: Database["public"]["Enums"]["report_type_enum"]
          reported_action_id?: string | null
          reported_user_id?: string | null
          reporting_supporter_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status_enum"]
        }
        Update: {
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          id?: string
          report_type?: Database["public"]["Enums"]["report_type_enum"]
          reported_action_id?: string | null
          reported_user_id?: string | null
          reporting_supporter_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "fraud_reports_reported_action_id_fkey"
            columns: ["reported_action_id"]
            isOneToOne: false
            referencedRelation: "community_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_reports_reporting_supporter_id_fkey"
            columns: ["reporting_supporter_id"]
            isOneToOne: false
            referencedRelation: "supporter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_rankings: {
        Row: {
          actions_count: number
          club_id: string
          community_points: number
          food_donated: number
          id: string
          legacy_score: number
          rank_by_category: Json | null
          rank_in_club: number | null
          rank_overall: number | null
          season_id: string
          supporter_id: string
          trees_planted: number
          updated_at: string
          volunteer_hours: number
        }
        Insert: {
          actions_count?: number
          club_id: string
          community_points?: number
          food_donated?: number
          id?: string
          legacy_score?: number
          rank_by_category?: Json | null
          rank_in_club?: number | null
          rank_overall?: number | null
          season_id: string
          supporter_id: string
          trees_planted?: number
          updated_at?: string
          volunteer_hours?: number
        }
        Update: {
          actions_count?: number
          club_id?: string
          community_points?: number
          food_donated?: number
          id?: string
          legacy_score?: number
          rank_by_category?: Json | null
          rank_in_club?: number | null
          rank_overall?: number | null
          season_id?: string
          supporter_id?: string
          trees_planted?: number
          updated_at?: string
          volunteer_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "individual_rankings_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_rankings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_rankings_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "supporter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      league_tables: {
        Row: {
          club_id: string
          community_difference: number
          community_points_against: number
          community_points_for: number
          community_tasks_completed: number
          drawn: number
          form: string[]
          id: string
          league_id: string
          lost: number
          played: number
          points: number
          position: number
          season_id: string
          updated_at: string
          won: number
        }
        Insert: {
          club_id: string
          community_difference?: number
          community_points_against?: number
          community_points_for?: number
          community_tasks_completed?: number
          drawn?: number
          form?: string[]
          id?: string
          league_id: string
          lost?: number
          played?: number
          points?: number
          position: number
          season_id: string
          updated_at?: string
          won?: number
        }
        Update: {
          club_id?: string
          community_difference?: number
          community_points_against?: number
          community_points_for?: number
          community_tasks_completed?: number
          drawn?: number
          form?: string[]
          id?: string
          league_id?: string
          lost?: number
          played?: number
          points?: number
          position?: number
          season_id?: string
          updated_at?: string
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_tables_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_tables_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_tables_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          country: string
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          logo_url: string | null
          max_clubs: number
          name: string
          primary_colour: string
          promotion_spots: number
          relegation_spots: number
          season_id: string
          slug: string
          tier: number
        }
        Insert: {
          country: string
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_clubs?: number
          name: string
          primary_colour: string
          promotion_spots?: number
          relegation_spots?: number
          season_id: string
          slug: string
          tier: number
        }
        Update: {
          country?: string
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_clubs?: number
          name?: string
          primary_colour?: string
          promotion_spots?: number
          relegation_spots?: number
          season_id?: string
          slug?: string
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "leagues_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_map_pins: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type_enum"]
          club_id: string
          count: number
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          updated_at: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type_enum"]
          club_id: string
          count?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          updated_at?: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type_enum"]
          club_id?: string
          count?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_map_pins_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_projects: {
        Row: {
          club_id: string
          completion_date: string | null
          council_partner: string | null
          cover_image_url: string | null
          created_at: string
          current_legacy_score: number
          description: string
          gallery_urls: string[] | null
          id: string
          legacy_score_threshold: number
          location_lat: number | null
          location_lng: number | null
          location_name: string
          project_type: Database["public"]["Enums"]["project_type_enum"]
          season_id: string
          sponsor_partner: string | null
          status: Database["public"]["Enums"]["project_status_enum"]
          title: string
          updated_at: string
        }
        Insert: {
          club_id: string
          completion_date?: string | null
          council_partner?: string | null
          cover_image_url?: string | null
          created_at?: string
          current_legacy_score?: number
          description: string
          gallery_urls?: string[] | null
          id?: string
          legacy_score_threshold: number
          location_lat?: number | null
          location_lng?: number | null
          location_name: string
          project_type: Database["public"]["Enums"]["project_type_enum"]
          season_id: string
          sponsor_partner?: string | null
          status?: Database["public"]["Enums"]["project_status_enum"]
          title: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          completion_date?: string | null
          council_partner?: string | null
          cover_image_url?: string | null
          created_at?: string
          current_legacy_score?: number
          description?: string
          gallery_urls?: string[] | null
          id?: string
          legacy_score_threshold?: number
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string
          project_type?: Database["public"]["Enums"]["project_type_enum"]
          season_id?: string
          sponsor_partner?: string | null
          status?: Database["public"]["Enums"]["project_status_enum"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_projects_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_projects_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          action_category: Database["public"]["Enums"]["action_category_enum"]
          action_type: Database["public"]["Enums"]["action_type_enum"]
          base_points: number
          base_xp: number
          completions_count: number
          created_at: string
          description: string
          end_date: string
          fixture_id: string | null
          id: string
          is_active: boolean
          max_completions_per_user: number | null
          max_completions_total: number | null
          multiplier_override: number | null
          start_date: string
          title: string
          verification_tier_required: Database["public"]["Enums"]["verification_tier_enum"]
        }
        Insert: {
          action_category: Database["public"]["Enums"]["action_category_enum"]
          action_type: Database["public"]["Enums"]["action_type_enum"]
          base_points: number
          base_xp: number
          completions_count?: number
          created_at?: string
          description: string
          end_date: string
          fixture_id?: string | null
          id?: string
          is_active?: boolean
          max_completions_per_user?: number | null
          max_completions_total?: number | null
          multiplier_override?: number | null
          start_date: string
          title: string
          verification_tier_required: Database["public"]["Enums"]["verification_tier_enum"]
        }
        Update: {
          action_category?: Database["public"]["Enums"]["action_category_enum"]
          action_type?: Database["public"]["Enums"]["action_type_enum"]
          base_points?: number
          base_xp?: number
          completions_count?: number
          created_at?: string
          description?: string
          end_date?: string
          fixture_id?: string | null
          id?: string
          is_active?: boolean
          max_completions_per_user?: number | null
          max_completions_total?: number | null
          multiplier_override?: number | null
          start_date?: string
          title?: string
          verification_tier_required?: Database["public"]["Enums"]["verification_tier_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "missions_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type_enum"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type_enum"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_validations: {
        Row: {
          action_id: string
          assigned_at: string
          created_at: string
          expires_at: string
          id: string
          notes: string | null
          responded_at: string | null
          validation_result: Database["public"]["Enums"]["validation_result_enum"]
          validator_supporter_id: string
        }
        Insert: {
          action_id: string
          assigned_at?: string
          created_at?: string
          expires_at: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          validation_result: Database["public"]["Enums"]["validation_result_enum"]
          validator_supporter_id: string
        }
        Update: {
          action_id?: string
          assigned_at?: string
          created_at?: string
          expires_at?: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          validation_result?: Database["public"]["Enums"]["validation_result_enum"]
          validator_supporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_validations_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "community_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_validations_validator_supporter_id_fkey"
            columns: ["validator_supporter_id"]
            isOneToOne: false
            referencedRelation: "supporter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      penalties: {
        Row: {
          appeal_resolution_notes: string | null
          appeal_resolved_by: string | null
          appeal_status: Database["public"]["Enums"]["appeal_status_enum"]
          appeal_submitted_at: string | null
          club_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          issued_at: string
          issued_by: string
          penalty_type: Database["public"]["Enums"]["penalty_type_enum"]
          points_deducted: number
          reason: string
          suspension_days: number | null
          user_id: string
        }
        Insert: {
          appeal_resolution_notes?: string | null
          appeal_resolved_by?: string | null
          appeal_status?: Database["public"]["Enums"]["appeal_status_enum"]
          appeal_submitted_at?: string | null
          club_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          issued_at?: string
          issued_by: string
          penalty_type: Database["public"]["Enums"]["penalty_type_enum"]
          points_deducted?: number
          reason: string
          suspension_days?: number | null
          user_id: string
        }
        Update: {
          appeal_resolution_notes?: string | null
          appeal_resolved_by?: string | null
          appeal_status?: Database["public"]["Enums"]["appeal_status_enum"]
          appeal_submitted_at?: string | null
          club_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          issued_at?: string
          issued_by?: string
          penalty_type?: Database["public"]["Enums"]["penalty_type_enum"]
          points_deducted?: number
          reason?: string
          suspension_days?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalties_appeal_resolved_by_fkey"
            columns: ["appeal_resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalties_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalties_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_completed: boolean
          is_current: boolean
          name: string
          slug: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_completed?: boolean
          is_current?: boolean
          name: string
          slug: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_completed?: boolean
          is_current?: boolean
          name?: string
          slug?: string
          start_date?: string
        }
        Relationships: []
      }
      supporter_profiles: {
        Row: {
          actions_completed_season: number
          actions_completed_total: number
          avatar_url: string | null
          bio: string | null
          club_id: string | null
          club_joined_at: string | null
          community_points_alltime: number
          community_points_season: number
          created_at: string
          current_level: number
          current_xp: number
          display_name: string
          food_donations_total: number
          id: string
          is_public: boolean
          last_action_at: string | null
          legacy_score: number
          location_city: string | null
          location_country: string
          specialist_path:
            | Database["public"]["Enums"]["specialist_path_enum"]
            | null
          specialist_path_set_at: string | null
          streak_current_days: number
          streak_longest_days: number
          total_xp_ever: number
          trees_planted_total: number
          updated_at: string
          user_id: string
          username: string
          volunteer_hours_total: number
        }
        Insert: {
          actions_completed_season?: number
          actions_completed_total?: number
          avatar_url?: string | null
          bio?: string | null
          club_id?: string | null
          club_joined_at?: string | null
          community_points_alltime?: number
          community_points_season?: number
          created_at?: string
          current_level?: number
          current_xp?: number
          display_name: string
          food_donations_total?: number
          id?: string
          is_public?: boolean
          last_action_at?: string | null
          legacy_score?: number
          location_city?: string | null
          location_country?: string
          specialist_path?:
            | Database["public"]["Enums"]["specialist_path_enum"]
            | null
          specialist_path_set_at?: string | null
          streak_current_days?: number
          streak_longest_days?: number
          total_xp_ever?: number
          trees_planted_total?: number
          updated_at?: string
          user_id: string
          username: string
          volunteer_hours_total?: number
        }
        Update: {
          actions_completed_season?: number
          actions_completed_total?: number
          avatar_url?: string | null
          bio?: string | null
          club_id?: string | null
          club_joined_at?: string | null
          community_points_alltime?: number
          community_points_season?: number
          created_at?: string
          current_level?: number
          current_xp?: number
          display_name?: string
          food_donations_total?: number
          id?: string
          is_public?: boolean
          last_action_at?: string | null
          legacy_score?: number
          location_city?: string | null
          location_country?: string
          specialist_path?:
            | Database["public"]["Enums"]["specialist_path_enum"]
            | null
          specialist_path_set_at?: string | null
          streak_current_days?: number
          streak_longest_days?: number
          total_xp_ever?: number
          trees_planted_total?: number
          updated_at?: string
          user_id?: string
          username?: string
          volunteer_hours_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "supporter_profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supporter_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status_enum"]
          created_at: string
          email: string
          email_verification_expires_at: string | null
          email_verification_token: string | null
          email_verified: boolean
          failed_login_attempts: number
          id: string
          is_admin: boolean
          is_moderator: boolean
          last_login_at: string | null
          locked_until: string | null
          notification_email_actions: boolean
          notification_email_security: boolean
          notification_email_weekly: boolean
          password_hash: string
          password_reset_expires_at: string | null
          password_reset_token: string | null
          referral_code: string
          referred_by: string | null
          updated_at: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          created_at?: string
          email: string
          email_verification_expires_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean
          failed_login_attempts?: number
          id?: string
          is_admin?: boolean
          is_moderator?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          notification_email_actions?: boolean
          notification_email_security?: boolean
          notification_email_weekly?: boolean
          password_hash: string
          password_reset_expires_at?: string | null
          password_reset_token?: string | null
          referral_code: string
          referred_by?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          created_at?: string
          email?: string
          email_verification_expires_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean
          failed_login_attempts?: number
          id?: string
          is_admin?: boolean
          is_moderator?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          notification_email_actions?: boolean
          notification_email_security?: boolean
          notification_email_weekly?: boolean
          password_hash?: string
          password_reset_expires_at?: string | null
          password_reset_token?: string | null
          referral_code?: string
          referred_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_level_thresholds: {
        Row: {
          badge_url: string | null
          colour: string
          id: string
          level: number
          perks: string[] | null
          title: string
          xp_required: number
        }
        Insert: {
          badge_url?: string | null
          colour: string
          id?: string
          level: number
          perks?: string[] | null
          title: string
          xp_required: number
        }
        Update: {
          badge_url?: string | null
          colour?: string
          id?: string
          level?: number
          perks?: string[] | null
          title?: string
          xp_required?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_streak: { Args: { p_supporter_id: string }; Returns: number }
      generate_referral_code: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_moderator: { Args: never; Returns: boolean }
      process_approved_action: {
        Args: { p_action_id: string }
        Returns: undefined
      }
      recalculate_league_table: {
        Args: { p_league_id: string; p_season_id: string }
        Returns: undefined
      }
    }
    Enums: {
      account_status_enum:
        | "active"
        | "suspended"
        | "banned"
        | "pending_verification"
      action_category_enum:
        | "environment"
        | "social_care"
        | "youth_development"
        | "community_regeneration"
      action_type_enum:
        | "litter_collection"
        | "recycling_activity"
        | "food_donation"
        | "tree_planting"
        | "volunteer_hour"
        | "blood_donation"
        | "event_leadership"
        | "youth_mentoring"
        | "elderly_assistance"
        | "homeless_outreach"
        | "playground_build"
        | "park_restoration"
        | "community_centre"
        | "coaching_session"
      appeal_status_enum: "none" | "pending" | "approved" | "rejected"
      award_type_enum:
        | "community_golden_boot"
        | "community_playmaker"
        | "community_iron_man"
        | "community_green_boot"
        | "community_heart_award"
        | "community_rising_star"
        | "community_captain_year"
        | "legacy_ball"
        | "league_champions"
        | "community_club_year"
        | "community_green_club"
        | "community_heart_club"
        | "legacy_project_year"
      fixture_status_enum: "upcoming" | "active" | "completed" | "cancelled"
      fixture_type_enum: "league" | "cup" | "derby" | "continental" | "final"
      notification_type_enum:
        | "action_approved"
        | "action_rejected"
        | "level_up"
        | "points_awarded"
        | "fixture_starting"
        | "mission_available"
        | "penalty_issued"
        | "peer_validation_needed"
        | "fraud_report_resolved"
        | "award_won"
        | "league_position_change"
        | "club_news"
        | "system_announcement"
      penalty_type_enum:
        | "warning"
        | "point_deduction"
        | "account_suspension"
        | "club_penalty"
        | "permanent_ban"
      project_status_enum: "proposed" | "approved" | "in_progress" | "completed"
      project_type_enum:
        | "youth_pitch"
        | "community_centre"
        | "playground"
        | "urban_forest"
        | "regeneration_scheme"
        | "community_garden"
      report_status_enum:
        | "open"
        | "under_review"
        | "resolved_genuine"
        | "resolved_fraudulent"
        | "dismissed"
      report_type_enum:
        | "duplicate_submission"
        | "fake_photo"
        | "wrong_location"
        | "coordinated_fraud"
        | "bot_activity"
        | "other"
      specialist_path_enum:
        | "environmental_champion"
        | "community_hero"
        | "youth_mentor"
        | "legacy_builder"
      validation_result_enum: "approved" | "rejected" | "flagged"
      verification_status_enum:
        | "pending"
        | "tier1_approved"
        | "tier2_approved"
        | "tier3_approved"
        | "rejected"
        | "flagged"
        | "under_review"
      verification_tier_enum: "tier_1" | "tier_2" | "tier_3"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status_enum: [
        "active",
        "suspended",
        "banned",
        "pending_verification",
      ],
      action_category_enum: [
        "environment",
        "social_care",
        "youth_development",
        "community_regeneration",
      ],
      action_type_enum: [
        "litter_collection",
        "recycling_activity",
        "food_donation",
        "tree_planting",
        "volunteer_hour",
        "blood_donation",
        "event_leadership",
        "youth_mentoring",
        "elderly_assistance",
        "homeless_outreach",
        "playground_build",
        "park_restoration",
        "community_centre",
        "coaching_session",
      ],
      appeal_status_enum: ["none", "pending", "approved", "rejected"],
      award_type_enum: [
        "community_golden_boot",
        "community_playmaker",
        "community_iron_man",
        "community_green_boot",
        "community_heart_award",
        "community_rising_star",
        "community_captain_year",
        "legacy_ball",
        "league_champions",
        "community_club_year",
        "community_green_club",
        "community_heart_club",
        "legacy_project_year",
      ],
      fixture_status_enum: ["upcoming", "active", "completed", "cancelled"],
      fixture_type_enum: ["league", "cup", "derby", "continental", "final"],
      notification_type_enum: [
        "action_approved",
        "action_rejected",
        "level_up",
        "points_awarded",
        "fixture_starting",
        "mission_available",
        "penalty_issued",
        "peer_validation_needed",
        "fraud_report_resolved",
        "award_won",
        "league_position_change",
        "club_news",
        "system_announcement",
      ],
      penalty_type_enum: [
        "warning",
        "point_deduction",
        "account_suspension",
        "club_penalty",
        "permanent_ban",
      ],
      project_status_enum: ["proposed", "approved", "in_progress", "completed"],
      project_type_enum: [
        "youth_pitch",
        "community_centre",
        "playground",
        "urban_forest",
        "regeneration_scheme",
        "community_garden",
      ],
      report_status_enum: [
        "open",
        "under_review",
        "resolved_genuine",
        "resolved_fraudulent",
        "dismissed",
      ],
      report_type_enum: [
        "duplicate_submission",
        "fake_photo",
        "wrong_location",
        "coordinated_fraud",
        "bot_activity",
        "other",
      ],
      specialist_path_enum: [
        "environmental_champion",
        "community_hero",
        "youth_mentor",
        "legacy_builder",
      ],
      validation_result_enum: ["approved", "rejected", "flagged"],
      verification_status_enum: [
        "pending",
        "tier1_approved",
        "tier2_approved",
        "tier3_approved",
        "rejected",
        "flagged",
        "under_review",
      ],
      verification_tier_enum: ["tier_1", "tier_2", "tier_3"],
    },
  },
} as const
