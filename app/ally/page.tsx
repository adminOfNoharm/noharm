'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateSecurePassword } from '@/lib/utils/password'
import { toast } from '@/components/ui/toast'
import { sendWelcomeEmail } from '@/lib/utils/email-templates'
import { trackEvent } from '@/lib/utils/analytics'
import OnboardingDialog from '@/components/ally/OnboardingDialog'
import DashboardRedirectButton from '@/components/ally/DashboardRedirectButton'
import AllyContent from '@/components/ally/AllyContent'
import Navbar from '@/components/landing/navbar'
import { User } from 'lucide-react'

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

function AllyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  useEffect(() => {
    const autoSignup = async () => {
      const email = searchParams?.get('email')
      if (!email) return
      
      await trackEvent('email_link_click', {
        email,
        url: window.location.href,
        source: 'email_invite'
      })
      
      if (!isValidEmail(email)) {
        toast.error('Invalid email address provided')
        return
      }

      setIsLoading(true)
      setLoadingMessage(`Creating custom session for user: ${email}`)

      try {
        const { data: { user: existingUser } } = await supabase.auth.getUser()
        if (existingUser) {
          setIsAuthenticated(true)
          setUserEmail(existingUser.email || null)
          setIsLoading(false)
          return
        }

        await trackEvent('signup_start', { email })

        const password = generateSecurePassword()
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding/dashboard`
          }
        })

        if (error) {
          if (error.message === 'User already registered') {
            setUserEmail(email)
            setShowLoginDialog(true)
            setIsLoading(false)
            return
          }
          throw error
        }

        if (data.user) {
          const name = email.split('@')[0]
          
          const { error: roleError } = await supabase
            .from('seller_compound_data')
            .upsert({
              uuid: data.user.id,
              data: {},
              role: 'ally',
              status: 'not_started',
              name
            })

          if (roleError) throw roleError

          setIsAuthenticated(true)
          setUserEmail(email)
          setIsLoading(false)
          toast.success('Session successfully created!')

          sendWelcomeEmail(email, name).catch(console.error)
          trackEvent('signup_complete', { email }).catch(console.error)
        }
      } catch (error) {
        console.error('Auto-signup error:', error)
        toast.error('Failed to create account automatically')
        setIsLoading(false)
      }
    }

    autoSignup()
  }, [searchParams, router])

  return (
    <>
      <Navbar 
        isAuthenticated={isAuthenticated} 
        userEmail={userEmail}
        CustomButton={
          isAuthenticated ? (
            <DashboardRedirectButton className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{userEmail}</span>
              <span className="ml-2 pl-2 border-l border-white/20">
                Continue Setup →
              </span>
            </DashboardRedirectButton>
          ) : undefined
        }
      />
      
      <AllyContent isAuthenticated={isAuthenticated} />

      <OnboardingDialog
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        showLoginDialog={showLoginDialog}
        userEmail={userEmail}
        onLoginClick={() => router.push('/login')}
        onCloseLoginDialog={() => setShowLoginDialog(false)}
      />
    </>
  )
}

// Wrap the main component in Suspense
export default function Ally() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loading...
          </h1>
        </div>
      </div>
    }>
      <AllyPage />
    </Suspense>
  )
} 