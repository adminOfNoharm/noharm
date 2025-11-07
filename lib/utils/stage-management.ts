import { supabase } from '@/lib/supabase';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Interface for onboarding stage
export interface OnboardingStage {
  stage_id: number;
  stage_name: string;
  stage_description: string | null;
  onboarding_stage_index: number;
  is_active: boolean;
}

// Fetch all onboarding stages
export async function fetchOnboardingStages(): Promise<OnboardingStage[]> {
  try {
    const response = await fetch('/api/admin/stages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch stages');
    }

    const data = await response.json();
    return data.stages;
  } catch (error) {
    console.error('Error fetching stages:', error);
    throw error;
  }
}

// Get next stages for a workflow
export async function getNextStagesForRole(role: string, currentStageId: number): Promise<OnboardingStage[]> {
  try {
    const response = await fetch(`/api/admin/stages/next?role=${encodeURIComponent(role)}&current_stage_id=${currentStageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch next stages');
    }

    const data = await response.json();
    return data.stages;
  } catch (error) {
    console.error('Error fetching next stages for role:', error);
    throw error;
  }
} 