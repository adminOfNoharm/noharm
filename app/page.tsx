'use client'

import { useState, useEffect } from 'react'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import HowItWorks from '@/components/landing/HowItWorks'
import Features from '@/components/landing/Features'
import Testimonials from '@/components/landing/Testimonials'
import FAQ from '@/components/landing/FAQ'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/navbar'
import { SolutionTabs } from '@/components/landing/solution-tabs'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session?.user)
      setUserEmail(session?.user?.email || null)
    }
    checkAuth()
  }, [])

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} userEmail={userEmail} />
      <div className="font-arcon min-h-screen">
        <main>
          <Hero />
          <Stats />
          <HowItWorks />
          <SolutionTabs/>
          <Features />
          {/* <Testimonials /> */}
          <FAQ />
          <CTA />
        </main>
      </div>
      <Footer />
    </div>
  )
}

