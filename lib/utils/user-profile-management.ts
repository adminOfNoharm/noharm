import { supabase } from '@/lib/supabase';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Interface for current stage
export interface CurrentStage {
  stage_id: number;
  stage_name: string;
  status: string;
  stage_index: number;
}

// Interface for user profile
export interface UserProfile {
  uuid: string;
  email: string;
  role: string;
  status: string;
  data: any;
  current_stage?: CurrentStage;
  onboarding_stages?: Array<{
    stage_id: number;
    stage_name: string;
    status: string;
    stage_index: number;
    data: Record<string, any>;
  }>;
}

// Interface for user document
export interface UserDocument {
  name: string;
  size: number;
  type: string;
  created_at: string;
  url: string;
}

// Fetch complete user profile data
export async function fetchUserProfile(uuid: string): Promise<UserProfile> {
  try {
    const response = await fetch(`/api/admin/user-profile?uuid=${encodeURIComponent(uuid)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user profile');
    }

    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Fetch stage information for a user
export async function fetchUserStage(uuid: string): Promise<CurrentStage> {
  try {
    const response = await fetch(`/api/admin/user-profile/stage?uuid=${encodeURIComponent(uuid)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user stage');
    }

    const data = await response.json();
    return data.currentStage;
  } catch (error) {
    console.error('Error fetching user stage:', error);
    throw error;
  }
}

// Interface for onboarding stage
export interface OnboardingStage {
  stage_id: number;
  stage_name: string;
  onboarding_stage_index: number;
  description?: string;
}

// Fetch next possible stages for a user
export async function fetchNextStages(uuid: string, currentStageId: number, role: string): Promise<OnboardingStage[]> {
  try {
    const response = await fetch(
      `/api/admin/user-profile/stage/next?uuid=${encodeURIComponent(uuid)}&role=${encodeURIComponent(role)}&current_stage_id=${currentStageId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch next stages');
    }

    const data = await response.json();
    return data.nextStages;
  } catch (error) {
    console.error('Error fetching next stages:', error);
    throw error;
  }
}

// Update user's stage status
export async function updateStageStatus(uuid: string, stageId: number, status: string): Promise<CurrentStage> {
  try {
    const response = await fetch('/api/admin/user-profile/stage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        uuid,
        stageId,
        status
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update stage status');
    }

    const data = await response.json();
    return data.currentStage;
  } catch (error) {
    console.error('Error updating stage status:', error);
    throw error;
  }
}

// Move user to next stage
export async function moveToNextStage(uuid: string, nextStageId: string, currentStageId?: number): Promise<CurrentStage> {
  try {
    const payload: Record<string, any> = {
      uuid,
      nextStageId
    };
    
    // Add currentStageId to payload if provided
    if (currentStageId !== undefined) {
      payload.currentStageId = currentStageId;
    }
    
    const response = await fetch('/api/admin/user-profile/stage/next', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to move to next stage');
    }

    const data = await response.json();
    return data.currentStage;
  } catch (error) {
    console.error('Error moving to next stage:', error);
    throw error;
  }
}

// Fetch buyer tool preferences
export async function fetchBuyerToolPreferences(uuid: string): Promise<string> {
  try {
    const response = await fetch(`/api/admin/user-profile/tool-preferences?uuid=${encodeURIComponent(uuid)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch buyer tool preferences');
    }

    const data = await response.json();
    return data.tool_preferences;
  } catch (error) {
    console.error('Error fetching buyer tool preferences:', error);
    throw error;
  }
}

// Fetch user documents
export async function fetchUserDocuments(uuid: string): Promise<UserDocument[]> {
  try {
    const response = await fetch(`/api/admin/documents?user_uuid=${encodeURIComponent(uuid)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user documents');
    }

    const data = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Error fetching user documents:', error);
    throw error;
  }
}

export async function updateTrialStatus(uuid: string, isTrialEnabled: boolean) {
  try {
    const { data, error } = await supabase
      .from('seller_compound_data')
      .update({ is_trial_enabled: isTrialEnabled })
      .eq('uuid', uuid)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating trial status:', error);
    return { success: false, error };
  }
} 