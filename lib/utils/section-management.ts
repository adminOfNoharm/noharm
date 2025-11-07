import { supabase } from '@/lib/supabase';
import { Section } from '@/lib/interfaces';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Section Management Functions
export async function fetchSections(flowName: string): Promise<Section[]> {
  try {
    const response = await fetch(`/api/admin/sections?flow=${encodeURIComponent(flowName)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch sections');
    }

    const data = await response.json();
    return data.sections;
  } catch (error) {
    console.error('Error fetching sections:', error);
    throw error;
  }
}

export async function updateSections(
  flowName: string, 
  modifiedSections: (Partial<Section> & { _delete?: boolean })[]
): Promise<void> {
  try {
    const response = await fetch('/api/admin/sections', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        flowName,
        sections: modifiedSections
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update sections');
    }
  } catch (error) {
    console.error('Error updating sections:', error);
    throw error;
  }
}

// Flow Management Functions
export async function listFlows(): Promise<string[]> {
  try {
    const response = await fetch('/api/admin/flows', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch flows');
    }

    const data = await response.json();
    return data.flows;
  } catch (error) {
    console.error('Error fetching flows:', error);
    throw error;
  }
}

export async function createFlow(flowName: string, templateName?: string): Promise<void> {
  try {
    const response = await fetch('/api/admin/flows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        flowName,
        templateName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create flow');
    }
  } catch (error) {
    console.error('Error creating flow:', error);
    throw error;
  }
}

export async function deleteFlow(flowName: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/flows?flow=${encodeURIComponent(flowName)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete flow');
    }
  } catch (error) {
    console.error('Error deleting flow:', error);
    throw error;
  }
} 