import { supabase } from '@/lib/supabase';
import { Section } from '@/lib/interfaces';

const TABLE_NAME = 'onboarding_questions';

export async function fetchSections(flowName:string): Promise<Section[]> {

  console.log(flowName);
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('flow_name', flowName)
    .single();

  if (error) {
    throw new Error(`Error fetching sections: ${error.message}`);
  }

  console.log(data);
  // Extract sections from the data structure
  return data?.data?.sections || [];
}

export async function updateSections(flowName: string, modifiedSections: (Partial<Section> & { _delete?: boolean })[]): Promise<void> {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('flow_name', flowName)
      .single();

    if (fetchError) throw new Error(`Error fetching current data: ${fetchError.message}`);

    // Handle deletions and updates
    const finalSections = currentData.data.sections
      .filter((section: Section) => 
        !modifiedSections.some(m => m._delete && m.id === section.id)
      )
      .map((existingSection: Section) => {
        const modifiedSection = modifiedSections.find(s => s.id === existingSection.id && !s._delete);
        if (!modifiedSection) return existingSection;
        
        // Ensure we properly handle the conditionalDisplay property
        const updatedSection = { ...existingSection, ...modifiedSection };
        if (modifiedSection.conditionalDisplay === undefined) {
          // If conditionalDisplay is undefined in the update, remove it from the section
          delete updatedSection.conditionalDisplay;
        }
        return updatedSection;
      });

    // Add new sections
    const newSections = modifiedSections.filter(section => 
      !section._delete && 
      !currentData.data.sections.some((s: Section) => s.id === section.id)
    );

    const { error: updateError } = await supabase
      .from(TABLE_NAME)
      .update({ data: { sections: [...finalSections, ...newSections] } })
      .eq('flow_name', flowName);

    if (updateError) throw new Error(`Error updating sections: ${updateError.message}`);
  } catch (error) {
    throw error;
  }
}

export async function listFlows(): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('flow_name');

  if (error) {
    throw new Error(`Error fetching flows: ${error.message}`);
  }

  return data?.map((row: any) => row.flow_name);
}

export async function createFlow(flowName: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .insert([{ flow_name: flowName, data: { sections: [] } }]);

  if (error) throw new Error(`Error creating flow: ${error.message}`);
}

export async function deleteFlow(flowName: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('flow_name', flowName);

  if (error) throw new Error(`Error deleting flow: ${error.message}`);
} 