import { supabase } from '@/lib/supabase';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Profile Notes interface
export interface ProfileNotes {
  id: number;
  notes: string;
  updated_at: string;
  user_uuid?: string;
}

// Fetch profile notes
export async function fetchProfileNotes(profileUuid: string): Promise<ProfileNotes | null> {
  try {
    const response = await fetch(`/api/admin/profile-notes?profile_uuid=${encodeURIComponent(profileUuid)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch profile notes');
    }

    const data = await response.json();
    return data.note || null;
  } catch (error) {
    console.error('Error fetching profile notes:', error);
    throw error;
  }
}

export async function saveProfileNotes(profileUuid: string, notes: string): Promise<any> {
  try {
    const response = await fetch('/api/admin/profile-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        profileUuid,
        notes
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save profile notes');
    }

    const data = await response.json();
    return data.note;
  } catch (error) {
    console.error('Error saving profile notes:', error);
    throw error;
  }
}

// Document Management
export interface UserDocument {
  name: string;
  size: number;
  type: string;
  created_at: string;
  url: string;
}

export async function fetchUserDocuments(userUuid: string): Promise<UserDocument[]> {
  try {
    const response = await fetch(`/api/admin/documents?user_uuid=${encodeURIComponent(userUuid)}`, {
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

export async function deleteUserDocument(userUuid: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/documents?user_uuid=${encodeURIComponent(userUuid)}&file_name=${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete document');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Onboarding Progress Management
export interface OnboardingProgress {
  id: number;
  uuid: string;
  stage_id: number;
  status: string;
  created_at: string;
  last_updated_at: string;
  onboarding_stages: {
    stage_id: number;
    stage_name: string;
    onboarding_stage_index: number;
  };
}

export async function fetchOnboardingProgress(userUuid: string): Promise<OnboardingProgress[]> {
  try {
    const response = await fetch(`/api/admin/onboarding-progress?user_uuid=${encodeURIComponent(userUuid)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch onboarding progress');
    }

    const data = await response.json();
    return data.progress;
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    throw error;
  }
}

export async function updateOnboardingStatus(userUuid: string, stageId: number, status: string): Promise<OnboardingProgress> {
  try {
    const response = await fetch('/api/admin/onboarding-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        userUuid,
        stageId,
        status
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update onboarding status');
    }

    const data = await response.json();
    return data.progress;
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
}

export interface KYCFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export async function getKYCPrefilledData(userUuid: string): Promise<KYCFormData | null> {
  try {
    // Fetch user data from seller_compound_data and auth
    const { data: userData, error: userError } = await supabase
      .from('seller_compound_data')
      .select('data, name')
      .eq('uuid', userUuid)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    // Get auth user for email
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.error('Error fetching auth user:', authError);
      return null;
    }

    // Extract name parts from the name field
    const nameParts = (userData.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Return formatted data for auto-population
    return {
      firstName,
      lastName,
      email: authUser.email || '',
    };
  } catch (error) {
    console.error('Error in getKYCPrefilledData:', error);
    return null;
  }
} 