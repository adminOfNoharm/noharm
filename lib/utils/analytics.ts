import { supabase } from '@/lib/supabase'
import type { AnalyticsEvent } from '@/lib/interfaces'

export async function trackEvent(
  eventType: AnalyticsEvent['event_type'],
  eventData: Omit<AnalyticsEvent['event_data'], 'timestamp'>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user?.id || null,
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString()
        }
      })

    if (error) {
      console.error('Analytics tracking error:', error)
    }
  } catch (error) {
    console.error('Failed to track event:', error)
  }
} 