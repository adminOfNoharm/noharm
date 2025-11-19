'use client'

import { useEffect, useState } from 'react'
import { Search, ArrowLeft, Eye } from 'lucide-react'
import Link from 'next/link'

import { Button } from "@/components/ui/button"
import { Profile0CompanyCard } from "@/components/ui/profile0-company-card"
import { MarketplaceHeader } from "@/components/ui/marketplace-header"
import { fetchProfile0Companies, Profile0Company } from "@/lib/marketplace-utils"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function MarketplacePreview() {
  const [companies, setCompanies] = useState<Profile0Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<Profile0Company | null>(null)

  useEffect(() => {
    async function loadProfile0Companies() {
      try {
        const profile0Companies = await fetchProfile0Companies()
        setCompanies(profile0Companies)

        // Check if current user has a profile in the marketplace
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: userIntakeForm } = await supabase
            .from('seller_intake_form')
            .select('*')
            .eq('uuid', session.user.id)
            .single()

          if (userIntakeForm) {
            // Find user's profile in the companies list
            const userCompany = profile0Companies.find(company => company.id === userIntakeForm.id)
            if (userCompany) {
              setUserProfile(userCompany)
            }
          }
        }
      } catch (err) {
        setError('Failed to load seller profiles')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile0Companies()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-white font-arcon">
        <MarketplaceHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white font-arcon">
        <MarketplaceHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-red-500">Failed to load profiles. Please try again later.</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white font-arcon">
      <MarketplaceHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-gray-600 hover:text-[#00792b] hover:bg-[#00792b]/10 p-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Preview Mode Banner */}
        <div className="mb-6 bg-gradient-to-r from-[#1105ff]/10 to-[#9b00ff]/10 border border-[#1105ff]/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-[#1105ff] flex items-center justify-center flex-shrink-0">
              <Eye className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1105ff] mb-1">
                🔍 Marketplace Preview Mode
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                This is a preview of how the marketplace looks to buyers. You're seeing all Profile 0 listings including your own.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <Link href="/marketplace" className="text-[#00792b] hover:underline font-medium">
                  View Actual Marketplace →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Preview Banner */}
        {userProfile && (
          <div className="mb-6 bg-gradient-to-r from-[#00792b]/10 to-[#9b00ff]/10 border border-[#00792b]/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[#00792b] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {userProfile.company_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#00792b] mb-1">
                  🎉 Your Profile 0 is Live!
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  This is how buyers see your company on the marketplace. Your profile shows your industry, founding year, and applications - no company name is displayed for privacy.
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Your profile:</strong> {userProfile.industry_regions.join(', ')} • Founded {userProfile.year_founded} • {userProfile.application_areas.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#00792b] font-altone">Marketplace Preview</h1>
          <p className="text-gray-600">
            Preview how buyers discover climate tech companies on the marketplace
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Profile 0 - Anonymous seller profiles from completed intake forms
          </p>
        </div>

        {/* Profile 0 Companies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="relative">
              <Profile0CompanyCard 
                company={company}
                userProfile={userProfile}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {companies.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No seller profiles found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No sellers have completed their intake forms yet. Complete yours to be the first!
            </p>
          </div>
        )}

        {/* Action Section */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to go live?</h3>
            <p className="text-gray-600 mb-4">
              Your Profile 0 is ready and will be visible to buyers on the actual marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-[#00792b] hover:bg-[#00792b]/90">
                <Link href="/marketplace">
                  View Live Marketplace
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
