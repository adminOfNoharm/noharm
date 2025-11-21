'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircleIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  TargetIcon, 
  UsersIcon,
  BuildingIcon,
  ArrowRightIcon
} from 'lucide-react';
import { DollarSignIcon, TrendingUpIcon, GlobeIcon, SparklesIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FormData {
  // Business Stage & Goals - REMOVED (covered in onboarding)
  // businessStage: string;
  // primaryGoals: string[];
  // revenueStage: string;
  // timeframe: string;
  
  // Support Needs
  supportTypes: string[];
  // technicalChallenges: string[]; // REMOVED - too technical for this assessment
  marketChallenges: string[];
  customChallenges: string;
  
  // Buyer Preferences
  idealBuyerSize: string[];
  preferredIndustries: string[];
  geographicFocus: string[];
  contractSize: string;
  
  // Partnership Preferences
  partnershipTypes: string[];
  partnershipGoals: string;
  
  // Funding & Investment - COMMENTED OUT (covered in onboarding)
  fundingStage: string;
  fundingAmount: string;
  investorTypes: string[];
  useOfFunds: string;
  
  // Additional Context
  successStories: string;
  biggestBarriers: string;
  priorityLevel: string;
}

const initialFormData: FormData = {
  supportTypes: [],
  marketChallenges: [],
  customChallenges: '',
  idealBuyerSize: [],
  preferredIndustries: [],
  geographicFocus: [],
  contractSize: '',
  partnershipTypes: [],
  partnershipGoals: '',
  fundingStage: '',
  fundingAmount: '',
  investorTypes: [],
  useOfFunds: '',
  successStories: '',
  biggestBarriers: '',
  priorityLevel: '',
};

export default function NeedsAssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingAssessment, setExistingAssessment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'dashboard' | 'form' | 'edit'>('form');
  const [editingSection, setEditingSection] = useState<number | null>(null);
  
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Load existing assessment on mount
  useEffect(() => {
    const loadExistingAssessment = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const { data: assessment, error } = await supabase
          .from('user_needs_assessment')
          .select('*')
          .eq('uuid', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error loading assessment:', error);
        }

        if (assessment) {
          setExistingAssessment(assessment);
          setViewMode('dashboard');
        }
        
      } catch (error) {
        console.error('Error checking existing assessment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingAssessment();
  }, []);

  // Load existing data into form for editing
  const loadDataIntoForm = (assessment: any) => {
    setFormData({
      supportTypes: assessment.support_types || [],
      marketChallenges: assessment.market_challenges || [],
      customChallenges: assessment.custom_challenges || '',
      idealBuyerSize: assessment.ideal_buyer_size || [],
      preferredIndustries: assessment.preferred_industries || [],
      geographicFocus: assessment.geographic_focus || [],
      contractSize: assessment.contract_size || '',
      partnershipTypes: assessment.partnership_types || [],
      partnershipGoals: assessment.partnership_goals || '',
      fundingStage: assessment.funding_stage || '',
      fundingAmount: assessment.funding_amount || '',
      investorTypes: assessment.investor_types || [],
      useOfFunds: assessment.use_of_funds || '',
      successStories: assessment.success_stories || '',
      biggestBarriers: assessment.biggest_barriers || '',
      priorityLevel: assessment.priority_level || '',
    });
  };

  const handleMultiSelect = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('User not authenticated. Please log in and try again.');
      }

      // Prepare data for submission
      const submissionData = {
        uuid: session.user.id,
        support_types: formData.supportTypes,
        market_challenges: formData.marketChallenges,
        custom_challenges: formData.customChallenges,
        ideal_buyer_size: formData.idealBuyerSize,
        preferred_industries: formData.preferredIndustries,
        geographic_focus: formData.geographicFocus,
        contract_size: formData.contractSize,
        partnership_types: formData.partnershipTypes,
        partnership_goals: formData.partnershipGoals,
        success_stories: formData.successStories,
        biggest_barriers: formData.biggestBarriers,
        priority_level: formData.priorityLevel,
      };

      // Submit to Supabase (upsert to handle updates)
      const { error: submitError } = await supabase
        .from('user_needs_assessment')
        .upsert(submissionData, {
          onConflict: 'uuid'
        });

      if (submitError) {
        throw new Error(`Failed to save assessment: ${submitError.message}`);
      }

      console.log('Needs assessment submitted successfully:', submissionData);
      setIsCompleted(true);
      
      // If this was a section edit, update the existing assessment and go back to dashboard
      if (editingSection !== null) {
        setExistingAssessment({ ...existingAssessment, ...submissionData });
        setViewMode('dashboard');
        setEditingSection(null);
      }
      
    } catch (error) {
      console.error('Error submitting needs assessment:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Section editing functions
  const editSection = (sectionNumber: number) => {
    loadDataIntoForm(existingAssessment);
    setCurrentStep(sectionNumber);
    setEditingSection(sectionNumber);
    setViewMode('edit');
    setSubmitError(null);
  };

  const retakeAssessment = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setEditingSection(null);
    setViewMode('form');
    setSubmitError(null);
  };

  const backToDashboard = () => {
    setViewMode('dashboard');
    setEditingSection(null);
    setSubmitError(null);
  };

  // Dashboard view for existing assessments
  const renderDashboard = () => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const sections = [
      {
        id: 1,
        title: 'Support Needs',
        icon: TargetIcon,
        color: 'from-[#1105ff] to-[#4c6ef5]',
        data: {
          'Support Types': existingAssessment.support_types?.length || 0,
          'Market Challenges': existingAssessment.market_challenges?.length || 0,
          'Custom Needs': existingAssessment.custom_challenges ? 'Provided' : 'Not provided'
        }
      },
      {
        id: 2,
        title: 'Buyer Profile',
        icon: BuildingIcon,
        color: 'from-[#9b00ff] to-[#b968c7]',
        data: {
          'Target Company Sizes': existingAssessment.ideal_buyer_size?.length || 0,
          'Industries': existingAssessment.preferred_industries?.length || 0,
          'Geographic Focus': existingAssessment.geographic_focus?.length || 0,
          'Contract Size': existingAssessment.contract_size || 'Not specified'
        }
      },
      {
        id: 3,
        title: 'Partnership Preferences',
        icon: UsersIcon,
        color: 'from-[#00792b] to-[#4caf50]',
        data: {
          'Partnership Types': existingAssessment.partnership_types?.length || 0,
          'Partnership Goals': existingAssessment.partnership_goals ? 'Provided' : 'Not provided'
        }
      },
      {
        id: 4,
        title: 'Additional Context',
        icon: CheckCircleIcon,
        color: 'from-[#8b5cf6] to-[#a855f7]',
        data: {
          'Success Stories': existingAssessment.success_stories ? 'Provided' : 'Not provided',
          'Growth Barriers': existingAssessment.biggest_barriers ? 'Provided' : 'Not provided',
          'Priority Level': existingAssessment.priority_level || 'Not specified'
        }
      }
    ];

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Needs Identifier</h1>
          <p className="text-lg text-gray-600 mb-2">
            Last updated on {formatDate(existingAssessment.updated_at)}
          </p>
          <p className="text-sm text-gray-500">
            Edit individual sections or retake the complete assessment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center shadow-md`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(section.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium text-gray-900">
                        {typeof value === 'number' && value > 0 ? `${value} selected` : value}
                      </span>
                    </div>
                  ))}
                  <Button
                    onClick={() => editSection(section.id)}
                    variant="outline"
                    className="w-full mt-4 border-gray-200 hover:border-[#00792b] hover:text-[#00792b]"
                  >
                    Edit Section
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={retakeAssessment}
            variant="outline"
            className="border-[#1105ff] text-[#1105ff] hover:bg-[#1105ff]/10 font-bold px-6 py-3"
          >
            Retake Complete Assessment
          </Button>
          
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white font-bold px-6 py-3 flex items-center gap-2">
              <ArrowRightIcon className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Show dashboard if user has existing assessment
  if (viewMode === 'dashboard' && existingAssessment) {
    return renderDashboard();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Success State */}
      {isCompleted ? (
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-[#2e7d32] to-[#4caf50] flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Needs Identifier Complete! 🎉</h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for sharing your needs. We'll use this information to personalize your experience and connect you with the most relevant opportunities.
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#f0f8f0] to-[#e6f2e6] rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-[#1105ff]/10 flex items-center justify-center mb-3">
                    <TargetIcon className="h-6 w-6 text-[#1105ff]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Personalized Matching</h3>
                  <p className="text-xs text-gray-600">Get matched with relevant buyers and partners</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-[#9b00ff]/10 flex items-center justify-center mb-3">
                    <SparklesIcon className="h-6 w-6 text-[#9b00ff]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Tailored Recommendations</h3>
                  <p className="text-xs text-gray-600">Receive customized support suggestions</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-[#00792b]/10 flex items-center justify-center mb-3">
                    <UsersIcon className="h-6 w-6 text-[#00792b]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Priority Access</h3>
                  <p className="text-xs text-gray-600">Get early access to relevant opportunities</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white font-bold px-6 py-3 flex items-center gap-2">
                  <ArrowRightIcon className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              
              <Link href="/marketplace">
                <Button variant="outline" className="border-[#1105ff] text-[#1105ff] hover:bg-[#1105ff]/10 font-bold px-6 py-3">
                  Explore Marketplace
                </Button>
              </Link>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>What's next?</strong> Our team will review your preferences and reach out within 2-3 business days with personalized recommendations and potential matches.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {editingSection !== null ? `Edit ${
                editingSection === 1 ? 'Support Needs' :
                editingSection === 2 ? 'Buyer Profile' :
                editingSection === 3 ? 'Partnership Preferences' :
                'Additional Context'
              }` : 'Needs Identifier'}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {editingSection !== null 
                ? 'Update your preferences for this section'
                : 'Help us understand your specific support needs so we can connect you with the right opportunities and assistance'
              }
            </p>
            
            {editingSection !== null && (
              <div className="mb-4">
                <Button
                  onClick={backToDashboard}
                  variant="outline"
                  className="flex items-center gap-2 text-gray-600 hover:text-[#00792b] hover:bg-[#00792b]/10"
                >
                  <ArrowRightIcon className="h-4 w-4 rotate-180" />
                  Back to Summary
                </Button>
              </div>
            )}
            
            {/* Progress Bar - only show for full assessment */}
            {editingSection === null && (
              <>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
              </>
            )}
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {/* Step 1: Support Needs */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#1105ff] to-[#4c6ef5] flex items-center justify-center mx-auto mb-4">
                      <TargetIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Needs</h2>
                    <p className="text-gray-600">What kind of support would be most valuable to you?</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">What types of support are you looking for? (Select all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Business development & sales',
                          'Technical/engineering support',
                          'Regulatory & compliance guidance',
                          'Market research & analysis',
                          'Financial planning & fundraising',
                          'Marketing & brand development',
                          'Operations & supply chain',
                          'Legal & IP protection'
                        ].map((support) => (
                          <div key={support} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                            <Checkbox 
                              id={support}
                              checked={formData.supportTypes.includes(support)}
                              onCheckedChange={() => handleMultiSelect('supportTypes', support)}
                            />
                            <Label htmlFor={support} className="flex-1 cursor-pointer text-sm">{support}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">What are your biggest market challenges?</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          'Finding the right customers/buyers',
                          'Pricing strategy & competitiveness',
                          'Market education & awareness',
                          'Building trust & credibility',
                          'Distribution & channel access',
                          'Competition from established players'
                        ].map((challenge) => (
                          <div key={challenge} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                            <Checkbox 
                              id={challenge}
                              checked={formData.marketChallenges.includes(challenge)}
                              onCheckedChange={() => handleMultiSelect('marketChallenges', challenge)}
                            />
                            <Label htmlFor={challenge} className="flex-1 cursor-pointer text-sm">{challenge}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customChallenges" className="text-base font-semibold text-gray-900 mb-3 block">
                        Describe any specific challenges or support needs not listed above
                      </Label>
                      <Textarea
                        id="customChallenges"
                        value={formData.customChallenges}
                        onChange={(e) => handleInputChange('customChallenges', e.target.value)}
                        placeholder="Please describe your specific challenges, goals, or support needs in detail..."
                        className="min-h-24"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Buyer Preferences */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#9b00ff] to-[#b968c7] flex items-center justify-center mx-auto mb-4">
                      <BuildingIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ideal Buyer Profile</h2>
                    <p className="text-gray-600">Help us understand what type of buyers you're looking for</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">What size companies are you targeting?</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Startups & SMEs (1-50 employees)',
                          'Mid-size companies (51-500 employees)', 
                          'Large enterprises (500+ employees)',
                          'Government agencies',
                          'NGOs & non-profits',
                          'Research institutions'
                        ].map((size) => (
                          <div key={size} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                            <Checkbox 
                              id={size}
                              checked={formData.idealBuyerSize.includes(size)}
                              onCheckedChange={() => handleMultiSelect('idealBuyerSize', size)}
                            />
                            <Label htmlFor={size} className="flex-1 cursor-pointer text-sm">{size}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">Which industries are most relevant to your solution?</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Energy & Utilities',
                          'Manufacturing & Industrial',
                          'Transportation & Logistics',
                          'Agriculture & Food',
                          'Construction & Real Estate',
                          'Technology & Data Centers',
                          'Retail & Consumer Goods',
                          'Healthcare & Pharmaceuticals'
                        ].map((industry) => (
                          <div key={industry} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                            <Checkbox 
                              id={industry}
                              checked={formData.preferredIndustries.includes(industry)}
                              onCheckedChange={() => handleMultiSelect('preferredIndustries', industry)}
                            />
                            <Label htmlFor={industry} className="flex-1 cursor-pointer text-sm">{industry}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">Geographic focus areas</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Southeast Asia',
                          'East Asia (China, Japan, Korea)',
                          'North America',
                          'Europe',
                          'Middle East',
                          'Australia & Oceania',
                          'Latin America',
                          'Global (no specific focus)'
                        ].map((region) => (
                          <div key={region} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                            <Checkbox 
                              id={region}
                              checked={formData.geographicFocus.includes(region)}
                              onCheckedChange={() => handleMultiSelect('geographicFocus', region)}
                            />
                            <Label htmlFor={region} className="flex-1 cursor-pointer text-sm">{region}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">Typical contract/deal size you're targeting</Label>
                      <Select value={formData.contractSize} onValueChange={(value) => handleInputChange('contractSize', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select typical deal size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-10k">Under $10K</SelectItem>
                          <SelectItem value="10k-50k">$10K - $50K</SelectItem>
                          <SelectItem value="50k-250k">$50K - $250K</SelectItem>
                          <SelectItem value="250k-1m">$250K - $1M</SelectItem>
                          <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                          <SelectItem value="over-5m">Over $5M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Partnership Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#00792b] to-[#4caf50] flex items-center justify-center mx-auto mb-4">
                      <UsersIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Partnership Preferences</h2>
                    <p className="text-gray-600">What kind of partnerships would accelerate your growth?</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">What types of partnerships interest you?</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          'Technology integration partnerships',
                          'Distribution & channel partnerships',
                          'Joint ventures for market entry',
                          'Research & development collaborations',
                          'Supply chain partnerships',
                          'Marketing & co-branding partnerships',
                          'Strategic investor partnerships',
                          'Acquisition opportunities'
                        ].map((partnership) => (
                          <div key={partnership} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                            <Checkbox 
                              id={partnership}
                              checked={formData.partnershipTypes.includes(partnership)}
                              onCheckedChange={() => handleMultiSelect('partnershipTypes', partnership)}
                            />
                            <Label htmlFor={partnership} className="flex-1 cursor-pointer text-sm">{partnership}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="partnershipGoals" className="text-base font-semibold text-gray-900 mb-3 block">
                        What would you hope to achieve through partnerships?
                      </Label>
                      <Textarea
                        id="partnershipGoals"
                        value={formData.partnershipGoals}
                        onChange={(e) => handleInputChange('partnershipGoals', e.target.value)}
                        placeholder="Describe your partnership goals, what you bring to the table, and what you're looking for in partners..."
                        className="min-h-24"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 
              Step 4: Funding & Investment - COMMENTED OUT (covered in onboarding)
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] flex items-center justify-center mx-auto mb-4">
                      <DollarSignIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Funding & Investment</h2>
                    <p className="text-gray-600">Tell us about your funding needs and investment preferences</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">Current funding stage</Label>
                      <RadioGroup value={formData.fundingStage} onValueChange={(value) => handleInputChange('fundingStage', value)}>
                        <div className="space-y-2">
                          {[
                            { value: 'bootstrapped', label: 'Bootstrapped - Self-funded, not seeking investment' },
                            { value: 'pre-seed', label: 'Pre-seed - Looking for initial funding' },
                            { value: 'seed', label: 'Seed stage - Raising Series Seed' },
                            { value: 'series-a', label: 'Series A - Looking for growth funding' },
                            { value: 'later-stage', label: 'Later stage - Series B+ or pre-IPO' },
                            { value: 'not-applicable', label: 'Not applicable - Not seeking funding currently' }
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <Label htmlFor={option.value} className="flex-1 cursor-pointer text-sm">{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.fundingStage !== 'bootstrapped' && formData.fundingStage !== 'not-applicable' && (
                      <>
                        <div>
                          <Label className="text-base font-semibold text-gray-900 mb-3 block">Funding amount you're targeting</Label>
                          <Select value={formData.fundingAmount} onValueChange={(value) => handleInputChange('fundingAmount', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select funding range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under-100k">Under $100K</SelectItem>
                              <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                              <SelectItem value="500k-2m">$500K - $2M</SelectItem>
                              <SelectItem value="2m-10m">$2M - $10M</SelectItem>
                              <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                              <SelectItem value="over-50m">Over $50M</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-gray-900 mb-3 block">What types of investors are you interested in?</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              'Angel investors',
                              'Venture capital funds',
                              'Corporate venture capital',
                              'Climate-focused funds',
                              'Government grants & programs',
                              'Impact investors',
                              'Strategic industry investors',
                              'Crowdfunding platforms'
                            ].map((investor) => (
                              <div key={investor} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border">
                                <Checkbox 
                                  id={investor}
                                  checked={formData.investorTypes.includes(investor)}
                                  onCheckedChange={() => handleMultiSelect('investorTypes', investor)}
                                />
                                <Label htmlFor={investor} className="flex-1 cursor-pointer text-sm">{investor}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="useOfFunds" className="text-base font-semibold text-gray-900 mb-3 block">
                            How would you use the funding?
                          </Label>
                          <Textarea
                            id="useOfFunds"
                            value={formData.useOfFunds}
                            onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
                            placeholder="Describe how you plan to use the funding (e.g., R&D, hiring, market expansion, equipment, working capital...)"
                            className="min-h-20"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              */}

              {/* Step 4: Additional Context */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Context</h2>
                    <p className="text-gray-600">Help us understand your success stories and priorities</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="successStories" className="text-base font-semibold text-gray-900 mb-3 block">
                        Share a recent success story or milestone
                      </Label>
                      <Textarea
                        id="successStories"
                        value={formData.successStories}
                        onChange={(e) => handleInputChange('successStories', e.target.value)}
                        placeholder="Tell us about a recent win, successful pilot, partnership, or milestone that you're proud of..."
                        className="min-h-24"
                      />
                    </div>

                    <div>
                      <Label htmlFor="biggestBarriers" className="text-base font-semibold text-gray-900 mb-3 block">
                        What are the biggest barriers to your growth right now?
                      </Label>
                      <Textarea
                        id="biggestBarriers"
                        value={formData.biggestBarriers}
                        onChange={(e) => handleInputChange('biggestBarriers', e.target.value)}
                        placeholder="What's holding you back? (e.g., access to customers, funding, technical challenges, regulatory issues, team, etc.)"
                        className="min-h-24"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-900 mb-3 block">How urgently do you need support?</Label>
                      <RadioGroup value={formData.priorityLevel} onValueChange={(value) => handleInputChange('priorityLevel', value)}>
                        <div className="space-y-2">
                          {[
                            { value: 'urgent', label: 'Urgent - Need support within 1-2 months' },
                            { value: 'high', label: 'High priority - Need support within 3-6 months' },
                            { value: 'moderate', label: 'Moderate - Would like support within 6-12 months' },
                            { value: 'low', label: 'Low priority - Just exploring options for now' }
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <Label htmlFor={option.value} className="flex-1 cursor-pointer text-sm">{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={editingSection !== null ? backToDashboard : prevStep}
                  disabled={editingSection !== null ? false : currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  {editingSection !== null ? 'Cancel' : 'Previous'}
                </Button>

                <div className="flex flex-col items-end gap-2">
                  {submitError && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200 max-w-md text-right">
                      {submitError}
                    </div>
                  )}
                  
                  {/* For section editing, always show save button */}
                  {editingSection !== null ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white flex items-center gap-2 min-w-32"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  ) : (
                    /* Normal flow navigation */
                    currentStep < totalSteps ? (
                      <Button
                        onClick={nextStep}
                        className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white flex items-center gap-2"
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white flex items-center gap-2 min-w-32"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            Complete Identifier
                          </>
                        )}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 