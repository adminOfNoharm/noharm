import { supabase } from '@/lib/supabase';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Interface for profile metrics
export interface ProfileMetrics {
  totalProfiles: number;
  inReviewProfiles: number;
  boardingProfiles: number;
  sellerCount?: number;
  buyerCount?: number;
  recentActivityCount?: number;
  completedStagesCount?: number;
  recentProfileCount?: number;
}

// Fetch dashboard metrics
export async function fetchDashboardMetrics(): Promise<ProfileMetrics> {
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
    
    // Ensure all required fields are present with defaults
    const metrics: ProfileMetrics = {
      totalProfiles: data.metrics.totalProfiles || 0,
      inReviewProfiles: data.metrics.inReviewProfiles || 0,
      boardingProfiles: data.metrics.boardingProfiles || 0,
      sellerCount: data.metrics.sellerCount || 0,
      buyerCount: data.metrics.buyerCount || 0,
      recentActivityCount: data.metrics.recentActivityCount || 0,
      completedStagesCount: data.metrics.completedStagesCount || 0,
      recentProfileCount: data.metrics.recentProfileCount || 0
    };
    
    return metrics;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    // Return default metrics on error
    return {
      totalProfiles: 0,
      inReviewProfiles: 0,
      boardingProfiles: 0
    };
  }
}

// Interface for status change
export interface StatusChange {
  uuid: string;
  email: string;
  status: string;
  last_updated_status: string;
  stage_name: string;
  previous_stage_name?: string;
  is_stage_change: boolean;
  activity_type?: 'profile_update' | 'stage_update';
}

// Fetch recent activity
export async function fetchRecentActivity(limit: number = 40): Promise<StatusChange[]> {
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

// Format timestamp for display
export function formatTimestamp(timestamp: string): { timeAgo: string, fullDate: string } {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Format the full date
  const fullDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);

  // Format relative time
  let timeAgo;
  if (diffInSeconds < 60) {
    timeAgo = 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    timeAgo = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    timeAgo = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    timeAgo = `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    timeAgo = fullDate;
  }

  return { timeAgo, fullDate };
}

// Format stage name for display
export function formatStageName(stageName: string): string {
  if (!stageName) {
    return 'Unknown Stage';
  }
  
  if (stageName.toLowerCase() === 'kyc') {
    return 'Initial Onboarding';
  }
  return stageName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get color for status badge
export function getStatusColor(status: string): string {
  if (!status) {
    return 'bg-gray-100 text-gray-800'; // default for missing status
  }
  
  const colors = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    boarding: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800'
  };
  return colors[status as keyof typeof colors] || colors.not_started;
}

// Get color for stage badge
export function getStageBadgeColor(stageName: string): string {
  if (!stageName) {
    return 'bg-slate-100 text-slate-800'; // default for missing stage
  }
  
  const colors = {
    kyc: 'bg-fuchsia-100 text-fuchsia-800',
    contract_sign: 'bg-lime-100 text-lime-800',
    awaiting_payment: 'bg-purple-100 text-purple-800',
    tool_questionaire: 'bg-orange-100 text-orange-800',
    document_input: 'bg-sky-100 text-sky-800'
  };
  return colors[stageName.toLowerCase() as keyof typeof colors] || 'bg-slate-100 text-slate-800';
} 