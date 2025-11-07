import { create } from 'zustand';
import { Section, Step } from './lib/interfaces';
import { Session } from '@supabase/supabase-js';
import { fetchSections } from './lib/api/sections';
import { supabase } from './lib/supabase';
import { validateSection as validateSectionUtil, validateStep } from './lib/validation';
import workflowsConfig from './components/workflows.json';
import { sendStageCompletionEmail } from './lib/utils/email-templates';

interface FlowStageMapping {
    [key: string]: {
        stageId: number;
        nextFlow?: string;
    };
}

// Map flows to their corresponding stages and next flows
const flowStageMapping: FlowStageMapping = {
    'kyc_seller': { stageId: 1, nextFlow: 'tool_questionnaire' },
    'tool_questionnaire': { stageId: 4 },
    'kyc_buyer': { stageId: 1 },
    'kyc_ally': { stageId: 1 },
    'buyer_questionnaire': { stageId: 7 }
};

interface ValuesState {
    sectionsData: Section[];
    loading: boolean;
    session: Session | null;
    userId: string | null;
    currentFlow: string;
    fetchSectionsData: (flowName: string) => Promise<void>;
    setSession: (session: Session | null) => void;
    setUserId: (id: string | null) => void;
    selectedValues: { [key: string]: any };
    setSelectedValue: (alias: string, value: any) => Promise<void>;
    setSelectedValues: (values: Record<string, any>) => Promise<void>;
    currentSectionIndex: number;
    currentStep: number;
    completedSections: Set<number>;
    setCompletedSections: (sections: Set<number>) => void;
    validateSection: (sectionIndex: number) => { isValid: boolean; error?: string };
    validateCurrentStep: () => { isValid: boolean; error?: string };
    setCurrentSectionIndex: (index: number) => void;
    setCurrentStep: (step: number) => void;
    handleNextStep: (totalSteps: number) => void;
    handleBackStep: () => void;
    handleNextSection: () => void;
    handleBackSection: () => void;
    onboardingComplete: boolean;
    setOnboardingComplete: (complete: boolean) => Promise<void>;
    setCurrentFlow: (flow: string) => void;
    isAdminMode: boolean;
    setAdminMode: (enabled: boolean) => void;
    userRole: string | null;
    setUserRole: (role: string | null) => void;
    reorderSections: (startIndex: number, endIndex: number) => void;
    isRecapMode: boolean;
    setRecapMode: (value: boolean) => void;
    getVisibleSections: () => Section[];
    getVisibleSteps: (sectionIndex: number) => Step[];
    calculateProgress: () => number;
    moveToNextStage: () => Promise<void>;
    completeFlow: () => Promise<void>;
    checkFlowCompletion: () => { isComplete: boolean; error?: string };
    isEditingMode: boolean;
    setEditingMode: (isEditing: boolean) => void;
}

// Evaluate if a section should be displayed based on its conditionalDisplay settings
const evaluateConditionalDisplay = (section: Section, selectedValues: Record<string, any>): boolean => {
    if (!section.conditionalDisplay) return true;
    
    const { questionAlias, expectedValue, operator } = section.conditionalDisplay;
    const actualValue = selectedValues[questionAlias];
    
    // Enhanced string comparison for all string values
    if (typeof expectedValue === 'string' && typeof actualValue === 'string') {
        const normalizedActual = actualValue.trim().toLowerCase();
        const normalizedExpected = expectedValue.trim().toLowerCase();
        
        if (operator === 'equals') {
            return normalizedActual === normalizedExpected;
        } else if (operator === 'notEquals') {
            return normalizedActual !== normalizedExpected;
        }
    }
    
    // Handle undefined or null values
    if (actualValue === undefined || actualValue === null) {
        // If we're checking for not equals, undefined/null is not equal to anything
        return operator === 'notEquals';
    }
    
    switch (operator) {
        case 'equals':
            // For non-string types, use strict equality
            return actualValue === expectedValue;
        case 'notEquals':
            // For non-string types, use strict inequality
            return actualValue !== expectedValue;
        case 'includes':
            if (Array.isArray(actualValue)) {
                // If expectedValue is a string and we're checking in an array of strings,
                // do case-insensitive comparison
                if (typeof expectedValue === 'string') {
                    return actualValue.some(val => 
                        typeof val === 'string' && 
                        val.trim().toLowerCase() === expectedValue.trim().toLowerCase()
                    );
                }
                return actualValue.includes(expectedValue);
            }
            return false;
        case 'notIncludes':
            if (Array.isArray(actualValue)) {
                // If expectedValue is a string and we're checking in an array of strings,
                // do case-insensitive comparison
                if (typeof expectedValue === 'string') {
                    return !actualValue.some(val => 
                        typeof val === 'string' && 
                        val.trim().toLowerCase() === expectedValue.trim().toLowerCase()
                    );
                }
                return !actualValue.includes(expectedValue);
            }
            return true;
        default:
            return true;
    }
};

// New function to evaluate step visibility
const evaluateStepConditionalDisplay = (step: Step, selectedValues: Record<string, any>): boolean => {
    if (!step.conditionalDisplay) return true;
    
    const { questionAlias, expectedValue, operator } = step.conditionalDisplay;
    const actualValue = selectedValues[questionAlias];
    
    // Enhanced string comparison for all string values
    if (typeof expectedValue === 'string' && typeof actualValue === 'string') {
        const normalizedActual = actualValue.trim().toLowerCase();
        const normalizedExpected = expectedValue.trim().toLowerCase();
        
        if (operator === 'equals') {
            return normalizedActual === normalizedExpected;
        } else if (operator === 'notEquals') {
            return normalizedActual !== normalizedExpected;
        }
    }
    
    // Handle undefined or null values
    if (actualValue === undefined || actualValue === null) {
        // If we're checking for not equals, undefined/null is not equal to anything
        return operator === 'notEquals';
    }
    
    switch (operator) {
        case 'equals':
            // For non-string types, use strict equality
            return actualValue === expectedValue;
        case 'notEquals':
            // For non-string types, use strict inequality
            return actualValue !== expectedValue;
        case 'includes':
            if (Array.isArray(actualValue)) {
                // If expectedValue is a string and we're checking in an array of strings,
                // do case-insensitive comparison
                if (typeof expectedValue === 'string') {
                    return actualValue.some(val => 
                        typeof val === 'string' && 
                        val.trim().toLowerCase() === expectedValue.trim().toLowerCase()
                    );
                }
                return actualValue.includes(expectedValue);
            }
            return false;
        case 'notIncludes':
            if (Array.isArray(actualValue)) {
                // If expectedValue is a string and we're checking in an array of strings,
                // do case-insensitive comparison
                if (typeof expectedValue === 'string') {
                    return !actualValue.some(val => 
                        typeof val === 'string' && 
                        val.trim().toLowerCase() === expectedValue.trim().toLowerCase()
                    );
                }
                return !actualValue.includes(expectedValue);
            }
            return true;
        default:
            return true;
    }
};

const useStore = create<ValuesState>((set, get) => ({
    sectionsData: [],
    loading: true,
    onboardingComplete: false,
    setOnboardingComplete: async (complete) => {
        set({ onboardingComplete: complete });
        
        const { userId } = get();
        if (complete && userId) {
            await supabase
                .from('seller_compound_data')
                .update({ status: 'in_review' })
                .eq('uuid', userId);
        }
    },
    session: null,
    userId: null,
    currentFlow: 'kyc_seller',
    setCurrentFlow: (flow) => set({ 
        currentFlow: flow,
        // Reset all relevant state when changing flows
        currentSectionIndex: 0,
        currentStep: 0,
        selectedValues: {},
        completedSections: new Set(),
        onboardingComplete: false,
        isRecapMode: false
    }),
    fetchSectionsData: async (flowName: string) => {
        set({ loading: true });
        try {
            const response = await fetchSections(flowName);
            // Sort sections by order
            const sortedSections = response.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            set({ sectionsData: sortedSections, loading: false });
        } catch (error) {
            console.error('Error fetching content:', error);
            set({ loading: false });
        }
    },
    selectedValues: {},
    setSelectedValue: async (alias, value) => {
        set((state) => ({
            selectedValues: { ...state.selectedValues, [alias]: value },
        }));
        
        const { userId, currentFlow, isEditingMode } = get();
        if (userId && currentFlow) {
            try {
                // Update seller_compound_data data without changing status when in editing mode
                if (isEditingMode) {
                    await supabase
                        .from('seller_compound_data')
                        .update({ 
                            data: { ...get().selectedValues, [alias]: value },
                        })
                        .eq('uuid', userId);
                } else {
                    // Normal onboarding flow - update status to in_progress
                    await supabase
                        .from('seller_compound_data')
                        .update({ 
                            data: { ...get().selectedValues, [alias]: value },
                            status: 'in_progress'
                        })
                        .eq('uuid', userId);

                    // Get the stage ID for current flow
                    const mapping = flowStageMapping[currentFlow];
                    if (mapping) {
                        // Update user_onboarding_progress to mark stage as in_progress
                        await supabase
                            .from('user_onboarding_progress')
                            .update({ status: 'in_progress' })
                            .eq('uuid', userId)
                            .eq('stage_id', mapping.stageId);
                    }
                }
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        }
    },
    setSelectedValues: async (values) => {
        set(() => ({
            selectedValues: values
        }));
        
        const { userId, isEditingMode } = get();
        if (userId) {
            if (isEditingMode) {
                // Only update data, not status when in editing mode
                await supabase
                    .from('seller_compound_data')
                    .update({ 
                        data: values,
                    })
                    .eq('uuid', userId);
            } else {
                // Normal onboarding flow - update status to in_progress
                await supabase
                    .from('seller_compound_data')
                    .update({ 
                        data: values,
                        status: 'in_progress'
                    })
                    .eq('uuid', userId);
            }
        }
    },
    currentSectionIndex: 0,
    currentStep: 0,
    completedSections: new Set<number>(),
    setCompletedSections: (sections) => set({ completedSections: sections }),
    validateSection: (sectionIndex) => {
        const { sectionsData, selectedValues, isAdminMode, getVisibleSections } = get();
        if (isAdminMode) return { isValid: true };

        const section = sectionsData[sectionIndex];
        if (!section) return { isValid: false, error: "Section not found" };
        
        // Check if the section is visible
        const visibleSections = getVisibleSections();
        if (!visibleSections.some(s => s.id === section.id)) {
            // If section is not visible, consider it valid
            return { isValid: true };
        }
        
        return validateSectionUtil(section.steps, selectedValues);
    },
    validateCurrentStep: () => {
        const { sectionsData, currentSectionIndex, currentStep, selectedValues, isAdminMode, getVisibleSections } = get();
        if (isAdminMode) return { isValid: true };

        const currentSection = sectionsData[currentSectionIndex];
        if (!currentSection) return { isValid: false, error: "Section not found" };

        // Check if the current section is visible
        const visibleSections = getVisibleSections();
        if (!visibleSections.some(s => s.id === currentSection.id)) {
            // If section is not visible, consider it valid
            return { isValid: true };
        }

        const currentStepData = currentSection.steps[currentStep];
        if (!currentStepData) return { isValid: false, error: "Step not found" };

        return validateStep(currentStepData.questions, selectedValues);
    },
    setCurrentSectionIndex: (index) => {
        set({ currentSectionIndex: index });
        set({ currentStep: 0 }); // Reset to first step when changing sections
    },
    setCurrentStep: (step) => set({ currentStep: step }),
    handleNextStep: (totalSteps: number) => {
        const { currentStep, currentSectionIndex, sectionsData, getVisibleSteps } = get();
        
        // Get visible steps for the current section
        const visibleSteps = getVisibleSteps(currentSectionIndex);
        const currentStepData = sectionsData[currentSectionIndex]?.steps[currentStep];
        
        // Find the index of the current step in the visible steps array
        const currentVisibleStepIndex = visibleSteps.findIndex(step => step.id === currentStepData?.id);
        
        // If we're at the last visible step in this section
        if (currentVisibleStepIndex === visibleSteps.length - 1) {
            // Move to the next section
            const nextSectionIndex = currentSectionIndex + 1;
            if (nextSectionIndex < sectionsData.length) {
                set({ 
                    currentSectionIndex: nextSectionIndex,
                    currentStep: 0
                });
            } else {
                // We're at the end of all sections
                set({ currentSectionIndex: sectionsData.length });
            }
        } else {
            // Find the next visible step's index in the original steps array
            const nextVisibleStep = visibleSteps[currentVisibleStepIndex + 1];
            const nextStepIndex = sectionsData[currentSectionIndex]?.steps.findIndex(
                step => step.id === nextVisibleStep.id
            );
            
            if (nextStepIndex !== undefined && nextStepIndex >= 0) {
                set({ currentStep: nextStepIndex });
            }
        }
    },
    handleBackStep: () => {
        const { currentStep, currentSectionIndex, sectionsData, getVisibleSteps, getVisibleSections } = get();
        
        // If we're at the first step of the current section
        if (currentStep === 0) {
            // Move to the previous section
            if (currentSectionIndex > 0) {
            const visibleSections = getVisibleSections();
                
                // Find the previous visible section
                let prevSectionIndex = currentSectionIndex - 1;
                while (prevSectionIndex >= 0) {
                    const prevSection = sectionsData[prevSectionIndex];
                    if (visibleSections.some(s => s.id === prevSection.id)) {
                        break;
                    }
                    prevSectionIndex--;
                }
                
                if (prevSectionIndex >= 0) {
                    // Get visible steps for the previous section
                    const visibleSteps = getVisibleSteps(prevSectionIndex);
                    
                    if (visibleSteps.length > 0) {
                        // Find the last visible step's index in the original steps array
                        const lastVisibleStep = visibleSteps[visibleSteps.length - 1];
                        const lastStepIndex = sectionsData[prevSectionIndex]?.steps.findIndex(
                            step => step.id === lastVisibleStep.id
                        );
                        
                        if (lastStepIndex !== undefined && lastStepIndex >= 0) {
                set({ 
                    currentSectionIndex: prevSectionIndex,
                                currentStep: lastStepIndex
                            });
                        }
                    }
                }
            }
        } else {
            // Get visible steps for the current section
            const visibleSteps = getVisibleSteps(currentSectionIndex);
            const currentStepData = sectionsData[currentSectionIndex]?.steps[currentStep];
            
            // Find the index of the current step in the visible steps array
            const currentVisibleStepIndex = visibleSteps.findIndex(step => step.id === currentStepData?.id);
            
            if (currentVisibleStepIndex > 0) {
                // Find the previous visible step's index in the original steps array
                const prevVisibleStep = visibleSteps[currentVisibleStepIndex - 1];
                const prevStepIndex = sectionsData[currentSectionIndex]?.steps.findIndex(
                    step => step.id === prevVisibleStep.id
                );
                
                if (prevStepIndex !== undefined && prevStepIndex >= 0) {
                    set({ currentStep: prevStepIndex });
                }
            } else {
                // This shouldn't happen normally, but as a fallback, just go to the previous step
                set({ currentStep: currentStep - 1 });
            }
        }
    },
    handleNextSection: () => {
        const { currentSectionIndex, setCurrentStep, getVisibleSections, setRecapMode } = get();
        const visibleSections = getVisibleSections();
        const currentVisibleIndex = visibleSections.findIndex(
            section => section.id === get().sectionsData[currentSectionIndex].id
        );
        
        if (currentVisibleIndex < visibleSections.length - 1) {
            // Find the next visible section's actual index in sectionsData
            const nextSection = visibleSections[currentVisibleIndex + 1];
            const nextSectionIndex = get().sectionsData.findIndex(
                section => section.id === nextSection.id
            );
            set({ currentSectionIndex: nextSectionIndex });
            setCurrentStep(0);
        } else {
            // Instead of moving to completion, move to recap mode
            setRecapMode(true);
        }
    },
    handleBackSection: () => {
        const { currentSectionIndex, setCurrentStep, getVisibleSections } = get();
        if (currentSectionIndex > 0) {
            const visibleSections = getVisibleSections();
            const currentVisibleIndex = visibleSections.findIndex(
                section => section.id === get().sectionsData[currentSectionIndex].id
            );
            
            if (currentVisibleIndex > 0) {
                const prevSection = visibleSections[currentVisibleIndex - 1];
                const prevSectionIndex = get().sectionsData.findIndex(
                    section => section.id === prevSection.id
                );
                set({ currentSectionIndex: prevSectionIndex });
                setCurrentStep(0);
            }
        }
    },
    setSession: async (session) => {
        set({ session });
        
        if (session?.user) {
            set({ userId: session.user.id });
            
            // Fetch and set user role when session is established
            const { data, error } = await supabase
                .from('seller_compound_data')
                .select('role')
                .eq('uuid', session.user.id)
                .single();

            if (!error && data?.role) {
                set({ userRole: data.role });
            } else {
                // If no role is found in seller_compound_data, default to "seller" for the seller onboarding flow
                set({ userRole: "seller" });
            }
        } else {
            // Clear user data on logout
            set({ 
                userId: null,
                userRole: null,
                selectedValues: {},
                currentSectionIndex: 0,
                currentStep: 0,
                completedSections: new Set(),
                onboardingComplete: false
            });
        }
    },
    setUserId: (id) => set({ userId: id }),
    isAdminMode: false,
    setAdminMode: (enabled) => set({ isAdminMode: enabled }),
    userRole: null,
    setUserRole: (role) => set({ userRole: role }),
    reorderSections: (startIndex: number, endIndex: number) => {
        set(state => {
            const result = Array.from(state.sectionsData);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);

            // Update order for all sections
            const updatedSections = result.map((section, index) => ({
                ...section,
                order: index
            }));

            return { sectionsData: updatedSections };
        });
    },
    isRecapMode: false,
    setRecapMode: (value) => set({ isRecapMode: value }),
    getVisibleSections: () => {
        const { sectionsData, selectedValues } = get();
        return sectionsData.filter(section => evaluateConditionalDisplay(section, selectedValues));
    },
    // New function to get visible steps for a section
    getVisibleSteps: (sectionIndex: number) => {
        const { sectionsData, selectedValues } = get();
        const section = sectionsData[sectionIndex];
        if (!section) return [];
        
        const visibleSteps = section.steps.filter(step => {
            const isVisible = evaluateStepConditionalDisplay(step, selectedValues);
            
            return isVisible;
        });
        
        return visibleSteps;
    },
    calculateProgress: () => {
        const { sectionsData, currentSectionIndex, currentStep, getVisibleSections, getVisibleSteps } = get();
        const visibleSections = getVisibleSections();
        
        // Calculate total steps from visible sections and their visible steps
        let totalSteps = 0;
        let completedSteps = 0;
        
        visibleSections.forEach((section, index) => {
            const sectionIndex = sectionsData.findIndex(s => s.id === section.id);
            const visibleSteps = getVisibleSteps(sectionIndex);
            totalSteps += visibleSteps.length;
            
            if (sectionIndex < currentSectionIndex) {
                // All steps in previous sections are completed
                completedSteps += visibleSteps.length;
            } else if (sectionIndex === currentSectionIndex) {
                // Count completed steps in current section
                const currentSectionVisibleSteps = visibleSteps.map(step => 
                    section.steps.findIndex(s => s.id === step.id)
                );
                
                // Find how many visible steps are completed in current section
                completedSteps += currentSectionVisibleSteps.filter(stepIndex => 
                    stepIndex <= currentStep
                ).length;
            }
        });

        return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    },
    moveToNextStage: async () => {
        const { userId, userRole } = get();
        if (!userId || !userRole) return;

        try {
            // Get current workflow stages for the user's role
            const roleWorkflow = workflowsConfig[userRole as keyof typeof workflowsConfig] || [];
            
            // Get user's current stage info
            const { data: userStages } = await supabase
                .from('user_onboarding_progress')
                .select('stage_id')
                .eq('uuid', userId)
                .order('created_at', { ascending: true });

            // If user has no stages, start with the first one
            if (!userStages || userStages.length === 0) {
                const firstStageId = roleWorkflow[0];
                if (!firstStageId) return;

                await supabase
                    .from('user_onboarding_progress')
                    .insert({
                        uuid: userId,
                        stage_id: firstStageId,
                        status: 'not_started'
                    });
                return;
            }

            // Get current stage ID (last one in the ordered list)
            const currentStageId = userStages[userStages.length - 1].stage_id;
            
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

                // Create new stage record
                await supabase
                    .from('user_onboarding_progress')
                    .insert({
                        uuid: userId,
                        stage_id: nextStageId,
                        status: 'not_started'
                    });
            }
        } catch (error) {
            console.error('Error moving to next stage:', error);
            throw error;
        }
    },
    checkFlowCompletion: () => {
        const { sectionsData, selectedValues, getVisibleSections } = get();
        const visibleSections = getVisibleSections();
        
        // Check if all visible sections are complete
        for (const section of visibleSections) {
            const sectionIndex = sectionsData.findIndex(s => s.id === section.id);
            const { isValid, error } = get().validateSection(sectionIndex);
            
            if (!isValid) {
                return { isComplete: false, error: `Incomplete section: ${section.name} - ${error}` };
            }
        }
        
        return { isComplete: true };
    },
    completeFlow: async () => {
        const { userId, userRole, currentFlow, session, onboardingComplete, isEditingMode } = get();
        if (!userId || !userRole || !currentFlow) {
            throw new Error('Missing required user information');
        }

        try {
            // Skip stage completion steps when in editing mode
            if (isEditingMode) {
                console.log('Skipping stage completion steps because user is in editing mode');
                return;
            }
            
            // 1. Get the stage ID for current flow
            const mapping = flowStageMapping[currentFlow];
            if (!mapping) {
                throw new Error(`No stage mapping found for flow: ${currentFlow}`);
            }

            // 2. Mark current stage as completed
            const { error: updateError } = await supabase
                .from('user_onboarding_progress')
                .update({ status: 'completed' })
                .eq('uuid', userId)
                .eq('stage_id', mapping.stageId);

            if (updateError) {
                throw new Error(`Failed to mark stage as completed: ${updateError.message}`);
            }

            // Only send email if onboarding is being submitted (onboardingComplete is true)
            if (onboardingComplete && session?.user?.email) {
                await sendStageCompletionEmail(
                    mapping.stageId,
                    session.user.email,
                    session.user.user_metadata?.full_name
                );
            }

            // 3. Get workflow for user's role
            const roleWorkflow = workflowsConfig[userRole as keyof typeof workflowsConfig] || [];
            
            // 4. Find next stage in workflow
            const currentStageIndex = roleWorkflow.indexOf(mapping.stageId);
            if (currentStageIndex >= 0 && currentStageIndex < roleWorkflow.length - 1) {
                const nextStageId = roleWorkflow[currentStageIndex + 1];
                
                // 5. Check if next stage already exists
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
                    // Only create if it doesn't exist
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
                    // If it exists and is completed, create the next stage in sequence
                    const nextNextStageIndex = currentStageIndex + 2;
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
            }
        } catch (error) {
            console.error('Error completing flow:', error);
            throw error;
        }
    },
    isEditingMode: false,
    setEditingMode: (isEditing) => set({ isEditingMode: isEditing }),
}));

export default useStore;
