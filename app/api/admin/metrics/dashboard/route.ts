import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth-admin';

// Initialize Supabase with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

// GET - Get dashboard metrics
export async function GET(request: Request) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    // Fetch seller profile metrics
    const { data: profilesData, error } = await supabaseAdmin
      .from('seller_compound_data')
      .select('status, role');

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch profile metrics: ${error.message}` }, 
        { status: 500 }
      );
    }

    // Calculate metrics
    const metrics: Record<string, number> = {
      totalProfiles: profilesData.length,
      inReviewProfiles: profilesData.filter(p => p.status === 'in_review').length,
      boardingProfiles: profilesData.filter(p => p.status === 'boarding').length,
      sellerCount: profilesData.filter(p => p.role === 'seller').length,
      buyerCount: profilesData.filter(p => p.role === 'buyer').length
    };

    // Calculate recent profile updates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isoDate = thirtyDaysAgo.toISOString();

    // Count of profiles updated in the last 30 days
    try {
      const { count: recentProfileCount, error: profileCountError } = await supabaseAdmin
        .from('seller_compound_data')
        .select('*', { count: 'exact', head: true })
        .gte('last_updated_status', isoDate);

      if (!profileCountError) {
        metrics.recentProfileCount = recentProfileCount || 0;
      }
    } catch (err) {
      console.error('Error fetching recent profile count:', err);
    }

    // Fetch recent onboarding progress count
    const { count: recentActivityCount, error: activityError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', isoDate);

    if (!activityError) {
      metrics.recentActivityCount = recentActivityCount || 0;
    }

    // Fetch completed stages count
    const { count: completedStagesCount, error: completedError } = await supabaseAdmin
      .from('user_onboarding_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (!completedError) {
      metrics.completedStagesCount = completedStagesCount || 0;
    }

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 