import { supabase } from '@/lib/supabase';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Fetch regular analytics data
export async function fetchAnalytics(params?: {
  eventType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<any> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.eventType) searchParams.append('event_type', params.eventType);
    if (params?.userId) searchParams.append('user_id', params.userId);
    if (params?.startDate) searchParams.append('start_date', params.startDate);
    if (params?.endDate) searchParams.append('end_date', params.endDate);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    
    const response = await fetch(`/api/admin/analytics${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch analytics data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

// Interface for email click metrics
export interface EmailMetrics {
  uniqueEmailClicks: number;
  staticUsers: number;
}

// Interface for email click events
export interface EmailClickEvent {
  id: string;
  created_at: string;
  email: string;
  source: string;
  staticStage: string | null;
  role: string | null;
}

// Fetch email click analytics
export async function fetchEmailClickAnalytics(): Promise<{
  metrics: EmailMetrics;
  emailClickEvents: EmailClickEvent[];
}> {
  try {
    const response = await fetch('/api/admin/analytics/email-clicks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch email click analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching email click analytics:', error);
    throw error;
  }
}

// Interface for analytics event
export interface AnalyticsEvent {
  id: string;
  created_at: string;
  user_id: string;
  event_type: string;
  event_data: any;
  auth_user?: {
    email: string;
  };
}

// Fetch user journey by email
export async function fetchUserJourney(email: string): Promise<AnalyticsEvent[]> {
  try {
    const response = await fetch(`/api/admin/analytics/user-journey?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user journey');
    }

    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error fetching user journey:', error);
    throw error;
  }
}

// Export analytics data
export async function exportAnalyticsData(): Promise<Blob> {
  try {
    const response = await fetch('/api/admin/analytics/export', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to export analytics data');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    throw error;
  }
} 