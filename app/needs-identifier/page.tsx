"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import NeedsAssessmentForm from "@/components/forms/NeedsAssessmentForm"

export default function NeedsIdentifierPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Beta Banner */}
      <div className="bg-gradient-to-r from-[#e6f2e6] to-[#d4f4d4] py-2.5 px-4 sm:px-6 text-center font-medium text-[#2e7d32] shadow-sm text-sm sm:text-base">
        🚀 Beta Preview – Share Your Feedback & Help Shape the Future of Climate Tech
      </div>

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

        {/* Main Content */}
        <NeedsAssessmentForm />
      </div>
    </div>
  )
} 