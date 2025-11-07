import { Button } from "@/components/ui/button";
import useStore from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CompletionSection = () => {
  const router = useRouter();
  const { setOnboardingComplete, setCurrentSectionIndex, setCurrentStep, session, isEditingMode, currentFlow, userRole } = useStore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('seller_compound_data')
          .select('role')
          .eq('uuid', session.user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    };

    checkAdminStatus();
  }, [session]);

  return (
    <div className="flex flex-1 flex-col p-8 md:p-12 lg:p-16 mx-auto min-w-[80%] items-center justify-center">
      <img src="/images/logos/new-logo-blue.png" alt="Logo" className="w-32" />
      <h2 className="text-3xl font-semibold font-primary">
        {isEditingMode ? "Your Changes Have Been Saved" : "Thank You!"}
      </h2>
      <p className="mt-4 text-lg">
        {isEditingMode 
          ? "Your information has been updated successfully." 
          : "We will be in touch shortly"}
      </p>

      {isAdmin ? (
        <Button 
          onClick={() => {
            setOnboardingComplete(false);
            setCurrentSectionIndex(0);
            setCurrentStep(0);
          }}
          className="mt-10"
        >
          Back to onboarding
        </Button>
      ) : (
        <Button 
          onClick={() => {
            // For sellers, always redirect to main dashboard (except for editing mode)
            if (userRole === 'seller' && !isEditingMode) {
              router.push('/dashboard')
            } else if (isEditingMode) {
              // In editing mode, go back to where they came from
              router.back()
            } else {
              router.push('/onboarding/dashboard')
            }
          }}
          className="mt-10"
        >
          {userRole === 'seller' && !isEditingMode ? 'Go to Dashboard' : isEditingMode ? 'Back' : 'Back to dashboard'}
        </Button>
      )}
    </div>
  );
};

export default CompletionSection; 