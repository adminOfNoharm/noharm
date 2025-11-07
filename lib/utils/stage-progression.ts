import { supabase } from '../supabase';
import workflowsConfig from '@/components/workflows.json';

interface WorkflowConfig {
  [key: string]: number[];
}

export async function progressToNextStage(userId: string, userRole: string, currentStageId: number) {
  try {
    const roleWorkflow = (workflowsConfig as WorkflowConfig)[userRole] || [];
    
    // Find current stage index in workflow
    const currentIndex = roleWorkflow.indexOf(currentStageId);
    
    // If there's a next stage in the workflow
    if (currentIndex >= 0 && currentIndex < roleWorkflow.length - 1) {
      const nextStageId = roleWorkflow[currentIndex + 1];
      
      // Mark current stage as completed
      await supabase
        .from('user_onboarding_progress')
        .update({ status: 'completed' })
        .eq('uuid', userId)
        .eq('stage_id', currentStageId);

      // Check if next stage already exists
      const { data: existingStage, error: checkError } = await supabase
        .from('user_onboarding_progress')
        .select('progress_id, status')
        .eq('uuid', userId)
        .eq('stage_id', nextStageId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw new Error(`Failed to check next stage: ${checkError.message}`);
      }

      if (!existingStage) {
        // Create new stage record only if it doesn't exist
        const { error: insertError } = await supabase
          .from('user_onboarding_progress')
          .insert({
            uuid: userId,
            stage_id: nextStageId,
            status: 'not_started'
          });

        if (insertError) {
          throw new Error(`Failed to create next stage: ${insertError.message}`);
        }
      } else if (existingStage.status === 'completed') {
        // If next stage exists and is completed, create the next stage in sequence
        const nextNextStageIndex = currentIndex + 2;
        if (nextNextStageIndex < roleWorkflow.length) {
          const nextNextStageId = roleWorkflow[nextNextStageIndex];
          const { error: insertError } = await supabase
            .from('user_onboarding_progress')
            .insert({
              uuid: userId,
              stage_id: nextNextStageId,
              status: 'not_started'
            });

          if (insertError && insertError.code !== '23505') { // 23505 is the Postgres unique violation code
            throw new Error(`Failed to create next next stage: ${insertError.message}`);
          }
        }
      }

      return { success: true, nextStageId };
    }

    return { success: true, nextStageId: null }; // No next stage available
  } catch (error) {
    console.error('Error progressing to next stage:', error);
    throw error;
  }
} 