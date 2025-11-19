'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ImpactMetric {
  metric: string;
  min: number;
  max: number;
}

interface IntakeFormData {
  company_name: string;
  year_founded: number | null;
  public_region: string;
  brief_description: string;
  impact_metrics: ImpactMetric[];
  application_areas: string[];
  industry_regions: string[];
  optional_fields: Record<string, any>;
}

interface SellerIntakeFormProps {
  onClose: () => void;
  onSubmit?: (data: IntakeFormData) => void;
}

const APPLICATION_AREAS = [
  'Pre-Design',
  'Design', 
  'Construction',
  'Operations',
  'Retrofit',
  'New Build'
];

const REGIONS = [
  'North America',
  'South America', 
  'Europe',
  'Asia Pacific',
  'Middle East & Africa',
  'Global'
];

const IMPACT_METRICS = [
  'CO2 Reduction (tons/year)',
  'Energy Savings (%)',
  'Water Conservation (gallons/year)',
  'Waste Reduction (%)',
  'Cost Savings ($)',
  'ROI (%)',
  'Jobs Created',
  'Custom Metric'
];

export default function SellerIntakeForm({ onClose, onSubmit }: SellerIntakeFormProps) {
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [existingData, setExistingData] = useState<IntakeFormData | null>(null);
  
  const [formData, setFormData] = useState<IntakeFormData>({
    company_name: '',
    year_founded: null,
    public_region: '',
    brief_description: '',
    impact_metrics: [],
    application_areas: [],
    industry_regions: [],
    optional_fields: {}
  });

  // Load existing data on component mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('seller_intake_form')
        .select('*')
        .eq('uuid', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading existing data:', error);
        return;
      }

      if (data) {
        setExistingData(data);
        setFormData({
          company_name: data.company_name || '',
          year_founded: data.year_founded || null,
          public_region: data.public_region || '',
          brief_description: data.brief_description || '',
          impact_metrics: data.impact_metrics || [],
          application_areas: data.application_areas || [],
          industry_regions: data.industry_regions || [],
          optional_fields: data.optional_fields || {}
        });
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const handleInputChange = (field: keyof IntakeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addImpactMetric = () => {
    setFormData(prev => ({
      ...prev,
      impact_metrics: [...prev.impact_metrics, { metric: '', min: 0, max: 0 }]
    }));
  };

  const updateImpactMetric = (index: number, field: keyof ImpactMetric, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      impact_metrics: prev.impact_metrics.map((metric, i) => 
        i === index ? { ...metric, [field]: value } : metric
      )
    }));
  };

  const removeImpactMetric = (index: number) => {
    setFormData(prev => ({
      ...prev,
      impact_metrics: prev.impact_metrics.filter((_, i) => i !== index)
    }));
  };

  const toggleApplicationArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      application_areas: prev.application_areas.includes(area)
        ? prev.application_areas.filter(a => a !== area)
        : [...prev.application_areas, area]
    }));
  };

  const addIndustryRegion = (region: string) => {
    if (!formData.industry_regions.includes(region)) {
      setFormData(prev => ({
        ...prev,
        industry_regions: [...prev.industry_regions, region]
      }));
    }
  };

  const removeIndustryRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      industry_regions: prev.industry_regions.filter(r => r !== region)
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft) {
      // Validate required fields
      if (!formData.company_name.trim()) {
        toast.error('Company name is required');
        return;
      }
      if (!formData.brief_description.trim()) {
        toast.error('Brief description is required');
        return;
      }
      if (formData.application_areas.length === 0) {
        toast.error('Please select at least one application area');
        return;
      }
    }

    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const dataToSubmit = {
        uuid: session.user.id,
        ...formData
      };

      let result;
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('seller_intake_form')
          .update(dataToSubmit)
          .eq('uuid', session.user.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('seller_intake_form')
          .insert([dataToSubmit])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(isDraft ? 'Draft saved successfully!' : 'Intake form submitted successfully!');
      onSubmit?.(formData);
      
      if (!isDraft) {
        // Show marketplace preview notification after a brief delay
        setTimeout(() => {
          toast.success('🎉 Your Profile 0 is now live on the marketplace! Check your dashboard for the "View Marketplace Preview" option.');
        }, 1500);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Create Abstracted Seller Profile
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete your profile to connect with climate-conscious buyers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Step 1 • Profile (3 min)</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Get Verified Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Get Verified, Get Found.</h3>
                <p className="text-sm text-green-800">
                  Finish in ~3 minutes to unlock a Verified badge and appear in buyer searches.
                </p>
                <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                  🔒 No client/site names. We show regions only.
                </p>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-sm font-medium">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company_name"
              placeholder="Enter your company name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
            />
          </div>

          {/* Year Founded */}
          <div className="space-y-2">
            <Label htmlFor="year_founded" className="text-sm font-medium">
              Year Founded <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.year_founded?.toString() || ''} 
              onValueChange={(value) => handleInputChange('year_founded', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="YYYY" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Public Region */}
          <div className="space-y-2">
            <Label htmlFor="public_region" className="text-sm font-medium">
              Public Region <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.public_region} 
              onValueChange={(value) => handleInputChange('public_region', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your primary region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brief Description */}
          <div className="space-y-2">
            <Label htmlFor="brief_description" className="text-sm font-medium">
              Brief Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="brief_description"
              placeholder="Describe your climate-tech solutions..."
              value={formData.brief_description}
              onChange={(e) => handleInputChange('brief_description', e.target.value)}
              rows={4}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Abstracted—no client names.</p>
              <span className="text-sm text-gray-400">
                {formData.brief_description.length}/300
              </span>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Impact <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImpactMetric}
                className="h-8 px-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add metric
              </Button>
            </div>

            {formData.impact_metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                <Select
                  value={metric.metric}
                  onValueChange={(value) => updateImpactMetric(index, 'metric', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACT_METRICS.map(metricOption => (
                      <SelectItem key={metricOption} value={metricOption}>
                        {metricOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={metric.min || ''}
                    onChange={(e) => updateImpactMetric(index, 'min', parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={metric.max || ''}
                    onChange={(e) => updateImpactMetric(index, 'max', parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImpactMetric(index)}
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Application Areas */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Application <span className="text-red-500">*</span> (Choose 1-3)
            </Label>
            <div className="flex flex-wrap gap-2">
              {APPLICATION_AREAS.map(area => (
                <Button
                  key={area}
                  type="button"
                  variant={formData.application_areas.includes(area) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleApplicationArea(area)}
                  className="h-8"
                >
                  {area}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {formData.application_areas.length}/3 selected
            </p>
          </div>

          {/* Industry Regions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Industry Regions <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={addIndustryRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Add industry region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.filter(region => !formData.industry_regions.includes(region)).map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {formData.industry_regions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.industry_regions.map(region => (
                  <Badge key={region} variant="secondary" className="flex items-center gap-1">
                    {region}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIndustryRegion(region)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500">Select regions where you operate</p>
          </div>

          {/* Show Optional Fields Toggle - Removing */}
          {/*<Button
            type="button"
            variant="ghost"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="w-full justify-center text-sm text-gray-600 hover:text-gray-900"
          >
            {showOptionalFields ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide optional fields
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show optional fields
              </>
            )}
          </Button>*/}

          {/* Optional Fields - Removing */}
          {/*{showOptionalFields && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Optional Information</h3>*/}
              {/* Add any optional fields here in the future */}
              {/*<p className="text-sm text-gray-500">Additional fields can be added here as needed.</p>
            </div>
          )}*/}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
