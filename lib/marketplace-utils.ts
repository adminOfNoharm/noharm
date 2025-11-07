import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Profile 0 interface - minimal seller profile from intake form
export interface Profile0Company {
  id: string
  company_name: string
  year_founded: number
  public_region: string
  industry_regions: string[]
  application_areas: string[]
  brief_description: string
  generic_image: string
}

// Legacy interface for backward compatibility
export interface MarketplaceCompany {
  id: string
  name: string
  technology: string
  industry: string
  rating: number
  image: string
  description: string
}

// Fetch Profile 0 companies from intake form data
export async function fetchProfile0Companies(): Promise<Profile0Company[]> {
  try {
    const { data: intakeForms, error } = await supabase
      .from('seller_intake_form')
      .select('*')

    if (error) throw error

    const profile0Companies: Profile0Company[] = intakeForms.map(form => ({
      id: form.id,
      company_name: form.company_name,
      year_founded: form.year_founded,
      public_region: form.public_region,
      industry_regions: form.industry_regions || [],
      application_areas: form.application_areas || [],
      brief_description: form.brief_description,
      generic_image: generateGenericImage(form.company_name)
    }))

    return profile0Companies
  } catch (error) {
    console.error('Error fetching Profile 0 companies:', error)
    return []
  }
}

// Generate a generic image pattern based on company name
function generateGenericImage(companyName: string): string {
  const patterns = [
    'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2300792b\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%231105ff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239b00ff\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
    'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300792b\' fill-opacity=\'0.15\'%3E%3Cpath d=\'m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
  ]
  
  // Use company name to consistently generate same pattern
  const hash = companyName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return patterns[Math.abs(hash) % patterns.length]
}

// Legacy function for backward compatibility - now uses Profile 0 data
export async function fetchMarketplaceProfiles(): Promise<MarketplaceCompany[]> {
  try {
    const profile0Companies = await fetchProfile0Companies()
    
    // Convert Profile 0 to legacy MarketplaceCompany format
    const marketplaceCompanies: MarketplaceCompany[] = profile0Companies.map(company => ({
      id: company.id,
      name: company.company_name,
      technology: company.application_areas.join(', ') || 'Climate Tech',
      industry: company.industry_regions[0] || 'Global',
      rating: 4.5, // Default rating for Profile 0
      image: company.generic_image,
      description: company.brief_description
    }))

    return marketplaceCompanies
  } catch (error) {
    console.error('Error fetching marketplace profiles:', error)
    return []
  }
}

// Helper function to get primary industry from regions
export function getPrimaryIndustry(industryRegions: string[]): string {
  if (!industryRegions || industryRegions.length === 0) return 'Global'
  return industryRegions[0]
} 