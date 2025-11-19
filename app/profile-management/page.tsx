'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'
import { Eye, Edit, Lock, CheckCircle, Clock, AlertCircle, Save, X, ArrowLeft } from 'lucide-react'
import { Profile0CompanyCard } from '@/components/ui/profile0-company-card'
import { Profile0Company } from '@/lib/marketplace-utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SellerIntakeForm {
  id: string
  company_name: string
  year_founded: number
  public_region: string
  brief_description: string
  impact_metrics: any[]
  application_areas: string[]
  industry_regions: string[]
  optional_fields: any
}

interface ToolQuestionnaireData {
  toolName?: string
  toolDescription?: string
  toolCategory?: string
  technologies?: string[]
  inProduction?: boolean
  customerSupport?: string
  updateFrequency?: string
  useCases?: string[]
  companySize?: string
  companyExperience?: string
  openToCollaboration?: string
  likelyToRecommend?: string
  website?: string
  email?: string
  detailForm?: any
  [key: string]: any
}

interface Profile2Data extends SellerIntakeForm {
  toolData?: ToolQuestionnaireData | null
  documents?: any[]
}

export default function ProfileManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [contractSigned, setContractSigned] = useState(false)
  
  // Profile 0 data
  const [profile0Data, setProfile0Data] = useState<SellerIntakeForm | null>(null)
  const [profile0Company, setProfile0Company] = useState<Profile0Company | null>(null)
  const [editingProfile0, setEditingProfile0] = useState(false)
  const [profile0Form, setProfile0Form] = useState<Partial<SellerIntakeForm>>({})
  
  // Profile 1 data
  const [profile1Data, setProfile1Data] = useState<ToolQuestionnaireData | null>(null)
  const [editingProfile1, setEditingProfile1] = useState(false)
  const [profile1Form, setProfile1Form] = useState<Partial<ToolQuestionnaireData>>({})
  
  // Profile 2 data
  const [profile2Data, setProfile2Data] = useState<Profile2Data | null>(null)

  useEffect(() => {
    checkAccessAndLoadData()
  }, [])

  const checkAccessAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/login')
        return
      }

      // Check user role
      const { data: userData } = await supabase
        .from('seller_compound_data')
        .select('role')
        .eq('uuid', session.user.id)
        .single()

      if (userData?.role !== 'seller') {
        router.push('/dashboard')
        return
      }

      setUserRole(userData.role)

      // Check if contract is signed - check both contract_signatures table AND user_onboarding_progress
      console.log('🔍 Checking contract signing status...')
      
      // Method 1: Check contract_signatures table
      const { data: contractSignatureData, error: contractSignatureError } = await supabase
        .from('contract_signatures')
        .select('id, contract_type')
        .eq('user_uuid', session.user.id)
        .single()

      // Method 2: Check user_onboarding_progress for stage 2 (contract stage)
      const { data: contractStageData, error: contractStageError } = await supabase
        .from('user_onboarding_progress')
        .select('status')
        .eq('uuid', session.user.id)
        .eq('stage_id', 2)
        .single()

      const isContractSignedFromSignatures = !!contractSignatureData
      const isContractSignedFromProgress = contractStageData?.status === 'completed'
      const isContractSigned = isContractSignedFromSignatures || isContractSignedFromProgress

      console.log('Contract signed status check:', {
        fromSignatures: isContractSignedFromSignatures,
        fromProgress: isContractSignedFromProgress,
        finalStatus: isContractSigned,
        signatureData: contractSignatureData,
        stageData: contractStageData
      })
      
      setContractSigned(isContractSigned)

      // Load all profile data
      await Promise.all([
        loadProfile0Data(session.user.id),
        loadProfile1Data(session.user.id)
      ])
      
      // Load Profile 2 data if contract is signed
      if (isContractSigned) {
        await loadProfile2Data(session.user.id)
      }

    } catch (error) {
      console.error('Error checking access:', error)
      toast.error('Error loading profile data')
    } finally {
      setLoading(false)
    }
  }

  const loadProfile0Data = async (userUuid: string) => {
    try {
      const { data, error } = await supabase
        .from('seller_intake_form')
        .select('*')
        .eq('uuid', userUuid)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Profile 0:', error)
        return
      }

      if (data) {
        setProfile0Data(data)
        setProfile0Form(data)
        
        // Convert to Profile0Company format for preview
        const companyData: Profile0Company = {
          id: data.id,
          company_name: data.company_name,
          year_founded: data.year_founded,
          public_region: data.public_region,
          brief_description: data.brief_description,
          application_areas: data.application_areas || [],
          industry_regions: data.industry_regions || [],
          generic_image: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%2300792b' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }
        setProfile0Company(companyData)
      }
    } catch (error) {
      console.error('Error loading Profile 0:', error)
    }
  }

  const loadProfile1Data = async (userUuid: string) => {
    try {
      const { data, error } = await supabase
        .from('seller_compound_data')
        .select('data')
        .eq('uuid', userUuid)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Profile 1:', error)
        return
      }

      if (data?.data) {
        console.log('Raw questionnaire data:', data.data) // Debug log
        
        // Extract data from DetailForm fields (common in questionnaires)
        const detailFormData = data.data.detailForm || {}
        
        // Map actual questionnaire field names to Profile 1 format
        const toolData: ToolQuestionnaireData = {
          // Company information from DetailForm
          toolName: detailFormData.companyName || data.data.companyName || 
                   detailFormData.productName || data.data.productName || 
                   detailFormData.solutionName || data.data.solutionName || '',
          
          // Tool description from various sources
          toolDescription: detailFormData.description || data.data.description || 
                          detailFormData.companyDescription || data.data.companyDescription ||
                          detailFormData.productDescription || data.data.productDescription || '',
          
          // Category from questionnaire responses
          toolCategory: data.data.focusIndustry || data.data.techOfferings?.[0] || 
                       data.data.companyExperience || data.data.operatingLength || '',
          
          // Technologies from multi-selection questions
          technologies: data.data.techOfferings || data.data.primaryOfferings || 
                       data.data.solutions || data.data.services || [],
          
          // Production status from various boolean fields
          inProduction: data.data.inProduction || data.data.isLive || 
                       data.data.operatingLength === '5+ years' || 
                       data.data.companyExperience === 'Over five years' || false,
          
          // Customer support from service-related fields
          customerSupport: data.data.supportLevel || data.data.customerService || 
                          data.data.clientSupport || data.data.serviceLevel || '',
          
          // Update frequency from operational questions
          updateFrequency: data.data.updateFrequency || data.data.maintenanceSchedule || 
                          data.data.releaseSchedule || data.data.serviceFrequency || '',
          
          // Use cases from application areas
          useCases: data.data.applicationAreas || data.data.useCases || 
                   data.data.industries || data.data.sectors || [],
          
          // Additional company details
          companySize: data.data.companySize || '',
          companyExperience: data.data.companyExperience || data.data.operatingLength || '',
          openToCollaboration: data.data.openToCollaboration || '',
          likelyToRecommend: data.data.likelyToRecommend || '',
          
          // Website and contact info from DetailForm
          website: detailFormData.companyWebsite || detailFormData.website || 
                  data.data.companyWebsite || data.data.website || '',
          email: detailFormData.companyEmail || detailFormData.email || 
                data.data.companyEmail || data.data.email || '',
          
          // Include all original data for complete context
          ...data.data,
          ...(detailFormData && { detailForm: detailFormData })
        }
        
        console.log('Processed Profile 1 data:', toolData) // Debug log
        setProfile1Data(toolData)
        setProfile1Form(toolData)
      }
    } catch (error) {
      console.error('Error loading Profile 1:', error)
    }
  }

  const loadProfile2Data = async (userUuid: string) => {
    try {
      console.log('Loading Profile 2 data...')
      
      // Wait a bit to ensure Profile 0 and Profile 1 data are loaded
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the latest Profile 0 data if not already loaded
      let currentProfile0Data = profile0Data
      if (!currentProfile0Data) {
        const { data } = await supabase
          .from('seller_intake_form')
          .select('*')
          .eq('uuid', userUuid)
          .single()
        currentProfile0Data = data
      }

      // Get the latest Profile 1 data if not already loaded  
      let currentProfile1Data = profile1Data
      if (!currentProfile1Data) {
        const { data } = await supabase
          .from('seller_compound_data')
          .select('data')
          .eq('uuid', userUuid)
          .single()
        currentProfile1Data = data?.data
      }

      // Combine all data for Profile 2
      if (currentProfile0Data) {
        const profile2: Profile2Data = {
          ...currentProfile0Data,
          toolData: currentProfile1Data,
          documents: [] // TODO: Load document data if needed
        }
        
        console.log('Profile 2 data loaded:', profile2)
        setProfile2Data(profile2)
      }
    } catch (error) {
      console.error('Error loading Profile 2:', error)
    }
  }

  const saveProfile0Changes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase
        .from('seller_intake_form')
        .upsert({
          ...profile0Form,
          uuid: session.user.id,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Profile 0 updated successfully!')
      setEditingProfile0(false)
      await loadProfile0Data(session.user.id)
    } catch (error) {
      console.error('Error saving Profile 0:', error)
      toast.error('Failed to save changes')
    }
  }

  const saveProfile1Changes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      // Get existing data first
      const { data: existingData } = await supabase
        .from('seller_compound_data')
        .select('data')
        .eq('uuid', session.user.id)
        .single()

      const mergedData = { ...existingData?.data, ...profile1Form }

      const { error } = await supabase
        .from('seller_compound_data')
        .upsert({
          uuid: session.user.id,
          data: mergedData
        })

      if (error) throw error

      toast.success('Profile 1 updated successfully!')
      setEditingProfile1(false)
      await loadProfile1Data(session.user.id)
    } catch (error) {
      console.error('Error saving Profile 1:', error)
      toast.error('Failed to save changes')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-[#00792b] font-altone">Profile Management</h1>
        <p className="text-gray-600">Manage and preview your different profile levels</p>
      </div>

      <Tabs defaultValue="profile0" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile0" className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${profile0Data ? 'text-green-500' : 'text-gray-400'}`} />
            Profile 0
          </TabsTrigger>
          <TabsTrigger value="profile1" className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${profile1Data ? 'text-green-500' : 'text-gray-400'}`} />
            Profile 1
          </TabsTrigger>
          <TabsTrigger value="profile2" className="flex items-center gap-2">
            {contractSigned ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-gray-400" />
            )}
            Profile 2
          </TabsTrigger>
        </TabsList>

        {/* Profile 0 Tab */}
        <TabsContent value="profile0" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Profile 0 - Basic Information
                    {profile0Data && <Badge className="bg-green-100 text-green-800">Active</Badge>}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Basic company information visible on the marketplace
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/preview/marketplace')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  {profile0Data && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProfile0(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profile0Data ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Profile 0 Details */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Company Name</Label>
                      <p className="text-sm text-gray-900">{profile0Data.company_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Year Founded</Label>
                        <p className="text-sm text-gray-900">{profile0Data.year_founded}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Region</Label>
                        <p className="text-sm text-gray-900">{profile0Data.public_region}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <p className="text-sm text-gray-900">{profile0Data.brief_description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Application Areas</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile0Data.application_areas?.map((area, index) => (
                          <Badge key={index} variant="secondary">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile 0 Preview */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Marketplace Preview</Label>
                    {profile0Company && (
                      <Profile0CompanyCard 
                        company={profile0Company}
                        userProfile={profile0Company}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Profile 0 not completed yet</p>
                  <Button onClick={() => router.push('/dashboard')}>
                    Complete Intake Form
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile 1 Tab */}
        <TabsContent value="profile1" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Profile 1 - Climate Tech Tool
                    {profile1Data && <Badge className="bg-blue-100 text-blue-800">Active</Badge>}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Detailed information about your climate tech solution
                  </p>
                </div>
                {profile1Data && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProfile1(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {profile1Data ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Tool/Company Name</Label>
                      <p className="text-sm text-gray-900">{profile1Data.toolName || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Category/Focus</Label>
                      <p className="text-sm text-gray-900">{profile1Data.toolCategory || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {profile1Data.toolDescription && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <p className="text-sm text-gray-900">{profile1Data.toolDescription}</p>
                    </div>
                  )}

                  {profile1Data.technologies && profile1Data.technologies.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Technologies/Offerings</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile1Data.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Company Size</Label>
                      <p className="text-sm text-gray-900">{profile1Data.companySize || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Experience</Label>
                      <p className="text-sm text-gray-900">{profile1Data.companyExperience || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">In Production</Label>
                      <p className="text-sm text-gray-900">
                        {profile1Data.inProduction ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Open to Collaboration</Label>
                      <p className="text-sm text-gray-900">{profile1Data.openToCollaboration || 'Not specified'}</p>
                    </div>
                  </div>

                  {profile1Data.website && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Website</Label>
                      <p className="text-sm text-gray-900">
                        <a href={profile1Data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile1Data.website}
                        </a>
                      </p>
                    </div>
                  )}

                  {profile1Data.likelyToRecommend && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Recommendation Score</Label>
                      <p className="text-sm text-gray-900">{profile1Data.likelyToRecommend}/5</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Profile 1 not completed yet</p>
                  <Button onClick={() => router.push('/dashboard')}>
                    Complete Tool Questionnaire
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile 2 Tab */}
        <TabsContent value="profile2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Profile 2 - Comprehensive Profile
                {contractSigned ? (
                  <Badge className="bg-green-100 text-green-800">Unlocked</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600">Locked</Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Complete profile with all information (unlocked after contract signing)
              </p>
            </CardHeader>
            <CardContent>
              {contractSigned ? (
                <div className="space-y-8">
                  {/* Company Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Company Name</Label>
                        <p className="text-sm text-gray-900">{profile0Data?.company_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Year Founded</Label>
                        <p className="text-sm text-gray-900">{profile0Data?.year_founded}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Region</Label>
                        <p className="text-sm text-gray-900">{profile0Data?.public_region}</p>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="text-sm text-gray-900">{profile0Data?.brief_description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tool Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Climate Tech Tool</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Tool Name</Label>
                        <p className="text-sm text-gray-900">{profile1Data?.toolName || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Category</Label>
                        <p className="text-sm text-gray-900">{profile1Data?.toolCategory || 'Not specified'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Tool Description</Label>
                        <p className="text-sm text-gray-900">{profile1Data?.toolDescription || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Additional Details</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Application Areas</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile0Data?.application_areas?.map((area, index) => (
                            <Badge key={index} variant="secondary">{area}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Technologies</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile1Data?.technologies?.map((tech, index) => (
                            <Badge key={index} variant="outline">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile 2 Locked</h3>
                  <p className="text-gray-600 mb-6">
                    Complete your contract signing to unlock your comprehensive profile
                  </p>
                  <Button onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile 0 Edit Modal */}
      <Dialog open={editingProfile0} onOpenChange={setEditingProfile0}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile 0</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={profile0Form.company_name || ''}
                onChange={(e) => setProfile0Form({...profile0Form, company_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year_founded">Year Founded</Label>
                <Input
                  id="year_founded"
                  type="number"
                  value={profile0Form.year_founded || ''}
                  onChange={(e) => setProfile0Form({...profile0Form, year_founded: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="public_region">Region</Label>
                <Input
                  id="public_region"
                  value={profile0Form.public_region || ''}
                  onChange={(e) => setProfile0Form({...profile0Form, public_region: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="brief_description">Description</Label>
              <Textarea
                id="brief_description"
                value={profile0Form.brief_description || ''}
                onChange={(e) => setProfile0Form({...profile0Form, brief_description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={saveProfile0Changes} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingProfile0(false)}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile 1 Edit Modal */}
      <Dialog open={editingProfile1} onOpenChange={setEditingProfile1}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile 1</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="toolName">Tool Name</Label>
              <Input
                id="toolName"
                value={profile1Form.toolName || ''}
                onChange={(e) => setProfile1Form({...profile1Form, toolName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="toolCategory">Category</Label>
              <Input
                id="toolCategory"
                value={profile1Form.toolCategory || ''}
                onChange={(e) => setProfile1Form({...profile1Form, toolCategory: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="toolDescription">Tool Description</Label>
              <Textarea
                id="toolDescription"
                value={profile1Form.toolDescription || ''}
                onChange={(e) => setProfile1Form({...profile1Form, toolDescription: e.target.value})}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="customerSupport">Customer Support</Label>
              <Input
                id="customerSupport"
                value={profile1Form.customerSupport || ''}
                onChange={(e) => setProfile1Form({...profile1Form, customerSupport: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={saveProfile1Changes} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingProfile1(false)}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
