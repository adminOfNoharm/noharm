import { create } from 'zustand';
import { listFlows, createFlow as apiCreateFlow, deleteFlow as apiDeleteFlow } from '@/lib/utils/section-management';
import { getTemplate } from '@/lib/flowTemplates';

interface FlowState {
  flows: string[];
  currentFlow: string | null;
  isLoading: boolean;
  error: string | null;
  selectedTemplate: string;
  
  // Actions
  setCurrentFlow: (flow: string | null) => void;
  setSelectedTemplate: (template: string) => void;
  fetchFlows: () => Promise<void>;
  createNewFlow: (name: string, templateName: string) => Promise<void>;
  deleteFlow: (name: string) => Promise<void>;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  flows: [],
  currentFlow: null,
  isLoading: false,
  error: null,
  selectedTemplate: 'basic',
  
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  fetchFlows: async () => {
    set({ isLoading: true, error: null });
    try {
      const flows = await listFlows();
      set({ flows, isLoading: false });
      
      // Set current flow if none selected
      if (!get().currentFlow && flows.length > 0) {
        set({ currentFlow: flows[0] });
      }
    } catch (error) {
      set({ 
        error: 'Failed to fetch flows', 
        isLoading: false 
      });
    }
  },
  
  createNewFlow: async (name: string, templateName: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiCreateFlow(name, templateName);
      await get().fetchFlows();
      set({ currentFlow: name });
    } catch (error) {
      set({ 
        error: 'Failed to create flow', 
        isLoading: false 
      });
    }
  },
  
  deleteFlow: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDeleteFlow(name);
      await get().fetchFlows();
      
      // If we deleted the current flow, switch to another one
      if (get().currentFlow === name) {
        const { flows } = get();
        set({ currentFlow: flows.length > 0 ? flows[0] : null });
      }
    } catch (error) {
      set({ 
        error: 'Failed to delete flow', 
        isLoading: false 
      });
    }
  },
})); 