import Link from "next/link"
import { Search, User } from 'lucide-react'
import Image from "next/image"

import { Button } from "@/components/ui/button"

export function MarketplaceHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b">
      <div className="relative bg-gradient-to-r from-[#00792b]/5 via-[#1105ff]/5 to-[#9b00ff]/5">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        
        <div className="container mx-auto flex h-16 items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
              <div className="h-16 w-36 relative overflow-hidden">
              <Image
                src="/images/logos/new-logo-blue.png"
                  alt="NoHarm Logo"
                  fill
                className="object-contain"
                  priority
              />
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-[#1105ff] hover:bg-[#1105ff]/10">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
            <Button variant="ghost" size="icon" className="text-[#9b00ff] hover:bg-[#9b00ff]/10">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </div>
      </div>
      </div>
      
      <div className="h-1 w-full bg-gradient-to-r from-[#00792b] via-[#1105ff] to-[#9b00ff]"></div>
    </header>
  )
}
