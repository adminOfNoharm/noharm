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

// POST - Bulk update operations
export async function POST(request: Request) {
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { operation, userIds, data } = body;
    
    if (!operation || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Operation type and at least one user ID are required' }, 
        { status: 400 }
      );
    }

    // Handle different bulk operations
    switch (operation) {
      case 'update_status': {
        if (!data || !data.status) {
          return NextResponse.json(
            { error: 'Status value is required for update_status operation' }, 
            { status: 400 }
          );
        }

        // Using a batch update approach instead of individual updates
        // Update all users at once with a single query
        const { data: updatedData, error: batchError } = await supabaseAdmin
          .from('seller_compound_data')
          .update({ status: data.status })
          .in('uuid', userIds)
          .select('uuid, status');

        if (batchError) {
          return NextResponse.json({
            operation: 'update_status',
            error: batchError.message,
            summary: {
              total: userIds.length,
              success: 0,
              error: userIds.length
            }
          }, { status: 500 });
        }

        // Map the results to match the expected format
        const updatedIds = new Set(updatedData?.map(item => item.uuid) || []);
        const results = userIds.map(uuid => {
          const userData = updatedData?.find(item => item.uuid === uuid);
          if (userData) {
            return { uuid, success: true, data: userData };
          } else {
            return { uuid, success: false, error: 'User not found or not updated' };
          }
        });

        return NextResponse.json({
          operation: 'update_status',
          results,
          summary: {
            total: userIds.length,
            success: updatedIds.size,
            error: userIds.length - updatedIds.size
          }
        });
      }

      case 'move_to_stage': {
        if (!data || !data.stageId) {
          return NextResponse.json(
            { error: 'Stage ID is required for move_to_stage operation' }, 
            { status: 400 }
          );
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        // Move each user to the specified stage
        for (const uuid of userIds) {
          try {
            // Get current stage
            const { data: currentStage, error: fetchError } = await supabaseAdmin
              .from('user_onboarding_progress')
              .select('stage_id')
              .eq('uuid', uuid)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (fetchError) {
              results.push({ uuid, success: false, error: `Failed to fetch current stage: ${fetchError.message}` });
              errorCount++;
              continue;
            }

            // Mark current stage as completed
            const { error: updateError } = await supabaseAdmin
              .from('user_onboarding_progress')
              .update({ status: 'completed' })
              .eq('uuid', uuid)
              .eq('stage_id', currentStage.stage_id);

            if (updateError) {
              results.push({ uuid, success: false, error: `Failed to complete current stage: ${updateError.message}` });
              errorCount++;
              continue;
            }

            // Create new stage
            const { data: newStage, error: insertError } = await supabaseAdmin
              .from('user_onboarding_progress')
              .insert([{
                uuid,
                stage_id: data.stageId,
                status: 'not_started'
              }])
              .select();

            if (insertError) {
              results.push({ uuid, success: false, error: `Failed to create new stage: ${insertError.message}` });
              errorCount++;
            } else {
              results.push({ uuid, success: true, data: newStage });
              successCount++;
            }
          } catch (err) {
            results.push({ uuid, success: false, error: 'Internal server error' });
            errorCount++;
          }
        }

        return NextResponse.json({
          operation: 'move_to_stage',
          results,
          summary: {
            total: userIds.length,
            success: successCount,
            error: errorCount
          }
        });
      }

      case 'delete_users': {
        const results = [];
        let successCount = 0;
        let errorCount = 0;

        // Process users in batches to avoid timeouts
        const batchSize = 10;
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batchUserIds = userIds.slice(i, i + batchSize);
          
          // Delete user data from seller_compound_data in a batch
          const { error: profileBatchError } = await supabaseAdmin
            .from('seller_compound_data')
            .delete()
            .in('uuid', batchUserIds);

          if (profileBatchError) {
            console.error(`Batch delete failed: ${profileBatchError.message}`);
            // Individual fallback for this batch if batch operation fails
            for (const uuid of batchUserIds) {
              try {
                // Delete user auth record
                const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(uuid);
                
                if (authError) {
                  results.push({ uuid, success: false, error: `Failed to delete auth user: ${authError.message}` });
                  errorCount++;
                } else {
                  results.push({ uuid, success: true });
                  successCount++;
                }
              } catch (err) {
                results.push({ uuid, success: false, error: 'Internal server error' });
                errorCount++;
              }
            }
          } else {
            // Batch delete succeeded, now delete auth records individually 
            // (Auth API doesn't support batch operations)
            for (const uuid of batchUserIds) {
              try {
                const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(uuid);
                
                if (authError) {
                  results.push({ uuid, success: false, error: `Failed to delete auth user: ${authError.message}` });
                  errorCount++;
                } else {
                  results.push({ uuid, success: true });
                  successCount++;
                }
              } catch (err) {
                results.push({ uuid, success: false, error: 'Internal server error' });
                errorCount++;
              }
            }
          }
        }

        return NextResponse.json({
          operation: 'delete_users',
          results,
          summary: {
            total: userIds.length,
            success: successCount,
            error: errorCount
          }
        });
      }

      default:
        return NextResponse.json(
          { error: `Unsupported operation: ${operation}` }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 