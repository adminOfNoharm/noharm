"use client";

import React from 'react';
import { useSectionStore } from '@/lib/stores/sectionStore';
import { useFlowStore } from '@/lib/stores/flowStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SectionEditor } from '@/components/admin/sections/SectionEditor';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function SectionsPage() {
  const { 
    sections,
    currentSection,
    isLoading: sectionsLoading,
    error: sectionsError,
    setCurrentSection,
    addSection,
    deleteSection,
    saveSection,
    fetchSections,
    modifiedSectionIds,
    reorderSections,
    saveFlow,
    hasReorderChanges
  } = useSectionStore();

  const {
    currentFlow,
    flows,
    setCurrentFlow,
    fetchFlows
  } = useFlowStore();

  const [isAddingSection, setIsAddingSection] = React.useState(false);
  const [newSection, setNewSection] = React.useState({
    name: '',
    color: '#000000'
  });
  const [savingSection, setSavingSection] = React.useState<number | null>(null);

  // Fetch flows and sections on mount
  React.useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  React.useEffect(() => {
    if (currentFlow) {
      fetchSections(currentFlow);
    }
  }, [currentFlow, fetchSections]);

  const handleCreateSection = () => {
    if (!newSection.name || !newSection.color) {
      alert('Please fill in all fields');
      return;
    }
    
    addSection({
      name: newSection.name,
      color: newSection.color,
      steps: [],
      order: sections.length
    });
    
    setIsAddingSection(false);
    setNewSection({ name: '', color: '#000000' });
  };

  const handleSaveSection = async (sectionId: number) => {
    try {
      setSavingSection(sectionId);
      await saveSection(sectionId);
      // Show success toast or feedback here if you have a toast component
    } catch (error) {
      // Show error toast or feedback here
      console.error('Failed to save section:', error);
    } finally {
      setSavingSection(null);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }
    try {
      await deleteSection(sectionId);
      // Show success toast or feedback here
    } catch (error) {
      // Show error toast or feedback here
      console.error('Failed to delete section:', error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    reorderSections(sourceIndex, destinationIndex);
  };

  if (sectionsLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (sectionsError) {
    return <div className="p-8 text-red-500">{sectionsError}</div>;
  }

  return (
    <div className="flex h-full">
      {/* Sections List Sidebar */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Flow
            </label>
            <select
              value={currentFlow || ''}
              onChange={(e) => setCurrentFlow(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {flows.map((flow) => (
                <option key={flow} value={flow}>
                  {flow}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 mb-4">
            <Button 
              className="flex-1"
              onClick={() => setIsAddingSection(true)}
            >
              Add New Section
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={saveFlow}
              disabled={!hasReorderChanges && modifiedSectionIds.size === 0}
            >
              Save Flow
            </Button>
          </div>

          {(hasReorderChanges || modifiedSectionIds.size > 0) && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              You have unsaved changes
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {sections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            p-3 rounded-md cursor-pointer
                            ${currentSection?.id === section.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}
                            ${snapshot.isDragging ? 'shadow-lg' : ''}
                          `}
                          style={{
                            ...provided.draggableProps.style,
                            borderLeft: `4px solid ${section.color}`
                          }}
                          onClick={() => setCurrentSection(section)}
                        >
                          <div className="font-medium">{section.name}</div>
                          <div className="text-sm text-gray-500">
                            {section.steps.length} steps
                            {modifiedSectionIds.has(section.id) && (
                              <span className="ml-2 text-yellow-600">(Unsaved changes)</span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!modifiedSectionIds.has(section.id) || savingSection === section.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveSection(section.id);
                              }}
                            >
                              {savingSection === section.id ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(section.id);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentSection ? (
          <SectionEditor section={currentSection} />
        ) : (
          <div className="p-8 text-center text-gray-500">
            Select a section to edit or create a new one
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {isAddingSection && (
        <Modal isOpen={true} onClose={() => setIsAddingSection(false)}>
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name
                </label>
                <Input
                  value={newSection.name}
                  onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter section name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newSection.color}
                    onChange={(e) => setNewSection(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={newSection.color}
                    onChange={(e) => setNewSection(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddingSection(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>
                Create Section
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 