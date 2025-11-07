import React from 'react';
import { ConditionalDisplay, Section, Step } from '@/lib/interfaces';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface StepConditionalDisplayEditorProps {
  step: Step;
  section: Section;
  allSections: Section[];
  stepIndex: number;
  onUpdate: (conditionalDisplay: ConditionalDisplay | undefined) => void;
}

export const StepConditionalDisplayEditor: React.FC<StepConditionalDisplayEditorProps> = ({
  step,
  section,
  allSections,
  stepIndex,
  onUpdate,
}) => {
  const [isEnabled, setIsEnabled] = React.useState(!!step.conditionalDisplay);
  const [settings, setSettings] = React.useState<ConditionalDisplay>(
    step.conditionalDisplay || {
      questionAlias: '',
      expectedValue: '',
      operator: 'equals'
    }
  );
  const [searchTerm, setSearchTerm] = React.useState('');

  // Collect all question aliases from previous sections and steps within the current section
  const availableQuestions = React.useMemo(() => {
    const questions: { alias: string; question: string; sectionName: string }[] = [];
    
    // Only include questions from sections that come before this one
    const currentSectionIndex = allSections.findIndex(s => s.id === section.id);
    const previousSections = allSections.slice(0, currentSectionIndex);
    
    // Add questions from previous sections
    previousSections.forEach(prevSection => {
      prevSection.steps.forEach(step => {
        step.questions.forEach(question => {
          if (question.alias) {
            questions.push({
              alias: question.alias,
              question: question.props.question,
              sectionName: prevSection.name
            });
          }
        });
      });
    });
    
    // Add questions from previous steps in the current section
    section.steps.slice(0, stepIndex).forEach((prevStep, prevStepIndex) => {
      prevStep.questions.forEach(question => {
        if (question.alias) {
          questions.push({
            alias: question.alias,
            question: question.props.question,
            sectionName: `${section.name} - Step ${prevStepIndex + 1}`
          });
        }
      });
    });
    
    return questions;
  }, [allSections, section, stepIndex]);

  // Filter questions based on search term
  const filteredQuestions = React.useMemo(() => {
    if (!searchTerm) return availableQuestions;
    const lowerSearch = searchTerm.toLowerCase().trim();
    return availableQuestions.filter(q => 
      (q.question || '').toLowerCase().includes(lowerSearch) || 
      (q.alias || '').toLowerCase().includes(lowerSearch) ||
      (q.sectionName || '').toLowerCase().includes(lowerSearch)
    );
  }, [availableQuestions, searchTerm]);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      onUpdate(undefined);
    }
  };

  const handleChange = (field: keyof ConditionalDisplay, value: any) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);
    if (isEnabled) {
      onUpdate(updatedSettings);
    }
  };

  // Update settings when step.conditionalDisplay changes
  React.useEffect(() => {
    if (step.conditionalDisplay) {
      setSettings(step.conditionalDisplay);
      setIsEnabled(true);
    } else {
      setSettings({
        questionAlias: '',
        expectedValue: '',
        operator: 'equals'
      });
      setIsEnabled(false);
    }
  }, [step.conditionalDisplay]);

  const selectedQuestion = availableQuestions.find(q => q.alias === settings.questionAlias);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Conditional Display</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">Enable conditional display</span>
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Based on Question
            </label>
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className="w-full mb-1"
              />
              {searchTerm && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredQuestions.map((q) => (
                    <div
                      key={q.alias}
                      className={`p-2 hover:bg-gray-100 cursor-pointer ${
                        settings.questionAlias === q.alias ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        handleChange('questionAlias', q.alias);
                        setSearchTerm('');
                      }}
                    >
                      <div>{q.question}</div>
                      <div className="text-sm text-gray-500">
                        {q.sectionName} - {q.alias}
                      </div>
                    </div>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <div className="p-2 text-gray-500">No questions found</div>
                  )}
                </div>
              )}
              {selectedQuestion && !searchTerm && (
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  <div>{selectedQuestion.question}</div>
                  <div className="text-sm text-gray-500">
                    {selectedQuestion.sectionName} - {selectedQuestion.alias}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator
            </label>
            <select
              value={settings.operator}
              onChange={(e) => handleChange('operator', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="equals">Equals</option>
              <option value="notEquals">Does Not Equal</option>
              <option value="includes">Includes</option>
              <option value="notIncludes">Does Not Include</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Value
            </label>
            <Input
              value={settings.expectedValue}
              onChange={(e) => handleChange('expectedValue', e.target.value)}
              placeholder="Value that should trigger showing this step"
              className="w-full"
            />
          </div>
        </div>
      )}
    </Card>
  );
}; 