import { supabase } from '@/lib/supabase';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Interface for profile with current stage
export interface ProfileWithStage {
  uuid: string;
  role: string;
  email?: string;  // Comes from Auth, not from seller_compound_data
  status: string;
  data: Record<string, any>;
  updated_at: string | null;
  created_at: string | null;
  current_stage?: {
    stage_id: number;
    stage_name: string;
    stage_index: number;
    status: string;
  };
}

// Fetch contract signing status for a user
export async function checkContractSignStatus(uuid: string): Promise<boolean> {
  try {
    // Direct Supabase query for contract signing status (stage_id = 2)
    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .select('status')
      .eq('uuid', uuid)
      .eq('stage_id', 2)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found error
        console.log(`No contract signing record found for user ${uuid}`);
        return false;
      }
      console.error('Error checking contract status:', error);
      return false;
    }

    return data?.status === 'completed';
  } catch (error) {
    console.error('Error in checkContractSignStatus:', error);
    return false;
  }
}

// Fetch payment status for a user
export async function checkPaymentStatus(uuid: string): Promise<boolean> {
  try {
    // Direct Supabase query for payment status (stage_id = 3)
    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .select('status')
      .eq('uuid', uuid)
      .eq('stage_id', 3)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found error
        console.log(`No payment record found for user ${uuid}`);
        return false;
      }
      console.error('Error checking payment status:', error);
      return false;
    }

    return data?.status === 'completed';
  } catch (error) {
    console.error('Error in checkPaymentStatus:', error);
    return false;
  }
}

// Fetch all profiles with their current stage information
export async function fetchAllProfiles(): Promise<ProfileWithStage[]> {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error details:', errorData);
      throw new Error(errorData.error || 'Failed to fetch profiles');
    }

    const data = await response.json();
    return data.profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
}

// Fetch dashboard metrics
export async function fetchDashboardMetrics() {
  try {
    const response = await fetch('/api/admin/metrics/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch dashboard metrics');
    }

    const data = await response.json();
    return data.metrics;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

// Fetch recent activity
export async function fetchRecentActivity(limit: number = 40) {
  try {
    const response = await fetch(`/api/admin/activity/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch recent activity');
    }

    const data = await response.json();
    return data.recentActivity;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}

// Interface for bulk operation result
export interface BulkOperationResult {
  operation: string;
  results: Array<{
    uuid: string;
    success: boolean;
    error?: string;
    data?: any;
  }>;
  summary: {
    total: number;
    success: number;
    error: number;
  };
}

// Perform bulk operations
export async function performBulkOperation(
  operation: string,
  userIds: string[],
  data?: Record<string, any>
): Promise<BulkOperationResult> {
  try {
    const response = await fetch('/api/admin/bulk-operations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        operation,
        userIds,
        data
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to perform bulk operation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    throw error;
  }
} 