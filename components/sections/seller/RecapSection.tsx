import { Button } from "@/components/ui/button";
import useStore from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, AlertCircle } from 'lucide-react';
import { validateQuestionValue } from "@/lib/validation";
import { Question } from "@/lib/interfaces";

const RecapSection = () => {
  const router = useRouter();
  const { 
    selectedValues, 
    sectionsData,
    setOnboardingComplete,
    setRecapMode,
    setCurrentSectionIndex,
    setCurrentStep,
    session,
    getVisibleSections,
    getVisibleSteps,
    completeFlow,
    userId,
    userRole,
    currentFlow,
    isEditingMode
  } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incompleteQuestions, setIncompleteQuestions] = useState<{
    sectionIndex: number;
    stepIndex: number;
    question: Question;
  }[]>([]);

  useEffect(() => {
    // Log user information for debugging
    console.log('User Info:', { userId, userRole, currentFlow, session });
    
    // Check for missing required information
    if (!userId || !userRole || !currentFlow) {
      setError('Missing required user information. Please try refreshing the page.');
    } else {
      setError(null);
    }
  }, [userId, userRole, currentFlow, session]);

  useEffect(() => {
    // Find all incomplete required questions from visible sections only
    const visibleSections = getVisibleSections();
    const incomplete: typeof incompleteQuestions = [];
    
    visibleSections.forEach(section => {
      // Find the actual index in the full sections array
      const sectionIndex = sectionsData.findIndex(s => s.id === section.id);
      
      // Get visible steps for this section
      const visibleSteps = getVisibleSteps(sectionIndex);
      
      visibleSteps.forEach(step => {
        // Find the actual index of this step in the section's steps array
        const stepIndex = section.steps.findIndex(s => s.id === step.id);
        
        step.questions.forEach(question => {
          const isRequired = question.props.required !== false;
          if (!isRequired) return;

          const validation = validateQuestionValue(question, selectedValues[question.alias]);
          if (!validation.isValid) {
            incomplete.push({
              sectionIndex,
              stepIndex,
              question
            });
          }
        });
      });
    });
    setIncompleteQuestions(incomplete);
  }, [sectionsData, selectedValues, getVisibleSections, getVisibleSteps]);

  const handleSubmit = async () => {
    if (incompleteQuestions.length > 0) {
      navigateToQuestion(
        incompleteQuestions[0].sectionIndex,
        incompleteQuestions[0].stepIndex
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (isEditingMode) {
        await completeFlow();
        // For sellers in editing mode, go back to main dashboard
        if (userRole === 'seller') {
          router.push('/dashboard');
        } else {
          router.push('/onboarding/dashboard');
        }
      } else {
        await setOnboardingComplete(true);
        await completeFlow();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred while submitting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const visibleSections = getVisibleSections();
    if (visibleSections.length > 0) {
      // Find the index of the last visible section in the full sections array
      const lastVisibleSection = visibleSections[visibleSections.length - 1];
      const lastVisibleIndex = sectionsData.findIndex(s => s.id === lastVisibleSection.id);
      setCurrentSectionIndex(lastVisibleIndex);
    } else {
      // Fallback to the last section if no visible sections (shouldn't happen)
      setCurrentSectionIndex(sectionsData.length - 1);
    }
    setRecapMode(false);
  };

  const navigateToQuestion = (sectionIndex: number, stepIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentStep(stepIndex);
    setRecapMode(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">
        {isEditingMode ? 'Review Your Changes' : 'Review Your Information'}
      </h1>
      
      {isEditingMode && (
        <div className="bg-blue-50 p-4 mb-6 rounded-md border border-blue-200">
          <p className="text-sm text-blue-800 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>You're in edit mode. Your changes will be saved without changing the completion status of the stage.</span>
          </p>
        </div>
      )}

      <div className="space-y-8">
        {getVisibleSections().map((section) => {
          // Find the actual index in the full sections array
          const sectionIndex = sectionsData.findIndex(s => s.id === section.id);
          // Get visible steps for this section
          const visibleSteps = getVisibleSteps(sectionIndex);
          
          return (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-4">{section.name}</h3>
              <div className="space-y-6">
                {visibleSteps.map((step) => {
                  // Find the actual index of this step in the section's steps array
                  const stepIndex = section.steps.findIndex(s => s.id === step.id);
                  
                  return (
                    <div key={step.id} className="space-y-4">
                      {step.questions.map((question) => {
                        const value = selectedValues[question.alias];
                        const isRequired = question.props.required !== false;
                        const validation = validateQuestionValue(question, value);
                        const isComplete = !isRequired || validation.isValid;

                        return (
                          <div 
                            key={question.alias} 
                            className={`flex items-start justify-between p-4 rounded-lg transition-colors ${
                              isComplete 
                                ? 'bg-gray-50' 
                                : 'bg-red-50 cursor-pointer hover:bg-red-100'
                            }`}
                            onClick={() => !isComplete && navigateToQuestion(sectionIndex, stepIndex)}
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {question.props.question || question.alias}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              {isComplete ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setRecapMode(false);
            setCurrentSectionIndex(0);
            setCurrentStep(0);
          }}
          disabled={isLoading}
        >
          Back to beginning
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || incompleteQuestions.length > 0 || Boolean(error)}
        >
          {isLoading 
            ? 'Processing...' 
            : isEditingMode 
              ? 'Save Changes' 
              : 'Submit'
          }
        </Button>
      </div>
    </div>
  );
};

export default RecapSection; 