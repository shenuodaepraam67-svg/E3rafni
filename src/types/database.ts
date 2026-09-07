// Database Types
// This file mirrors the schema defined in docs/02_DATABASE_SCHEMA.md
// In a real environment, this should be generated via:
// npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> --schema public > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tests: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          status: 'draft' | 'active' | 'paused'
          visibility: string | null
          allow_anonymous: boolean | null
          show_score_to_participant: boolean | null
          show_rank_to_participant: boolean | null
          allow_result_sharing: boolean | null
          theme: Json | null
          cover_image_url: string | null
          share_code: string
          total_questions: number | null
          attempt_count: number | null
          completed_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          status?: 'draft' | 'active' | 'paused'
          visibility?: string | null
          allow_anonymous?: boolean | null
          show_score_to_participant?: boolean | null
          show_rank_to_participant?: boolean | null
          allow_result_sharing?: boolean | null
          theme?: Json | null
          cover_image_url?: string | null
          share_code?: string
          total_questions?: number | null
          attempt_count?: number | null
          completed_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'active' | 'paused'
          visibility?: string | null
          allow_anonymous?: boolean | null
          show_score_to_participant?: boolean | null
          show_rank_to_participant?: boolean | null
          allow_result_sharing?: boolean | null
          theme?: Json | null
          cover_image_url?: string | null
          share_code?: string
          total_questions?: number | null
          attempt_count?: number | null
          completed_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      test_questions: {
        Row: {
          id: string
          test_id: string
          question_type: 'essay' | 'multiple_choice'
          prompt: string
          position: number | null
          required: boolean | null
          points: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          test_id: string
          question_type: 'essay' | 'multiple_choice'
          prompt: string
          position?: number | null
          required?: boolean | null
          points?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          test_id?: string
          question_type?: 'essay' | 'multiple_choice'
          prompt?: string
          position?: number | null
          required?: boolean | null
          points?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          position: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          position?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          position?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      test_attempts: {
        Row: {
          id: string
          test_id: string
          participant_user_id: string | null
          participant_name: string | null
          participant_token: string
          status: string | null
          score: number | null
          max_score: number | null
          percentage: number | null
          rank: number | null
          submitted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          test_id: string
          participant_user_id?: string | null
          participant_name?: string | null
          participant_token?: string
          status?: string | null
          score?: number | null
          max_score?: number | null
          percentage?: number | null
          rank?: number | null
          submitted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          test_id?: string
          participant_user_id?: string | null
          participant_name?: string | null
          participant_token?: string
          status?: string | null
          score?: number | null
          max_score?: number | null
          percentage?: number | null
          rank?: number | null
          submitted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      test_answers: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          selected_option_id: string | null
          answer_text: string | null
          is_correct: boolean | null
          points_awarded: number | null
          reviewed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          selected_option_id?: string | null
          answer_text?: string | null
          is_correct?: boolean | null
          points_awarded?: number | null
          reviewed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          selected_option_id?: string | null
          answer_text?: string | null
          is_correct?: boolean | null
          points_awarded?: number | null
          reviewed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          criteria: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          criteria?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          criteria?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string | null
          title: string | null
          message: string | null
          data: Json | null
          read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type?: string | null
          title?: string | null
          message?: string | null
          data?: Json | null
          read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string | null
          title?: string | null
          message?: string | null
          data?: Json | null
          read?: boolean | null
          created_at?: string | null
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_type: string | null
          target_id: string | null
          reason: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          reporter_id: string
          target_type?: string | null
          target_id?: string | null
          reason?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string
          target_type?: string | null
          target_id?: string | null
          reason?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      ad_placements: {
        Row: {
          id: string
          placement_name: string
          ad_code: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          placement_name: string
          ad_code?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          placement_name?: string
          ad_code?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      ad_events_daily: {
        Row: {
          id: string
          date: string | null
          placement_name: string | null
          impressions: number | null
          clicks: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          date?: string | null
          placement_name?: string | null
          impressions?: number | null
          clicks?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          date?: string | null
          placement_name?: string | null
          impressions?: number | null
          clicks?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json | null
          updated_at?: string | null
        }
      }
    }
  }
}
