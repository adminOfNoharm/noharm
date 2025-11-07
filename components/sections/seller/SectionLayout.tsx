import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useStore from "@/store";
import DynamicQuestionRenderer from "@/components/questions/DynamicQuestionRenderer";
import { Question, DetailFormField } from "@/lib/interfaces";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ValidationResult, validateStep, validateQuestionValue } from "@/lib/validation";
import { toast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SectionLayout = () => {
    const {
        sectionsData,
        currentSectionIndex,
        currentStep,
        setCurrentStep,
        handleNextStep,
        handleBackStep,
        selectedValues,
        setSelectedValue,
        session,
        setSelectedValues,
        validateSection,
        validateCurrentStep,
        setCurrentSectionIndex,
        getVisibleSteps
    } = useStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setError(null);
        setValidationErrors({});
    }, [currentStep, currentSectionIndex]);

    const totalSteps = () => {
        const visibleSteps = getVisibleSteps(currentSectionIndex);
        return visibleSteps.length;
    };

    // Get the visible steps for the current section
    const visibleSteps = getVisibleSteps(currentSectionIndex);

    const upsertSelectedValues = async () => {
        if (!session) {
            alert("Unable to save. No session found.");
            return false;
        }

        const { user } = session;
        const currentStepData = sectionsData[currentSectionIndex]?.steps[currentStep];
        const currentStepQuestions: Question[] = currentStepData?.questions || [];
        const updatedValues: Record<string, any> = {};

        currentStepQuestions.forEach(q => {
            updatedValues[q.alias] = selectedValues[q.alias];
        });

        if (Object.keys(updatedValues).length === 0) {
            return true; // No update needed
        }

        try {
            const { data: existingData } = await supabase
                .from('seller_compound_data')
                .select('data')
                .eq('uuid', user.id)
                .single();

            const existingValues = existingData?.data || {};
            const mergedData = { ...existingValues, ...updatedValues };

            const { error } = await supabase
                .from('seller_compound_data')
                .upsert([{
                    uuid: user.id,
                    data: mergedData
                }]);

            if (error) {
                console.error("Error saving data:", error.message);
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error saving data:", error);
            return false;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!session) {
                alert("An error occurred. Code: NoSession");
                return;
            }

            const { user } = session;
            const { data, error } = await supabase
                .from('seller_compound_data')
                .select('data, role')
                .eq('uuid', user.id)
                .single();

            if (error) {
                console.error("Error fetching data:", error.message);
                alert("Error fetching data. Please try again.");
            } else if (!data) {
                console.warn("No data found for the given UUID.");
                const { error: upsertError } = await supabase
                    .from('seller_compound_data')
                    .upsert([{ uuid: user.id, data: {}, role: 'seller' }]);

                if (upsertError) {
                    console.error("Error upserting new data:", upsertError.message);
                    alert("Error creating new data. Please try again.");
                } else {
                    setSelectedValues({});
                }
            } else {
                setSelectedValues(data.data);
            }

            setIsLoading(false);
        };

        fetchData();
    }, [session, setSelectedValues]);

    const handleContinue = async () => {
        // Validate current step's questions
        const currentStepData = sectionsData[currentSectionIndex]?.steps[currentStep];
        const currentStepQuestions: Question[] = currentStepData?.questions || [];
        const newValidationErrors: Record<string, string> = {};

        currentStepQuestions.forEach(question => {
            const validation = validateQuestionValue(question, selectedValues[question.alias]);
            if (!validation.isValid && question.props.required !== false) {
                newValidationErrors[question.alias] = validation.error || 'This field is required';
            }
        });

        setValidationErrors(newValidationErrors);

        // If there are validation errors, stop here
        if (Object.keys(newValidationErrors).length > 0) {
            return;
        }

        setError(null);
        const saveSuccess = await upsertSelectedValues();
        if (saveSuccess) {
            handleNextStep(totalSteps());
        } else {
            setError("Failed to save. Please try again");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }
  
    const currentSectionData = sectionsData[currentSectionIndex]; 
    const currentStepData = currentSectionData?.steps[currentStep]; 
    const currentStepQuestions: Question[] = currentStepData?.questions || []; 

    // Helper function to check if a section is complete
    const isSectionComplete = (sectionIndex: number) => {
        const section = sectionsData[sectionIndex];
        if (!section) return false;
        
        const validation = validateSection(sectionIndex);
        return validation.isValid;
    };

    // Find the index of the current step in the visible steps array
    const currentVisibleStepIndex = visibleSteps.findIndex(step => step.id === currentStepData?.id);

    return (
        <div className="flex flex-1 flex-col p-8 md:p-12 mx-auto w-[100%] sm:w-[90%] lg:w-[90%]">
            {/* Progress Indicator */}
            <div className="mb-12 flex flex-wrap gap-2" style={{ height: '40px' }}>
                {visibleSteps.map((step, index) => {
                    // Find the actual index of this step in the section's steps array
                    const stepIndex = sectionsData[currentSectionIndex]?.steps.findIndex(s => s.id === step.id);
                    
                    return (
                        <div 
                            key={step.id} 
                            className={`h-1.5 w-16 hover:cursor-pointer rounded ${
                                currentVisibleStepIndex >= index ? "bg-black" : "bg-gray-200"
                            }`} 
                            onClick={() => stepIndex !== undefined && stepIndex >= 0 ? setCurrentStep(stepIndex) : null}
                        />
                    );
                })}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            {currentStepQuestions.length === 1 ? (
                <div className="flex flex-1 flex-col justify-center">
                    <div className="w-full">
                        <DynamicQuestionRenderer
                            question={currentStepQuestions[0]}
                            selectedValues={selectedValues}
                            setSelectedValue={setSelectedValue}
                        />
                        {validationErrors[currentStepQuestions[0].alias] && (
                            <div className="mt-2 text-sm text-red-600">
                                {validationErrors[currentStepQuestions[0].alias]}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 flex-col justify-between gap-24 mb-[15%]">
                    {currentStepQuestions.map((question, index) => (
                        <div key={index}>
                            <DynamicQuestionRenderer
                                question={question}
                                selectedValues={selectedValues}
                                setSelectedValue={setSelectedValue}
                            />
                            {validationErrors[question.alias] && (
                                <div className="mt-2 text-sm text-red-600">
                                    {validationErrors[question.alias]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Navigation */}
            <div className="mt-auto pt-8 flex items-center" style={{ height: '60px' }}>
                {(currentStep > 0 || currentSectionIndex > 0) && (
                    <Button variant="ghost" onClick={handleBackStep}>Back</Button>
                )}
                <Button className="ml-auto" onClick={handleContinue}>
                    {currentVisibleStepIndex === visibleSteps.length - 1 ? "Complete Section" : "Continue"}
                </Button>
            </div>
        </div>
    );
};

export default SectionLayout; 