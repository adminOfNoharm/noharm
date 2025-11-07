'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Sidebar from '@/components/layout/Sidebar';
import { toast } from '@/components/ui/toast';
import { Question } from '@/lib/interfaces';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import Image from 'next/image';
import { Upload, Menu, X } from 'lucide-react';

interface OnboardingProgress {
  stage_id: number;
  status: string;
  onboarding_stages: {
    stage_id: number;
    stage_name: string;
    onboarding_stage_index: number;
  };
}

interface ProfileData {
  uuid: string;
  data: Record<string, any>;
  status: string;
  role: string;
  email?: string;
  current_stage?: {
    stage_id: number;
    stage_name: string;
    status: string;
    stage_index: number;
  };
}

interface QuestionProps {
  type: string;
  alias: string;
  props: {
    options?: string[];
    otherOption?: boolean;
    maxSelections?: number;
    minSelections?: number;
    question: string;
  };
  editable: boolean;
}

interface Step {
  id: number;
  order: number;
  questions: Question[];
}

interface Section {
  id: number;
  name: string;
  color: string;
  order: number;
  steps: Step[];
  conditionalDisplay?: {
    operator: string;
    expectedValue: string;
    questionAlias: string;
  };
}

interface FlowData {
  sections: Section[];
}

interface PageProps {
  params: {
    uuid: string;
  };
}

interface ValidationError {
  field: string;
  message: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileData | null>(null);
  const [kycStatus, setKycStatus] = useState<string>('not_started');
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set());
  const [questionConfig, setQuestionConfig] = useState<{ [key: string]: QuestionProps }>({});
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [notesId, setNotesId] = useState<number | null>(null);
  const [selectedNextStage, setSelectedNextStage] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (toastMessage) {
      toast[toastMessage.type](toastMessage.message);
      setToastMessage(null);
    }
  }, [toastMessage]);

  // Function to flatten nested objects for display
  const flattenObject = (obj: any, prefix = ''): { [key: string]: string } => {
    return Object.keys(obj).reduce((acc: { [key: string]: string }, key: string) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
        acc[pre + key] = Array.isArray(obj[key]) ? obj[key] : obj[key]?.toString() || '';
      }
      return acc;
    }, {});
  };

  // Group fields by section
  const groupFields = (data: { [key: string]: string }) => {
    const detailFormGroups: { [key: string]: { [key: string]: string } } = {};
    const otherFields: { [key: string]: string } = {};

    Object.entries(data).forEach(([key, value]) => {
      const questionAlias = key.split('.')[0];
      const config = questionConfig[questionAlias];
      
      if (config?.type === 'DetailForm' || key.includes('detailForm') || questionAlias === 'detailForm') {
        // Determine the correct group key (either the alias or 'detailForm')
        const groupKey = config?.type === 'DetailForm' ? questionAlias : 'detailForm';
        
        if (!detailFormGroups[groupKey]) {
          detailFormGroups[groupKey] = {};
        }
        detailFormGroups[groupKey][key] = value;
      } else {
        otherFields[key] = value;
      }
    });

    return { detailFormGroups, otherFields };
  };

  // Function to update nested object value
  const updateNestedValue = (obj: any, path: string[], value: any): any => {
    const [head, ...rest] = path;
    if (rest.length === 0) {
      return { ...obj, [head]: value };
    }
    return {
      ...obj,
      [head]: updateNestedValue(obj[head] || {}, rest, value)
    };
  };

  // Function to format camelCase/PascalCase to Title Case
  const formatFieldName = (key: string): string => {
    const words = key
      .split(/(?=[A-Z])|\./)
      .filter(Boolean)
      .map(word => word.toLowerCase())
      .join(' ');
    
    return words.charAt(0).toUpperCase() + words.slice(1);
  };

  // Function to get editable fields from flow
  const getEditableFields = (flowData: FlowData): Set<string> => {
    const editableFields = new Set<string>();
    
    // Always add detailForm fields
    editableFields.add('detailForm');

    flowData.sections.forEach(section => {
      section.steps.forEach(step => {
        step.questions.forEach(question => {
          // Include all questions by default, unless explicitly marked as non-editable
          if (question.editable !== false) {
            editableFields.add(question.alias);
          }
        });
      });
    });

    return editableFields;
  };

  useEffect(() => {
    const fetchProfileAndFlow = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        // Fetch stage 1 status
        const { data: stage1Data } = await supabase
          .from('user_onboarding_progress')
          .select('status')
          .eq('uuid', session.user.id)
          .eq('stage_id', 1)
          .single();
        
        setKycStatus(stage1Data?.status || 'not_started');

        console.log('Fetching profile with UUID:', session.user.id);

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('seller_compound_data')
          .select('*')
          .eq('uuid', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setToastMessage({ type: 'error', message: 'Failed to load profile data' });
          return;
        }

        if (!profile) {
          console.error('No profile found for UUID:', session.user.id);
          setToastMessage({ type: 'error', message: 'Profile not found' });
          return;
        }

        console.log('Fetched profile data:', profile);

        if (!profile.role || profile.role === 'admin') {
          router.push('/onboarding/dashboard');
          return;
        }

        // Set logo URL from the data JSON
        setLogoUrl(profile.data?.companyLogo || null);

        // Determine which flow to fetch based on role
        const flowName = `kyc_${profile.role}`;

        // Fetch flow data
        const { data: flowData, error: flowError } = await supabase
          .from('onboarding_questions')
          .select('data')
          .eq('flow_name', flowName)
          .single();

        if (flowError) {
          console.error('Error fetching flow:', flowError);
          setToastMessage({ type: 'error', message: 'Failed to load question configuration' });
          return;
        }

        if (!flowData) {
          console.error('No flow data found for:', flowName);
          setToastMessage({ type: 'error', message: 'Question configuration not found' });
          return;
        }

        // Parse the flow data and get editable fields
        const parsedFlowData: FlowData = typeof flowData.data === 'string' 
          ? JSON.parse(flowData.data) 
          : flowData.data;

        console.log('Fetched flow data:', parsedFlowData);

        const editableFieldSet = getEditableFields(parsedFlowData);
        console.log('Editable fields:', editableFieldSet);
        setEditableFields(editableFieldSet);

        // Parse the profile data
        const parsedProfile = {
          ...profile,
          data: typeof profile.data === 'string' ? JSON.parse(profile.data) : profile.data
        };

        console.log('Setting initial profile data:', parsedProfile);
        setProfileData(parsedProfile);
        setFormData(parsedProfile);

        // Store question configurations
        const questionConfigs: { [key: string]: QuestionProps } = {};
        parsedFlowData.sections.forEach(section => {
          section.steps.forEach(step => {
            step.questions.forEach(question => {
              questionConfigs[question.alias] = question;
            });
          });
        });
        console.log('Question configs:', questionConfigs);
        setQuestionConfig(questionConfigs);

        setLoading(false);
      } catch (error) {
        console.error('Unexpected error during data fetch:', error);
        setToastMessage({ type: 'error', message: 'An unexpected error occurred while loading the profile' });
        setLoading(false);
      }
    };

    fetchProfileAndFlow();
  }, [router]);

  // Function to check if a field should be shown
  const shouldShowField = (key: string): boolean => {
    // Hide country code fields
    if (key.toLowerCase().includes('countrycode') || key.toLowerCase().includes('country_code')) return false;
    
    const questionAlias = key.split('.')[0];
    const config = questionConfig[questionAlias];
    
    // Show if it's a DetailForm type or contains detailForm in the key
    if (config?.type === 'DetailForm' || key.includes('detailForm') || questionAlias === 'detailForm') return true;
    
    // For non-DetailForm fields, check if they're in editableFields or if they have a valid config
    return editableFields.has(questionAlias) || !!config;
  };

  // Function to validate a field
  const validateField = (key: string, value: any, config?: QuestionProps): string | null => {
    if (!config) return null;

    if (config.type === 'MultiSelection') {
      const selectedValues = Array.isArray(value) ? value : [];
      
      if (config.props.minSelections && selectedValues.length < config.props.minSelections) {
        return `Please select at least ${config.props.minSelections} option${config.props.minSelections > 1 ? 's' : ''}`;
      }
      
      if (config.props.maxSelections && selectedValues.length > config.props.maxSelections) {
        return `Please select no more than ${config.props.maxSelections} option${config.props.maxSelections > 1 ? 's' : ''}`;
      }
    }
    
    return null;
  };

  // Modify handleInputChange to include validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }, isMultiple = false) => {
    const { name, value } = e.target;
    const path = name.split('.');
    const questionAlias = path[0];
    const config = questionConfig[questionAlias];
    
    console.log('handleInputChange:', { name, value, path });
    
    // Validate the new value
    const error = validateField(name, value, config);
    
    // Update validation errors
    setValidationErrors(prev => {
      const newErrors = prev.filter(err => err.field !== name);
      if (error) {
        newErrors.push({ field: name, message: error });
      }
      return newErrors;
    });

    setFormData(prev => {
      if (!prev) return null;
      
      let newValue = value;
      if (Array.isArray(value)) {
        // Handle array values (for MultiSelect)
        newValue = value;
      } else if (isMultiple && e.target instanceof HTMLSelectElement) {
        // Handle multiple select
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        newValue = selectedOptions;
      }

      console.log('Current form data:', prev.data);
      console.log('Setting new value:', { path, newValue });

      // If it's a direct questionAlias (not nested in detailForm)
      if (path.length === 1) {
        const newData = {
          ...prev,
          data: {
            ...prev.data,
            [path[0]]: newValue
          }
        };
        console.log('Updated form data:', newData);
        return newData;
      }

      // For nested paths (like detailForm.fieldName)
      const newData = {
        ...prev,
        data: updateNestedValue(prev.data, path, newValue)
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  // Modify handleSubmit to check all validations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !profileData) return;

    // Validate all fields before submitting
    const errors: ValidationError[] = [];
    
    Object.entries(flattenObject(formData.data)).forEach(([key, value]) => {
      const questionAlias = key.split('.')[0];
      const config = questionConfig[questionAlias];
      const error = validateField(key, value, config);
      if (error) {
        errors.push({ field: key, message: error });
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      setToastMessage({ type: 'error', message: 'Please check all fields are valid before saving' });
      return;
    }

    // If there are any existing validation errors, prevent saving
    if (validationErrors.length > 0) {
      setToastMessage({ type: 'error', message: 'Please check all fields are valid before saving' });
      return;
    }

    try {
      setSaving(true);

      console.log('Saving data:', formData.data);

      const { error } = await supabase
        .from('seller_compound_data')
        .update({
          data: formData.data
        })
        .eq('uuid', profileData.uuid);

      if (error) throw error;

      setProfileData(formData);
      setToastMessage({ type: 'success', message: 'Changes saved successfully' });
      setValidationErrors([]); // Clear validation errors after successful save
    } catch (error) {
      console.error('Error updating profile:', error);
      setToastMessage({ type: 'error', message: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToastMessage({ type: 'error', message: 'File size must be less than 5MB' });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setToastMessage({ type: 'error', message: 'File must be an image' });
        return;
      }

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      // Update the data JSON with the new logo URL
      const updatedData = {
        ...(formData?.data || {}),
        companyLogo: publicUrl
      };

      const { error: updateError } = await supabase
        .from('seller_compound_data')
        .update({
          data: updatedData
        })
        .eq('uuid', profileData?.uuid || '');

      if (updateError) throw updateError;

      // Update local state
      setLogoUrl(publicUrl);
      setFormData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          data: updatedData
        };
      });

      setToastMessage({ type: 'success', message: 'Logo uploaded successfully' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      setToastMessage({ type: 'error', message: 'Failed to upload logo' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const flattenedData = formData?.data ? flattenObject(formData.data) : {};
  const { detailFormGroups, otherFields } = groupFields(flattenedData);

  // Filter out non-editable fields from otherFields
  const editableOtherFields = Object.entries(otherFields).filter(([key, value]) => {
    // Skip empty values and country code fields
    if (!value || key.toLowerCase().includes('countrycode') || key.toLowerCase().includes('country_code')) {
      return false;
    }
    
    // Include the field if it should be shown
    return shouldShowField(key);
  });

  // Function to render the appropriate input based on question type
  const renderInput = (key: string, value: any, questionAlias: string) => {
    const config = questionConfig[questionAlias];
    
    // If no config is found, default to a text input
    if (!config) {
      console.warn(`No config found for question alias: ${questionAlias}, defaulting to text input`);
      
      // Determine if this should be a textarea (for longer text)
      const isLongText = typeof value === 'string' && (
        value.length > 50 || 
        key.toLowerCase().includes('description') || 
        key.toLowerCase().includes('bio') ||
        key.toLowerCase().includes('about') ||
        key.toLowerCase().includes('notes') ||
        key.toLowerCase().includes('address')
      );
      
      return isLongText ? (
        <textarea
          name={key}
          value={value || ''}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      ) : (
        <input
          type="text"
          name={key}
          value={value || ''}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      );
    }

    const error = validationErrors.find(err => err.field === key)?.message;

    const renderError = () => {
      if (!error) return null;
      return (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      );
    };

    console.log('Rendering input:', { key, value, type: config.type, config });

    // For detailForm fields, use regular text input
    if (key.includes('detailForm.') || questionAlias === 'detailForm') {
      // Determine if this should be a textarea (for longer text)
      const isLongText = typeof value === 'string' && (
        value.length > 50 || 
        key.toLowerCase().includes('description') || 
        key.toLowerCase().includes('bio') ||
        key.toLowerCase().includes('about') ||
        key.toLowerCase().includes('notes') ||
        key.toLowerCase().includes('address')
      );
      
      return isLongText ? (
        <textarea
          name={key}
          value={value || ''}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      ) : (
        <input
          type="text"
          name={key}
          value={value || ''}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      );
    }

    switch (config.type) {
      case 'SingleSelection':
        const predefinedSingleOptions = config.props.options || [];
        // Check if current value is not in predefined options - means it's an "other" value
        const isOtherValue = value && !predefinedSingleOptions.includes(value);
        const displayValue = isOtherValue ? 'other' : value;

        const singleOptions = predefinedSingleOptions.map(opt => ({
          value: opt,
          label: opt
        }));
        
        if (config.props.otherOption) {
          singleOptions.push({ value: 'other', label: 'Other' });
        }

        return (
          <div className="space-y-2">
            <Select
              value={displayValue?.toString() || ''}
              onValueChange={(newValue) => {
                // Always update the display value first
                handleInputChange({
                  target: { name: key, value: newValue }
                } as any);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {singleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {displayValue === 'other' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please specify other option
                </label>
                <input
                  type="text"
                  placeholder="Enter your custom option"
                  value={isOtherValue ? value : ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    // Only update if the new value would be considered "other"
                    if (!predefinedSingleOptions.includes(newValue)) {
                      handleInputChange({
                        target: { name: key, value: newValue }
                      } as any);
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            )}
            {renderError()}
          </div>
        );

      case 'SlidingScale':
      case 'EmotiveScale':
      case 'SignalScale': {
        const options = config.props.options || [];
        
        console.log('Scale input value:', { value, type: typeof value, options });
        
        // Handle the retrieved value (which is the text option)
        let currentIndex = -1;
        let currentValue = '';
        
        if (value !== null && value !== undefined) {
          // Convert string to number if needed
          const numericValue = typeof value === 'string' ? parseInt(value) : value;
          if (!isNaN(numericValue)) {
            currentIndex = numericValue - 1; // Convert to 0-based index
            currentValue = numericValue.toString();
          }
        }
        
        console.log('Processed scale value:', { 
          currentIndex, 
          currentValue, 
          displayText: options[currentIndex],
          options 
        });
        
        return (
          <Select
            value={currentValue}
            onValueChange={(newValue) => {
              // Convert selected index back to 1-based number for storage
              const selectedIndex = parseInt(newValue);
              console.log('Scale selection change:', { newValue, selectedIndex });
              handleInputChange({
                target: { name: key, value: selectedIndex }
              } as any);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {currentIndex >= 0 && options[currentIndex] ? options[currentIndex] : 'Select an option'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={option} value={(index + 1).toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'MultiSelection':
        // Ensure value is always an array
        let selectedValues: string[] = Array.isArray(value) ? value : 
                           typeof value === 'string' ? value.split(',').map(v => v.trim()).filter(Boolean) : 
                           [];

        // Find any value that's not in the options list - this would be our "other" value
        const predefinedOptions = config.props.options || [];
        const otherValue = selectedValues.find(v => !predefinedOptions.includes(v));
        
        // If we have a value not in the options, replace it with "other" in the selected values
        const displayedValues = selectedValues.map(v => 
          predefinedOptions.includes(v) ? v : 'other'
        );

        const options = (predefinedOptions).map(opt => ({
          value: opt,
          label: opt
        }));
        
        if (config.props.otherOption) {
          options.push({ value: 'other', label: 'Other' });
        }

        return (
          <div className="space-y-2">
            <MultiSelect
              key={`${key}-${displayedValues.join(',')}`}
              options={options}
              selected={displayedValues}
              onChange={(newValues) => {
                // Only validate and update if the new selection is within limits
                if (config.props.maxSelections && newValues.length > config.props.maxSelections) {
                  setToastMessage({ 
                    type: 'error', 
                    message: `You can select up to ${config.props.maxSelections} options` 
                  });
                  return;
                }

                // If "other" was removed, remove the custom value too
                if (!newValues.includes('other')) {
                  const filteredValues = newValues.filter(v => v !== 'other');
                  handleInputChange({
                    target: { name: key, value: filteredValues }
                  } as any);
                  return;
                }

                // Keep any existing other value when modifying selections
                const finalValues = newValues.map(v => 
                  v === 'other' && otherValue ? otherValue : v
                );

                handleInputChange({
                  target: { name: key, value: finalValues }
                } as any);
              }}
            />
            {displayedValues.includes('other') && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Please specify other option"
                  value={otherValue || ''}
                  onChange={(e) => {
                    const newOtherValue = e.target.value;
                    // Replace the old "other" value with the new one
                    const updatedValues = selectedValues.map(v => 
                      !predefinedOptions.includes(v) ? newOtherValue : v
                    );
                    
                    handleInputChange({
                      target: { name: key, value: updatedValues }
                    } as any);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            )}
            {renderError()}
          </div>
        );

      default:
        // For any other type, default to single selection
        return (
          <Select
            value={value?.toString() || ''}
            onValueChange={(newValue) => {
              handleInputChange({
                target: { name: key, value: newValue }
              } as any);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={value?.toString() || ''}>
                {value?.toString() || 'Select an option'}
              </SelectItem>
            </SelectContent>
          </Select>
        );
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile menu button - always visible */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-md border border-gray-200 lg:hidden"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-[240px] h-screen bg-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-[300px]'
        } lg:translate-x-0`}
      >
        <Sidebar userRole={formData?.role || ''} kycStatus={kycStatus} userEmail={profileData?.email || ''} />
      </aside>

      {/* Main content */}
      <main className="flex-1 relative overflow-y-auto bg-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Add padding top on mobile to account for menu button */}
          <div className="pt-12 lg:pt-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 sm:mb-8">Profile Settings</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pb-12">
              {/* Company Logo Section */}
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-8">Company Logo</h2>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Company Logo"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploadingLogo}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
                    >
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      Recommended: Square image, max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Detail Form Sections */}
              {Object.entries(detailFormGroups).map(([alias, fields]) => (
                Object.keys(fields).length > 0 && (
                  <div key={alias} className="bg-white shadow-md rounded-lg p-4 sm:p-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-8">{formatFieldName(alias)}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      {Object.entries(fields).map(([key, value]) => {
                        // Skip country code fields
                        if (key.toLowerCase().includes('countrycode') || key.toLowerCase().includes('country_code')) {
                          return null;
                        }
                        
                        // Determine if this should be a textarea (for longer text)
                        const isLongText = typeof value === 'string' && (
                          value.length > 50 || 
                          key.toLowerCase().includes('description') || 
                          key.toLowerCase().includes('bio') ||
                          key.toLowerCase().includes('about') ||
                          key.toLowerCase().includes('notes') ||
                          key.toLowerCase().includes('address')
                        );
                        
                        return (
                          <div key={key} className={`p-4 space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 ${isLongText ? 'md:col-span-2' : ''}`}>
                            <label className="block text-sm font-medium text-gray-700">
                              {formatFieldName(key.replace(`${alias}.`, ''))}
                            </label>
                            {isLongText ? (
                              <textarea
                                name={key}
                                value={value || ''}
                                onChange={handleInputChange}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                            ) : (
                              <input
                                type="text"
                                name={key}
                                value={value || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ))}

              {/* Other Fields Section */}
              {editableOtherFields.length > 0 && (
                <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-8">Additional Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {editableOtherFields.map(([key, value]) => {
                      const questionAlias = key.split('.')[0];
                      return (
                        <div key={key} className="p-4 space-y-3 rounded-lg border border-gray-100 bg-gray-50/50">
                          <label className="block text-sm font-medium text-gray-700">
                            {formatFieldName(key)}
                          </label>
                          {renderInput(key, value, questionAlias)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 