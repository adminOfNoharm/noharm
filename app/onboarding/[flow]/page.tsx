'use client';

import CompletionSection from "@/components/sections/seller/CompletionSection";
import SectionLayout from "@/components/sections/seller/SectionLayout";
import RecapSection from "@/components/sections/seller/RecapSection";
import useStore from "@/store"; 
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowRight, ArrowLeft, X, Check, AlertCircle } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

function MainContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const flowName = params?.flow as string;
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Check if in editing mode from query parameters
  const isEditing = searchParams?.get('isEditing') === 'true';

  const {
    loading,
    fetchSectionsData,
    sectionsData,
    currentSectionIndex,
    setCurrentSectionIndex,
    currentStep,
    setCurrentStep,
    setSession,
    setUserId,
    session,
    userId,
    onboardingComplete,
    setOnboardingComplete,
    setCurrentFlow,
    setSelectedValues,
    completedSections,
    isRecapMode,
    setRecapMode,
    getVisibleSections,
    calculateProgress,
    setEditingMode
  } = useStore();

  // Add state for tracking data loading
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Set editing mode when component mounts or isEditing changes
  useEffect(() => {
    setEditingMode(isEditing);
  }, [isEditing, setEditingMode]);

  useEffect(() => {
    const initializeAndCheckAccess = async () => {
      setIsDataLoading(true);
      try {
        // Get initial session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession?.user) {
          router.push('/login');
          return;
        }

        // Set session in store
        setSession(currentSession);
        setUserId(currentSession.user.id);

        // Check user role and access
        const { data: profile } = await supabase
          .from('seller_compound_data')
          .select('role')
          .eq('uuid', currentSession.user.id)
          .single();

        const userRole = profile?.role;
        
        // Allow admin to access any flow
        if (userRole === 'seller') {
          if (flowName !== "kyc_seller" && flowName !== "tool_questionnaire") {
            router.push('/onboarding');
            return;
          }
        }
        else if (userRole === 'ally') {
          if (flowName !== "kyc_ally") {
            router.push('/onboarding');
            return;
          }
        }
        else if (userRole === 'buyer') {
          if (flowName !== "kyc_buyer" && flowName !== "buyer_questionnaire") {
            router.push('/onboarding');
            return;
          }
        }

        // Check if flow exists
        const { data, error } = await supabase
          .from('onboarding_questions')
          .select('flow_name')
          .eq('flow_name', flowName)
          .single();
        
        if (error || !data) {
          router.push('/404');
          return;
        }
        
        // Set flow and fetch data only after all checks pass
        setCurrentFlow(flowName);
        await fetchSectionsData(flowName);
        setIsDataLoading(false);
      } catch (error) {
        console.error('Error in initialization:', error);
        router.push('/404');
      }
    };

    initializeAndCheckAccess();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSession(session);
        setUserId(session.user.id);
      } else {
        setUserId(null);
        router.push('/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [flowName, router, setSession, setUserId, setCurrentFlow, fetchSectionsData]);

  const visibleSections = getVisibleSections();

  useEffect(() => {
    if (!loading && currentSectionIndex === sectionsData.length) {
      setRecapMode(true);
      
      // Check if all sections are complete
      const { isComplete } = useStore.getState().checkFlowCompletion();
      if (isComplete) {
        // Complete the flow and move to next stage if applicable
        useStore.getState().completeFlow().catch(error => {
          console.error('Error completing flow:', error);
          setNotification({
            type: 'error',
            message: 'Error completing onboarding flow. Please try again.'
          });
        });
      }
    }
  }, [currentSectionIndex, sectionsData.length, loading, setRecapMode]);

  // Add effect to handle section visibility changes
  useEffect(() => {
    if (!loading && sectionsData.length > 0 && visibleSections.length > 0) {
      // Only update if we're at index 0 and the current section isn't already the first visible one
      if (currentSectionIndex === 0) {
        const firstVisibleSection = visibleSections[0];
        const firstVisibleIndex = sectionsData.findIndex(s => s.id === firstVisibleSection.id);
        if (firstVisibleIndex !== currentSectionIndex) {
          setCurrentSectionIndex(firstVisibleIndex);
          
          // Set to first visible step
          const visibleSteps = useStore.getState().getVisibleSteps(firstVisibleIndex);
          if (visibleSteps.length > 0) {
            const firstVisibleStepIndex = firstVisibleSection.steps.findIndex(s => s.id === visibleSteps[0].id);
            if (firstVisibleStepIndex >= 0) {
              setCurrentStep(firstVisibleStepIndex);
            } else {
              setCurrentStep(0);
            }
          } else {
            setCurrentStep(0);
          }
        }
        return;
      }

      // Handle visibility changes for current section
      const currentSection = sectionsData[currentSectionIndex];
      if (currentSection && !visibleSections.includes(currentSection)) {
        // Current section is no longer visible, move to the next visible section
        const nextVisibleSection = visibleSections.find(s => 
          sectionsData.findIndex(ds => ds.id === s.id) > currentSectionIndex
        );
        if (nextVisibleSection) {
          const nextIndex = sectionsData.findIndex(s => s.id === nextVisibleSection.id);
          if (nextIndex !== currentSectionIndex) {
            setCurrentSectionIndex(nextIndex);
            
            // Set to first visible step
            const visibleSteps = useStore.getState().getVisibleSteps(nextIndex);
            if (visibleSteps.length > 0) {
              const firstVisibleStepIndex = nextVisibleSection.steps.findIndex(s => s.id === visibleSteps[0].id);
              if (firstVisibleStepIndex >= 0) {
                setCurrentStep(firstVisibleStepIndex);
              } else {
                setCurrentStep(0);
              }
            } else {
              setCurrentStep(0);
            }
          }
        } else if (currentSectionIndex !== sectionsData.length) {
          // Only move to recap if we're not already there
          setCurrentSectionIndex(sectionsData.length);
        }
      }
    }
  }, [loading, visibleSections, currentSectionIndex, sectionsData, setCurrentSectionIndex, setCurrentStep]);

  // Add effect to ensure the correct step is shown when a section is loaded
  useEffect(() => {
    if (!loading && sectionsData.length > 0) {
      // Check if the current step is valid for the current section
      const currentSection = sectionsData[currentSectionIndex];
      if (currentSection) {
        const visibleSteps = useStore.getState().getVisibleSteps(currentSectionIndex);
        
        // If there are visible steps but the current step doesn't correspond to a visible step
        if (visibleSteps.length > 0) {
          const currentStepId = currentSection.steps[currentStep]?.id;
          const isCurrentStepVisible = visibleSteps.some(step => step.id === currentStepId);
          
          if (!isCurrentStepVisible) {
            // Find the index of the first visible step
            const firstVisibleStepIndex = currentSection.steps.findIndex(s => s.id === visibleSteps[0].id);
            if (firstVisibleStepIndex >= 0) {
              console.log(`Current step ${currentStep} is not visible, switching to ${firstVisibleStepIndex}`);
              setCurrentStep(firstVisibleStepIndex);
            }
          }
        }
      }
    }
  }, [loading, currentSectionIndex, currentStep, sectionsData, setCurrentStep]);

  const isSectionComplete = (index: number) => {
    const { validateSection } = useStore.getState();
    return validateSection(index).isValid;
  };

  // Modify the loading check to include all necessary conditions
  if (loading || isDataLoading || !session || !sectionsData || sectionsData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const renderSection = () => {
    if (onboardingComplete) {
      return <CompletionSection />;
    } else if (isRecapMode) {
      return <RecapSection />;
    } else {
      return <SectionLayout />;
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div 
        className={`hidden lg:block fixed left-0 top-0 bottom-0 w-[400px] ${onboardingComplete || isRecapMode ? 'lg:hidden' : ''} overflow-y-auto transition-colors duration-700 ease-in-out`} 
        style={{ backgroundColor: sectionsData[currentSectionIndex]?.color || '#ffffff' }}
      >
        <div className="h-full w-[320px] mx-auto pt-16 flex flex-col">
          <div className="flex-shrink-0">
            <div className="flex flex-row items-center space-x-2">
              <img src="/images/logos/new-iconlogo-white.png" alt="Icon Logo" className="h-12 w-12" />
              <h1 className="text-3xl font-semibold text-white font-primary">Onboarding</h1>
            </div>
            <p className="mt-2 text-white/80 font-secondary text-lg">Let's get to know you better</p>
          </div>
          
          <div className="mt-[6rem] flex-1 overflow-y-auto pr-4">
            <div className="flex flex-col space-y-4">
              {visibleSections.map((section, visibleIndex) => {
                const isComplete = isSectionComplete(sectionsData.findIndex(s => s.id === section.id));
                const isCurrent = section.id === sectionsData[currentSectionIndex]?.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      const actualIndex = sectionsData.findIndex(s => s.id === section.id);
                      setCurrentSectionIndex(actualIndex);
                      
                      // Reset to first visible step instead of always step 0
                      const visibleSteps = useStore.getState().getVisibleSteps(actualIndex);
                      if (visibleSteps.length > 0) {
                        // Find the index of the first visible step in the section's steps array
                        const firstVisibleStepIndex = section.steps.findIndex(s => s.id === visibleSteps[0].id);
                        if (firstVisibleStepIndex >= 0) {
                          setCurrentStep(firstVisibleStepIndex);
                        } else {
                          setCurrentStep(0);
                        }
                      } else {
                        setCurrentStep(0);
                      }
                    }}
                    className={`group flex items-start w-full p-4 rounded-lg transition-all duration-500 ease-in-out ${
                      isCurrent
                        ? 'bg-white text-black shadow-xl'
                        : 'bg-transparent text-white opacity-60 hover:bg-white hover:text-black hover:opacity-20 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <div className="text-[0.9em] font-medium font-primary tracking-wide break-words pr-2">
                        {section.name}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {currentSectionIndex === sectionsData.findIndex(s => s.id === section.id) ? (
                        <ArrowRight 
                          className="w-4 h-4 text-black transition-all duration-300 ease-in-out"
                        />
                      ) : isComplete ? (
                        <Check 
                          className="w-4 h-4 text-white transition-all duration-300 ease-in-out"
                        />
                      ) : (
                        <AlertCircle 
                          className="w-4 h-4 text-white/60 transition-all duration-300 ease-in-out"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex-shrink-0 pb-8">
            <button
              onClick={() => router.push('/onboarding/dashboard')}
              className="flex items-center space-x-2 text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <main 
        className={`min-h-screen w-full flex flex-col ${onboardingComplete || isRecapMode ? '' : 'lg:pl-[400px]'} transition-colors duration-700 ease-in-out`}
        style={{backgroundColor: sectionsData[currentSectionIndex]?.color || '#ffffff'}}
      >
        <div className={`flex-1 flex flex-col bg-white ${onboardingComplete || isRecapMode ? '' : 'lg:rounded-l-3xl'}`}>
          {/* Mobile section selector */}
          <div className="lg:hidden px-6 pt-6 pb-4 bg-white sticky top-0 z-10">
            <select
              value={currentSectionIndex}
              onChange={(e) => {
                const newSectionIndex = Number(e.target.value);
                setCurrentSectionIndex(newSectionIndex);
                
                // Reset to first visible step instead of always step 0
                const visibleSteps = useStore.getState().getVisibleSteps(newSectionIndex);
                if (visibleSteps.length > 0) {
                  // Find the index of the first visible step in the section's steps array
                  const section = sectionsData[newSectionIndex];
                  const firstVisibleStepIndex = section.steps.findIndex(s => s.id === visibleSteps[0].id);
                  if (firstVisibleStepIndex >= 0) {
                    setCurrentStep(firstVisibleStepIndex);
                  } else {
                    setCurrentStep(0);
                  }
                } else {
                  setCurrentStep(0);
                }
              }}
              className="w-full p-3 border rounded-lg bg-white text-lg"
            >
              {visibleSections.map((section) => {
                const actualIndex = sectionsData.findIndex(s => s.id === section.id);
                return (
                  <option key={section.id} value={actualIndex}>
                    {section.name}
                  </option>
                );
              })}
            </select>
          </div>

          {isEditing && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-4">
              <p className="text-sm text-blue-800 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>You're in edit mode. Changes will be saved without affecting your completion status.</span>
              </p>
            </div>
          )}

          {renderSection()}

          {/* Progress bar */}
          <div className="mt-auto">
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between p-6">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 mr-6">
                <div
                  className="h-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${calculateProgress()}%`,
                    backgroundColor: currentSectionIndex < sectionsData.length 
                      ? sectionsData[currentSectionIndex].color 
                      : sectionsData[sectionsData.length - 1].color
                  }}
                />
              </div>
              <img src="/images/logos/new-logo-blue.png" alt="noharm" className="h-7" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainContent; 