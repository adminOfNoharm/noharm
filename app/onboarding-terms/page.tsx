"use client"

import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/navbar";
import Link from "next/link"
import { useState } from "react"
import React from 'react';

interface Section {
  id: string
  title: string
}

interface TermsSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

const sections: Section[] = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "marketplace-purpose", title: "2. Marketplace Purpose" },
  { id: "data-collection", title: "3. Data Collection and Usage" },
  { id: "user-obligations", title: "4. User Obligations" },
  { id: "intellectual-property", title: "5. Intellectual Property" },
  { id: "liability", title: "6. Limitation of Liability" },
  { id: "termination", title: "7. Termination" },
  { id: "changes", title: "8. Changes to Terms" },
]

const TermsSection: React.FC<TermsSectionProps> = ({ id, title, children }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  return (
    <section id={id} className="mt-8 border-t pt-8">
      <h2
        className="text-lg leading-6 font-medium text-gray-800 hover:text-[#00792b] transition-colors duration-200 mb-4 cursor-pointer flex items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {title}
        <svg
          className={`ml-2 h-5 w-5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </h2>
      <div
        className={`mt-2 transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[1000px] opacity-100 bg-[#f7f9ff] p-4 rounded-md" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </section>
  )
}

const renderSectionContent = (id: string): React.ReactNode => {
  switch (id) {
    case "acceptance":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            By accessing or using the Noharm marketplace platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access or use our services.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            These terms apply to all users of the platform, including buyers, sellers, and other participants in the marketplace ecosystem.
          </p>
        </div>
      )
    case "marketplace-purpose":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            The Noharm marketplace is designed exclusively for business-to-business interactions in the climate technology sector. The platform facilitates:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Connection between climate technology buyers and sellers</li>
            <li>Business profile creation and management</li>
            <li>Marketplace listings for climate technology solutions</li>
            <li>Business matchmaking and opportunity discovery</li>
          </ul>
        </div>
      )
    case "data-collection":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            Data collection and processing are conducted in accordance with EU regulations, including GDPR. We collect and use data solely for:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Creating and managing business profiles</li>
            <li>Facilitating marketplace transactions</li>
            <li>Improving platform functionality and user experience</li>
            <li>Compliance with legal obligations</li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            All data processing activities are conducted with transparency and in compliance with applicable data protection laws. For detailed information about our data practices, please refer to our Privacy Policy.
          </p>
        </div>
      )
    case "user-obligations":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            As a user of our platform, you agree to:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Provide accurate and truthful information about your business</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Use the platform only for legitimate business purposes</li>
            <li>Respect intellectual property rights and confidential information</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </div>
      )
    case "intellectual-property":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            All platform content, features, and functionality are owned by Noharm and protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            Users retain ownership of their own content but grant Noharm a license to use, display, and process their information for platform operations.
          </p>
        </div>
      )
    case "liability":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            Noharm provides the platform "as is" and "as available" without any warranties, express or implied. We are not liable for:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Business transactions between users</li>
            <li>Content posted by users</li>
            <li>Service interruptions or technical issues</li>
            <li>Indirect or consequential damages</li>
          </ul>
        </div>
      )
    case "termination":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            We reserve the right to terminate or suspend access to our platform:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>For violations of these terms</li>
            <li>For illegal or unauthorized use</li>
            <li>At our sole discretion when deemed necessary</li>
          </ul>
        </div>
      )
    case "changes":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the platform.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            Continued use of the platform after changes constitutes acceptance of the modified terms. We will notify users of significant changes via email or platform notifications.
          </p>
        </div>
      )
    default:
      return null
  }
}

const OnboardingTerms: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-white to-[#f0f2ff] font-arcon pt-20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-black">Terms and Conditions</h1>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col md:flex-row gap-8">
              <nav className="md:w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Table of Contents</h2>
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <Link
                          href={`#${section.id}`}
                          className="text-gray-700 hover:text-[#1105ff] transition-colors duration-200"
                        >
                          {section.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>

              <div className="flex-grow">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg leading-6 font-medium text-[#00792b] mb-4">Effective Date: 14/01/2025</h2>
                    <h2 className="text-lg leading-6 font-medium text-[#00792b] mb-4">Last Updated: 17/01/2025</h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-700">
                      Welcome to Noharm. These Terms and Conditions govern your use of our marketplace platform and outline the rules and regulations for accessing and using our services. Please read these terms carefully before proceeding with registration and platform usage.
                    </p>

                    {sections.map((section) => (
                      <TermsSection key={section.id} id={section.id} title={section.title}>
                        {renderSectionContent(section.id)}
                      </TermsSection>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OnboardingTerms; 