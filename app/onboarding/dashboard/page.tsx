'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import workflowsConfig from '@/components/workflows.json';
import { Lock, Users, ArrowRight, Milestone, Menu, X, Home } from 'lucide-react';
import { trackEvent } from '@/lib/utils/analytics'
import TermsModal from '@/components/onboarding/TermsModal';
import ContractModal from '@/components/onboarding/ContractModal';
import ToolPreferences from '@/components/buyer/ToolPreferences';
import { sendStageCompletionEmail } from '@/lib/utils/email-templates';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Flow {
  flow_name: string;
  title?: string;
}

interface OnboardingStage {
  stage_description: ReactNode;
  stage_id: number;
  stage_name: string;
  status: 'not_started' | 'in_progress' | 'in_review' | 'completed';
  last_updated_at: string;
  label: string;
  route: string;
  order?: number;
}

type StatusConfig = {
  label: string;
  bgColor: string;
  textColor: string;
}

type StatusConfigs = {
  [key in OnboardingStage['status']]: StatusConfig;
}

interface UserStageInfo {
  currentStageId: number | null;
  role: string | null;
  accessibleStages: Set<number>;
}

interface UserProfile {
  uuid: string;
  role: string;
  status: string;
  data: Record<string, any>;
  is_trial_enabled?: boolean;
  current_stage?: {
    stage_id: number;
    stage_name: string;
    status: string;
  };
}

const PaymentStage = ({ stage, profile }: { stage: any; profile: UserProfile }) => {
  const isTrialMode = profile.is_trial_enabled;
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {isTrialMode ? 'Trial Period ($0)' : 'Complete Payment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stage.status !== 'completed' && (
          <Button 
            className="w-full"
            asChild
          >
            <Link 
              href={isTrialMode 
                ? 'https://buy.stripe.com/bJe3cv1tO1FF5IycjP9sk09'
                : 'https://buy.stripe.com/00w8wP3BW6ZZef44Rn9sk06'
              }
              target="_blank"
            >
              {isTrialMode ? 'Start Trial' : 'Pay Now'}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userUuid, setUserUuid] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string>('not_started');
  const [onboardingStages, setOnboardingStages] = useState<OnboardingStage[]>([]);
  const [showSignOut, setShowSignOut] = useState(false);
  const [workflowOrder, setWorkflowOrder] = useState<number[]>([]);
  const [accessibleStages, setAccessibleStages] = useState<Set<number>>(new Set());
  const [currentStageId, setCurrentStageId] = useState<number | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [isSpecialUser, setIsSpecialUser] = useState(false);
  const [pendingStageAction, setPendingStageAction] = useState<{
    stageName: string;
    route: string;
    type: 'regular' | 'payment' | 'contract';
    isEditing?: boolean;
    stageId?: number;
  } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const getStatusConfig = (status: OnboardingStage['status']): StatusConfig => {
    const configs: StatusConfigs = {
      'not_started': {
        label: 'Not Started',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600'
      },
      'in_progress': {
        label: 'In Progress',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
      },
      'in_review': {
        label: 'In Review',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600'
      },
      'completed': {
        label: 'Completed',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600'
      }
    };

    return configs[status] || configs['not_started'];
  };

  const getUserStageInfo = async (userId: string): Promise<UserStageInfo> => {
    // Get user's role
    const { data: profile } = await supabase
      .from('seller_compound_data')
      .select('role')
      .eq('uuid', userId)
      .single();

    // Get all stages the user has in the progress table
    const { data: userStages } = await supabase
      .from('user_onboarding_progress')
      .select('stage_id')
      .eq('uuid', userId)
      .order('created_at', { ascending: true });

    // Get the last stage (current stage)
    const currentStageId = userStages && userStages.length > 0 
      ? userStages[userStages.length - 1].stage_id 
      : null;

    // Create a set of accessible stage IDs
    const accessibleStages = new Set(userStages?.map(stage => stage.stage_id) || []);

    return {
      currentStageId,
      role: profile?.role || null,
      accessibleStages
    };
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('No session found, redirecting to login');
          router.replace('/login');
          return;
        }

        // Special handling for specific UUID
        const specialUuid = '623709ad-bd70-4fe6-b774-8e065a0f7707';
        const isSpecialUser = session.user.id === specialUuid;
        setIsSpecialUser(isSpecialUser);
        setUserUuid(session.user.id);
        
        // Get user's stage info
        const userInfo = await getUserStageInfo(session.user.id);
        
        if (!userInfo.role) {
          console.log('No profile found, signing out');
          await supabase.auth.signOut();
          router.replace('/login');
          return;
        }

        // Redirect admin users to the admin dashboard instead of loading flows
        if (userInfo.role === 'admin') {
          console.log('Admin user detected, redirecting to admin dashboard');
          window.location.href = '/admin';
          return;
        }

        // Redirect pending role users to the choose role page instead of on-boarding dashboard
        if (userInfo.role === 'pending') {
          console.log('Pending user role detected, redirecting to choose role page');
          window.location.href = '/signup/choose-role';
          return;
        }

        // Only proceed with loading data if user is authorized
        // Fetch stage 1 status
        const { data: stage1Data } = await supabase
          .from('user_onboarding_progress')
          .select('status')
          .eq('uuid', session.user.id)
          .eq('stage_id', 1)
          .single();
        
        setKycStatus(stage1Data?.status || 'not_started');
        
        console.log('User role:', userInfo.role);
        console.log('Current stage:', userInfo.currentStageId);
        console.log('Accessible stages:', userInfo.accessibleStages);
        
        setUserEmail(session.user.email || '');
        setUserRole(userInfo.role);
        setAccessibleStages(isSpecialUser ? new Set([1, 2, 3, 4, 5]) : userInfo.accessibleStages);
        setCurrentStageId(userInfo.currentStageId);

        // Set workflow order based on user role
        const roleWorkflow = workflowsConfig[userInfo.role as keyof typeof workflowsConfig] || [];
        console.log('Workflow order for role:', roleWorkflow);
        setWorkflowOrder(roleWorkflow);

        if (userInfo.role === 'admin') {
          setIsAdmin(true);
          const { data: flowsData, error } = await supabase
            .from('onboarding_questions')
            .select('flow_name')
            .order('flow_name');

          if (!error && flowsData) {
            console.log('Admin flows:', flowsData);
            setFlows(flowsData);
          }
        } else {
          // Fetch ALL onboarding stages
          const { data: allStages, error: stagesError } = await supabase
            .from('onboarding_stages')
            .select('stage_id, stage_name, stage_description, label, route')
            .order('stage_id');

          // Fetch user's progress for all stages
          const { data: userProgress, error: progressError } = await supabase
            .from('user_onboarding_progress')
            .select('stage_id, status, last_updated_at')
            .eq('uuid', session.user.id);

          if (!stagesError && allStages) {
            // Create a map of stage progress
            const progressMap = new Map(
              (userProgress || []).map(progress => [progress.stage_id, progress])
            );

            // Combine all stages with user progress
            const combinedStages = allStages.map(stage => {
              // Special handling for specific UUID - set all stages to in_progress
              if (isSpecialUser && stage.stage_id !== 2 && stage.stage_id !== 3) {
                return {
                  ...stage,
                  status: 'in_progress',
                  last_updated_at: progressMap.get(stage.stage_id)?.last_updated_at || '',
                  stage_description: stage.stage_description || '',
                };
              }
             
              return {
                ...stage,
                status: progressMap.get(stage.stage_id)?.status || 'not_started',
                last_updated_at: progressMap.get(stage.stage_id)?.last_updated_at || '',
                stage_description: stage.stage_description || '',
              };
            });

            // Create a map for faster stage lookup
            const stagesMap = new Map(combinedStages.map(stage => [stage.stage_id, stage]));
            
            // Sort stages according to workflow order
            const orderedStages = roleWorkflow
              .map(stageId => stagesMap.get(stageId))
              .filter((stage): stage is OnboardingStage => stage !== undefined);

            setOnboardingStages(orderedStages);
          }
        }

        // Fetch complete profile data
        const { data: profileData } = await supabase
          .from('seller_compound_data')
          .select('*')
          .eq('uuid', session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Only set loading to false after all data is loaded and we're sure user is authorized
        setLoading(false);
        
      } catch (error) {
        console.error('Error checking session:', error);
        // On error, redirect to login and keep loading true
        router.replace('/login');
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    // Track dashboard visit
    trackEvent('dashboard_visit', {
      url: window.location.href
    })
  }, [])

  // Keep showing loading spinner while checking authorization or loading data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Function to get the correct link for a stage
  const getStageLink = (route: string) => {
    if (route === '/onboarding/dashboard/#') {
      return `/onboarding/kyc_${userRole}`;
    }
    return route;
  };

  // Function to determine if a stage is accessible
  const isStageAccessible = (stage: OnboardingStage) => {
    // Check for special UUID - always show all stages
    if (isSpecialUser) {
      return true;
    }
    
    // First stage is always accessible
    if (stage.stage_id === 1) {
      return true;
    }
    
    // If stage is already in accessible stages, return true
    if (accessibleStages.has(stage.stage_id)) {
      return true;
    }

    // Find the index of this stage in the workflow order
    const stageIndex = workflowOrder.indexOf(stage.stage_id);
    if (stageIndex <= 0) return false; // Not found or first stage
    
    // Get the previous stage ID from workflow order
    const prevStageId = workflowOrder[stageIndex - 1];
    
    // Find the previous stage object
    const previousStage = onboardingStages.find(s => s.stage_id === prevStageId);
    
    // Previous stage must exist and be completed
    return previousStage !== undefined && previousStage.status === 'completed';
  };

  // Add function to check if a stage is locked
  const isLockedStage = (stageId: number) => {
    // Temporarily disabled all locked stages
    return false; // Previously was: return [2].includes(stageId);
  };

  // Add function to check if a stage is updatable (can be accessed even when completed)
  const isStageUpdatable = (stageId: number) => {
    // Only exclude payment and contract stages (2 and 3)
    // Include document upload stage (5)
    return ![2, 3].includes(stageId);
  };

  const getFlowTitle = (flowName: string) => {
    const name = flowName.replace('kyc_', '').replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Update payment links based on user role
  const getPaymentLink = () => {
    if (userRole === 'ally') {
      return "https://buy.stripe.com/00w8wP3BW6ZZef44Rn9sk06"; // Updated Ally plan link
    }
    return "https://buy.stripe.com/00w8wP3BW6ZZef44Rn9sk06"; // default payment link
  };

  // Track stage start with stage name and additional context
  const handleStageClick = async (stageName: string, stageId: number, stageType: 'regular' | 'payment' | 'contract' = 'regular', isEditing: boolean = false) => {
    // Check for special UUID - never use edit mode
    if (isSpecialUser) {
      isEditing = false;
    }
    
    // Find the stage object
    const stageObj = onboardingStages.find(s => s.stage_id === stageId);
    
    // For KYC stage (stage_id 1) with not_started status, show terms modal first
    if (stageId === 1 && stageObj && stageObj.status === 'not_started') {
      setShowTermsModal(true);
      setPendingStageAction({
        stageName,
        route: stageObj ? getStageLink(stageObj.route) : getStageLink(`/onboarding/kyc_${userRole}`),
        type: stageType,
        isEditing: isEditing
      });
      return;
    }
    
    // For contract signing stage, show contract modal
    if (stageName === 'contract_sign') {
      setShowContractModal(true);
      setPendingStageAction({
        stageName,
        route: stageObj ? getStageLink(stageObj.route) : '#',
        type: 'contract',
        isEditing: isEditing,
        stageId: stageId
      });
      return;
    }

    // For tool preferences (stage 6), just mark it as in_progress
    if (stageId === 6) {
      try {
        await supabase
          .from('user_onboarding_progress')
          .upsert({
            uuid: userUuid,
            stage_id: 6,
            status: 'in_progress'
          }, {
            onConflict: 'uuid,stage_id'
          });

        // Update the stage status in the UI
        setOnboardingStages(prevStages => 
          prevStages.map(s => 
            s.stage_id === 6 
              ? { ...s, status: 'in_progress' } 
              : s
          )
        );
        
        // Track the event
        await trackEvent('stage_start', {
          stage_name: stageName,
          url: window.location.href,
          source: isEditing ? 'update_information' : 'onboarding'
        });
        
        return;
      } catch (error) {
        console.error('Error updating tool preferences stage:', error);
        return;
      }
    }

    const eventData = {
      stage_name: stageName,
      url: window.location.href,
      source: isEditing ? 'update_information' : 'onboarding'
    };

    if (stageType === 'payment') {
      eventData.url = getPaymentLink();
    }

    await trackEvent('stage_start', eventData);
    
    // Navigate to the appropriate route if not payment and not tool preferences
    if (stageType !== 'payment' && stageObj && stageId !== 6) {
      // Add isEditing as a query parameter for completed stages being edited
      const route = getStageLink(stageObj.route);
      const routeWithParams = isEditing ? `${route}?isEditing=true` : route;
      router.push(routeWithParams);
    }
  };

  // Handle terms acceptance
  const handleTermsAccept = async () => {
    setShowTermsModal(false);
    
    if (pendingStageAction) {
      // Track the event
      await trackEvent('stage_start', {
        stage_name: pendingStageAction.stageName,
        url: window.location.href,
        source: pendingStageAction.isEditing ? 'update_information' : 'onboarding'
      });
      
      // Navigate to the stage
      const routeWithParams = pendingStageAction.isEditing 
        ? `${pendingStageAction.route}?isEditing=true` 
        : pendingStageAction.route;
      
      router.push(routeWithParams);
      
      // Reset pending action
      setPendingStageAction(null);
    }
  };
  
  // Handle contract acceptance
  const handleContractAccept = async () => {
    setShowContractModal(false);
    
    if (pendingStageAction && pendingStageAction.stageId) {
      try {
        // Find the contract stage ID
        const contractStageId = pendingStageAction.stageId;
        
        // Mark the contract stage as completed
        await supabase
          .from('user_onboarding_progress')
          .upsert({
            uuid: userUuid,
            stage_id: contractStageId,
            status: 'completed'
          }, {
            onConflict: 'uuid,stage_id'
          });
        
        // Find the next stage in the workflow
        const currentIndex = workflowOrder.indexOf(contractStageId);
        if (currentIndex >= 0 && currentIndex < workflowOrder.length - 1) {
          const nextStageId = workflowOrder[currentIndex + 1];
          
          // Check if next stage record already exists
          const { data: existingRecord, error: existingRecordError } = await supabase
            .from('user_onboarding_progress')
            .select('progress_id')
            .eq('uuid', userUuid)
            .eq('stage_id', nextStageId);
          
          // Only insert if no record exists
          if (!existingRecord || existingRecord.length === 0) {
            // Create a record for the next stage with 'not_started' status
            await supabase
              .from('user_onboarding_progress')
              .insert({
                uuid: userUuid,
                stage_id: nextStageId,
                status: 'not_started'
              });
          }
          
          // Update current stage ID in state
          setCurrentStageId(nextStageId);
        }
          
        // Update the stage status in the UI
        setOnboardingStages(prevStages => {
          // First mark contract stage as completed
          return prevStages.map(s => 
            s.stage_id === contractStageId
              ? { ...s, status: 'completed' as const } 
              : s
          );
        });
        
        // Send email notification about stage completion
        if (userEmail) {
          try {
            // Get user name if available
            const { data: userData } = await supabase
              .from('seller_compound_data')
              .select('name')
              .eq('uuid', userUuid)
              .single();
            
            const userName = userData?.name || undefined;
            
            // Send stage completion email - wrapped in try-catch to prevent async errors
            await sendStageCompletionEmail(
              contractStageId,
              userEmail,
              userName
            );
          } catch (emailError) {
            console.error('Error sending completion email:', emailError);
            // Continue with contract acceptance - don't block the process if email fails
          }
        }
        
        // Reset pending action
        setPendingStageAction(null);
      } catch (error) {
        console.error('Error updating contract stage:', error);
      }
    }
  };

  // Add function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add function to close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        stageName={pendingStageAction?.stageName || 'kyc'}
      />
      
      {/* Contract Modal */}
      <ContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        onAccept={handleContractAccept}
        userRole={userRole || ''}
      />

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
        <Sidebar userEmail={userEmail} userRole={userRole || ''} kycStatus={kycStatus} />
      </aside>

      {/* Main content */}
      <main className="flex-1 relative overflow-y-auto bg-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Add padding top on mobile to account for menu button */}
          <div className="pt-12 lg:pt-0">
            {isAdmin ? (
              <>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 sm:mb-8">
                  Admin Dashboard
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {flows.map((flow) => (
                    <Link 
                      key={flow.flow_name}
                      href={`/onboarding/${flow.flow_name}`}
                      className="block group"
                    >
                      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 border border-gray-100">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {getFlowTitle(flow.flow_name)}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-500">
                          View and manage {getFlowTitle(flow.flow_name)} onboarding flow
                        </p>
                        <div className="mt-4 text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                          View Flow →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 border-b border-gray-200 pb-4">
                  <Milestone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                      Onboarding Journey
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Complete these steps to get started
                    </p>
                  </div>
                </div>

                <div className="relative">
                  {/* Base timeline line */}
                  <div className="absolute left-4 sm:left-12 top-0 bottom-0 w-0.5 bg-gray-200" />

                  <div className="space-y-4">
                    {onboardingStages
                      .filter(stage => {
                        // For sellers, hide stages that have been moved to dashboard portal
                        if (userRole === 'seller') {
                          const hiddenStageIds = [2, 3, 4, 5]; // contract, payment, tool_questionnaire, document_input
                          if (hiddenStageIds.includes(stage.stage_id)) {
                            return false;
                          }
                        }
                        return isStageAccessible(stage); // Only show accessible stages (first stage is always accessible)
                      })
                      .map((stage, index) => {
                      const statusConfig = getStatusConfig(stage.status);
                      const isAccessible = isStageAccessible(stage);
                      const canProceed = isAccessible && stage.status !== 'in_review' && stage.status !== 'completed';
                      const isCompleted = stage.status === 'completed';
                      const filteredStages = onboardingStages.filter(s => isStageAccessible(s));
                      const nextStage = index < filteredStages.length - 1 ? filteredStages[index + 1] : null;
                      const isCurrentStage = stage.stage_id === currentStageId;
                      
                      // Check if this is the last stage and all stages are completed
                      const isLastStage = index === filteredStages.length - 1;
                      const allStagesCompleted = onboardingStages.every(s => s.status === 'completed');
                      
                      // Highlight current stage, but not the last stage if all stages are completed
                      // (since matchmaking will be highlighted instead)
                      const shouldHighlight = !isSpecialUser && isCurrentStage && !(isLastStage && allStagesCompleted);
                      
                      return (
                        <div 
                          key={stage.stage_id}
                          className="relative"
                        >
                          {/* Colored timeline line for completed stages */}
                          {isCompleted && nextStage && (
                            <div 
                              className={`absolute left-4 sm:left-12 -translate-x-1/2 w-0.5 ${isSpecialUser ? 'bg-gray-200' : 'bg-green-500'}`} 
                              style={{ 
                                top: '0.875rem',
                                height: 'calc(100% + 1rem)'
                              }}
                            />
                          )}

                          {/* Colored timeline line for the last completed stage connecting to matchmaking */}
                          {isCompleted && 
                           !nextStage && 
                           (userRole === 'buyer' || userRole === 'seller') && 
                           index === filteredStages.length - 1 && 
                           onboardingStages.every(s => s.status === 'completed') && (
                            <div 
                              className={`absolute left-4 sm:left-12 -translate-x-1/2 w-0.5 ${isSpecialUser ? 'bg-gray-200' : 'bg-green-500'}`} 
                              style={{ 
                                top: '0.875rem',
                                height: 'calc(100% + 1rem)'
                              }}
                            />
                          )}

                          {/* Timeline dot */}
                          <div className={`absolute left-4 sm:left-12 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            isSpecialUser
                              ? 'bg-blue-500' 
                              : stage.status === 'completed' 
                                ? 'bg-green-500' 
                                : stage.status === 'in_progress'
                                ? 'bg-blue-500'
                                : stage.status === 'in_review'
                                ? 'bg-yellow-500'
                                : 'bg-gray-300'
                          } z-10 ${shouldHighlight && !isSpecialUser ? 'ring-2 ring-blue-100' : ''}`} />

                          <div 
                            className={`ml-8 sm:ml-24 bg-white rounded-lg shadow-sm p-4 sm:p-5 border transition-all duration-200 ${
                              shouldHighlight && !isSpecialUser
                                ? 'border-blue-200 shadow-md ring-1 ring-blue-100' 
                                : !isAccessible && !isSpecialUser
                                ? 'opacity-50 border-gray-100' 
                                : 'border-gray-100'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h2 className={`text-base sm:text-lg font-semibold ${
                                    isSpecialUser 
                                      ? 'text-gray-900' 
                                      : shouldHighlight 
                                        ? 'text-blue-900' 
                                        : 'text-gray-900'
                                  }`}>
                                    {`${index + 1}. ${stage.label}`}
                                  </h2>
                                  {!isSpecialUser && shouldHighlight && 
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse flex-shrink-0" />
                                  }
                                </div>
                                <p className={`text-xs sm:text-sm ${
                                  isSpecialUser 
                                    ? 'text-gray-600' 
                                    : shouldHighlight 
                                      ? 'text-blue-800' 
                                      : 'text-gray-600'
                                } mb-3`}>
                                  {stage.stage_description}
                                </p>
                              </div>
                              {stage.stage_name !== "awaiting_payment" && !(stage.stage_name === "contract_sign" && userRole === "buyer") && (
                                <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} text-xs sm:text-sm font-medium flex-shrink-0 mb-3 sm:mb-0`}>
                                  {statusConfig.label}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-1">
                              {isLockedStage(stage.stage_id) && stage.stage_name !== "awaiting_payment" ? (
                                <div className="flex items-center gap-2">
                                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                  {shouldHighlight && <span className="text-xs sm:text-sm text-gray-500">Temporarily locked</span>}
                                </div>
                              ) : canProceed ? (
                                stage.stage_name === "awaiting_payment" && profile ? (
                                  <PaymentStage stage={stage} profile={profile} />
                                ) : stage.stage_id === 6 ? null : (
                                  <Link 
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleStageClick(stage.stage_name, stage.stage_id, stage.stage_name === 'contract_sign' ? 'contract' : 'regular');
                                    }}
                                    className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white min-h-[40px] sm:min-h-[36px] w-full sm:w-auto touch-manipulation tap-highlight-transparent ${
                                      isSpecialUser
                                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                        : shouldHighlight 
                                          ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                                          : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                                  >
                                    <span className="whitespace-nowrap">
                                      {isSpecialUser 
                                        ? 'Visit Stage'
                                        : stage.status === 'in_progress' ? 'Continue Stage' : 'Start Stage'}
                                    </span>
                                  </Link>
                                )
                              ) : stage.status === 'in_review' ? (
                                <div className="text-xs sm:text-sm text-yellow-600 font-medium">
                                  Waiting for review
                                </div>
                              ) : isStageUpdatable(stage.stage_id) && stage.status === 'completed' ? (
                                <Link 
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleStageClick(stage.stage_name, stage.stage_id, stage.stage_name === 'contract_sign' ? 'contract' : 'regular', !isSpecialUser);
                                  }}
                                  className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 min-h-[40px] sm:min-h-[36px] w-full sm:w-auto touch-manipulation tap-highlight-transparent ${
                                    isSpecialUser 
                                      ? 'border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                      : 'border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50'
                                  } text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                                >
                                  <span className="whitespace-nowrap">
                                    {isSpecialUser ? 'Visit Stage' : 'Update Information'}
                                  </span>
                                </Link>
                              ) : null}
                            </div>

                            {/* Show ToolPreferences directly for stage 6 */}
                            {stage.stage_id === 6 && stage.status !== 'completed' && (
                              <div className="mt-4">
                                <ToolPreferences userUuid={userUuid} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Dashboard Access for Buyers and Sellers who complete Stage 1 */}
                    {(userRole === 'buyer' || userRole === 'seller') && 
                     onboardingStages.find(stage => stage.stage_id === 1)?.status === 'completed' ? (
                      <div className="relative">
                        {/* Colored timeline line connecting to dashboard */}
                        <div 
                          className="absolute left-4 sm:left-12 -translate-x-1/2 w-0.5 bg-green-500" 
                          style={{ 
                            top: '-1rem',
                            height: '1.875rem'
                          }}
                        />
                        
                        {/* Timeline dot */}
                        <div className="absolute left-4 sm:left-12 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500 ring-2 ring-green-100 z-10" />

                        <div className="ml-8 sm:ml-24 bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-md p-4 sm:p-5 border border-green-200 ring-1 ring-green-100">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h2 className="text-base sm:text-lg font-semibold text-green-900 flex items-center gap-2 mb-1">
                                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                Dashboard Access Unlocked!
                              </h2>
                              <p className="text-xs sm:text-sm text-green-700 mb-3">
                                Great! You've completed the KYC stage. You can now access your dashboard while continuing with other onboarding steps.
                              </p>
                              <Button 
                                onClick={() => router.push('/dashboard')}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                              >
                                Go to Dashboard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Matchmaking card */}
                    {((userRole === 'buyer' || userRole === 'seller') && 
                      onboardingStages.every(stage => stage.status === 'completed')) || 
                      isSpecialUser ? (
                      <div className="relative">
                        {/* Colored timeline line connecting to matchmaking - only shown when all stages are completed */}
                        <div 
                            className={`absolute left-4 sm:left-12 -translate-x-1/2 w-0.5 ${isSpecialUser ? 'bg-gray-200' : 'bg-green-500'}`} 
                          style={{ 
                            top: '-1rem',
                            height: '1.875rem'
                          }}
                        />
                        
                        {/* Timeline dot */}
                        <div className={`absolute left-4 sm:left-12 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          isSpecialUser
                            ? 'bg-blue-500'
                            : onboardingStages.every(stage => stage.status === 'completed')
                              ? 'bg-blue-500 ring-2 ring-blue-100'
                              : 'bg-gray-300'
                        } z-10`} />

                        <div className={`ml-8 sm:ml-24 bg-white rounded-lg shadow-sm p-4 sm:p-5 border ${
                          isSpecialUser
                            ? 'border-gray-100'
                            : onboardingStages.every(stage => stage.status === 'completed')
                              ? 'border-blue-200 shadow-md ring-1 ring-blue-100'
                              : 'border-gray-100 opacity-60'
                        }`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h2 className={`text-base sm:text-lg font-semibold ${
                                isSpecialUser 
                                  ? 'text-purple-900' 
                                  : 'text-blue-900'
                              } flex items-center gap-2 mb-1`}>
                                <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  isSpecialUser 
                                    ? 'text-purple-500' 
                                    : 'text-blue-500'
                                }`} />
                                Matchmaking
                              </h2>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {`We'll help match you with the perfect ${userRole === 'buyer' ? 'sellers' : 'buyers'} for your needs.`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 