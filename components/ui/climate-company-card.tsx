import Image from "next/image"
import Link from "next/link"
import { Star, Lock } from 'lucide-react'

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Company {
  id: string | number
  name: string
  technology: string
  industry: string
  rating: number
  image: string
  description?: string
}

interface ClimateCompanyCardProps {
  company: Company
}

export function ClimateCompanyCard({ company }: ClimateCompanyCardProps) {
  // Generate a random pattern for companies without images
  const patterns = [
    'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2300792b\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300792b\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2300792b\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'
  ];
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];

  return (
    <Link href={`/company/${company.id}`} className="group">
      <Card className="overflow-hidden border-2 border-gray-100 transition-all duration-300 hover:border-[#00792b] hover:shadow-md relative opacity-70 hover:opacity-100">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#00792b] via-[#1105ff] to-[#9b00ff]"></div>

        <div 
          className="relative h-48 w-full overflow-hidden"
          style={{
            backgroundImage: company.image !== '/placeholder.svg?height=400&width=400' ? 'none' : randomPattern,
            backgroundColor: '#f8f9fa'
          }}
        >
          {company.image !== '/placeholder.svg?height=400&width=400' && (
            <Image
              src={company.image}
              alt={company.name}
              fill
              className="object-cover"
            />
          )}
          
          {/* Permanent semi-transparent overlay */}
          <div className="absolute inset-0 bg-black/70 z-10"></div>

          <Badge className="absolute right-2 top-2 bg-[#00792b] z-20 font-altone">{company.industry}</Badge>

          {/* Company logo overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="h-20 w-20 relative bg-white rounded-full p-2 shadow-md">
              <Image
                src={company.image !== '/placeholder.svg?height=400&width=400' ? company.image : `/placeholder.svg?height=80&width=80&text=${company.name.charAt(0)}`}
                alt={`${company.name} logo`}
                fill
                className="object-contain p-2"
              />
            </div>
          </div>

          {/* Lock indicator */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white z-20">
            <div className="flex items-center text-xs font-arcon">
              <Lock className="h-3 w-3 mr-1" />
              <span>Full details available after contact</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00792b] font-altone">{company.name}</h3>
          <p className="mt-1 text-sm text-gray-600 font-arcon">{company.technology}</p>
          {company.description && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2 font-arcon">{company.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs bg-[#00792b]/10 text-[#00792b] border-[#00792b]/20 font-arcon">
              Climate Tech
            </Badge>
            <Badge variant="outline" className="text-xs bg-[#1105ff]/10 text-[#1105ff] border-[#1105ff]/20 font-arcon">
              Innovative
            </Badge>
            <Badge variant="outline" className="text-xs bg-[#9b00ff]/10 text-[#9b00ff] border-[#9b00ff]/20 font-arcon">
              Verified
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 p-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-[#00792b] text-[#00792b]" />
            <span className="ml-1 text-sm font-medium font-arcon">{company.rating}</span>
          </div>
          <Badge className="bg-[#1105ff] hover:bg-[#1105ff]/90 transition-colors font-altone">View Profile</Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}