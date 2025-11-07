"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { sendWelcomeEmail } from "@/lib/utils/email-templates"
import Link from "next/link"
import Image from "next/image"
import { Leaf, Wind, Droplets, Sun, Zap, Eye, EyeOff } from "lucide-react"
import { Montserrat } from "next/font/google";
type Role = "buyer" | "seller" | "ally" | "admin" | null

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "600", "800"], // Light, SemiBold & Bold
});

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  //const [confirmPassword, setConfirmPassword] = useState("") //Removing for New UI
  const [passwordError, setPasswordError] = useState<string | null>(null)
  //const [selectedRole, setSelectedRole] = useState<Role>(null) //Removing for New UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirectPath(params.get("redirect"))
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      // Don't check session if there's an active operation
      if (loading) {
        return
      }

      console.log("Checking existing session...")
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        console.log("Session found:", session.user.email)
        // Check if there's a redirect path
        if (redirectPath) {
          console.log("Redirecting to:", redirectPath)
          window.location.href = redirectPath
          return
        }

        // Check if the user has a role in seller_compound_data
        const { data: profile, error } = await supabase
          .from("seller_compound_data")
          .select("role")
          .eq("uuid", session.user.id)
          .single()

        console.log("User profile:", profile, "Error:", error)
        
        if (profile) {
          // Check if role is null or pending - if so, don't redirect
          if (profile.role === "pending" || profile.role === null || profile.role === undefined) {
            console.log("User has no role assigned, staying on signup page")
            return // Don't redirect if no role is set
          }
          if (profile.role === "admin") {
            console.log("Admin user, redirecting to admin dashboard")
            window.location.href = "/admin"
          } else {
            console.log("Regular user, redirecting to onboarding dashboard")
            window.location.href = "/onboarding/dashboard"
          }
          return
        }
      } else {
        console.log("No active session found")
      }
    }
    checkSession()
  }, [redirectPath, loading])

  const validatePassword = (pass: string): boolean => {
    const minLength = pass.length >= 8
    const hasUpperCase = /[A-Z]/.test(pass)
    const hasLowerCase = /[a-z]/.test(pass)
    const hasNumber = /[0-9]/.test(pass)
    return minLength && hasUpperCase && hasLowerCase && hasNumber
  }

  // Sanitize input function
  const sanitizeInput = (input: string): string => {
    return (
      input
      .trim()
      // Remove any HTML tags
        .replace(/<[^>]*>/g, "")
      // Remove special characters but keep spaces and basic punctuation
        .replace(/[^\w\s.,!?-]/g, "")
      // Remove multiple spaces
        .replace(/\s+/g, " ")
        .trim()
    )
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setPasswordError(null)
    
    //Removing for New UI logic
    /*if (!selectedRole) {
      setError("Please select your role")
      return
    }*/

    const sanitizedName = sanitizeInput(name)
    if (!sanitizedName) {
      setError("Please enter your name")
      return
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
      )
      return
    }

    //Removing for New UI logic
    /*if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }*/

    setLoading(true)

    try {
      const sanitizedEmail = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        /*options: {
          emailRedirectTo: `${window.location.origin}/onboarding/dashboard`,
        },*/
      })

      if (error) throw error

      if (data.user) {
        // Create user record in seller_compound_data
        const { error: roleError } = await supabase.from("seller_compound_data").upsert({
            uuid: data.user.id,
            data: {},
            //role: selectedRole, //Removing for New UI logic
            role: "pending", //Modifying for New UI logic - Temp value until user selects actual role
          status: "not_started",
          name: sanitizeInput(name),
        })

        if (roleError) throw roleError

        // Send welcome email using the template
        await sendWelcomeEmail(sanitizedEmail, sanitizeInput(name))

        // Sign out the user so they can explicitly sign in with the new credentials - Removing for New UI Logic
        //await supabase.auth.signOut()

        setSuccessMessage("Account created successfully! Let's set up your role!")
        setTimeout(() => {
          router.push("/signup/choose-role") //Updated for New UI logic
        }, 1000)
      }
    } catch (error) {
      console.error("Signup error:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred")
      }
    }
    setLoading(false)
  }

  return (
    <div className="signup-page min-h-screen flex bg-[url('/images/new-background.png')] bg-cover bg-center text-gray-800 ${montserrat.className}">
      {/* Center - Sign up form */}
      {/*<div className="w-full lg:w-1/2 p-4 sm:p-6 flex flex-col min-h-screen">*/}
      <div className="w-full p-4 sm:p-6 flex flex-col min-h-screen">
        <div className="mb-4 sm:mb-6">
          <Image src="/images/logos/new-logo.png" alt="NoHarm Logo" width={200} height={60} className="h-[35px] sm:h- w-auto" />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-2 sm:px-0">
          {/*<h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 font-altone">*/}
          <div className= "text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
            Start Your Journey with NoHarm
          </h1>
          <p className="text-lg text-gray-50 font-light">
              Verified Solutions. Trusted Capital. Real Impact.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
          <div>
              <label htmlFor="name" className="block text-md font-medium text-gray-50 mb-1 font-semibold">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-blue-800 rounded-md focus:outline-none text-black shadow-sm font-montserrat"
              required
                placeholder="Enter your full name"
            />
          </div>

          <div>
              <label htmlFor="email" className="block text-md font-medium text-gray-50 mb-1 font-semibold">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-blue-800 rounded-md focus:outline-none text-black shadow-sm font-montserrat"
              required
                placeholder="Enter your email"
            />
          </div>



          <div>
              <label htmlFor="password" className="block text-md font-medium text-gray-50 mb-1 font-semibold">
                Password
              </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-blue-800 rounded-md focus:outline-none text-black shadow-sm font-montserrat pr-12"
                required
                placeholder="Create a password"
              />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                {showPassword ? (
                <EyeOff className="w-5 h-5" />
                ) : (
                <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

            {/* Removing for New UI */}
            {/*<div>
              <label htmlFor="confirmPassword" className="block text-md font-medium text-gray-700 mb-1 font-arcon">
                  Confirm Password
                </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00792b] focus:border-[#00792b] text-gray-800 shadow-sm font-arcon"
                required
                placeholder="••••••••"
              />
          </div>*/}



          {/*<div className="space-y-2">
              <label className="block text-md font-medium text-gray-700 font-arcon">
              Choose your role
            </label>
              <div className="space-y-2">
              <button
                type="button"
                  onClick={() => setSelectedRole("buyer")}
                  className={`relative w-full p-2 rounded-md border transition-all font-arcon ${
                    selectedRole === "buyer"
                      ? "border-[#00792b] bg-[#00792b]/10"
                      : "border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                    <div
                      className={`shrink-0 w-4 h-4 rounded-full border ${
                        selectedRole === "buyer" ? "border-[#00792b] bg-[#00792b]" : "border-gray-400"
                      }`}
                    />
                    <div className="ml-3 text-left">
                      <h3 className="font-medium text-sm text-gray-800">Buyer</h3>
                      <p className="text-sm text-gray-500">I want to buy climate tech solutions</p>
                    </div>
                </div>
              </button>

              <button
                type="button"
                  onClick={() => setSelectedRole("seller")}
                  className={`relative w-full p-2 rounded-md border transition-all font-arcon ${
                    selectedRole === "seller"
                      ? "border-[#00792b] bg-[#00792b]/10"
                      : "border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                    <div
                      className={`shrink-0 w-4 h-4 rounded-full border ${
                        selectedRole === "seller" ? "border-[#00792b] bg-[#00792b]" : "border-gray-400"
                      }`}
                    />
                    <div className="ml-3 text-left">
                      <h3 className="font-medium text-sm text-gray-800">Seller</h3>
                      <p className="text-sm text-gray-500">I want to sell climate tech solutions</p>
                    </div>
                </div>
              </button>

              <button
                type="button"
                  onClick={() => setSelectedRole("ally")}
                  className={`relative w-full p-2 rounded-md border transition-all font-arcon ${
                    selectedRole === "ally"
                      ? "border-[#00792b] bg-[#00792b]/10"
                      : "border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                    <div
                      className={`shrink-0 w-4 h-4 rounded-full border ${
                        selectedRole === "ally" ? "border-[#00792b] bg-[#00792b]" : "border-gray-400"
                      }`}
                    />
                    <div className="ml-3 text-left">
                      <h3 className="font-medium text-sm text-gray-800">NoHarm Ally</h3>
                      <p className="text-sm text-gray-500">I want to join as an ally</p>
                    </div>
                </div>
              </button>
            </div>
          </div>*/}

          {error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-200 font-montserrat">
              {error}
            </div>
          )}

          {successMessage && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md border border-green-200 font-montserrat">
              {successMessage}
            </div>
          )}

          {passwordError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-200 font-montserrat">
              {passwordError}
            </div>
          )}

            <button
            type="submit"
            disabled={loading}
              className={`w-full py-2 rounded-md font-medium transition-colors font-montserrat ${
                loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#4200fc] hover:bg-[#4100e2]/90 text-white"
              }`}
            >
              {loading ? <LoadingSpinner /> : "Create Account"}
            </button>

            <div className="mt-4 text-center text-sm font-montserrat">
              <p className="text-gray-100">
                Already have an account?{" "}
                <Link href="/login" className="text-[#9db1fc] hover:underline font-medium font-montserrat">
                Sign in
              </Link>
            </p>
          </div>

          {/* T&C */}
          <div className="mt-4 text-center text-sm font-montserrat text-sm">
              <p className="text-gray-300">
                By creating an account, you agree to NoHarm's{" "}
                <Link href="https://www.noharm.tech/onboarding-terms" target="_blank" rel="noopener noreferrer" className="text-[#9db1fc] hover:underline font-medium font-montserrat"> Terms </Link> {" & "} 
                <Link href="https://www.noharm.tech/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#9db1fc] hover:underline font-medium font-montserrat"> Privacy Policy </Link>
            </p>
          </div>
        </form>
      </div>
    </div>

      {/* Right side - Climate Tech Visuals - Removing for New UI*/}
      {/*<div className="hidden lg:block lg:w-1/2 relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00792b] to-[#005c20] rounded-l-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-pattern"></div>
          <div className="h-full flex flex-col p-6 sm:p-8 lg:p-12">*/}
            {/* Decorative elements */}
            {/*<div className="absolute top-20 right-20 opacity-20">
              <Sun className="w-16 sm:w-24 h-16 sm:h-24 text-white" />
            </div>
            <div className="absolute bottom-40 left-10 opacity-20">
              <Wind className="w-24 sm:w-32 h-24 sm:h-32 text-white" />
            </div>*/}
            {/* <div className="absolute top-1/3 left-1/4 opacity-20">
              <Leaf className="w-20 h-20 text-white" />
            </div> */}

            {/*<div className="flex-grow flex flex-col justify-center">
              <div className="mb-8 sm:mb-12 max-w-2xl mx-auto w-full">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white font-altone">
                  Connect with Climate Innovation
                </h2>
                <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8 text-white font-arcon">
                  Join the marketplace that's accelerating the transition to a sustainable future.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">*/}
                  {/* Renewable Energy Card */}
                  {/*<div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-[#00792b]/20 shadow-lg hover:border-[#00792b]/30 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00792b]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Leaf className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#00792b] flex items-center justify-center mb-3">
                        <Leaf className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1 text-white font-altone">Renewable Energy</h3>
                      <p className="text-sm opacity-80 text-white font-arcon">
                        Access cutting-edge solar, wind, and energy storage solutions
                      </p>
                    </div>
                  </div>*/}

                  {/* Clean Transport Card */}
                  {/*<div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-[#1105ff]/20 shadow-lg hover:border-[#1105ff]/30 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1105ff] group-hover:opacity-100 "></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Zap className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#00792b] flex items-center justify-center mb-3">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1 text-white font-altone">Clean Transport</h3>
                      <p className="text-sm opacity-80 text-white font-arcon">
                        Discover EV infrastructure and sustainable mobility technologies
                      </p>
                    </div>
                  </div>*/}

                  {/* Water Solutions Card */}
                  {/*<div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-[#9b00ff]/20 shadow-lg hover:border-[#9b00ff]/30 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9b00ff] group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Droplets className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#1105ff] flex items-center justify-center mb-3">
                        <Droplets className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1 text-white font-altone">Water Solutions</h3>
                      <p className="text-sm opacity-80 text-white font-arcon">
                        Find water conservation and treatment technologies
                      </p>
                    </div>
                  </div>*/}

                  {/* Carbon Capture Card */}
                  {/*<div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-[#00792b] transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1105ff]/10 to-transparent opacity-0  transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Wind className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#00792b] flex items-center justify-center mb-3">
                        <Wind className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1 text-white font-altone">Carbon Capture</h3>
                      <p className="text-sm opacity-80 text-white font-arcon">
                        Connect with innovative carbon removal and storage solutions
                      </p>
                    </div>
                  </div>
                </div>*/}

                {/* Accelerate your impact section - now aligned with grid above */}
                {/*<div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 font-altone">Accelerate Your Impact</h3>
                      <p className="text-xs sm:text-sm text-white/80 font-arcon">
                        Join NoHarm's ecosystem of climate innovators and decision-makers
                      </p>
                    </div>
                    <Image
                      src="/images/noharm-ecosystem-icon.svg"
                      alt="NoHarm Ecosystem"
                      width={60}
                      height={60}
                      className="opacity-90 w-16 sm:w-20 h-16 sm:h-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>*/}
      {/* Scoped autofill styles - preventing browser white autofill*/}
{/*<style jsx global>{`
  .signup-page input:-webkit-autofill,
  .signup-page input:-webkit-autofill:hover,
  .signup-page input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px black inset !important;
    -webkit-text-fill-color: white !important;
    caret-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`}</style>*/}

    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <LoadingSpinner />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  )
} 
