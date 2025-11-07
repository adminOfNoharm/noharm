"use client"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Users, Store, Handshake } from "lucide-react"
import Link from "next/link"
import { Montserrat } from "next/font/google";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "600", "800"], // Light, SemiBold & Bold
});

function ChooseRoleContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const searchParams = useSearchParams()
  const [uuid, setUuid] = useState<string | null>(null)
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null) // Track which button was clicked

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        // No session, redirect to login
        router.push('/login')
        return
      }
      
      setUser(user)
      setUuid(user.id)
      
      // Check if user already has a role (not pending)
      const { data: profile } = await supabase
        .from("seller_compound_data")
        .select("role")
        .eq("uuid", user.id)
        .single()
      
      if (profile && profile.role && profile.role !== "pending") {
        // User already has a role, redirect to appropriate dashboard
        if (profile.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/onboarding/dashboard")
        }
      }
    }
    
    checkUser()
  }, [router])

  const roles = [
    {
      id: "seller",
      title: "Seller",
      subtitle: "Offer your climate technology. Verified, matched, adopted.",
      subtitleColor: "text-gray-200",
      icon: Store,
      bg: "bg-[#4900fc]",
      hover: "hover:border-blue-800 hover:shadow-xl hover:bg-[#3a00c9]",
      iconBg: "bg-[#3a00c9] border-none",   
      iconBghover: "group-hover:bg-[#4200fc]",
      iconColor:"text-white",
      iconHoverColor: "",
      buttonBg: "border-white",
      buttonhover: "hover:text-white hover:bg-[#4200fc]",
      extraInfo:
        "As a Seller, showcase your climate solutions to verified buyers and expand your market reach globally.",
      extraInfoColor: "text-white",
    },
    {
      id: "buyer",
      title: "Buyer",
      subtitle: "Discover and adopt verified climate solutions for your portfolio.",
      subtitleColor: "text-gray-800",
      icon: Users,
      bg: "bg-[#d6d6d6] text-black",
      hover: "hover:border-white hover:shadow-xl hover:bg-[#c0c0c0]",
      iconBg: "bg-white border-none hover:bg-[#d6d6d6]",
      iconBghover: "group-hover:bg-white",
      iconColor:"text-black",
      iconHoverColor: "group-hover:text-black",
      buttonBg: "border-black", 
      buttonhover: "hover:text-black hover:bg-white",  
      extraInfo:
        "As a Buyer, access a curated marketplace of climate technologies and solutions tailored to your sustainability goals.",
      extraInfoColor: "text-black",
    },
    {
      id: "ally",
      title: "Ally",
      subtitle: "Partner, support and connect across the ecosystem.",
      subtitleColor: "text-gray-200",
      icon: Handshake,
      bg: "bg-black",
      hover: "hover:border-[#181818] hover:shadow-xl hover:bg-gray-800",
      iconBg: "bg-gray-800 border-none", 
      iconBghover: "group-hover:bg-[#181818]",
      iconColor:"text-white",
      iconHoverColor: "",
      buttonBg: "border-white",  
      buttonhover: "hover:text-white hover:bg-[#181818]",
      extraInfo:
        "As an Ally, you’ll help bridge innovation and opportunity — supporting sustainable growth across all sectors.",
      extraInfoColor: "text-white",
    },
  ]

  const handleRoleSelect = async (roleId: string) => {
    console.log("Role selected:", roleId) 
    setSelectedRole(roleId) // Track which button is loading
    setError(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("No user session found. Please sign in again.")
      }

      console.log("Updating role for user:", user.id) 

      // Update role in database
      const { error: updateError } = await supabase
        .from("seller_compound_data")
        .update({ role: roleId })
        .eq("uuid", user.id)

      if (updateError) {
        console.error("Update error:", updateError) 
        throw updateError
      }

      console.log("Role updated successfully, redirecting...")

      // Redirect based on role - matching login logic
    if (roleId === "admin") {
      router.push("/admin")
    } else if (roleId === "buyer") {
      // Check if buyer has completed Stage 1 (KYC)
      const { data: stage1Data } = await supabase
        .from('user_onboarding_progress')
        .select('status')
        .eq('uuid', user.id)
        .eq('stage_id', 1)
        .single()
      
      if (stage1Data?.status === 'completed') {
        router.push("/dashboard")
      } else {
        router.push("/onboarding/dashboard")
      }
    } else if (roleId === "seller") {
      // Check if seller has completed Stage 1 (KYC/Get to know you)
      const { data: stage1Data } = await supabase
        .from('user_onboarding_progress')
        .select('status')
        .eq('uuid', user.id)
        .eq('stage_id', 1)
        .single()
      
      if (stage1Data?.status === 'completed') {
        router.push("/dashboard")
      } else {
        router.push("/onboarding/dashboard")
      }
    } else {
      // Ally or any other role
      router.push("/onboarding/dashboard")
    }
  } catch (err: any) {
    console.error("Error selecting role:", err)
    setError(err.message || "Something went wrong")
    setSelectedRole(null) //Reset loading state on error
  } 
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[url('/images/new-layout-revised.png')] bg-fixed bg-cover bg-center text-white px-6 py-12">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-black">
          Choose your path into the Marketplace
        </h1>
        <p className="text-lg text-black mb-20 font-montserrat">
          We tailor your experience based on your role.
        </p>

        {error && (
          <p className="text-red-400 mb-4 text-sm">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          {roles.map((role) => {
            const IconComponent = role.icon;
             const isHovered = hoveredRole === role.id;
             const isLoading = selectedRole === role.id
            return (
            <div
              key={role.id} onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
              className={`${role.bg} group relative rounded-2xl border border-transparent transition-all duration-500 transform ${isHovered ? "scale-105 shadow-2xl" : ""} ${role.hover} p-6 flex flex-col items-center`}
            >
            {/* Icon */}
              <div
          className={`${role.iconBg} ${role.iconBghover} w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-current`}
        >
          <IconComponent className={`w-8 h-8 ${role.iconColor} ${role.iconHoverColor}`} />
        </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
              <p className={`text-sm mb-6 ${role.subtitleColor} transition-opacity duration-300`}>{role.subtitle}</p>

               {/* Hidden Info (expands only for hovered card) */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
                isHovered ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"
              }`}
            >
              <p className={`text-sm ${role.extraInfoColor} px-2`}>
                {role.extraInfo}
              </p>
            </div>

            {/* “Get Started” button */}
        <button
          onClick={() => handleRoleSelect(role.id)}
          disabled={selectedRole !== null } //Disable all buttons when any is loading
          className={`${role.buttonBg} ${role.buttonhover} mt-auto inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border transition-colors duration-300`}
        >
          {isLoading ? 'Loading...' : 'Get Started →'}
        </button>
              </div>
          )})}
        </div>

         {/* Footer line */}
        <p className="mt-20 text-sm text-[#4100e2] font-semibold">
            <span className="text-black">•</span> Powered by Climate Technology <span className="text-black">•</span>
        </p>
      </div>
    </div>
  )
}

export default function ChooseRolePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    }>
      <ChooseRoleContent />
    </Suspense>
  )
}
