/**
 * TypeScript interfaces for Supabase database models
 * These interfaces help maintain type safety when working with database records
 */

// Analytics Events
export interface AnalyticsEvent {
  id: string;
  created_at: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  auth_user?: {
    email: string;
  };
}

// Onboarding Stages
export interface OnboardingStage {
  stage_id: number;
  stage_name: string;
  onboarding_stage_index: number;
  description?: string;
}

// User Onboarding Progress
export interface OnboardingProgress {
  uuid: string;
  stage_id: number;
  status: string;
  created_at: string;
  last_updated_at: string;
  onboarding_stages: OnboardingStage;
}

// Status Change for Activity Tracking
export interface StatusChange {
  uuid: string;
  email: string;
  status: string;
  last_updated_status: string;
  stage_name: string;
  previous_stage_name?: string;
  is_stage_change: boolean;
}

// Email Click Events
export interface EmailClickEvent {
  id: string;
  created_at: string;
  email: string;
  source: string;
  staticStage: string | null;
  role: string | null;
}

// User Profile
export interface UserProfile {
  uuid: string;
  email: string;
  role: string;
  status: string;
  data: Record<string, any>;
  current_stage?: {
    stage_id: number;
    stage_name: string;
    status: string;
    stage_index: number;
  };
}

// User Documents
export interface UserDocument {
  name: string;
  size: number;
  type: string;
  created_at: string;
  url: string;
}

// Profile Notes
export interface ProfileNotes {
  id: number;
  profile_uuid: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Metrics
export interface ProfileMetrics {
  totalProfiles: number;
  inReviewProfiles: number;
  boardingProfiles: number;
}

// Email Metrics
export interface EmailMetrics {
  uniqueEmailClicks: number;
  staticUsers: number;
} 