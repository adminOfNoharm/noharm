"use client"
import { BellIcon, CalendarIcon, MessageCircleIcon, SearchIcon, Settings2Icon, UserIcon, TrendingUpIcon, DollarSignIcon, TargetIcon, HomeIcon, BarChart3Icon, TrendingDownIcon, UsersIcon, ActivityIcon, LightbulbIcon, BookmarkIcon, ShoppingCartIcon, FileTextIcon, HelpCircleIcon, ChevronRightIcon, MenuIcon, XIcon, BuildingIcon, CheckIcon, GripVerticalIcon, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import CalendlyBookingModal from "@/components/modals/CalendlyBookingModal"
import ContractModal from "@/components/onboarding/ContractModal"
import SellerIntakeForm from "@/components/forms/SellerIntakeForm"
import { toast } from "@/components/ui/toast"
import { LogOut } from 'lucide-react' //For Sign out button
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "600", "800"], // Light, SemiBold & Bold
});

interface UserData {
  firstName?: string
  lastName?: string
  companyName?: string
  title?: string
  email?: string
}

interface UserToolProfile {
  id: string
  name: string
  data: any
  password: string
  type: 'seller' | 'buyer' | 'ally'
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData>({})
  const [calendlyModalOpen, setCalendlyModalOpen] = useState(false)
  const [needsIdentifierCompleted, setNeedsIdentifierCompleted] = useState<boolean | null>(null)
  const [needsIdentifierData, setNeedsIdentifierData] = useState<any>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userToolProfile, setUserToolProfile] = useState<UserToolProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [showIntakeFormModal, setShowIntakeFormModal] = useState(false)
  const [contractStageStatus, setContractStageStatus] = useState<string>('not_started')
  const [paymentStageStatus, setPaymentStageStatus] = useState<string>('not_started')
  const [intakeFormStatus, setIntakeFormStatus] = useState<string>('not_started')
  const [toolQuestionnaireStatus, setToolQuestionnaireStatus] = useState<string>('not_started')
  const [documentInputStatus, setDocumentInputStatus] = useState<string>('not_started')
  const [profile, setProfile] = useState<any>(null)
  const [pendingStageAction, setPendingStageAction] = useState<{
    stageName: string;
    route: string;
    type: 'regular' | 'payment' | 'contract';
    isEditing?: boolean;
    stageId?: number;
  } | null>(null)
  const router = useRouter()

  // Function to check if user has completed real estate intake form (for buyers)
  const checkIntakeFormStatus = async (userUuid: string) => {
    try {
      console.log('🔍 Checking real estate intake form status...')
      
      // Check if user has completed the intake form
      const { data: intakeData, error: intakeError } = await supabase
        .from('real_estate_intake')
        .select('*')
        .eq('uuid', userUuid)
        .single()

      if (intakeError) {
        if (intakeError.code === 'PGRST116') {
          console.log('ℹ️ No intake form found')
          return false
        }
        console.error('Error checking intake form:', intakeError)
        return false
      }

      if (intakeData) {
        console.log('✅ Intake form found and completed')
        return true
      }

      return false
    } catch (error) {
      console.error('Error in checkIntakeFormStatus:', error)
      return false
    }
  }

  // Function to check if seller has completed intake form
  const checkSellerIntakeFormStatus = async (userUuid: string) => {
    try {
      console.log('🔍 Checking seller intake form status...')
      
      // Check if user has completed the seller intake form
      const { data: intakeData, error: intakeError } = await supabase
        .from('seller_intake_form')
        .select('*')
        .eq('uuid', userUuid)
        .single()

      if (intakeError) {
        if (intakeError.code === 'PGRST116') {
          console.log('ℹ️ No seller intake form found')
          return false
        }
        console.error('Error checking seller intake form:', intakeError)
        return false
      }

      if (intakeData) {
        console.log('✅ Seller intake form found and completed')
        return true
      }

      return false
    } catch (error) {
      console.error('Error in checkSellerIntakeFormStatus:', error)
      return false
    }
  }

  // Function to check if user has actually signed a contract
  const checkContractSigningStatus = async (userUuid: string) => {
    try {
      console.log('🔍 Checking contract signing status from contract_signatures table...')
      
      // Check if user has signed a contract by looking at contract_signatures table
      const { data: signatureData, error: signatureError } = await supabase
        .from('contract_signatures')
        .select('*')
        .eq('user_uuid', userUuid)
        .eq('contract_type', 'buyer')
        .single()

      if (signatureError) {
        if (signatureError.code === 'PGRST116') {
          console.log('ℹ️ No contract signature found')
          return false
        }
        console.error('Error checking contract signatures:', signatureError)
        return false
      }

      if (signatureData) {
        console.log('✅ Contract signature found:', signatureData)
        return true
      }

      return false
    } catch (error) {
      console.error('Error in checkContractSigningStatus:', error)
      return false
    }
  }

  // Function to refresh seller stage statuses
  const refreshSellerStageStatuses = async (userUuid: string) => {
    try {
      console.log('🔍 Fetching seller-specific stage statuses for user:', userUuid)
      
      // Fetch Stage 4 (Tool Questionnaire) status - check both user_onboarding_progress and seller_compound_data
      const { data: toolData, error: toolError } = await supabase
        .from('user_onboarding_progress')
        .select('status')
        .eq('uuid', userUuid)
        .eq('stage_id', 4)
        .single()

      // Also check if there's data in seller_compound_data as a backup
      const { data: compoundData, error: compoundError } = await supabase
        .from('seller_compound_data')
        .select('data')
        .eq('uuid', userUuid)
        .single()
      
      // If we have tool questionnaire data in seller_compound_data, consider it completed
      const hasCompoundData = compoundData?.data && Object.keys(compoundData.data).length > 0
      
      if (toolError && toolError.code === 'PGRST116') {
        // No record found in user_onboarding_progress
        if (hasCompoundData) {
          console.log('✅ Tool questionnaire completed (found in seller_compound_data)')
          setToolQuestionnaireStatus('completed')
        } else {
          console.log('ℹ️ No tool questionnaire data found, defaulting to not_started')
          setToolQuestionnaireStatus('not_started')
        }
      } else if (toolError) {
        console.error('Error checking tool questionnaire status:', toolError)
        setToolQuestionnaireStatus('not_started')
      } else {
        console.log('✅ Tool questionnaire stage status:', toolData.status)
        // If status is not_started but we have compound data, override to completed
        if (toolData.status === 'not_started' && hasCompoundData) {
          console.log('✅ Overriding status to completed based on seller_compound_data')
          setToolQuestionnaireStatus('completed')
        } else {
          setToolQuestionnaireStatus(toolData.status || 'not_started')
        }
      }

      // Fetch Stage 5 (Document Input) status  
      const { data: docData, error: docError } = await supabase
        .from('user_onboarding_progress')
        .select('status')
        .eq('uuid', userUuid)
        .eq('stage_id', 5)
        .single()
      
      if (docError) {
        console.log('ℹ️ No document input stage record found, defaulting to not_started')
        setDocumentInputStatus('not_started')
      } else {
        console.log('✅ Document input stage status:', docData.status)
        setDocumentInputStatus(docData.status || 'not_started')
      }

      // Fetch Stage 2 (Contract) status
      const { data: contractData, error: contractError } = await supabase
        .from('user_onboarding_progress')
        .select('status')
        .eq('uuid', userUuid)
        .eq('stage_id', 2)
        .single()
      
      if (contractError) {
        console.log('ℹ️ No contract stage record found, defaulting to not_started')
        setContractStageStatus('not_started')
      } else {
        console.log('✅ Contract stage status:', contractData.status)
        setContractStageStatus(contractData.status || 'not_started')
      }

      // Fetch Stage 3 (Payment) status
      const { data: paymentData, error: paymentError } = await supabase
        .from('user_onboarding_progress')
        .select('status')
        .eq('uuid', userUuid)
        .eq('stage_id', 3)
        .single()
      
      if (paymentError) {
        console.log('ℹ️ No payment stage record found, defaulting to not_started')
        setPaymentStageStatus('not_started')
      } else {
        console.log('✅ Payment stage status:', paymentData.status)
        setPaymentStageStatus(paymentData.status || 'not_started')
      }

      // Check seller intake form status
      const isSellerIntakeCompleted = await checkSellerIntakeFormStatus(userUuid)
      console.log('✅ Seller intake form status:', isSellerIntakeCompleted ? 'completed' : 'not_started')
      setIntakeFormStatus(isSellerIntakeCompleted ? 'completed' : 'not_started')

      // Fetch user profile data for trial mode check
      const { data: profileData, error: profileError } = await supabase
        .from('seller_compound_data')
        .select('is_trial_enabled')
        .eq('uuid', userUuid)
        .single()
      
      if (!profileError && profileData) {
        setProfile(profileData)
      }

      console.log('📊 Current stage statuses:', {
        toolQuestionnaireStatus,
        documentInputStatus,
        contractStageStatus,
        paymentStageStatus,
        profile: profileData
      })
      
    } catch (error) {
      console.error('Error fetching seller stage statuses:', error)
    }
  }

  // Function to refresh buyer stage statuses from database
  const refreshBuyerStageStatuses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      console.log('🔄 Refreshing buyer stage statuses from database...')

      // Check contract signing status from contract_signatures table
      const isContractSigned = await checkContractSigningStatus(session.user.id)
      if (isContractSigned) {
        console.log('✅ Contract is signed (from contract_signatures table)')
        setContractStageStatus('completed')
      } else {
        console.log('ℹ️ Contract not signed yet')
        setContractStageStatus('not_started')
      }

      // Fetch Stage 3 (Payment) status from user_onboarding_progress
      const { data: paymentData, error: paymentError } = await supabase
        .from('user_onboarding_progress')
        .select('status')
        .eq('uuid', session.user.id)
        .eq('stage_id', 3)
        .single()

      if (!paymentError && paymentData) {
        console.log('✅ Refreshed payment status:', paymentData.status)
        setPaymentStageStatus(paymentData.status)
      } else {
        console.log('ℹ️ No payment record found, defaulting to not_started')
        setPaymentStageStatus('not_started')
      }

      // Check intake form status
      const isIntakeCompleted = await checkIntakeFormStatus(session.user.id)
      if (isIntakeCompleted) {
        console.log('✅ Intake form is completed')
        setIntakeFormStatus('completed')
      } else {
        console.log('ℹ️ Intake form not completed yet')
        setIntakeFormStatus('not_started')
      }
    } catch (error) {
      console.error('Error refreshing buyer stage statuses:', error)
    }
  }

  // Handle contract acceptance - replicated from onboarding dashboard
  const handleContractAccept = async () => {
    setShowContractModal(false);
    
    if (pendingStageAction && pendingStageAction.stageId) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return
        
        // Find the contract stage ID
        const contractStageId = pendingStageAction.stageId;
        
        // Mark the contract stage as completed
        await supabase
          .from('user_onboarding_progress')
          .upsert({
            uuid: session.user.id,
            stage_id: contractStageId,
            status: 'completed'
          }, {
            onConflict: 'uuid,stage_id'
          });
        
        // Refresh seller stage statuses to update UI
        await refreshSellerStageStatuses(session.user.id)
        
        console.log('✅ Contract stage marked as completed')
        toast.success('Contract signed successfully!')
        
      } catch (error) {
        console.error('Error completing contract stage:', error)
        toast.error('Error completing contract stage')
      }
      
      // Reset pending action
      setPendingStageAction(null);
    }
  };

  // Handle contract signing click
  const handleContractClick = async () => {
    setShowContractModal(true);
    setPendingStageAction({
      stageName: 'contract_sign',
      route: '#',
      type: 'contract',
      stageId: 2 // Contract stage ID
    });
  };

  // Handle payment link click with trial mode support
  const handlePaymentClick = () => {
    const isTrialMode = profile?.is_trial_enabled;
    const paymentLink = isTrialMode 
      ? 'https://buy.stripe.com/bJe3cv1tO1FF5IycjP9sk09'
      : 'https://buy.stripe.com/00w8wP3BW6ZZef44Rn9sk06';
    
    window.open(paymentLink, '_blank');
  };

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.replace('/login')
          return
        }

        // Get user profile data
        const { data: profile, error: profileError } = await supabase
          .from('seller_compound_data')
          .select('role, data')
          .eq('uuid', session.user.id)
          .single()

        if (profileError || !profile?.role) {
          router.replace('/login')
          return
        }

        setUserRole(profile.role)

        // Extract user data from profile
        const profileData = profile.data || {}
        const detailForm = profileData.detailForm || {}
        
        setUserData({
          firstName: detailForm.firstName || '',
          lastName: detailForm.lastName || '',
          companyName: detailForm.companyName || '',
          title: detailForm.title || '',
          email: session.user.email || ''
        })

        // Check if needs identifier is completed
        const { data: needsIdentifier } = await supabase
          .from('user_needs_assessment')
          .select('*')
          .eq('uuid', session.user.id)
          .single()

        // If we have any data in the needs assessment table, it means it's completed
        const isCompleted = needsIdentifier !== null
        console.log('Needs Assessment Status:', needsIdentifier, 'Is Completed:', isCompleted)
        setNeedsIdentifierCompleted(isCompleted)
        setNeedsIdentifierData(needsIdentifier)

        // Check onboarding completion based on user role
        const { data: onboardingStages } = await supabase
          .from('user_onboarding_progress')
          .select('stage_id, status')
          .eq('uuid', session.user.id)

        if (!onboardingStages || onboardingStages.length === 0) {
          // No onboarding progress, redirect to onboarding
          router.replace('/onboarding/dashboard')
          return
        }

        // For buyers: only need Stage 1 (KYC) completed to access dashboard
        if (profile.role === 'buyer') {
          const stage1 = onboardingStages.find(stage => stage.stage_id === 1)
          if (!stage1 || stage1.status !== 'completed') {
            // Stage 1 (KYC) not completed, redirect to onboarding
            router.replace('/onboarding/dashboard')
            return
          }
          console.log('Buyer has completed Stage 1 (KYC), allowing dashboard access')
        } else if (profile.role === 'seller') {
          // For sellers: only need Stage 1 (KYC/Get to know you) completed to access dashboard
          const stage1 = onboardingStages.find(stage => stage.stage_id === 1)
          if (!stage1 || stage1.status !== 'completed') {
            // Stage 1 (KYC) not completed, redirect to onboarding
            router.replace('/onboarding/dashboard')
            return
          }
          console.log('Seller has completed Stage 1 (Get to know you), allowing dashboard access')
        } else {
          // For allies: require all stages completed (original logic)
        const allStagesCompleted = onboardingStages.every(stage => stage.status === 'completed')
        
        if (!allStagesCompleted) {
          // Not all stages completed, redirect to onboarding
          router.replace('/onboarding/dashboard')
          return
          }
        }

        // Fetch user's tool profile if it exists  
        await fetchUserToolProfile(session)

        // For buyers, fetch contract and payment stage statuses
        if (profile.role === 'buyer') {
          console.log('🔍 Fetching buyer-specific stage statuses...')
          
          // Check contract signing status from contract_signatures table
          const isContractSigned = await checkContractSigningStatus(session.user.id)
          if (isContractSigned) {
            console.log('✅ Contract is signed (from contract_signatures table)')
            setContractStageStatus('completed')
          } else {
            console.log('ℹ️ Contract not signed yet')
            setContractStageStatus('not_started')
          }

          // Fetch Stage 3 (Payment) status from user_onboarding_progress
          const { data: paymentData, error: paymentError } = await supabase
            .from('user_onboarding_progress')
            .select('status')
            .eq('uuid', session.user.id)
            .eq('stage_id', 3)
            .single()
          
          if (paymentError) {
            console.log('ℹ️ No payment stage record found, defaulting to not_started')
          } else {
            console.log('✅ Payment stage status from DB:', paymentData?.status)
          }
          
          setPaymentStageStatus(paymentData?.status || 'not_started')

          // Check intake form status
          const isIntakeCompleted = await checkIntakeFormStatus(session.user.id)
          if (isIntakeCompleted) {
            console.log('✅ Intake form is completed (initial load)')
            setIntakeFormStatus('completed')
          } else {
            console.log('ℹ️ Intake form not completed yet (initial load)')
            setIntakeFormStatus('not_started')
          }
        } else if (profile.role === 'seller') {
          // For sellers, fetch all stage statuses
          await refreshSellerStageStatuses(session.user.id)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        router.replace('/login')
      }
    }

    checkOnboardingStatus()
  }, [router])

  // Add window focus listener to refresh buyer stage statuses
  useEffect(() => {
    const handleFocus = () => {
      if (userRole === 'buyer') {
        console.log('🔄 Window focused, refreshing buyer stage statuses...')
        refreshBuyerStageStatuses()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [userRole])

  // Helper function to get user's full name
  const getUserFullName = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`
    }
    if (userData.firstName) return userData.firstName
    if (userData.lastName) return userData.lastName
    return 'User'
  }

  // Helper function to get user's initials
  const getUserInitials = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
    }
    if (userData.firstName) return userData.firstName.charAt(0)
    if (userData.email) return userData.email.charAt(0).toUpperCase()
    return 'U'
  }

  // Helper function to get company name
  const getCompanyName = () => {
    return userData.companyName || 'Your Company'
  }

  // Helper function to get user role badge
  const getUserRoleBadge = () => {
    if (userRole === 'seller') return 'Pro Seller'
    if (userRole === 'buyer') return 'Pro Buyer'
    return 'Pro User'
  }

  // Function to fetch user's tool profile if it exists
  const fetchUserToolProfile = async (session: any) => {
    if (!session?.user || !userRole) return

    try {
      setProfileLoading(true)
      
      // Direct lookup using user UUID association - clean, reliable approach
      const { data: profiles, error } = await supabase
        .from('tool_profiles')
        .select('*')
        .eq('type', userRole) // Match the user's role type

      if (error) {
        console.error('Error fetching tool profiles:', error)
        return
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found for role:', userRole)
        return
      }

      // Look for profile with direct user association
      const associatedProfile = profiles.find(profile => {
        return profile.data?.userAssociation?.user_uuid === session.user.id
      })

      if (associatedProfile) {
        console.log('Found associated profile for user:', associatedProfile.name)
        setUserToolProfile(associatedProfile)
      } else {
        console.log('No profile associated with user:', session.user.id)
      }
    } catch (error) {
      console.error('Error fetching user tool profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  // Add this helper function at the top with other helper functions
  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00792b]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white/80 backdrop-blur-xl overflow-hidden">
      {/* Global Spotlight Background */}
      <div className="dashboard-spotlight" />
      {/* Moving Hexagon Logo */}
      <div className="floating-logo">
        <img src="/images/logo.svg" alt="Logo Glow" />
      </div>
      <div className="floating-logo second">
      <img src="/images/logo.svg" alt="Logo Glow" />
    </div>
    <div className="floating-logo third">
      <img src="/images/logo.svg" alt="Logo Glow" />
    </div>

      {/* Calendly Booking Modal */}
      <CalendlyBookingModal 
        isOpen={calendlyModalOpen} 
        onClose={() => setCalendlyModalOpen(false)} 
      />

      {/* Contract Modal - Only for Buyers */}
      {userRole === 'buyer' && (
        <ContractModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          onAccept={async () => {
            try {
              console.log('🔄 Contract accepted, updating database...')
              const { data: { session } } = await supabase.auth.getSession()
              if (session?.user) {
                // Update user_onboarding_progress to mark stage 2 as completed
                const { error } = await supabase
                  .from('user_onboarding_progress')
                  .upsert({
                    uuid: session.user.id,
                    stage_id: 2,
                    status: 'completed',
                    last_updated_at: new Date().toISOString()
                  }, {
                    onConflict: 'uuid,stage_id'
                  })
                
                if (error) {
                  console.error('Database error updating onboarding progress:', error)
                  toast.error('Error updating contract status in database')
                  return
                }
                
                console.log('✅ Contract stage marked as completed in user_onboarding_progress')
                
                // Update UI state immediately
                setContractStageStatus('completed')
                setShowContractModal(false)
                toast.success('Contract signed successfully!')
                
                // Refresh status from database to ensure consistency
                setTimeout(() => {
                  refreshBuyerStageStatuses()
                }, 500)
              }
            } catch (error) {
              console.error('Error updating contract status:', error)
              toast.error('Error updating contract status')
            }
          }}
          userRole={userRole || 'buyer'}
        />
      )}

      {/* Beta Banner - Removing */} 
      {/*<div className="bg-gradient-to-r from-[#e6f2e6] to-[#d4f4d4] py-2.5 px-4 sm:px-6 text-center font-medium text-[#2e7d32] shadow-sm text-sm sm:text-base">
        🚀 Beta Preview – Share Your Feedback & Help Shape the Future of Climate Tech
      </div>*/}

      <div className="flex h-screen">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-[#4200fc] to-[#282828] shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:top-0 lg:h-full lg:z-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header with Notifications */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <Link href="/" className="flex items-center gap-3">
                  <div className="h-12 w-40 relative overflow-hidden">
                    <Image
                      src="/images/logos/new-logo.png"
                      alt="NoHarm Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
                
                <div className="flex items-center gap-2">
                  {/* Notifications Dropdown - Removing*/} 
                  {/*<div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative h-8 w-8 hover:bg-gray-100"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                    <BellIcon className="h-4 w-4 text-gray-600" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                    
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            <Badge variant="secondary" className="bg-red-500 text-white text-xs">3 new</Badge>
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          <div className="p-2 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#1105ff]/10 flex items-center justify-center flex-shrink-0">
                                <UsersIcon className="h-4 w-4 text-[#1105ff]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">New buyer match found</p>
                                <p className="text-xs text-gray-600 mt-0.5">Company XYZ is interested in your services</p>
                                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-2 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#00792b]/10 flex items-center justify-center flex-shrink-0">
                                <CalendarIcon className="h-4 w-4 text-[#00792b]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Meeting scheduled</p>
                                <p className="text-xs text-gray-600 mt-0.5">Strategy session with John Doe</p>
                                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-2 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#9b00ff]/10 flex items-center justify-center flex-shrink-0">
                                <TrendingUpIcon className="h-4 w-4 text-[#9b00ff]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">NoHarm Score updated</p>
                                <p className="text-xs text-gray-600 mt-0.5">Your score increased by 5 points</p>
                                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 border-t border-gray-200">
                          <Link href="/notifications" className="text-sm text-[#1105ff] font-medium hover:text-[#1105ff]/80 block text-center">
                            View all notifications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>*/}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                    className="h-8 w-8 lg:hidden"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* User Profile in Sidebar */}
              <div className="bg-[#ffffff] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt={getUserFullName()} />
                    <AvatarFallback className="bg-gradient-to-br from-[#282828] to-[#000000] text-white font-bold">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">{getUserFullName()}</h3>
                    <p className="text-xs text-gray-600">{getCompanyName()}</p>
                    <Badge className="mt-1 bg-gradient-to-r from-gray-500 to-black text-white text-xs">{getUserRoleBadge()}</Badge>
                  </div>
                </div>
                {/* Profile Completion Bar - Removing*/}
                {/*<div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Profile Completion</span>
                    <span className="text-xs font-bold text-[#00792b]">100%</span>
                  </div>
                  <Progress value={100} className="h-1.5 bg-gray-200" indicatorClassName="bg-gradient-to-r from-[#00792b] to-[#4caf50]" />
                </div>*/}
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
              <ul className="space-y-1">
                <li>
                  <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#4200fc] text-white font-semibold text-sm transition-all hover:bg-[#4200fc]">
                    <HomeIcon className="h-4 w-4 text-white" />
                    <span>Home</span>
                  </Link>
                </li>
                
                {/* Removing Analytics */}
                { /*<li>
                  <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all">
                    <BarChart3Icon className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </li> */ }

                {/* Profile Management Link - Only show for sellers */}
                {userRole === 'seller' && (
                  <li>
                    <Link href="/profile-management" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#4200fc] text-white font-semibold text-sm transition-all border-none">
                      <UsersIcon className="h-4 w-4 text-white" />
                      <span>Profile Management</span>
                    </Link>
                  </li>
                )}

                {/* Your Profile Link - Only show if user has an associated profile */}
                {userToolProfile && !profileLoading && (
                  <li>
                    <Link href={`/profilepreviews/${userToolProfile.id}?portal=true`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#4200fc] text-white font-semibold text-sm transition-all border-none">
                      <UserIcon className="h-4 w-4 text-white" />
                      <span>Your Profile</span>
                    </Link>
                  </li>
                )}

                <li>
                  <Link href="/marketplace" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#4200fc] text-white font-semibold text-sm transition-all">
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>Marketplace</span>
                  </Link>
                </li>

                <Separator className="my-4" />

                {/* Needs Assessment Link - Only for Sellers/Allies, not Buyers */}
                {userRole !== 'buyer' && (
                  <li>
                    <Link href="/needs-identifier" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#4200fc] text-white font-semibold text-sm transition-all">
                      <HelpCircleIcon className="h-4 w-4" />
                      <span>Needs Identifier</span>
                    </Link>
                  </li>
                )}

                {/* Onboarding Dashboard Link */}
                <li>
                  <Link href="/onboarding/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#4200fc] text-white font-semibold text-sm transition-all">
                    <UserIcon className="h-4 w-4" />
                    <span>Onboarding Dashboard</span>
                  </Link>
                </li>

                {/* Sign Out Button */}
                <li>
                   <button onClick={async () => {
                     await supabase.auth.signOut();
                     // Clear any cached tokens
                     localStorage.removeItem('supabase.auth.token');
                     // Use a short delay to ensure signout completes
                     setTimeout(() => {
                     window.location.href = '/login';
                     }, 100);
                     }}
                     className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:text-red-500 text-red-400 font-semibold text-sm transition-all"
                     >
                     <LogOut className="h-4 w-4" />
                     <span>Sign out</span>
                    </button>
                 </li>
              </ul>
            </nav>

            {/* Learning Resources Widget - Removing */}
            {/*<div className="px-4 pb-3 border-t border-gray-200">
              <div className="bg-gradient-to-r from-[#00792b]/5 to-[#00792b]/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-[#00792b] flex items-center justify-center">
                    <span className="text-xs text-white">💡</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900">Today's Tip</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                  Optimize your profile visibility by adding 3+ case studies to increase match quality by 40%.
                </p>
                <div className="flex items-center justify-between">
                  <button className="text-xs text-[#00792b] hover:text-[#00792b]/80 font-semibold transition-colors">
                    More Tips
                  </button>
                  <div className="flex gap-1">
                    <div className="h-1 w-1 rounded-full bg-[#00792b]"></div>
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>*/}
          </div>
        </div>

        {/* Mobile Header - Only show menu button on mobile when sidebar is closed */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8 hover:bg-gray-100"
          >
            <MenuIcon className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0">
          <main className="h-full overflow-y-auto p-4 sm:p-6 pt-20 lg:pt-6 2xl:p-8">
            <div className="max-w-7xl 2xl:max-w-full 2xl:mx-8 mx-auto">
              {/* Personalized Welcome Header */}
              <div className="mb-6 2xl:mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#4200fc] to-[#270097] text-transparent bg-clip-text mb-2 font-semibold">
                      Welcome back, {userData.firstName ? userData.firstName : 'there'}! 
                    </h1>
                    <p className="text-gray-900 text-base sm:text-lg font-medium">
                      {getCompanyName() !== 'Your Company' 
                        ? `Ready to drive climate impact with ${getCompanyName()}?`
                        : 'Ready to drive climate impact?'
                      }
                    </p>
                  </div>
                  {/* User Profile Static Icon - Removing */}
                  {/*<div className="hidden sm:flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{getUserFullName()}</p>
                      <p className="text-sm font-medium text-gray-600">{userData.title || getUserRoleBadge()}</p>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt={getUserFullName()} />
                      <AvatarFallback className="bg-[#00792b] text-white font-semibold">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </div>*/}
                </div>
              </div>

              {/* Main Grid Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-12 2xl:grid-cols-12 gap-4 2xl:gap-6">
                {/* Overview Section - Full Width */}
                <div className="xl:col-span-12 2xl:col-span-12">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
                  {/* Top Metrics Cards - Different for Buyers vs Sellers/Allies */}
                                    {userRole === 'buyer' ? (
                    // Buyer Dashboard - Contract, Payment, and Intake Form Widgets
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      {/* Contract Widget */}
                      <Card className="shadow-lg border-0 bg-[#ced8fd] backdrop-blur-sm h-full">
                        <CardContent className="pt-4 pb-4 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1105ff] to-[#4c6ef5] flex items-center justify-center shadow-lg">
                              <FileTextIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 mb-2">Contract Signing</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {contractStageStatus === 'completed' 
                                ? 'Contract signed successfully!'
                                : 'Review and sign your service agreement'
                              }
                            </p>
                            {contractStageStatus !== 'completed' ? (
                              <Button 
                                className="w-full bg-white/90 hover:bg-gray-100 text-[#3400c9]"
                                onClick={() => setShowContractModal(true)}
                              >
                                Sign Contract
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                disabled
                              >
                                Contract Signed!
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Payment Widget */}
                      <Card className="shadow-lg border-0 bg-[#ced8fd] backdrop-blur-sm h-full">
                        <CardContent className="pt-4 pb-4 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1105ff] to-[#4c6ef5] flex items-center justify-center shadow-lg">
                              <DollarSignIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 mb-2">Payment</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {paymentStageStatus === 'completed' 
                                ? 'Payment completed successfully!'
                                : 'Complete your subscription payment'
                              }
                            </p>
                            {paymentStageStatus !== 'completed' ? (
                              <Button 
                                asChild
                                className="w-full bg-white/90 hover:bg-gray-100 text-[#3400c9]"
                                disabled={contractStageStatus !== 'completed'}
                              >
                                <Link href="https://buy.stripe.com/00w8wP3BW6ZZef44Rn9sk06" target="_blank">
                                  {contractStageStatus !== 'completed' ? 'Sign Contract First' : 'Pay Now'}
                                </Link>
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                disabled
                              >
                                Payment Complete!
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Intake Form Widget */}
                      <Card className="shadow-lg border-0 bg-[#ced8fd] backdrop-blur-sm h-full">
                        <CardContent className="pt-4 pb-4 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1105ff] to-[#4c6ef5] flex items-center justify-center shadow-lg">
                              <BuildingIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 mb-2">Real Estate Intake Form</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {intakeFormStatus === 'completed' 
                                ? 'Real estate details submitted!'
                                : 'Complete your real estate intake form'
                              }
                            </p>
                            {intakeFormStatus !== 'completed' ? (
                              <Button 
                                asChild
                                className="w-full bg-white/90 hover:bg-gray-100 text-[#3400c9]"
                              >
                                <Link href="/onboarding/real-estate-intake">
                                  Start Intake Form
                                </Link>
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                disabled
                              >
                                Intake Complete!
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : userRole === 'seller' ? (
                    // Seller Dashboard - Task Widgets + Original Widgets
                    <div className="space-y-6">
                      {/* Task Widgets - Tool Questionnaire, Document Input, and Intake Form */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Tool Questionnaire Widget */}
                        <Card className="shadow-lg border-0 bg-white backdrop-blur-sm h-full">
                          <CardContent className="pt-4 pb-4 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1105ff] to-[#4c6ef5] flex items-center justify-center shadow-lg">
                                <HelpCircleIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-gray-900 mb-2">Tool Questionnaire</h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {toolQuestionnaireStatus === 'completed' 
                                  ? 'Tool questionnaire completed!'
                                  : toolQuestionnaireStatus === 'in_progress'
                                  ? 'Continue your tool questionnaire'
                                  : 'Complete your tool questionnaire to tell us about your solution'
                                }
                              </p>
                              {toolQuestionnaireStatus === 'completed' ? (
                                <div className="space-y-2">
                                  <Button 
                                    variant="outline"
                                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                    disabled
                                  >
                                    Questionnaire Complete!
                                  </Button>
                                  <Button 
                                    asChild
                                    variant="outline"
                                    className="w-full bg-[#e1e7fe] border-none text-[#3400c9] hover:bg-[#d7dffd] hover:text-[#3400c9]"
                                  >
                                    <Link href="/onboarding/tool_questionnaire?isEditing=true">
                                      Update Information
                                    </Link>
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  asChild
                                  className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white"
                                >
                                  <Link href="/onboarding/tool_questionnaire">
                                    {toolQuestionnaireStatus === 'in_progress' ? 'Continue Questionnaire' : 'Start Questionnaire'}
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Document Input Widget */}
                        <Card className="shadow-lg border-0 bg-white backdrop-blur-sm h-full">
                          <CardContent className="pt-4 pb-4 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1105ff] to-[#4c6ef5] flex items-center justify-center shadow-lg">
                                <FileTextIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-gray-900 mb-2">Document Upload</h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {documentInputStatus === 'completed' 
                                  ? 'Documents uploaded successfully!'
                                  : 'Upload required documents to proceed'
                                }
                              </p>
                              {documentInputStatus !== 'completed' ? (
                                <Button 
                                  asChild
                                  className="w-full border-none bg-[#e1e7fe] text-[#3400c9] hover:bg-[#d7dffd] hover:text-[#3400c9]"
                                >
                                  <Link href="/onboarding/document-upload">
                                    Upload Documents
                                  </Link>
                                </Button>
                              ) : (
                                <Button 
                                  asChild
                                  variant="outline"
                                  className="w-full border-none bg-[#e1e7fe] text-[#3400c9] hover:bg-[#d7dffd] hover:text-[#3400c9]"
                                >
                                  <Link href="/onboarding/document-upload">
                                    Manage Documents
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Seller Intake Form Widget */}
                        <Card className="shadow-lg border-0 bg-white backdrop-blur-sm h-full">
                          <CardContent className="pt-4 pb-4 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1105ff] to-[#4c6ef5] flex items-center justify-center shadow-lg">
                                <BuildingIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-gray-900 mb-2">Intake Form</h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {intakeFormStatus === 'completed' 
                                  ? 'Intake form completed!'
                                  : 'Complete your company intake form'
                                }
                              </p>
                              {intakeFormStatus !== 'completed' ? (
                                <Button 
                                  className="w-full border-none bg-[#e1e7fe] text-[#3400c9] hover:bg-[#d7dffd] hover:text-[#3400c9]"
                                  onClick={() => setShowIntakeFormModal(true)}
                                >
                                  Start Intake Form
                                </Button>
                              ) : (
                                <div className="space-y-2">
                                  <Button 
                                    variant="outline"
                                    className="w-full border-none bg-[#e1e7fe] text-[#3400c9] hover:bg-[#d7dffd] hover:text-[#3400c9]"
                                    onClick={() => setShowIntakeFormModal(true)}
                                  >
                                    Edit Information
                                  </Button>
                                  <Button 
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Link href="/preview/marketplace">
                                      View Marketplace Preview
                                    </Link>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Contract and Payment Widgets - Always show, but disabled until prerequisites are met */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Contract Widget */}
                          <Card className="shadow-lg border-0 bg-white backdrop-blur-sm h-full">
                            <CardContent className="pt-4 pb-4 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1105ff] to-[#4c6ef5] flex items-center justify-center shadow-lg">
                                  <FileTextIcon className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 mb-2">Contract Signing</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  {contractStageStatus === 'completed' 
                                    ? 'Contract signed successfully!'
                                    : 'Sign your service agreement to continue'
                                  }
                                </p>
                                {contractStageStatus !== 'completed' ? (
                                  <Button 
                                    className="w-full border-none bg-[#e1e7fe] text-[#3400c9] hover:bg-[#d7dffd] hover:text-[#3400c9]"
                                    onClick={handleContractClick}
                                  >
                                    Sign Contract
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline"
                                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                    disabled
                                  >
                                    Contract Signed!
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Payment Widget */}
                          <Card className="shadow-lg border-0 bg-white backdrop-blur-sm h-full">
                            <CardContent className="pt-4 pb-4 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1105ff] to-[#4c6ef5] flex items-center justify-center shadow-lg">
                                  <DollarSignIcon className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 mb-2">
                                  {profile?.is_trial_enabled ? 'Trial Period ($0)' : 'Payment'}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  {paymentStageStatus === 'completed' 
                                    ? (profile?.is_trial_enabled ? 'Trial started successfully!' : 'Payment completed successfully!')
                                    : (profile?.is_trial_enabled ? 'Start your free trial period' : 'Complete your subscription payment')
                                  }
                                </p>
                                {paymentStageStatus !== 'completed' ? (
                                  <Button 
                                    className="w-full border-none bg-[#e1e7fe] text-[#3400c9] hover:bg-[#d7dffd] hover:text-[#3400c9]"
                                    onClick={handlePaymentClick}
                                  >
                                    {profile?.is_trial_enabled ? 'Start Trial' : 'Pay Now'}
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline"
                                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                                    disabled
                                  >
                                    {profile?.is_trial_enabled ? 'Trial Started!' : 'Payment Complete!'}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                    </div>
                  ) : (
                    // Ally Dashboard - Original Widgets
                  <DragDropContext onDragEnd={(result) => {
                    // Handle drag and drop reordering here
                  }}>
                    <Droppable droppableId="metrics">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                          {/* Make all cards same height with h-full */}
                          <Draggable draggableId="buyers" index={0}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="h-full">
                                <Card className="shadow-lg border-0 bg-[#ced8fd] backdrop-blur-sm group h-full">
                                  <CardContent className="pt-4 pb-4 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                        <BuildingIcon className="w-5 h-5 text-[#1105ff]" />
                      </div>
                                      <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVerticalIcon className="h-5 w-5 text-gray-400" />
                                      </div>
                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-base font-bold text-gray-900 mb-2">Potential Buyers</h3>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-extrabold text-[#1105ff]">1</p>
                      <p className="text-sm font-semibold text-gray-700">active buyers</p>
                                      </div>
                                      <p className="text-sm font-semibold text-[#4100e2] mt-2">
                                        🎯 Highly matched to your profile
                                      </p>
                    </div>
                  </CardContent>
                </Card>
                              </div>
                            )}
                          </Draggable>

                            <Draggable draggableId="connections" index={1}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="h-full">
                                  <Card className="shadow-lg border-0 bg-[#ced8fd] backdrop-blur-sm group h-full">
                                    <CardContent className="pt-4 pb-4 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                          <UsersIcon className="w-5 h-5 text-[#1105ff]" />
                                      </div>
                                      <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVerticalIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                                      <div className="flex-1">
                                        <h3 className="text-base font-bold text-gray-900 mb-2">Active Connections</h3>
                                      <div className="flex items-baseline gap-2">
                                          <p className="text-2xl font-extrabold text-[#1105ff]">3</p>
                        <p className="text-sm font-semibold text-gray-700">connections</p>
                                      </div>
                                        <p className="text-sm font-semibold text-[#4100e2] mt-2">
                                          📈 +2 from last month
                                        </p>
                    </div>
                  </CardContent>
                </Card>
                              </div>
                            )}
                          </Draggable>

                          <Draggable draggableId="score" index={2}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="h-full">
                                <Card className="shadow-lg border-0 bg-[#ced8fd] backdrop-blur-sm group h-full">
                  <CardContent className="pt-4 pb-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                                        <TargetIcon className="w-6 h-6 text-[#1105ff]" />
                                      </div>
                                      <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVerticalIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                                      <h3 className="text-lg font-bold text-gray-900 mb-2">NoHarm Score</h3>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-extrabold text-[#1105ff]">85</p>
                                        <p className="text-base font-semibold text-blue-700">/100</p>
                                      </div>
                                      <div className="mt-2">
                                        <div className="h-2 w-full bg-[#3400c9]/20 rounded-full overflow-hidden">
                                          <div className="h-full w-[85%] bg-gradient-to-r from-[#3400c9] to-[#4200fc] rounded-full"></div>
                                        </div>
                                        <p className="text-sm font-semibold text-[#4100e2] mt-1">🏆 Top 15% in your region</p>
                                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
                            )}
                          </Draggable>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  )}
                </div>

                {/* Left Column - Active Widgets */}
                <div className="xl:col-span-7 2xl:col-span-7 space-y-4">
                  {/* Suggested Actions Section */}
                  <Card className="shadow-sm border border-none shadow-lg bg-white backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-[#4200fc]" />
                        Suggested Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Book a Session Button */}
                      <div className="bg-[#e1e7fe] rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-[#4100e2] font-bold mb-1">Schedule a Meeting</h3>
                          <p className="text-sm text-gray-900">Get personalized guidance on your climate tech journey</p>
                        </div>
                        <Button 
                          onClick={() => setCalendlyModalOpen(true)}
                          className="bg-[#3400c9] hover:bg-[#4200fc] text-white font-bold shadow-lg transition-all"
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Book Meeting
                        </Button>
                      </div>

                      {/* Action Items */}
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-200 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-[#e1e7fe] flex items-center justify-center flex-shrink-0">
                              <FileTextIcon className="h-4 w-4 text-[#4200fc]" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 text-sm">Complete your profile</h5>
                              <p className="text-sm text-gray-600 mt-1">Add your company details and tech specifications</p>
                            </div>
                            <Link href={userRole === "buyer" ? "/onboarding/profile": "/profile-management"}>
                            <Button variant="outline" size="sm" className="h-8">
                              Complete
                            </Button>
                            </Link>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-200 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-[#e1e7fe] flex items-center justify-center flex-shrink-0">
                              <UsersIcon className="h-4 w-4 text-[#4200fc]" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 text-sm">{userRole === "buyer" ? "Connect with sellers" : "Go to Marketplace"}</h5>
                              <p className="text-sm text-gray-600 mt-1">{userRole === "buyer" ? "Explore matched opportunities in your region" : "View your profile and those of other sellers in your region"}</p>
                            </div>
                            <Link href="/marketplace">
                            <Button variant="outline" size="sm" className="h-8">
                              Explore
                            </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Profile Section - Show if profile exists */} {/*Check!*/}
                  {userToolProfile && (
                    <Card className="shadow-lg border-0 bg-[#e1e7fe] backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-[#3400c9]" />
                          Your Profile
                        </CardTitle>
                        <CardDescription>
                          Your profile is live and accessible to potential partners
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          {userToolProfile.data?.companyInfo?.logo && (
                            <div className="h-12 w-12 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img 
                                src={userToolProfile.data.companyInfo.logo} 
                                alt="Company logo" 
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{userToolProfile.name}</h3>
                            <p className="text-sm text-gray-600 truncate">
                              {userToolProfile.data?.toolInfo?.category || userToolProfile.data?.companyInfo?.name || 'Your Company Profile'}
                            </p>
                            <Badge className="mt-1 bg-[#3400c9] text-white text-xs capitalize">
                              {userToolProfile.type} Profile
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-white/80 rounded-lg p-3">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {userToolProfile.data?.toolDescription?.short || 
                             userToolProfile.data?.companyInfo?.description || 
                             'Your professional profile showcasing your climate tech solutions and capabilities.'}
                          </p>
                        </div>

                        <Button 
                          asChild
                          className="w-full bg-[#3400c9] hover:bg-[#4200fc] text-white"
                        >
                          <Link 
                            href={`/profilepreviews/${userToolProfile.id}?portal=true`}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Profile Loading State */}
                  {profileLoading && (
                    <Card className="shadow-sm border border-gray-200 bg-white">
                      <CardContent className="py-6">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 border-2 border-[#4200fc] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-600">Checking for your profile...</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Needs Identifier - Only for Sellers/Allies, not Buyers */}
                  {userRole !== 'buyer' && needsIdentifierCompleted !== null && (
                    needsIdentifierCompleted ? (
                      // Compact version when completed
                      <Card className="shadow-sm border border-none shadow-lg bg-white backdrop-blur-sm">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-bold">
                              <HelpCircleIcon className="h-5 w-5 text-[#4200fc]" />
                              Needs Identifier
                            </CardTitle>
                            <Badge variant="outline" className="bg-[#e1e7fe] text-[#4100e2]">Completed</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-[#e1e7fe] flex items-center justify-center">
                                <CheckIcon className="h-4 w-4 text-[#4200fc]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Your needs have been identified</p>
                                <p className="text-xs text-gray-600">Last updated {needsIdentifierData?.updated_at ? formatLastUpdated(needsIdentifierData.updated_at) : 'Recently'}</p>
                              </div>
                            </div>
                            <Link href="/needs-identifier">
                              <Button variant="outline" size="sm" className="h-8">
                                Update
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      // Full size version for new users
                      <Card className="shadow-lg border-0 bg-white backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-black text-lg font-bold">
                            <HelpCircleIcon className="h-6 w-6 text-[#4200fc]" />
                            Complete Your Needs Assessment
                          </CardTitle>
                          <CardDescription>
                            Help us understand your requirements better to provide personalized recommendations
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="h-8 w-8 rounded-full bg-[#3400c9] flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">1</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Quick Assessment</h4>
                                <p className="text-sm text-gray-600">5-minute questionnaire to understand your needs</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="h-8 w-8 rounded-full bg-[#3400c9] flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">2</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Get Recommendations</h4>
                                <p className="text-sm text-gray-600">Receive tailored solutions and matches</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6">
                            <Link href="/needs-identifier">
                              <Button className="w-full bg-[#e1e7fe] hover:bg-[#ced8fd] text-[#3400c9]">
                                Start Assessment
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>

                {/* Right Column - Active Widgets */}
                <div className="xl:col-span-5 2xl:col-span-5 space-y-4">
                  {/* Notifications Center Widget - Compact Version - Removing for sellers and buyers both */}
                  {/*
                  <Card className="shadow-sm border border-gray-100 bg-white">
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                          <BellIcon className="h-4 w-4 text-[#1105ff]" />
                          Recent Activity
                      </CardTitle>
                        <Link href="/notifications">
                          <Button variant="ghost" size="sm" className="text-xs text-[#1105ff] hover:text-[#1105ff]/80">
                            View All
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                          <div className="h-7 w-7 rounded-lg bg-[#1105ff]/10 flex items-center justify-center flex-shrink-0">
                            <UsersIcon className="h-3.5 w-3.5 text-[#1105ff]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">New buyer match found</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View
                            </Button>
                      </div>

                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                          <div className="h-7 w-7 rounded-lg bg-[#00792b]/10 flex items-center justify-center flex-shrink-0">
                            <CalendarIcon className="h-3.5 w-3.5 text-[#00792b]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Meeting with John Doe</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            Join
                          </Button>
                      </div>

                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                          <div className="h-7 w-7 rounded-lg bg-[#9b00ff]/10 flex items-center justify-center flex-shrink-0">
                            <TrendingUpIcon className="h-3.5 w-3.5 text-[#9b00ff]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">NoHarm Score +5 points</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  */}

                        </div>


                          </div>
                              </div>
          </main>
                        </div>
                      </div>

      {/* Contract Modal */}
      {showContractModal && (
        <ContractModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          onAccept={handleContractAccept}
          userRole={userRole || 'seller'}
        />
      )}

      {/* Seller Intake Form Modal */}
      {showIntakeFormModal && (
        <SellerIntakeForm
          onClose={() => setShowIntakeFormModal(false)}
          onSubmit={async () => {
            // Refresh intake form status after submission
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              const isIntakeCompleted = await checkSellerIntakeFormStatus(session.user.id)
              setIntakeFormStatus(isIntakeCompleted ? 'completed' : 'not_started')
            }
          }}
        />
      )}
    </div>
  )
}
