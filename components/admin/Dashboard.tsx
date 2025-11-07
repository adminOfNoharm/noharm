import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from '@/components/ui/modal';
import { useAdminStore } from '@/lib/stores/adminStore';
import { QuestionModal } from './QuestionModal';
import { getTemplateNames, getTemplate } from '@/lib/flowTemplates';
import { supabase } from '@/lib/supabase';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/utils";

interface ProfileMetrics {
  totalProfiles: number;
  inReviewProfiles: number;
  boardingProfiles: number;
}

interface StatusChange {
  uuid: string;
  email: string;
  status: string;
  last_updated_status: string;
}

const Dashboard = () => {
  const {
    sections,
    activeTab,
    isLoading,
    isAddingSection,
    isAddingFlow,
    isDeleteModalOpen,
    deleteConfirmName,
    newSection,
    newFlowName,
    setNewFlowName,
    createNewFlow,
    handleDeleteFlow,
    setIsAddingFlow,
    fetchSections,
    fetchFlows,
    setActiveTab,
    setIsAddingSection,
    setDeleteConfirmName,
    setSectionToDelete,
    handleSectionChange,
    saveNewSection,
    handleDeleteSection,
    addStep,
    removeStep,
    saveChanges,
    setNewSection,
    setIsDeleteModalOpen,
    modifiedSectionIds,
    deletedSectionIds,
    currentFlow,
    availableFlows,
    setCurrentFlow,
    selectedTemplate,
    setSelectedTemplate,
  } = useAdminStore();

  const [selectedQuestion, setSelectedQuestion] = useState<{
    indices: { section: number; step: number; question: number; };
  } | null>(null);

  const [metrics, setMetrics] = useState<ProfileMetrics>({
    totalProfiles: 0,
    inReviewProfiles: 0,
    boardingProfiles: 0
  });
  const [recentActivity, setRecentActivity] = useState<StatusChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleDescriptions, setVisibleDescriptions] = useState<Record<string, boolean>>({});

  const toggleDescription = (templateName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setVisibleDescriptions(prev => ({
      ...prev,
      [templateName]: !prev[templateName]
    }));
  };

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      fetchMetrics();
      fetchRecentActivity();
      fetchFlows();
      fetchSections();
    }
  }, [fetchFlows, fetchSections]);

  const fetchMetrics = async () => {
    try {
      const { data: profilesData, error } = await supabase
        .from('seller_compound_data')
        .select('status');

      if (error) throw error;

      const metrics = {
        totalProfiles: profilesData.length,
        inReviewProfiles: profilesData.filter(p => p.status === 'in_review').length,
        boardingProfiles: profilesData.filter(p => p.status === 'boarding').length
      };

      setMetrics(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Fetch the 20 most recent status changes
      const { data: statusChanges, error: statusError } = await supabase
        .from('seller_compound_data')
        .select('uuid, status, last_updated_status')
        .order('last_updated_status', { ascending: false })
        .limit(20);

      if (statusError) throw statusError;

      // Fetch emails for each profile
      const profilesWithEmails = await Promise.all((statusChanges || []).map(async (change) => {
        const { data: email, error: emailError } = await supabase
          .rpc('get_user_email_by_uuid', { user_uuid: change.uuid });
        
        if (emailError) {
          console.error("Error fetching email:", emailError);
          return { ...change, email: 'Email not found' };
        }
        
        return { ...change, email: email || 'Email not found' };
      }));

      setRecentActivity(profilesWithEmails);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      boarding: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  // Handle flow change
  const handleFlowChange = (newFlow: string) => {
    if (modifiedSectionIds.size > 0 || deletedSectionIds.size > 0) {
      if (window.confirm('You have unsaved changes. Switching flows will discard these changes. Continue?')) {
        setCurrentFlow(newFlow);
        fetchSections();
      }
    } else {
      setCurrentFlow(newFlow);
      fetchSections();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r overflow-y-auto">
        <div className="p-4">
          {/* Flow Management */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Flow
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingFlow(true)}
              >
                New Flow
              </Button>
            </div>
            <div className="flex gap-2">
              <select
                value={currentFlow}
                onChange={(e) => handleFlowChange(e.target.value)}
                className="flex-1 p-2 border rounded-md"
              >
                {availableFlows.map((flow) => (
                  <option key={flow} value={flow}>
                    {flow}
                  </option>
                ))}
              </select>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteFlow(currentFlow)}
                disabled={availableFlows.length <= 1}
              >
                Delete
              </Button>
            </div>
          </div>

          <Button
            className="w-full mb-2"
            onClick={() => setIsAddingSection(true)}
          >
            Add New Section
          </Button>
          
          <Button 
            className="w-full mb-4"
            onClick={saveChanges}
            disabled={modifiedSectionIds.size === 0 && deletedSectionIds.size === 0}
            variant="success"
          >
            Save all Changes
          </Button>
          
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`p-3 cursor-pointer rounded ${
                activeTab === index ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(index)}
            >
              <div className="font-medium">{section.name}</div>
              <div className="text-sm text-gray-500">{section.steps.length} steps</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Profiles</h3>
              <p className="text-3xl font-bold mt-2">{metrics.totalProfiles}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Profiles In Review</h3>
              <p className="text-3xl font-bold mt-2 text-yellow-600">{metrics.inReviewProfiles}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Profiles Boarding</h3>
              <p className="text-3xl font-bold mt-2 text-green-600">{metrics.boardingProfiles}</p>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Status Changes</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={`${activity.uuid}-${activity.last_updated_status}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{activity.email}</p>
                      <p className="text-sm text-gray-500">
                        Status changed to{' '}
                        <Badge className={getStatusColor(activity.status)}>
                          {capitalize(activity.status.replace('_', ' '))}
                        </Badge>
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.last_updated_status).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {sections[activeTab] && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{sections[activeTab].name}</h1>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => saveChanges}
                    disabled={!modifiedSectionIds.has(sections[activeTab].id)}
                  >
                    Save Section
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setSectionToDelete(activeTab);
                      setDeleteConfirmName('');
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    Delete Section
                  </Button>
                </div>
              </div>

              {/* Section Details */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">Section Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {['name', 'color'].map((field) => (
                    <div key={field}>
                      <label className="block font-medium mb-1 capitalize">{field}:</label>
                      <Input
                        value={sections[activeTab][field as 'name' | 'color']}
                        onChange={(e) => handleSectionChange(activeTab, field as 'name' | 'color', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps and Questions */}
              {sections[activeTab].steps.map((step, stepIndex) => (
                <div key={step.id} className="bg-white p-6 rounded-lg shadow mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Step {stepIndex + 1}</h3>
                    <Button 
                      variant="destructive"
                      onClick={() => removeStep(activeTab, stepIndex)}
                    >
                      Delete Step
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {step.questions.map((question, questionIndex) => (
                      <div
                        key={questionIndex}
                        className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedQuestion({
                          indices: { section: activeTab, step: stepIndex, question: questionIndex }
                        })}
                      >
                        <div className="font-medium">{question.props.question || 'Untitled Question'}</div>
                        <div className="text-sm text-gray-500">
                          Type: {question.type} | Alias: {question.alias}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button 
                className="w-full"
                variant="outline"
                onClick={() => addStep(activeTab)}
              >
                Add New Step
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedQuestion && (
        <QuestionModal
          isOpen={true}
          onClose={() => setSelectedQuestion(null)}
          sectionIndex={selectedQuestion.indices.section}
          stepIndex={selectedQuestion.indices.step}
          questionIndex={selectedQuestion.indices.question}
        />
      )}

      {/* Other existing modals (Add Section, Delete Confirmation) */}
      {isDeleteModalOpen && (
        <Modal isOpen={true} onClose={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete Section</h2>
            <p className="mb-4">Please type "{sections[activeTab].name}" to confirm deletion:</p>
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Enter section name"
              className="w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteSection}
              >
                Delete Section
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isAddingSection && (
        <Modal isOpen={true} onClose={() => setIsAddingSection(false)}>
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Add New Section</h2>
            <div className="space-y-4">
              {['name', 'color'].map((field) => (
                <div key={field}>
                  <label className="font-semibold capitalize">{field}:</label>
                  <Input
                    value={newSection[field as keyof typeof newSection]}
                    onChange={(e) => setNewSection(prev => ({
                      ...prev,
                      [field]: e.target.value
                    }))}
                    placeholder={`Enter ${field}`}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddingSection(false)}>
                Cancel
              </Button>
              <Button onClick={saveNewSection}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Flow Modal */}
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
              <Button onClick={createNewFlow}>
                Create Flow
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard; 