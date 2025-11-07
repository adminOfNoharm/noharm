import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Category mapping for different types of technologies
const categoryMapping: { [key: string]: string } = {
  // Energy related categories
  'Solar Energy': 'Energy',
  'Wind Energy': 'Energy',
  'Energy Storage': 'Energy',
  'Energy Efficiency': 'Energy',
  'Thermal Energy Storage Systems': 'Energy',
  'Energy Management': 'Energy',
  'Renewable Energy': 'Energy',
  
  // Water related categories
  'Water Purification': 'Water',
  'Water Treatment': 'Water',
  'Water Management': 'Water',
  'Water Safety & Disinfection Technologies': 'Water',
  'Water Conservation': 'Water',
  'Smart Water': 'Water',
  
  // Waste related categories
  'Waste Management': 'Waste',
  'Waste Treatment': 'Waste',
  'Recycling': 'Waste',
  'Plastic Waste Recycling': 'Waste',
  'Chemical Recycling': 'Waste',
  'Waste-to-Energy': 'Waste',
  'Circular Economy': 'Waste'
}

export interface MarketplaceCompany {
  id: string
  name: string
  technology: string
  industry: string
  rating: number
  image: string
  description: string
}

export async function fetchMarketplaceProfiles(): Promise<MarketplaceCompany[]> {
  try {
    const { data: profiles, error } = await supabase
      .from('tool_profiles')
      .select('*')
      .eq('type', 'seller')

    if (error) throw error

    const marketplaceCompanies: MarketplaceCompany[] = profiles
      .map(profile => {
        const category = profile.data?.toolInfo?.category || ''
        const mainCategory = determineMainCategory(category)
        
        if (!mainCategory) return null

        return {
          id: profile.id,
          name: profile.data?.companyName || profile.name,
          technology: profile.data?.toolInfo?.name || '',
          industry: mainCategory,
          rating: profile.data?.companyInfo?.sustainabilityScore || 4.5,
          image: profile.data?.companyInfo?.logo || '/placeholder.svg?height=400&width=400',
          description: profile.data?.toolDescription?.short || ''
        }
      })
      .filter((company): company is MarketplaceCompany => company !== null)

    return marketplaceCompanies
  } catch (error) {
    console.error('Error fetching marketplace profiles:', error)
    return []
  }
}

function determineMainCategory(category: string): string | null {
  // Direct match
  if (categoryMapping[category]) {
    return categoryMapping[category]
  }

  // Check if the category contains any of our main categories
  const mainCategories = ['Energy', 'Water', 'Waste']
  for (const mainCat of mainCategories) {
    if (category.toLowerCase().includes(mainCat.toLowerCase())) {
      return mainCat
    }
  }

  // Check if the category matches any of our mapped categories
  for (const [mappedCat, mainCat] of Object.entries(categoryMapping)) {
    if (category.toLowerCase().includes(mappedCat.toLowerCase())) {
      return mainCat
    }
  }

  // If no match is found, try to make an educated guess based on keywords
  const keywords = category.toLowerCase().split(/[\s/&]+/)
  for (const keyword of keywords) {
    if (['solar', 'wind', 'thermal', 'power', 'electricity'].includes(keyword)) {
      return 'Energy'
    }
    if (['water', 'hydro', 'aqua', 'fluid'].includes(keyword)) {
      return 'Water'
    }
    if (['waste', 'recycl', 'trash', 'circular'].includes(keyword)) {
      return 'Waste'
    }
  }

  return null
} 