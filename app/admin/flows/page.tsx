"use client";

import React from 'react';
import { useFlowStore } from '@/lib/stores/flowStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getTemplateNames, getTemplate } from '@/lib/flowTemplates';

export default function FlowsPage() {
  const { 
    flows,
    currentFlow,
    isLoading,
    error,
    selectedTemplate,
    setSelectedTemplate,
    setCurrentFlow,
    createNewFlow,
    deleteFlow
  } = useFlowStore();

  const [isAddingFlow, setIsAddingFlow] = React.useState(false);
  const [newFlowName, setNewFlowName] = React.useState('');
  const [visibleDescriptions, setVisibleDescriptions] = React.useState<Record<string, boolean>>({});

  const toggleDescription = (templateName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setVisibleDescriptions(prev => ({
      ...prev,
      [templateName]: !prev[templateName]
    }));
  };

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) {
      alert('Please enter a flow name');
      return;
    }
    
    await createNewFlow(newFlowName, selectedTemplate);
    setIsAddingFlow(false);
    setNewFlowName('');
  };

  const handleDeleteFlow = async (flowName: string) => {
    if (!window.confirm(`Are you sure you want to delete the flow "${flowName}"?`)) {
      return;
    }
    await deleteFlow(flowName);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Flows</h1>
        <Button onClick={() => setIsAddingFlow(true)}>
          Add New Flow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow) => (
          <Card key={flow} className={`
            ${currentFlow === flow ? 'ring-2 ring-primary' : ''}
            hover:shadow-lg transition-shadow duration-200
          `}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">{flow}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteFlow(flow)}
              >
                Delete
              </Button>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCurrentFlow(flow)}
              >
                {currentFlow === flow ? 'Currently Selected' : 'Select Flow'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAddingFlow && (
        <Modal isOpen={true} onClose={() => setIsAddingFlow(false)}>
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Flow</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flow Name
                </label>
                <Input
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="Enter flow name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Template
                </label>
                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto">
                  {getTemplateNames().map((name) => {
                    const template = getTemplate(name);
                    if (!template) return null;
                    
                    return (
                      <div
                        key={name}
                        className={`
                          border rounded-lg p-4 cursor-pointer transition-all
                          ${selectedTemplate === name 
                            ? 'ring-2 ring-primary border-primary bg-primary/5' 
                            : 'hover:border-gray-400'
                          }
                        `}
                        onClick={() => setSelectedTemplate(name)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-lg mb-2">{template.name}</h3>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                                {template.sections.length} section{template.sections.length !== 1 ? 's' : ''}
                              </div>
                              <button
                                onClick={(e) => toggleDescription(name, e)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                {visibleDescriptions[name] ? 'Hide info' : 'Show info'}
                              </button>
                            </div>
                          </div>
                          {selectedTemplate === name && (
                            <div className="text-primary">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {visibleDescriptions[name] && (
                          <p className="text-sm text-gray-500 mb-3 border-l-2 border-gray-200 pl-3">
                            {template.description}
                          </p>
                        )}

                        <div className="space-y-1">
                          {template.sections.map((section, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: section.color || '#CBD5E1' }}
                              />
                              <span className="text-sm text-gray-600">{section.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddingFlow(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFlow}>
                Create Flow
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 