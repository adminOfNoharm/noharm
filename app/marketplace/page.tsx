'use client'

import { useEffect, useState } from 'react'
import { Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from "@/components/ui/button"
import { Profile0CompanyCard } from "@/components/ui/profile0-company-card"
import { MarketplaceHeader } from "@/components/ui/marketplace-header"
import { fetchProfile0Companies, Profile0Company } from "@/lib/marketplace-utils"

export default function Home() {
  const [companies, setCompanies] = useState<Profile0Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile0Companies() {
      try {
        const profile0Companies = await fetchProfile0Companies()
        setCompanies(profile0Companies)
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00792b]"></div>
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


        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#00792b] font-altone">Discover Climate Tech Sellers</h1>
          <p className="text-gray-600">
            Browse verified climate tech companies ready to help you achieve your{" "}
            <span className="text-[#9b00ff]">sustainability goals</span>
          </p>
        </div>

        {/* Profile 0 Companies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company) => (
            <Profile0CompanyCard 
              key={company.id} 
              company={company}
              userProfile={null}
            />
          ))}
        </div>

        {/* Empty State */}
        {companies.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No sellers have completed their intake forms yet. Check back soon for climate tech solutions!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
