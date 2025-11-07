"use client";

import React from 'react';
import { 
  Section, 
  Question, 
  Step, 
  QuestionProps,
  SingleSelectionProps,
  MultiSelectionProps,
  SingleSelectionWithBooleanConditionalProps,
  DetailFormProps,
  SlidingScaleProps,
  EmotiveScaleProps,
  SignalScaleProps,
  DetailFormField,
  ConditionalDisplay
} from '@/lib/interfaces';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useSectionStore } from '@/lib/stores/sectionStore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ConditionalDisplayEditor } from './ConditionalDisplayEditor';
import { StepConditionalDisplayEditor } from './StepConditionalDisplayEditor';

function hasOptions(props: QuestionProps): props is SingleSelectionProps | MultiSelectionProps | SingleSelectionWithBooleanConditionalProps {
  return 'options' in props;
}

function isDetailForm(props: QuestionProps): props is DetailFormProps {
  return 'fields' in props;
}

function isSlidingScale(props: QuestionProps): props is SlidingScaleProps {
  return 'minLabel' in props && 'maxLabel' in props;
}

function hasScaleOptions(props: QuestionProps): props is SlidingScaleProps | EmotiveScaleProps | SignalScaleProps {
  return 'options' in props && Array.isArray((props as any).options);
}

interface QuestionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  stepIndex: number;
  questionIndex: number;
  question: Question;
  step: Step;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  isOpen,
  onClose,
  sectionId,
  stepIndex,
  questionIndex,
  question,
  step
}) => {
  const { updateStep, saveSection } = useSectionStore();
  const [questionData, setQuestionData] = React.useState(() => {
    // Initialize with existing data, ensuring all properties are set
    const baseQuestion = {
      ...question,
      props: {
        ...question.props,
        required: question.props.required === undefined ? true : Boolean(question.props.required)
      }
    };

    if (question.type === 'MultiSelection') {
      const props = baseQuestion.props as MultiSelectionProps;
      return {
        ...baseQuestion,
        props: {
          ...props,
          otherOption: props.otherOption || false,
          minSelections: props.minSelections || 0,
          maxSelections: props.maxSelections || props.options.length
        }
      };
    }
    if (question.type === 'SingleSelection' || question.type === 'SingleSelectionWithBooleanConditional') {
      const props = baseQuestion.props as SingleSelectionProps;
      return {
        ...baseQuestion,
        props: {
          ...props,
          otherOption: props.otherOption || false
        }
      };
    }
    if (question.type === 'DetailForm') {
      const props = baseQuestion.props as DetailFormProps;
      return {
        ...baseQuestion,
        props: {
          ...props,
          fields: props.fields.map(field => {
            // Create a new field with all properties explicitly initialized
            const newField: DetailFormField = {
              id: field.id || Date.now().toString(),
              label: field.label || '',
              type: ((field as any).type === 'tel' ? 'phone' : field.type) || 'text',
              required: field.required === undefined ? true : Boolean(field.required),
              placeholder: field.placeholder || '',
              alias: field.alias || `field_${Date.now()}`,
              options: field.type === 'select' ? (field.options || []) : undefined,
              textareaHeight: field.type === 'textarea' ? (field.textareaHeight || 'medium') : undefined,
              columnSpan: field.columnSpan || 1
            };
            return newField;
          })
        }
      };
    }
    return baseQuestion;
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    if (!questionData.alias) {
      alert('Question alias is required');
      return;
    }
    if (!questionData.props.question) {
      alert('Question text is required');
      return;
    }

    // Validate DetailForm fields
    if (questionData.type === 'DetailForm') {
      const props = questionData.props as DetailFormProps;
      if (!props.fields.length) {
        alert('Detail form must have at least one field');
        return;
      }
      
      // Validate each field
      for (const field of props.fields) {
        if (!field.label) {
          alert('All fields must have a label');
          return;
        }
        if (!field.alias) {
          alert('All fields must have an alias');
          return;
        }
        if (field.type === 'select' && (!field.options || !field.options.length)) {
          alert('Select fields must have at least one option');
          return;
        }
      }
    }

    // Validate min/max selections for MultiSelection
    if (questionData.type === 'MultiSelection') {
      const props = questionData.props as MultiSelectionProps;
      if (props.minSelections !== undefined && props.maxSelections !== undefined) {
        if (props.minSelections > props.maxSelections) {
          alert('Minimum selections cannot be greater than maximum selections');
          return;
        }
        if (props.maxSelections > props.options.length) {
          alert('Maximum selections cannot be greater than the number of options');
          return;
        }
      }
    }

    try {
      setIsSaving(true);
      
      // Update the question in the section
      updateStep(sectionId, stepIndex, {
        questions: step.questions.map((q: Question, idx: number) =>
          idx === questionIndex ? questionData : q
        )
      });

      // Save the section to persist changes
      await saveSection(sectionId);
      
      onClose();
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptionChange = (options: string[]) => {
    if (hasOptions(questionData.props)) {
      setQuestionData(prev => ({
        ...prev,
        props: { ...prev.props, options }
      }));
    }
  };

  const handleFieldChange = (fields: DetailFormField[]) => {
    if (isDetailForm(questionData.props)) {
      setQuestionData(prev => ({
        ...prev,
        props: { ...prev.props, fields }
      }));
    }
  };

  const renderOptionFields = () => {
    if (!hasOptions(questionData.props)) return null;
    
    const props = questionData.props as SingleSelectionProps | MultiSelectionProps | SingleSelectionWithBooleanConditionalProps;
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Options
          </label>
          <div className="space-y-2">
            {props.options?.map((option: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(props.options || [])];
                    newOptions[idx] = e.target.value;
                    handleOptionChange(newOptions);
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newOptions = (props.options || []).filter((_: string, i: number) => i !== idx);
                    handleOptionChange(newOptions);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newOptions = [...(props.options || []), ''];
                handleOptionChange(newOptions);
              }}
            >
              Add Option
            </Button>
          </div>
        </div>

        {/* Other option checkbox */}
        {'otherOption' in props && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.otherOption || false}
              onChange={(e) => setQuestionData(prev => ({
                ...prev,
                props: { ...prev.props, otherOption: e.target.checked }
              }))}
              className="h-4 w-4"
            />
            <label className="text-sm text-gray-700">Allow "Other" option</label>
          </div>
        )}

        {/* Min/Max selections for MultiSelection */}
        {'minSelections' in props && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Selections
              </label>
              <Input
                type="number"
                min="0"
                max={(props.options || []).length}
                value={props.minSelections || 0}
                onChange={(e) => {
                  const min = parseInt(e.target.value) || 0;
                  const max = props.maxSelections || (props.options || []).length;
                  if (min > max) {
                    alert('Minimum selections cannot be greater than maximum selections');
                    return;
                  }
                  setQuestionData(prev => ({
                    ...prev,
                    props: { ...prev.props, minSelections: min }
                  }));
                }}
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                Must be between 0 and {(props.options || []).length}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Selections
              </label>
              <Input
                type="number"
                min={props.minSelections || 1}
                max={(props.options || []).length}
                value={props.maxSelections || (props.options || []).length}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || (props.options || []).length;
                  const min = props.minSelections || 0;
                  if (max < min) {
                    alert('Maximum selections cannot be less than minimum selections');
                    return;
                  }
                  if (max > (props.options || [])   .length) {
                    alert('Maximum selections cannot exceed the number of options');
                    return;
                  }
                  setQuestionData(prev => ({
                    ...prev,
                    props: { ...prev.props, maxSelections: max }
                  }));
                }}
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                Must be between {props.minSelections || 1} and {(props.options || []).length}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailForm = () => {
    if (!isDetailForm(questionData.props)) return null;
    
    const props = questionData.props as DetailFormProps;
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Form Fields
        </label>
        <div className="space-y-4">
          {props.fields.map((field, idx) => (
            <div key={idx} className="space-y-2 border rounded-lg p-4">
              <div className="flex gap-2">
                <Input
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...props.fields];
                    newFields[idx] = { ...field, label: e.target.value };
                    handleFieldChange(newFields);
                  }}
                  placeholder="Field label"
                  className="flex-1"
                />
                <select
                  value={field.type}
                  onChange={(e) => {
                    const newFields = [...props.fields];
                    const newType = e.target.value as DetailFormField['type'];
                    newFields[idx] = {
                      ...field,
                      type: newType,
                      // Initialize or clear options based on type
                      options: newType === 'select' ? (field.options || []) : undefined,
                      // Set textareaHeight for textarea type
                      textareaHeight: newType === 'textarea' ? (field.textareaHeight || 'medium') : undefined,
                      // Preserve columnSpan
                      columnSpan: field.columnSpan || 1
                    };
                    handleFieldChange(newFields);
                  }}
                  className="w-32 border rounded-md"
                >
                  <option value="text">Text</option>
                  <option value="textarea">Text Area</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="select">Select</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newFields = props.fields.filter((_: DetailFormField, i: number) => i !== idx);
                    handleFieldChange(newFields);
                  }}
                >
                  Remove
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => {
                    const newFields = [...props.fields];
                    newFields[idx] = { ...field, placeholder: e.target.value };
                    handleFieldChange(newFields);
                  }}
                  placeholder="Placeholder text"
                  className="flex-1"
                />
                <Input
                  value={field.alias || ''}
                  onChange={(e) => {
                    const newFields = [...props.fields];
                    newFields[idx] = { ...field, alias: e.target.value };
                    handleFieldChange(newFields);
                  }}
                  placeholder="Field alias"
                  className="w-40"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <label className="text-sm text-gray-700 block mb-1">Column Width:</label>
                  <select
                    value={field.columnSpan || 1}
                    onChange={(e) => {
                      const newFields = [...props.fields];
                      // Ensure we're converting the string value to a number
                      const columnSpanValue = parseInt(e.target.value, 10) as 1 | 2;
                      newFields[idx] = { ...field, columnSpan: columnSpanValue };
                      handleFieldChange(newFields);
                    }}
                    className="w-full border rounded-md p-1"
                  >
                    <option value={1}>Single Column</option>
                    <option value={2}>Full Width</option>
                  </select>
                </div>

              {field.type === 'textarea' && (
                  <div className="flex-1">
                    <label className="text-sm text-gray-700 block mb-1">Textarea Height:</label>
                  <select
                    value={field.textareaHeight || 'medium'}
                    onChange={(e) => {
                      const newFields = [...props.fields];
                      newFields[idx] = { 
                        ...field, 
                        textareaHeight: e.target.value as 'small' | 'medium' | 'large' 
                      };
                      handleFieldChange(newFields);
                    }}
                      className="w-full border rounded-md p-1"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(field.required)}
                  onChange={(e) => {
                    const newFields = [...props.fields];
                    newFields[idx] = {
                      ...field,
                      required: e.target.checked
                    };
                    handleFieldChange(newFields);
                  }}
                  className="h-4 w-4"
                />
                <label className="text-sm text-gray-700">Required field</label>
              </div>

              {field.type === 'select' && (
                <div className="mt-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  {(field.options || []).map((option, optionIdx) => (
                    <div key={optionIdx} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newFields = [...props.fields];
                          const newOptions = [...(field.options || [])];
                          newOptions[optionIdx] = e.target.value;
                          newFields[idx] = { ...field, options: newOptions };
                          handleFieldChange(newFields);
                        }}
                        placeholder={`Option ${optionIdx + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFields = [...props.fields];
                          const newOptions = (field.options || []).filter((_, i) => i !== optionIdx);
                          newFields[idx] = { ...field, options: newOptions };
                          handleFieldChange(newFields);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFields = [...props.fields];
                      const newOptions = [...(field.options || []), ''];
                      newFields[idx] = { ...field, options: newOptions };
                      handleFieldChange(newFields);
                    }}
                  >
                    Add Option
                  </Button>
                </div>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              const newField: DetailFormField = {
                id: Date.now().toString(),
                label: '',
                type: 'text',
                required: false,
                placeholder: '',
                alias: `field_${Date.now()}`,
                options: undefined,
                columnSpan: 1
              };
              handleFieldChange([...props.fields, newField]);
            }}
          >
            Add Field
          </Button>
        </div>
      </div>
    );
  };

  const renderScaleOptions = () => {
    if (!hasScaleOptions(questionData.props)) return null;
    
    const props = questionData.props as SlidingScaleProps | EmotiveScaleProps | SignalScaleProps;
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {questionData.type === 'EmotiveScale' ? 'Emotive Options' : 
           questionData.type === 'SignalScale' ? 'Signal Options' : 'Scale Points'}
        </label>
        <div className="space-y-2">
          {(props.options || []).map((option: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...(props.options || [])];
                  newOptions[idx] = e.target.value;
                  setQuestionData(prev => ({
                    ...prev,
                    props: { ...prev.props, options: newOptions }
                  }));
                }}
                placeholder={`Option ${idx + 1}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newOptions = (props.options || []).filter((_: string, i: number) => i !== idx);
                  setQuestionData(prev => ({
                    ...prev,
                    props: { ...prev.props, options: newOptions }
                  }));
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              const newOptions = [...(props.options || []), ''];
              setQuestionData(prev => ({
                ...prev,
                props: { ...prev.props, options: newOptions }
              }));
            }}
          >
            Add {questionData.type === 'EmotiveScale' ? 'Emotive Option' : 
                 questionData.type === 'SignalScale' ? 'Signal Option' : 'Scale Point'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
        <div className="space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={questionData.type}
              onChange={(e) => {
                const newType = e.target.value as Question['type'];
                let newProps: QuestionProps;
                
                // Initialize appropriate props based on the new type
                switch (newType) {
                  case 'DetailForm':
                    newProps = {
                      question: questionData.props.question || '',
                      required: questionData.props.required || false,
                      subtext: questionData.props.subtext || '',
                      fields: [],
                      initialData: {},
                      onChange: (data: Record<string, string>) => {}
                    };
                    break;
                  case 'SingleSelection':
                  case 'SingleSelectionWithBooleanConditional':
                    newProps = {
                      question: questionData.props.question || '',
                      required: questionData.props.required || false,
                      subtext: questionData.props.subtext || '',
                      options: [],
                      selectedOption: '',
                      onSelect: () => {},
                      otherOption: false,
                      ...(newType === 'SingleSelectionWithBooleanConditional' ? {
                        onFollowUpChange: () => {}
                      } : {})
                    };
                    break;
                  case 'MultiSelection':
                    newProps = {
                      question: questionData.props.question || '',
                      required: questionData.props.required || false,
                      subtext: questionData.props.subtext || '',
                      options: [],
                      selectedValues: [],
                      onSelect: () => {},
                      otherOption: false,
                      minSelections: 0,
                      maxSelections: undefined
                    };
                    break;
                  case 'SlidingScale':
                  case 'EmotiveScale':
                    newProps = {
                      question: questionData.props.question || '',
                      required: questionData.props.required || false,
                      subtext: questionData.props.subtext || '',
                      minLabel: '',
                      maxLabel: '',
                      options: [],
                      onSelect: () => {},
                      ...(newType === 'EmotiveScale' ? {
                        selectedOption: 0
                      } : {
                        initialValue: 0
                      })
                    };
                    break;
                  case 'SignalScale':
                    newProps = {
                      question: questionData.props.question || '',
                      required: questionData.props.required || false,
                      subtext: questionData.props.subtext || '',
                      options: [],
                      selectedOption: 0,
                      onSelect: () => {}
                    };
                    break;
                  default:
                    // This should never happen as we've handled all question types
                    newProps = {
                      question: questionData.props.question || '',
                      required: questionData.props.required || false,
                      subtext: questionData.props.subtext || '',
                      options: [],
                      selectedOption: '',
                      onSelect: () => {}
                    } as SingleSelectionProps;
                }

                setQuestionData(prev => ({
                  ...prev,
                  type: newType,
                  props: newProps
                }));
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="SingleSelection">Single Selection</option>
              <option value="MultiSelection">Multiple Selection</option>
              <option value="DetailForm">Detail Form</option>
              <option value="SlidingScale">Sliding Scale</option>
              <option value="EmotiveScale">Emotive Scale</option>
              <option value="SignalScale">Signal Scale</option>
              <option value="SingleSelectionWithBooleanConditional">Single Selection with Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Alias
            </label>
            <Input
              value={questionData.alias}
              onChange={(e) => setQuestionData(prev => ({
                ...prev,
                alias: e.target.value
              }))}
              placeholder="Enter question alias"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </label>
            <Input
              value={questionData.props.question}
              onChange={(e) => setQuestionData(prev => ({
                ...prev,
                props: { ...prev.props, question: e.target.value }
              }))}
              placeholder="Enter question text"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtext
            </label>
            <Input
              value={questionData.props.subtext || ''}
              onChange={(e) => setQuestionData(prev => ({
                ...prev,
                props: { ...prev.props, subtext: e.target.value }
              }))}
              placeholder="Enter subtext (optional)"
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={questionData.props.required === undefined ? true : Boolean(questionData.props.required)}
              onChange={(e) => setQuestionData(prev => ({
                ...prev,
                props: { ...prev.props, required: e.target.checked }
              }))}
              className="h-4 w-4"
            />
            <label className="text-sm text-gray-700">Required question</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={questionData.editable || false}
              onChange={(e) => setQuestionData(prev => ({
                ...prev,
                editable: e.target.checked
              }))}
              className="h-4 w-4"
            />
            <label className="text-sm text-gray-700">Editable</label>
          </div>

          {/* Type-specific fields */}
          {(questionData.type === 'SingleSelection' || 
            questionData.type === 'MultiSelection' || 
            questionData.type === 'SingleSelectionWithBooleanConditional') && renderOptionFields()}

          {questionData.type === 'DetailForm' && renderDetailForm()}

          {(questionData.type === 'SlidingScale' || questionData.type === 'EmotiveScale' || questionData.type === 'SignalScale') && (
            <div className="space-y-4">
              {(questionData.type === 'SlidingScale' || questionData.type === 'EmotiveScale') && isSlidingScale(questionData.props) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Label
                    </label>
                    <Input
                      value={questionData.props.minLabel}
                      onChange={(e) => setQuestionData(prev => ({
                        ...prev,
                        props: { ...prev.props, minLabel: e.target.value }
                      }))}
                      placeholder="Enter minimum label"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Label
                    </label>
                    <Input
                      value={questionData.props.maxLabel}
                      onChange={(e) => setQuestionData(prev => ({
                        ...prev,
                        props: { ...prev.props, maxLabel: e.target.value }
                      }))}
                      placeholder="Enter maximum label"
                      className="w-full"
                    />
                  </div>
                </>
              )}
              {renderScaleOptions()}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Question'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const SectionEditor: React.FC<{ section: Section }> = ({ section }) => {
  const { updateSection, addStep, removeStep, deleteSection, reorderSteps, sections, updateStep } = useSectionStore();
  const [selectedQuestion, setSelectedQuestion] = React.useState<{
    sectionId: number;
    stepIndex: number;
    questionIndex: number;
    question: Question;
    step: Step;
  } | null>(null);
  const [removingStepIndex, setRemovingStepIndex] = React.useState<number | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({ name: section.name, color: section.color });

  const handleSaveSection = () => {
    if (!editData.name.trim()) {
      alert('Section name is required');
      return;
    }
    updateSection(section.id, editData);
    setIsEditing(false);
  };

  const handleDeleteSection = async () => {
    if (window.confirm(`Are you sure you want to delete section "${section.name}"? This action cannot be undone.`)) {
      try {
        await deleteSection(section.id);
      } catch (error) {
        console.error('Failed to delete section:', error);
        alert('Failed to delete section. Please try again.');
      }
    }
  };

  const handleDeleteStep = async (sectionId: number, stepIndex: number) => {
    if (window.confirm(`Are you sure you want to delete Step ${stepIndex + 1}? This action cannot be undone.`)) {
      try {
        setRemovingStepIndex(stepIndex);
        removeStep(sectionId, stepIndex);
        
        // If we have a selected question from this step, clear it
        if (selectedQuestion?.stepIndex === stepIndex) {
          setSelectedQuestion(null);
        }
        
        // Reset the removing state after animation completes
        setTimeout(() => {
          setRemovingStepIndex(null);
        }, 300);
      } catch (error) {
        console.error('Failed to delete step:', error);
        alert('Failed to delete step. Please try again.');
        setRemovingStepIndex(null);
      }
    }
  };

  const handleAddQuestion = (stepIndex: number, step: Step) => {
    // Create a new question with default props based on type
    const newQuestion: Question = {
      type: 'DetailForm',
      alias: '',
      editable: false,
      props: {
        question: '',
        required: true,
        subtext: '',
        fields: [],  // Initialize empty fields array for DetailForm
        initialData: {},
        onChange: (data: Record<string, string>) => {}
      }
    };
    
    // Add the question to the step
    const updatedStep = {
      ...step,
      questions: [...step.questions, newQuestion]
    };

    // Update the section with the new step
    updateSection(section.id, {
      steps: section.steps.map((s, idx) =>
        idx === stepIndex ? updatedStep : s
      )
    });

    // Open the question editor for the new question
    setSelectedQuestion({
      sectionId: section.id,
      stepIndex,
      questionIndex: step.questions.length,
      question: newQuestion,
      step: updatedStep
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    reorderSteps(section.id, sourceIndex, destinationIndex);
  };

  const handleConditionalDisplayUpdate = (conditionalDisplay: ConditionalDisplay | undefined) => {
    updateSection(section.id, { conditionalDisplay });
  };

  const handleStepConditionalDisplayUpdate = (stepIndex: number, conditionalDisplay: ConditionalDisplay | undefined) => {
    updateStep(section.id, stepIndex, { conditionalDisplay });
  };

  // Add useEffect to update editData when section changes
  React.useEffect(() => {
    setEditData({ name: section.name, color: section.color });
  }, [section]);

  return (
    <div className="p-6">
      {/* Section Header */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Name
              </label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter section name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Color
              </label>
              <Input
                type="color"
                value={editData.color}
                onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
                className="w-20 h-10"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSection}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: section.color }}>{section.name}</h2>
              <p className="text-sm text-gray-500">{section.steps.length} steps</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Section
              </Button>
              <Button variant="destructive" onClick={handleDeleteSection}>
                Delete Section
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add ConditionalDisplayEditor here */}
      <div className="mb-6">
        <ConditionalDisplayEditor
          section={section}
          allSections={sections}
          onUpdate={handleConditionalDisplayUpdate}
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`section-${section.id}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
              {section.steps.map((step, stepIndex) => (
                <Draggable
                  key={step.id}
                  draggableId={step.id.toString()}
                  index={stepIndex}
                >
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-4 transition-opacity duration-300 ${
                        removingStepIndex === stepIndex ? 'opacity-50' : 'opacity-100'
                      } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="flex justify-between items-center mb-4"
                      >
                        <h3 className="text-lg font-medium">Step {stepIndex + 1}</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStep(section.id, stepIndex)}
                          disabled={removingStepIndex === stepIndex}
                        >
                          {removingStepIndex === stepIndex ? 'Deleting...' : 'Delete Step'}
                        </Button>
                      </div>

                      {/* Add StepConditionalDisplayEditor here */}
                      <div className="mb-4">
                        <StepConditionalDisplayEditor
                          step={step}
                          section={section}
                          allSections={sections}
                          stepIndex={stepIndex}
                          onUpdate={(conditionalDisplay) => handleStepConditionalDisplayUpdate(stepIndex, conditionalDisplay)}
                        />
                      </div>

                      <div className="space-y-4">
                        {step.questions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedQuestion({
                              sectionId: section.id,
                              stepIndex,
                              questionIndex,
                              question,
                              step
                            })}
                          >
                            <div className="font-medium">{question.props.question || 'Untitled Question'}</div>
                            <div className="text-sm text-gray-500">
                              Type: {question.type} | Alias: {question.alias}
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAddQuestion(stepIndex, step)}
                        >
                          Add Question
                        </Button>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        variant="outline"
        className="w-full mt-6"
        onClick={() => addStep(section.id)}
      >
        Add New Step
      </Button>

      {selectedQuestion && (
        <QuestionEditor
          isOpen={true}
          onClose={() => setSelectedQuestion(null)}
          {...selectedQuestion}
        />
      )}
    </div>
  );
}; 