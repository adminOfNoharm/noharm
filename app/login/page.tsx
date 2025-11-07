"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"
import Image from "next/image"
import { Leaf, Globe, Users, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "600", "800"], // Light, SemiBold & Bold
});

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
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
          if (profile.role === "pending") { //Added for New UI Logic
           console.log("User role is pending, redirecting to choose role page")
           window.location.href = "/signup/choose-role"
          } else if (profile.role === "admin") {
            console.log("Admin user, redirecting to admin dashboard")
            window.location.href = "/admin"
          } else if (profile.role === "buyer") {
            // Check if buyer has completed Stage 1 (KYC)
            const { data: stage1Data } = await supabase
              .from('user_onboarding_progress')
              .select('status')
              .eq('uuid', session.user.id)
              .eq('stage_id', 1)
              .single()
            
            if (stage1Data?.status === 'completed') {
              console.log("Buyer with completed KYC, redirecting to dashboard")
              window.location.href = "/dashboard"
            } else {
              console.log("Buyer without completed KYC, redirecting to onboarding dashboard")
              window.location.href = "/onboarding/dashboard"
            }
          } else if (profile.role === "seller") {
            // Check if seller has completed Stage 1 (KYC/Get to know you)
            const { data: stage1Data } = await supabase
              .from('user_onboarding_progress')
              .select('status')
              .eq('uuid', session.user.id)
              .eq('stage_id', 1)
              .single()
            
            if (stage1Data?.status === 'completed') {
              console.log("Seller with completed KYC, redirecting to dashboard")
              window.location.href = "/dashboard"
            } else {
              console.log("Seller without completed KYC, redirecting to onboarding dashboard")
              window.location.href = "/onboarding/dashboard"
            }
          } else {
            console.log("Regular user (ally), redirecting to onboarding dashboard")
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://noharm.tech/reset-password",
      })

      if (error) throw error
      setSuccessMessage("Password reset email sent! Please check your inbox.")
      setEmail("")
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to send reset password email")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      console.log("Attempting to sign in with:", email)

      // Sign in with the provided credentials
      const sanitizedEmail = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      })

      if (error) throw error

      console.log("Sign in successful, user data:", data.user)
      console.log("Session:", data.session)

      // Check for the user's role
      const { data: profileData, error: profileError } = await supabase
        .from("seller_compound_data")
        .select("role")
        .eq("uuid", data.user.id)
        .single()

      console.log("User profile data:", profileData, "Profile error:", profileError)

      if (profileData?.role === "admin") {
        console.log("Admin user detected, redirecting to admin dashboard")
        // For admin users, directly redirect without signing out
        window.location.href = "/admin"
        return
      }

      // Navigate based on redirect parameter or default path
      if (redirectPath) {
        console.log("Redirecting to:", redirectPath)
        // Don't sign out regular users either, just redirect
        window.location.href = redirectPath
      } else {
        console.log("Redirecting to dashboard")
        // Don't sign out regular users, just redirect to dashboard
        window.location.href = "/onboarding/dashboard"
      }

      // We return early after redirect, but still set loading to false in case
      setLoading(false)
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred")
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[url('/images/new-background.png')] bg-cover bg-center text-gray-800 ${montserrat.className}">
      {/* Center - Login form */}
      {/*<div className="w-full lg:w-1/2 p-8 flex flex-col">*/}
      <div className="w-full p-8 flex flex-col">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-[#4100e2] border border-[#3a00c9] rounded-sm shadow-sm hover:bg-[#3a00c9] focus:outline-none focus:ring-1 focus:ring-[#3a00c9] font-montserrat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to home
          </button>
        </div>

        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <Image
              src="/images/logos/new-logo.png"
              alt="NoHarm Logo"
              width={180}
              height={50}
              className="h-[40px] w-auto mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold text-white mb-2">
              {isResetPassword ? "Reset Password" : "Welcome"}
            </h1>
            <p className="text-gray-50 font-light text-lg">
              {isResetPassword ? "Enter your email to reset your password" : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={isResetPassword ? handleResetPassword : handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-md font-medium text-gray-50 mb-1 font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#4200fc] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4100e2] focus:border-[#4100e2] text-gray-800 shadow-sm font-montserrat"
                required
                placeholder="your@email.com"
              />
            </div>

            {!isResetPassword && (
            <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-md font-medium text-gray-50 mb-1 font-semibold">
                    Password
                  </label>
                </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#4200fc] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4100e2] focus:border-[#4100e2] text-gray-800 shadow-sm font-montserrat pr-12"
                  required
                  placeholder="••••••••"
                />

                {/* Eye toggle button */}
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
            )}

            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200 font-montserrat">{error}</div>
            )}

            {successMessage && (
              <div className="text-xs text-green-600 bg-green-50 p-3 rounded-md border border-green-200 font-montserrat">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md font-medium font-montserrat transition-colors ${
                loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              {loading ? <LoadingSpinner /> : isResetPassword ? "Send Reset Link" : "Sign In"}
            </button>

            <div className="mt-4 text-center">
              {!isResetPassword ? (
                <div className="space-y-2">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetPassword(true)
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className="text-sm text-[#9db1fc] hover:text-[#706eff] font-semibold"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-100 font-montserrat">
                      Don't have an account?{" "}
                      <Link 
                        href="/signup" 
                        className="text-[#9db1fc] hover:text-[#706eff] font-semibold font-montserrat"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPassword(false)
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="text-sm text-[#9db1fc] hover:text-[#706eff] font-medium"
                >
                  Back to login
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Enhanced climate solutions visual - Removing*/}
      {/*<div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00792b] to-[#005c20] rounded-l-3xl overflow-hidden">*/}
          {/* Enhanced background with subtle pattern and gradient */}
          {/*<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,121,43,0.4)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 opacity-10 bg-pattern"></div>*/}

          {/* Subtle floating particles */}
          {/*<div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-2 h-2 rounded-full bg-white/30 top-[20%] left-[30%] animate-float-slow"></div>
            <div className="absolute w-3 h-3 rounded-full bg-white/20 top-[65%] left-[15%] animate-float-medium"></div>
            <div className="absolute w-2 h-2 rounded-full bg-white/30 top-[35%] left-[75%] animate-float-fast"></div>
            <div className="absolute w-4 h-4 rounded-full bg-white/10 top-[80%] left-[60%] animate-float-slow"></div>
          </div>

          <div className="h-full flex flex-col justify-center p-12 relative z-10">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-5">
                  <Image src="/images/logos/iconlogo.png" alt="NoHarm Logo" width={40} height={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Welcome to NoHarm</h2>
                  <p className="text-white/80 mt-1">Where climate innovation meets opportunity</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl mb-8 border border-white/10 shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Climate Solutions Platform</h3>
                    <p className="text-white/80">
                      NoHarm connects innovative climate technologies with buyers and partners worldwide, helping scale
                      your impact and accelerate adoption.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#1105ff]/60 backdrop-blur-sm p-5 rounded-xl border border-white/10 shadow-lg hover:bg-[#9b00ff] transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#9b00ff] flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">Global Network</h3>
                  </div>
                  <p className="text-white/80 text-sm">
                    Join our community of climate innovators and solution providers
                  </p>
                </div>

                <div className="bg-[#9b00ff]/70 backdrop-blur-sm p-5 rounded-xl border border-white/20 shadow-lg hover:bg-[#1105ff] transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#1105ff] flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 8V5L19 2L20 4L22 5L19 8H16ZM16 8L12 11.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white">Market Access</h3>
                  </div>
                  <p className="text-white/80 text-sm">Reach decision-makers looking for sustainable solutions</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-[#00792b]"></div>
                      <div className="w-8 h-8 rounded-full bg-white/40 border-2 border-[#00792b]"></div>
                      <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#00792b] flex items-center justify-center text-xs text-white font-medium">
                        +
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium">Join 200+ Climate Innovators</p>
                      <p className="text-white/70 text-sm">Making a difference through sustainable technology</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>*/}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
