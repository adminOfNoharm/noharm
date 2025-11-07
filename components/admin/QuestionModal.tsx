import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/lib/stores/adminStore';
import { questionConfig } from '@/lib/questionConfig';
import { X, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DetailFormField } from '@/lib/interfaces';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionIndex: number;
  stepIndex: number;
  questionIndex: number;
}

export function QuestionModal({ isOpen, onClose, sectionIndex, stepIndex, questionIndex }: QuestionModalProps) {
  const { sections, handleChange } = useAdminStore();
  const [isModified, setIsModified] = useState(false);
  const [initialState, setInitialState] = useState<string>('');
  const question = sections[sectionIndex].steps[stepIndex].questions[questionIndex];
  const config = questionConfig[question.type];

  useEffect(() => {
    if (isOpen) {
      const state = JSON.stringify({
        props: question.props,
        type: question.type
      });
      setInitialState(state);
      setIsModified(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const currentState = JSON.stringify({
      props: question.props,
      type: question.type
    });
    setIsModified(currentState !== initialState);
  }, [
    JSON.stringify(question.props),
    question.type,
    initialState
  ]);

  const handlePropChange = (field: string, value: any) => {
    handleChange(sectionIndex, stepIndex, questionIndex, field, value);
  };

  const handleOptionChange = (sectionIndex: number, stepIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    const newOptions = [...(question.props.options || [])];
    newOptions[optionIndex] = value;
    handlePropChange('options', newOptions);
  };

  const removeOption = (sectionIndex: number, stepIndex: number, questionIndex: number, optionIndex: number) => {
    const newOptions = (question.props.options || []).filter((item: string, index: number) => index !== optionIndex);
    handlePropChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(question.props.options || []), ''];
    handlePropChange('options', newOptions);
  };

  const renderField = (fieldName: string, fieldConfig: typeof config.basicFields[string]) => {
    if (fieldConfig.type === 'fields' && question.type === 'DetailForm') {
      return (
        <div className="space-y-4">
          {(question.props.fields || []).map((field: DetailFormField, index: number) => (
            <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 space-y-4">
                <Input
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...(question.props.fields || [])];
                    newFields[index] = { ...field, label: e.target.value };
                    handlePropChange('fields', newFields);
                  }}
                  placeholder="Field Label"
                />
                <Input
                  value={field.alias || ''}
                  onChange={(e) => {
                    const newFields = [...(question.props.fields || [])];
                    newFields[index] = { ...field, alias: e.target.value };
                    handlePropChange('fields', newFields);
                  }}
                  placeholder="Field Alias (for data storage)"
                  className="mt-2"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={field.type}
                    onValueChange={(val) => {
                      const newFields = [...(question.props.fields || [])];
                      newFields[index] = { ...field, type: val as DetailFormField['type'] };
                      handlePropChange('fields', newFields);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Field Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => {
                      const newFields = [...(question.props.fields || [])];
                      newFields[index] = { ...field, placeholder: e.target.value };
                      handlePropChange('fields', newFields);
                    }}
                    placeholder="Placeholder text"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.required}
                    onCheckedChange={(checked) => {
                      const newFields = [...(question.props.fields || [])];
                      newFields[index] = { ...field, required: !!checked };
                      handlePropChange('fields', newFields);
                    }}
                  />
                  <span className="text-sm font-medium">Required field</span>
                </div>
                {field.type === 'select' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Options</label>
                    {(field.options || []).map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newFields = [...(question.props.fields || [])];
                            const newOptions = [...(field.options || [])];
                            newOptions[optionIndex] = e.target.value;
                            newFields[index] = { ...field, options: newOptions };
                            handlePropChange('fields', newFields);
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newFields = [...(question.props.fields || [])];
                            const newOptions = field.options?.filter((_: string, i: number) => i !== optionIndex);
                            newFields[index] = { ...field, options: newOptions };
                            handlePropChange('fields', newFields);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFields = [...(question.props.fields || [])];
                        const newOptions = [...(field.options || []), ''];
                        newFields[index] = { ...field, options: newOptions };
                        handlePropChange('fields', newFields);
                      }}
                    >
                      Add Option
                    </Button>
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newFields = (question.props.fields || []).filter((_: DetailFormField, i: number) => i !== index);
                  handlePropChange('fields', newFields);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              const newField: DetailFormField = {
                id: `field_${Date.now()}`,
                type: 'text',
                label: '',
                required: true,
                placeholder: '',
                alias: `field_${Date.now()}`
              };
              const newFields = [...(question.props.fields || []), newField];
              handlePropChange('fields', newFields);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
      );
    }
    
    switch (fieldConfig.type) {
      case 'text':
        return (
          <Input
            value={question.props[fieldName] || ''}
            onChange={(e) => handlePropChange(fieldName, e.target.value)}
            className="w-full"
            placeholder={fieldConfig.placeholder}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={question.props[fieldName] || ''}
            onChange={(e) => handlePropChange(fieldName, e.target.value ? Number(e.target.value) : undefined)}
            min={fieldConfig.min}
            max={fieldConfig.max || question.props.options?.length}
            className="w-full"
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={question.props[fieldName] || false}
            onCheckedChange={(checked) => handlePropChange(fieldName, checked)}
          />
        );
    }
  };

  const handleClose = () => {
    setIsModified(false);
    onClose();
  };

  const handleTypeChange = (newType: string) => {
    handleChange(sectionIndex, stepIndex, questionIndex, 'type', newType);
    
    // Initialize empty props for DetailForm
    if (newType === 'DetailForm') {
      handleChange(sectionIndex, stepIndex, questionIndex, 'props', {
        question: '',  // Initialize empty question field
        required: false,
        subtext: '',
        fields: []
      });
    } else {
      handleChange(sectionIndex, stepIndex, questionIndex, 'props', {
        question: '',
        required: false,
        subtext: ''
      });
    }
  };

  return (
    <div className={`fixed inset-0 bg-white z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-semibold">Edit Question</h2>
          <div className="flex items-center gap-4">
            <Button onClick={handleClose} variant={isModified ? "default" : "secondary"}>
              {isModified ? "Update" : "Close"}
            </Button>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-73px)] overflow-y-auto">
        <div className="max-w-[1200px] mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Settings</h3>
              <div className="mb-4">
                <label className="block font-medium mb-2">
                  Question Type
                  <Select value={question.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(questionConfig).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-2">
                  Alias
                  <Input
                    value={question.alias || ''}
                    onChange={(e) => handleChange(sectionIndex, stepIndex, questionIndex, 'alias', e.target.value)}
                    className="w-full"
                    placeholder="Enter alias for conditional logic"
                  />
                </label>
              </div>
              {question.type && Object.entries(config.basicFields).map(([fieldName, fieldConfig]) => (
                <div key={fieldName} className="mb-4">
                  <label className="block font-medium mb-2">
                    {fieldConfig.type === 'checkbox' ? (
                      <div className="flex items-center space-x-2">
                        {renderField(fieldName, fieldConfig)}
                        <span>{fieldConfig.label}</span>
                      </div>
                    ) : (
                      <>
                        {fieldConfig.label}
                        {renderField(fieldName, fieldConfig)}
                      </>
                    )}
                  </label>
                </div>
              ))}
            </div>

            {question.type && config.specificFields && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Additional Settings</h3>
                {Object.entries(config.specificFields).map(([fieldName, fieldConfig]) => (
                  <div key={fieldName} className="mb-4">
                    <label className="block font-medium mb-2">
                      {fieldConfig.type === 'checkbox' ? (
                        <div className="flex items-center space-x-2">
                          {renderField(fieldName, fieldConfig)}
                          <span>{fieldConfig.label}</span>
                        </div>
                      ) : (
                        <>
                          {fieldConfig.label}
                          {renderField(fieldName, fieldConfig)}
                        </>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {question.type && question.props.options && (
              <div className="bg-white rounded-lg border p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Options</h3>
                  <Button
                    onClick={addOption}
                    variant="outline"
                    className="flex items-center gap-2 bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {question.props.options.map((option: string, optionIndex: number) => (
                    <div key={optionIndex} className="flex gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                        {optionIndex + 1}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(sectionIndex, stepIndex, questionIndex, optionIndex, e.target.value)}
                        className="flex-1"
                        placeholder="Enter option text"
                      />
                      <Button 
                        variant="destructive"
                        onClick={() => removeOption(sectionIndex, stepIndex, questionIndex, optionIndex)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 