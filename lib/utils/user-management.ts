import { supabase } from '@/lib/supabase';

export async function deleteUser(uuid: string) {
  try {
    // Use the admin API route to delete the user
    const response = await fetch(`/api/admin/users/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error };
  }
}

export async function getUserData(uuid: string) {
  try {
    // Use the admin API route to get user data
    const response = await fetch(`/api/admin/users/${uuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

export async function updateUserData(uuid: string, data: any) {
  try {
    // Use the admin API route to update user data
    const response = await fetch(`/api/admin/users/${uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

export async function getAllUsers(params: { 
  query?: string; 
  page?: number; 
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.set('query', params.query);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    // Use the admin API route to get all users
    const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
} 