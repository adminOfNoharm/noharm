import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Profile0Company } from "@/lib/marketplace-utils"

interface Profile0CompanyCardProps {
  company: Profile0Company
  userProfile?: Profile0Company | null
}

export function Profile0CompanyCard({ company, userProfile }: Profile0CompanyCardProps) {
  return (
    <Card className="overflow-hidden border-2 border-gray-100 transition-all duration-300 hover:border-[#00792b] hover:shadow-md relative hover:scale-[1.02]">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#00792b] via-[#1105ff] to-[#9b00ff]"></div>

      {/* Generic Pattern Background */}
      <div 
        className="relative h-48 w-full overflow-hidden"
        style={{
          backgroundImage: company.generic_image,
          backgroundColor: '#f8f9fa'
        }}
      >
        {/* Company Initial Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white">
            <span className="text-2xl font-bold text-[#00792b]">
              {company.company_name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Industry Badge */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {userProfile && company.id === userProfile.id && (
            <Badge className="bg-[#00792b] text-white font-medium">
              Your Profile
            </Badge>
          )}
          <Badge className="bg-[#00792b]/90 text-white font-medium">
            {company.industry_regions[0] || 'Global'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Industry / Year Founded */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Industry:</span> {company.industry_regions.join(', ') || 'Global'}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Founded:</span> {company.year_founded}
          </div>
        </div>

        {/* Application Areas */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Applications:</p>
          <div className="flex flex-wrap gap-1">
            {company.application_areas.slice(0, 3).map((area, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-[#1105ff]/10 text-[#1105ff] border-[#1105ff]/20"
              >
                {area}
              </Badge>
            ))}
            {company.application_areas.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs bg-gray-100 text-gray-600 border-gray-200"
              >
                +{company.application_areas.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Brief Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {company.brief_description}
        </p>

        {/* Profile 0 Badge */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Badge className="bg-[#9b00ff]/10 text-[#9b00ff] border-[#9b00ff]/20" variant="outline">
              Profile 0 • Verified
            </Badge>
            <span className="text-xs text-gray-500">
              Climate Tech Solution
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
