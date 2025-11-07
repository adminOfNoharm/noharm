import { create } from 'zustand';
import { Section, Question, Step, QuestionProps, ConditionalDisplay } from '@/lib/interfaces';
import { fetchSections, updateSections, listFlows, createFlow, deleteFlow } from '@/lib/utils/section-management';
import { getTemplate } from '@/lib/flowTemplates';

interface AdminStore {
  sections: Section[];
  activeTab: number;
  isLoading: boolean;
  isAddingSection: boolean;
  isDeleteModalOpen: boolean;
  deleteConfirmName: string;
  sectionToDelete: number | null;
  newSection: {
    color: string;
    name: string;
  };
  modifiedSectionIds: Set<number>;
  initialData: Section[];
  deletedSectionIds: Set<number>;
  currentFlow: string;
  availableFlows: string[];
  isAddingFlow: boolean;
  newFlowName: string;
  selectedTemplate: string;
  
  // Actions
  setSections: (sections: Section[]) => void;
  setActiveTab: (index: number) => void;
  setIsLoading: (loading: boolean) => void;
  setIsAddingSection: (adding: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  setDeleteConfirmName: (name: string) => void;
  setSectionToDelete: (index: number | null) => void;
  setNewSection: (updates: Partial<AdminStore['newSection']> | ((prev: AdminStore['newSection']) => AdminStore['newSection'])) => void;
  markSectionModified: (sectionId: number) => void;
  setCurrentFlow: (flow: string) => void;
  setIsAddingFlow: (adding: boolean) => void;
  setNewFlowName: (name: string) => void;
  setSelectedTemplate: (template: string) => void;
  
  // Complex actions
  fetchSections: () => Promise<void>;
  fetchFlows: () => Promise<void>;
  saveChanges: () => Promise<void>;
  handleChange: (
    sectionIndex: number, 
    stepIndex: number, 
    questionIndex: number, 
    field: keyof Question['props'] | "type" | "alias" | "editable", 
    value: any
  ) => void;
  handleSectionChange: (sectionIndex: number, field: keyof Section, value: unknown) => void;
  addStep: (sectionIndex: number) => void;
  removeStep: (sectionIndex: number, stepIndex: number) => void;
  removeQuestion: (sectionIndex: number, stepIndex: number, questionIndex: number) => void;
  addQuestion: (sectionIndex: number, stepIndex: number) => void;
  saveNewSection: () => void;
  handleDeleteSection: () => void;
  createNewFlow: () => Promise<void>;
  handleDeleteFlow: (flow: string) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  sections: [],
  activeTab: 0,
  isLoading: true,
  isAddingSection: false,
  isDeleteModalOpen: false,
  deleteConfirmName: '',
  sectionToDelete: null,
  newSection: {
    color: '',
    name: ''
  },
  modifiedSectionIds: new Set(),
  initialData: [],
  deletedSectionIds: new Set(),
  currentFlow: 'kyc_seller',
  availableFlows: [],
  isAddingFlow: false,
  newFlowName: '',
  selectedTemplate: 'basic',

  // Actions
  setSections: (sections) => set({ sections }),
  setActiveTab: (index) => set({ activeTab: index }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsAddingSection: (adding) => set({ isAddingSection: adding }),
  setIsDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
  setDeleteConfirmName: (name) => set({ deleteConfirmName: name }),
  setSectionToDelete: (index) => set({ sectionToDelete: index }),
  setNewSection: (updates) => set(state => ({
    newSection: typeof updates === 'function' 
      ? updates(state.newSection)
      : { ...state.newSection, ...updates }
  })),
  markSectionModified: (sectionId: number) => set(state => ({
    modifiedSectionIds: new Set(state.modifiedSectionIds).add(sectionId)
  })),
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  setIsAddingFlow: (adding) => set({ isAddingFlow: adding }),
  setNewFlowName: (name) => set({ newFlowName: name }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  // Complex actions
  fetchFlows: async () => {
    try {
      const flows = await listFlows();
      set({ availableFlows: flows });
    } catch (error) {
      console.error('Error fetching flows:', error);
      alert('Failed to load flows. Please try again.');
    }
  },

  fetchSections: async () => {
    const { currentFlow } = get();
    try {
      const sections = await fetchSections(currentFlow);
      set({ 
        sections,
        initialData: JSON.parse(JSON.stringify(sections)),
        activeTab: sections.length > 0 ? 0 : 0,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      alert('Failed to load sections. Please try again.');
      set({ isLoading: false });
    }
  },

  saveChanges: async () => {
    const { sections, modifiedSectionIds, deletedSectionIds, initialData, currentFlow } = get();
    
    if (modifiedSectionIds.size === 0 && deletedSectionIds.size === 0) {
      alert('No changes to save');
      return;
    }

    const modifiedSections = [
      ...sections
        .filter(section => modifiedSectionIds.has(section.id))
        .map(section => {
          const initialSection = initialData.find(s => s.id === section.id);
          return !initialSection ? section : {
            id: section.id,
            ...(section.name !== initialSection.name ? { name: section.name } : {}),
            ...(section.color !== initialSection.color ? { color: section.color } : {}),
            ...(JSON.stringify(section.steps) !== JSON.stringify(initialSection.steps) ? { steps: section.steps } : {})
          };
        }),
      ...[...deletedSectionIds].map(id => ({ id, _delete: true }))
    ];

    try {
      await updateSections(currentFlow, modifiedSections);
      set({ 
        initialData: JSON.parse(JSON.stringify(sections)),
        modifiedSectionIds: new Set(),
        deletedSectionIds: new Set()
      });
      alert('Changes saved!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save changes. Please try again.');
    }
  },

  handleChange: (sectionIndex, stepIndex, questionIndex, field, value) => {
    set(state => {
      const newSections = [...state.sections];
      const section = newSections[sectionIndex];
      
      if (!section) return state;
      
      const step = section.steps[stepIndex];
      if (!step) return state;
      
      const question = step.questions[questionIndex];
      if (!question) return state;
      
      // Handle the different field types with explicit type checks
      if (field === 'type') {
        // Type is a string enum
        question.type = value as Question['type'];
      } else if (field === 'alias') {
        // Alias is a string
        question.alias = value as string;
      } else if (field === 'editable') {
        // Editable is a boolean
        question.editable = value as boolean;
      } else {
        // For props fields, use type assertion
        (question.props as any)[field] = value;
      }
      
      return {
        sections: newSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(section.id)
      };
    });
  },

  handleSectionChange: (sectionIndex, field, value) => {
    set(state => {
      const newSections = [...state.sections];
      const section = newSections[sectionIndex];
      
      if (!section) return state;
      
      // Handle different section fields with correct types
      if (field === 'name' || field === 'color') {
        section[field] = value as string;
      } else if (field === 'id' || field === 'order') {
        section[field] = value as number;
      } else if (field === 'steps') {
        section.steps = value as Step[];
      } else if (field === 'conditionalDisplay') {
        section.conditionalDisplay = value as ConditionalDisplay | undefined;
      }
      
      return {
        sections: newSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(section.id)
      };
    });
  },

  addStep: (sectionIndex) => {
    set(state => {
      const newSections = [...state.sections];
      const section = newSections[sectionIndex];
      
      if (!section) return state;
      
      const newStep: Step = {
        id: Date.now(),
        order: section.steps.length,
        questions: []
      };
      
      section.steps.push(newStep);
      
      return {
        sections: newSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(section.id)
      };
    });
  },

  removeStep: (sectionIndex, stepIndex) => {
    set(state => {
      const newSections = [...state.sections];
      const section = newSections[sectionIndex];
      
      if (!section) return state;
      
      section.steps.splice(stepIndex, 1);
      
      return {
        sections: newSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(section.id)
      };
    });
  },

  removeQuestion: (sectionIndex, stepIndex, questionIndex) => {
    set(state => {
      const newSections = [...state.sections];
      const section = newSections[sectionIndex];
      
      if (!section) return state;
      
      const step = section.steps[stepIndex];
      if (!step) return state;
      
      step.questions.splice(questionIndex, 1);
      
      return {
        sections: newSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(section.id)
      };
    });
  },

  addQuestion: (sectionIndex, stepIndex) => {
    set(state => {
      const newSections = [...state.sections];
      const section = newSections[sectionIndex];
      
      if (!section) return state;
      
      const step = section.steps[stepIndex];
      if (!step) return state;
      
      const newQuestion: Question = {
        type: 'SingleSelection',
        alias: `question_${Date.now()}`,
        editable: true,
        props: {
          question: 'New Question',
          required: true,
          options: ['Option 1', 'Option 2']
        }
      };
      
      step.questions.push(newQuestion);
      
      return {
        sections: newSections,
        modifiedSectionIds: new Set(state.modifiedSectionIds).add(section.id)
      };
    });
  },

  saveNewSection: () => set(state => {
    const { color, name } = state.newSection;
    if (!color || !name) {
      alert('All fields are required.');
      return state;
    }
    
    const newSection: Section = {
      id: state.sections.length > 0 ? Math.max(...state.sections.map(s => s.id)) + 1 : 1,
      color, 
      name,
      steps: [],
      order: state.sections.length
    };

    // Add to modified sections to ensure it gets saved
    return { 
      sections: [...state.sections, newSection],
      modifiedSectionIds: new Set(state.modifiedSectionIds).add(newSection.id),
      isAddingSection: false,
      newSection: { color: '', name: '' } // Reset the form
    };
  }),

  handleDeleteSection: () => set(state => {
    if (state.sectionToDelete === null) return state;
    const sectionName = state.sections[state.sectionToDelete].name;
    if (state.deleteConfirmName !== sectionName) {
      alert('Section name does not match. Deletion cancelled.');
      return state;
    }

    const sectionId = state.sections[state.sectionToDelete].id;
    
    return {
      sections: state.sections.filter((_, i) => i !== state.sectionToDelete),
      activeTab: state.activeTab === state.sectionToDelete ? 0 : 
                state.activeTab > state.sectionToDelete ? state.activeTab - 1 : state.activeTab,
      isDeleteModalOpen: false,
      sectionToDelete: null,
      deletedSectionIds: new Set(state.deletedSectionIds).add(sectionId)
    };
  }),

  createNewFlow: async () => {
    const { newFlowName, selectedTemplate } = get();
    if (!newFlowName.trim()) {
      alert('Flow name is required');
      return;
    }

    try {
      set({ isLoading: true });
      await createFlow(newFlowName, selectedTemplate);
      
      // Reset state and fetch updated flows
      set({
        isAddingFlow: false,
        newFlowName: '',
        currentFlow: newFlowName
      });
      
      await get().fetchFlows();
      await get().fetchSections();
    } catch (error) {
      console.error('Error creating flow:', error);
      alert('Failed to create flow. Please try again.');
      set({ isLoading: false });
    }
  },

  handleDeleteFlow: async (flow: string) => {
    if (!confirm(`Are you sure you want to delete the flow "${flow}"? This action cannot be undone.`)) {
      return;
    }

    try {
      set({ isLoading: true });
      await deleteFlow(flow);
      
      // Fetch updated flows
      await get().fetchFlows();
      
      // If we deleted the current flow, fetch sections for the new current flow
      if (get().currentFlow === flow) {
        await get().fetchSections();
      }
    } catch (error) {
      console.error('Error deleting flow:', error);
      alert('Failed to delete flow. Please try again.');
      set({ isLoading: false });
    }
  }
})); 