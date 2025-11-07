import { create } from 'zustand';
import { Section, Step } from '@/lib/interfaces';
import { fetchSections as apiFetchSections, updateSections as apiUpdateSections } from '@/lib/utils/section-management';

interface SectionState {
  sections: Section[];
  currentSection: Section | null;
  isLoading: boolean;
  error: string | null;
  modifiedSectionIds: Set<number>;
  currentFlow: string | null;
  hasReorderChanges: boolean;
  
  // Actions
  setCurrentSection: (section: Section | null) => void;
  setCurrentFlow: (flow: string | null) => void;
  fetchSections: (flowName: string) => Promise<void>;
  updateSection: (sectionId: number, updates: Partial<Section>) => void;
  saveSection: (sectionId: number) => Promise<void>;
  addSection: (section: Omit<Section, 'id'>) => void;
  deleteSection: (sectionId: number) => Promise<void>;
  saveFlow: () => Promise<void>;
  
  // Step management
  addStep: (sectionId: number) => void;
  removeStep: (sectionId: number, stepIndex: number) => void;
  updateStep: (sectionId: number, stepIndex: number, updates: any) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  reorderSteps: (sectionId: number, startIndex: number, endIndex: number) => void;
}

export const useSectionStore = create<SectionState>((set, get) => ({
  sections: [],
  currentSection: null,
  isLoading: false,
  error: null,
  modifiedSectionIds: new Set(),
  currentFlow: null,
  hasReorderChanges: false,
  
  setCurrentSection: (section) => set({ currentSection: section }),
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  
  fetchSections: async (flowName: string) => {
    set({ isLoading: true, error: null, currentFlow: flowName });
    try {
      const sections = await apiFetchSections(flowName);
      // Sort sections and steps by order
      const sortedSections = sections
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(section => ({
          ...section,
          steps: section.steps
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        }));

      set({ 
        sections: sortedSections,
        isLoading: false,
        modifiedSectionIds: new Set(),
        hasReorderChanges: false
      });
    } catch (error) {
      set({ 
        error: 'Failed to fetch sections', 
        isLoading: false 
      });
    }
  },
  
  updateSection: (sectionId, updates) => {
    set(state => {
      const updatedSections = state.sections.map(section =>
        section.id === sectionId ? {
          ...section,
          ...updates,
          // Ensure conditionalDisplay is properly handled
          ...(updates.conditionalDisplay === undefined ? { conditionalDisplay: section.conditionalDisplay } : {})
        } : section
      );
      
      return {
        sections: updatedSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(sectionId)
      };
    });
  },
  
  saveSection: async (sectionId: number) => {
    const { sections, modifiedSectionIds, currentFlow } = get();
    if (!modifiedSectionIds.has(sectionId) || !currentFlow) return;
    
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    try {
      await apiUpdateSections(currentFlow, [section]);
      
      set(state => {
        const updatedSections = state.sections.map(s => 
          s.id === sectionId ? section : s
        );

        return {
          sections: updatedSections,
          currentSection: state.currentSection?.id === sectionId ? section : state.currentSection,
          modifiedSectionIds: new Set([...state.modifiedSectionIds].filter(id => id !== sectionId))
        };
      });
    } catch (error) {
      set({ error: 'Failed to save section' });
      throw error;
    }
  },
  
  addSection: (newSection) => {
    set(state => {
      const id = Math.max(0, ...state.sections.map(s => s.id)) + 1;
      const order = state.sections.length; // New sections go to the end
      const section = { ...newSection, id, order };
      return {
        sections: [...state.sections, section],
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(id)
      };
    });
  },
  
  deleteSection: async (sectionId: number) => {
    const { currentFlow } = get();
    if (!currentFlow) return;

    try {
      await apiUpdateSections(currentFlow, [{ id: sectionId, _delete: true }]);
      set(state => ({
        sections: state.sections.filter(s => s.id !== sectionId),
        currentSection: state.currentSection?.id === sectionId ? null : state.currentSection,
        modifiedSectionIds: new Set([...state.modifiedSectionIds].filter(id => id !== sectionId))
      }));
    } catch (error) {
      set({ error: 'Failed to delete section' });
      throw error;
    }
  },
  
  addStep: (sectionId: number) => {
    set(state => {
      const updatedSections = state.sections.map(section => {
        if (section.id !== sectionId) return section;
        
        const newStep: Step = {
          id: Date.now(),
          order: section.steps.length, // New steps go to the end
          questions: []
        };

        return {
          ...section,
          steps: [...section.steps, newStep]
        };
      });
      
      const updatedCurrentSection = state.currentSection?.id === sectionId 
        ? updatedSections.find(s => s.id === sectionId) || state.currentSection
        : state.currentSection;
      
      return {
        sections: updatedSections,
        currentSection: updatedCurrentSection,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(sectionId)
      };
    });
  },
  
  removeStep: (sectionId: number, stepIndex: number) => {
    set(state => {
      const updatedSections = state.sections.map(section => {
        if (section.id !== sectionId) return section;
        
        return {
          ...section,
          steps: section.steps.filter((_, index) => index !== stepIndex)
        };
      });
      
      const updatedCurrentSection = state.currentSection?.id === sectionId 
        ? updatedSections.find(s => s.id === sectionId) || state.currentSection
        : state.currentSection;

      return {
        sections: updatedSections,
        currentSection: updatedCurrentSection,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(sectionId)
      };
    });
  },
  
  updateStep: (sectionId: number, stepIndex: number, updates: any) => {
    set(state => {
      const updatedSections = state.sections.map(section => {
        if (section.id !== sectionId) return section;
        
        const updatedSteps = section.steps.map((step, index) =>
          index === stepIndex ? { ...step, ...updates } : step
        );
        
        return { ...section, steps: updatedSteps };
      });
      
      return {
        sections: updatedSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(sectionId)
      };
    });
  },
  
  reorderSections: (startIndex: number, endIndex: number) => {
    set(state => {
      const result = Array.from(state.sections);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      // Update order for all sections
      const updatedSections = result.map((section, index) => ({
        ...section,
        order: index
      }));

      return {
        sections: updatedSections,
        hasReorderChanges: true
      };
    });
  },

  reorderSteps: (sectionId: number, startIndex: number, endIndex: number) => {
    set(state => {
      const updatedSections = state.sections.map(section => {
        if (section.id !== sectionId) return section;

        const newSteps = Array.from(section.steps);
        const [removed] = newSteps.splice(startIndex, 1);
        newSteps.splice(endIndex, 0, removed);

        // Update order for all steps
        const updatedSteps = newSteps.map((step, index) => ({
          ...step,
          order: index
        }));

        const updatedSection = {
          ...section,
          steps: updatedSteps
        };

        return updatedSection;
      });

      return {
        sections: updatedSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(sectionId)
      };
    });
  },

  saveFlow: async () => {
    const { sections, modifiedSectionIds, currentFlow, hasReorderChanges } = get();
    
    if (!currentFlow) return;
    if (!hasReorderChanges && modifiedSectionIds.size === 0) return;
    
    try {
      // If we have reorder changes, we need to save all sections
      const sectionsToUpdate = hasReorderChanges ? sections : 
        sections.filter(section => modifiedSectionIds.has(section.id));
      
      await apiUpdateSections(currentFlow, sectionsToUpdate);
      
      set({ 
        modifiedSectionIds: new Set(),
        hasReorderChanges: false
      });
    } catch (error) {
      set({ error: 'Failed to save flow' });
      throw error;
    }
  }
})); 