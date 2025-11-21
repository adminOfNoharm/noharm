'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { 
  Building, 
  Shield, 
  Zap, 
  Settings, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Calendar,
  Ruler,
  Users,
  CheckCircleIcon,
  ArrowLeftIcon,
  EditIcon
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FormData {
  // Property Identification
  propertyName: string;
  propertyType: string;
  countryRegion: string;
  yearBuilt: string;
  address: string;
  floorArea: string;
  occupancyRate: number;
  
  // Regulatory & Certifications
  usRegulations: string[];
  euRegulations: string[];
  certifications: string[];
  complianceStatus: string;
  sustainabilityGoals: string[];
  
  // Energy & Emissions
  energyConsumption: string;
  carbonFootprint: string;
  renewableEnergy: string;
  emissionSources: string[];
  
  // Building Systems
  hvacSystem: string;
  lightingSystem: string;
  waterManagement: string;
  wasteManagement: string;
  
  // Financials & Disclosure
  annualEnergyBudget: string;
  sustainabilityBudget: string;
  disclosureRequirements: string[];
  reportingFrequency: string;
}

const STEPS = [
  {
    id: 'property-identification',
    title: 'Property Identification',
    description: 'Basic property details and characteristics',
    icon: Building,
    fields: ['propertyName', 'propertyType', 'countryRegion', 'yearBuilt', 'address', 'floorArea', 'occupancyRate']
  },
  {
    id: 'regulatory-certifications',
    title: 'Regulatory & Certifications',
    description: 'Compliance status and certifications',
    icon: Shield,
    fields: ['usRegulations', 'euRegulations', 'certifications', 'complianceStatus']
  },
  {
    id: 'energy-emissions',
    title: 'Energy & Emissions',
    description: 'Energy consumption and carbon footprint data',
    icon: Zap,
    fields: ['energyConsumption', 'carbonFootprint', 'renewableEnergy', 'emissionSources']
  },
  {
    id: 'building-systems',
    title: 'Building Systems',
    description: 'Infrastructure and operational systems',
    icon: Settings,
    fields: ['hvacSystem', 'lightingSystem', 'waterManagement', 'wasteManagement']
  },
  {
    id: 'financials-disclosure',
    title: 'Financials & Disclosure',
    description: 'Budget allocation and reporting requirements',
    icon: DollarSign,
    fields: ['annualEnergyBudget', 'sustainabilityBudget', 'disclosureRequirements', 'reportingFrequency']
  }
];

const PROPERTY_TYPES = [
  'Office Building',
  'Retail Center',
  'Industrial Facility',
  'Mixed-Use Development',
  'Residential Complex',
  'Hotel',
  'Healthcare Facility',
  'Educational Institution',
  'Warehouse',
  'Data Center'
];

const COUNTRIES_REGIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Netherlands',
  'Australia',
  'Singapore',
  'Japan',
  'Other'
];

const US_REGULATIONS = [
  'ENERGY STAR',
  'LEED',
  'WELL',
  'Local Law 97',
  'Title 24',
  'ASHRAE 90.1',
  'IECC'
];

const EU_REGULATIONS = [
  'EPBD',
  'EU Taxonomy',
  'CSRD/ESRS',
  'BREEAM',
  'DGNB',
  'HQE'
];

const CERTIFICATIONS = [
  'LEED',
  'BREEAM',
  'WELL',
  'Fitwel',
  'NABERS'
];

const COMPLIANCE_STATUS_OPTIONS = [
  'Fully Compliant',
  'Partially Compliant',
  'Non-Compliant',
  'Under Review',
  'Not Applicable'
];

const SUSTAINABILITY_GOALS = [
  'Net Zero Carbon',
  'Carbon Neutral',
  'Renewable Energy 100%',
  'Water Positive',
  'Zero Waste to Landfill',
  'WELL Certification',
  'Biodiversity Net Gain',
  'Circular Economy'
];

const EMISSION_SOURCES = [
  'Electricity',
  'Natural Gas',
  'District Heating/Cooling',
  'On-site Fuel Combustion',
  'Refrigerants',
  'Transportation',
  'Water & Wastewater',
  'Waste'
];

const HVAC_SYSTEMS = [
  'Central Air Conditioning',
  'Heat Pumps',
  'Variable Air Volume (VAV)',
  'Chilled Beam',
  'Radiant Heating/Cooling',
  'Geothermal',
  'Natural Ventilation',
  'Hybrid Systems'
];

const LIGHTING_SYSTEMS = [
  'LED',
  'Fluorescent',
  'Smart Lighting Controls',
  'Daylight Harvesting',
  'Occupancy Sensors',
  'Mixed Systems'
];

const WATER_MANAGEMENT = [
  'Rainwater Harvesting',
  'Greywater Recycling',
  'Low-flow Fixtures',
  'Smart Irrigation',
  'Water Monitoring Systems',
  'Standard Systems'
];

const WASTE_MANAGEMENT = [
  'Comprehensive Recycling',
  'Composting Program',
  'Waste-to-Energy',
  'Zero Waste Initiative',
  'Standard Collection',
  'Minimal Program'
];

const DISCLOSURE_REQUIREMENTS = [
  'Annual ESG Report',
  'Carbon Footprint Disclosure',
  'Energy Performance Certificate',
  'Green Building Certification',
  'Regulatory Compliance Report',
  'Tenant Sustainability Report'
];

const initialFormData: FormData = {
  propertyName: '',
  propertyType: '',
  countryRegion: '',
  yearBuilt: '',
  address: '',
  floorArea: '',
  occupancyRate: 80,
  usRegulations: [],
  euRegulations: [],
  certifications: [],
  complianceStatus: '',
  sustainabilityGoals: [],
  energyConsumption: '',
  carbonFootprint: '',
  renewableEnergy: '',
  emissionSources: [],
  hvacSystem: '',
  lightingSystem: '',
  waterManagement: '',
  wasteManagement: '',
  annualEnergyBudget: '',
  sustainabilityBudget: '',
  disclosureRequirements: [],
  reportingFrequency: ''
};

export default function RealEstateIntakeForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingIntake, setExistingIntake] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'dashboard' | 'form' | 'edit'>('form');
  const [editingSection, setEditingSection] = useState<number | null>(null);

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Load existing intake on mount
  useEffect(() => {
    const loadExistingIntake = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const { data: intake, error } = await supabase
          .from('real_estate_intake')
          .select('*')
          .eq('uuid', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error loading real estate intake:', error.message);
        }

        if (intake) {
          setExistingIntake(intake);
          setViewMode('dashboard');
        }
        
      } catch (error) {
        console.error('Error checking existing intake:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingIntake();
  }, []);

  // Load existing data into form for editing
  const loadDataIntoForm = (intake: any) => {
    setFormData({
      propertyName: intake.property_name || '',
      propertyType: intake.property_type || '',
      countryRegion: intake.country_region || '',
      yearBuilt: intake.year_built || '',
      address: intake.address || '',
      floorArea: intake.floor_area || '',
      occupancyRate: intake.occupancy_rate || 80,
      usRegulations: intake.us_regulations || [],
      euRegulations: intake.eu_regulations || [],
      certifications: intake.certifications || [],
      complianceStatus: intake.compliance_status || '',
      sustainabilityGoals: intake.sustainability_goals || [],
      energyConsumption: intake.energy_consumption || '',
      carbonFootprint: intake.carbon_footprint || '',
      renewableEnergy: intake.renewable_energy || '',
      emissionSources: intake.emission_sources || [],
      hvacSystem: intake.hvac_system || '',
      lightingSystem: intake.lighting_system || '',
      waterManagement: intake.water_management || '',
      wasteManagement: intake.waste_management || '',
      annualEnergyBudget: intake.annual_energy_budget || '',
      sustainabilityBudget: intake.sustainability_budget || '',
      disclosureRequirements: intake.disclosure_requirements || [],
      reportingFrequency: intake.reporting_frequency || ''
    });
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field: keyof FormData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleInputChange(field, newArray);
  };

  const isStepComplete = (stepIndex: number) => {
    const step = STEPS[stepIndex];
    return step.fields.every(field => {
      const value = formData[field as keyof FormData];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== undefined && value !== null;
    });
  };

  const canProceedToNext = () => {
    return isStepComplete(currentStep);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1 && canProceedToNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
        property_name: formData.propertyName,
        property_type: formData.propertyType,
        country_region: formData.countryRegion,
        year_built: formData.yearBuilt,
        address: formData.address,
        floor_area: formData.floorArea,
        occupancy_rate: formData.occupancyRate,
        us_regulations: formData.usRegulations,
        eu_regulations: formData.euRegulations,
        certifications: formData.certifications,
        compliance_status: formData.complianceStatus,
        sustainability_goals: formData.sustainabilityGoals,
        energy_consumption: formData.energyConsumption,
        carbon_footprint: formData.carbonFootprint,
        renewable_energy: formData.renewableEnergy,
        emission_sources: formData.emissionSources,
        hvac_system: formData.hvacSystem,
        lighting_system: formData.lightingSystem,
        water_management: formData.waterManagement,
        waste_management: formData.wasteManagement,
        annual_energy_budget: formData.annualEnergyBudget,
        sustainability_budget: formData.sustainabilityBudget,
        disclosure_requirements: formData.disclosureRequirements,
        reporting_frequency: formData.reportingFrequency
      };

      // Submit to Supabase (upsert to handle updates)
      const { error: submitError } = await supabase
        .from('real_estate_intake')
        .upsert(submissionData, {
          onConflict: 'uuid'
        });

      if (submitError) {
        throw new Error(`Failed to save intake form: ${submitError.message}`);
      }

      console.log('Real estate intake submitted successfully:', submissionData);
      setIsCompleted(true);
      toast.success('Real estate intake form submitted successfully!');
      
      // If this was a section edit, update the existing intake and go back to dashboard
      if (editingSection !== null) {
        setExistingIntake({ ...existingIntake, ...submissionData });
        setViewMode('dashboard');
        setEditingSection(null);
      }
      
    } catch (error) {
      console.error('Error submitting real estate intake:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      toast.error('Failed to submit intake form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Section editing functions
  const editSection = (sectionNumber: number) => {
    loadDataIntoForm(existingIntake);
    setCurrentStep(sectionNumber);
    setEditingSection(sectionNumber);
    setViewMode('edit');
    setSubmitError(null);
  };

  const retakeIntake = () => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setEditingSection(null);
    setViewMode('form');
    setSubmitError(null);
  };

  const backToDashboard = () => {
    if (editingSection !== null) {
      setViewMode('dashboard');
      setEditingSection(null);
    } else {
      router.push('/dashboard');
    }
  };

  const handleFinalSubmit = () => {
    if (currentStep === STEPS.length - 1 && canProceedToNext()) {
      handleSubmit();
    }
  };

  const renderPropertyIdentification = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="propertyName">Property Name</Label>
          <Input
            id="propertyName"
            placeholder="Enter property name"
            value={formData.propertyName}
            onChange={(e) => handleInputChange('propertyName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="propertyType">Property Type</Label>
          <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="countryRegion">Country / Region</Label>
          <Select value={formData.countryRegion} onValueChange={(value) => handleInputChange('countryRegion', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country/region" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES_REGIONS.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="yearBuilt">Year Built</Label>
          <Input
            id="yearBuilt"
            placeholder="e.g. 2005"
            value={formData.yearBuilt}
            onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="Enter property address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="floorArea">Floor Area (m²)</Label>
          <Input
            id="floorArea"
            placeholder="e.g. 5000"
            value={formData.floorArea}
            onChange={(e) => handleInputChange('floorArea', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="occupancyRate">Occupancy Rate (%): {formData.occupancyRate}%</Label>
          <div className="mt-2">
            <input
              type="range"
              id="occupancyRate"
              min="0"
              max="100"
              value={formData.occupancyRate}
              onChange={(e) => handleInputChange('occupancyRate', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegulatoryAndCertifications = () => (
    <div className="space-y-6">
      {/* US Regulations */}
      <div>
        <Label className="text-base font-semibold text-gray-900">US Regulations</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {US_REGULATIONS.map(regulation => (
            <button
              key={regulation}
              onClick={() => handleMultiSelect('usRegulations', regulation)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors font-medium ${
                formData.usRegulations.includes(regulation)
                  ? regulation === 'LEED' 
                    ? 'bg-black text-white border-black'
                    : 'bg-gray-800 text-white border-gray-800'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {regulation}
            </button>
          ))}
        </div>
      </div>

      {/* EU Regulations */}
      <div>
        <Label className="text-base font-semibold text-gray-900">EU Regulations</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
          {EU_REGULATIONS.map(regulation => (
            <button
              key={regulation}
              onClick={() => handleMultiSelect('euRegulations', regulation)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors font-medium ${
                formData.euRegulations.includes(regulation)
                  ? regulation === 'CSRD/ESRS' 
                    ? 'bg-black text-white border-black'
                    : 'bg-gray-800 text-white border-gray-800'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {regulation}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <Label className="text-base font-semibold text-gray-900">Certifications</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
          {CERTIFICATIONS.map(cert => (
            <button
              key={cert}
              onClick={() => handleMultiSelect('certifications', cert)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors font-medium ${
                formData.certifications.includes(cert)
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div>
        <Label htmlFor="complianceStatus" className="text-base font-semibold text-gray-900">Compliance Status</Label>
        <Select value={formData.complianceStatus} onValueChange={(value) => handleInputChange('complianceStatus', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select compliance status" />
          </SelectTrigger>
          <SelectContent>
            {COMPLIANCE_STATUS_OPTIONS.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderEnergyAndEmissions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="energyConsumption">Annual Energy Consumption (kWh)</Label>
          <Input
            id="energyConsumption"
            placeholder="e.g. 500000"
            value={formData.energyConsumption}
            onChange={(e) => handleInputChange('energyConsumption', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="carbonFootprint">Carbon Footprint (tCO2e/year)</Label>
          <Input
            id="carbonFootprint"
            placeholder="e.g. 250"
            value={formData.carbonFootprint}
            onChange={(e) => handleInputChange('carbonFootprint', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="renewableEnergy">Renewable Energy (%)</Label>
        <Input
          id="renewableEnergy"
          placeholder="e.g. 25%"
          value={formData.renewableEnergy}
          onChange={(e) => handleInputChange('renewableEnergy', e.target.value)}
        />
      </div>

      <div>
        <Label>Primary Emission Sources</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {EMISSION_SOURCES.map(source => (
            <button
              key={source}
              onClick={() => handleMultiSelect('emissionSources', source)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                formData.emissionSources.includes(source)
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBuildingSystems = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hvacSystem">HVAC System</Label>
          <Select value={formData.hvacSystem} onValueChange={(value) => handleInputChange('hvacSystem', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select HVAC system" />
            </SelectTrigger>
            <SelectContent>
              {HVAC_SYSTEMS.map(system => (
                <SelectItem key={system} value={system}>{system}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lightingSystem">Lighting System</Label>
          <Select value={formData.lightingSystem} onValueChange={(value) => handleInputChange('lightingSystem', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select lighting system" />
            </SelectTrigger>
            <SelectContent>
              {LIGHTING_SYSTEMS.map(system => (
                <SelectItem key={system} value={system}>{system}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="waterManagement">Water Management</Label>
          <Select value={formData.waterManagement} onValueChange={(value) => handleInputChange('waterManagement', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select water management" />
            </SelectTrigger>
            <SelectContent>
              {WATER_MANAGEMENT.map(system => (
                <SelectItem key={system} value={system}>{system}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="wasteManagement">Waste Management</Label>
          <Select value={formData.wasteManagement} onValueChange={(value) => handleInputChange('wasteManagement', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select waste management" />
            </SelectTrigger>
            <SelectContent>
              {WASTE_MANAGEMENT.map(system => (
                <SelectItem key={system} value={system}>{system}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderFinancialsAndDisclosure = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="annualEnergyBudget">Annual Energy Budget ($)</Label>
          <Input
            id="annualEnergyBudget"
            placeholder="e.g. 150000"
            value={formData.annualEnergyBudget}
            onChange={(e) => handleInputChange('annualEnergyBudget', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sustainabilityBudget">Sustainability Budget ($)</Label>
          <Input
            id="sustainabilityBudget"
            placeholder="e.g. 50000"
            value={formData.sustainabilityBudget}
            onChange={(e) => handleInputChange('sustainabilityBudget', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reportingFrequency">Reporting Frequency</Label>
        <Select value={formData.reportingFrequency} onValueChange={(value) => handleInputChange('reportingFrequency', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select reporting frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annually">Annually</SelectItem>
            <SelectItem value="as-needed">As Needed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Disclosure Requirements</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {DISCLOSURE_REQUIREMENTS.map(req => (
            <button
              key={req}
              onClick={() => handleMultiSelect('disclosureRequirements', req)}
              className={`p-2 text-sm rounded-md border transition-colors text-left ${
                formData.disclosureRequirements.includes(req)
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {req}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPropertyIdentification();
      case 1:
        return renderRegulatoryAndCertifications();
      case 2:
        return renderEnergyAndEmissions();
      case 3:
        return renderBuildingSystems();
      case 4:
        return renderFinancialsAndDisclosure();
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Dashboard view for existing intake
  if (viewMode === 'dashboard' && existingIntake) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button
            onClick={backToDashboard}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-[#00792b] hover:bg-[#00792b]/10 p-2 -ml-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Real Estate Intake Form</h2>
              <p className="text-gray-600">Your property information has been submitted</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
              <span className="text-green-600 font-medium">Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map((step, index) => (
              <Card key={step.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <step.icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => editSection(index)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-[#00792b]"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={retakeIntake}
              variant="outline"
              className="border-[#00792b] text-[#00792b] hover:bg-[#00792b] hover:text-white"
            >
              Retake Intake Form
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Completion state
  if (isCompleted && !editingSection) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-6">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Intake Form Submitted!</h2>
            <p className="text-gray-600">
              Thank you for providing your property information. Your data has been saved successfully.
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={backToDashboard}
              className="bg-[#00792b] hover:bg-[#00792b]/90 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Real Estate Sustainability & Compliance Intake Form
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Help us capture your property details to assess compliance, retrofit opportunities, and financing readiness.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Icons */}
      <div className="flex justify-center space-x-4 mb-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep || isStepComplete(index);
          
          return (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              <div className={`p-3 rounded-full border-2 transition-colors ${
                isActive 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isCompleted 
                    ? 'bg-green-100 border-green-200 text-green-600'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${
                  isActive ? 'text-green-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Form Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            {React.createElement(currentStepData.icon, { 
              className: "w-6 h-6 text-green-600" 
            })}
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{currentStepData.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Error Display */}
      {submitError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="text-sm text-gray-500">
          Step {currentStep + 1} of {STEPS.length}
        </div>

        {currentStep === STEPS.length - 1 ? (
          <Button
            onClick={handleFinalSubmit}
            disabled={!canProceedToNext() || isSubmitting}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Form</span>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext()}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Selected Items Summary */}
      {(formData.usRegulations.length > 0 || 
        formData.euRegulations.length > 0 || 
        formData.certifications.length > 0 ||
        formData.sustainabilityGoals.length > 0 ||
        formData.emissionSources.length > 0 ||
        formData.disclosureRequirements.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Current Selections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.usRegulations.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700">US Regulations:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.usRegulations.map(regulation => (
                    <Badge key={regulation} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      {regulation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {formData.euRegulations.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700">EU Regulations:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.euRegulations.map(regulation => (
                    <Badge key={regulation} variant="secondary" className="text-xs bg-green-100 text-green-700">
                      {regulation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {formData.certifications.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Certifications:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.certifications.map(cert => (
                    <Badge key={cert} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {formData.sustainabilityGoals.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Goals:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.sustainabilityGoals.map(goal => (
                    <Badge key={goal} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.emissionSources.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Emission Sources:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.emissionSources.map(source => (
                    <Badge key={source} variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.disclosureRequirements.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Disclosure:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.disclosureRequirements.map(req => (
                    <Badge key={req} variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 