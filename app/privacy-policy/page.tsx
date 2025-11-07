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

interface PrivacySectionProps {
  id: string
  title: string
  children: React.ReactNode
}

const sections: Section[] = [
  { id: "information-we-collect", title: "1. Information We Collect" },
  { id: "how-we-use-your-information", title: "2. How We Use Your Information" },
  { id: "data-protection-and-security", title: "3. Data Protection and Security" },
  { id: "compliance-with-gdpr", title: "4. Compliance with GDPR and Data Subject Rights" },
  { id: "international-data-transfers", title: "5. International Data Transfers" },
  { id: "data-retention-policy", title: "6. Data Retention Policy" },
  { id: "cookies-and-tracking", title: "7. Cookies and Tracking Technologies" },
  { id: "third-party-services", title: "8. Third-Party Services" },
  { id: "how-to-contact-us", title: "9. How to Contact Us" },
  { id: "changes-to-policy", title: "10. Changes to This Privacy Policy" },
]

const PrivacySection: React.FC<PrivacySectionProps> = ({ id, title, children }) => {
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
    case "information-we-collect":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            We collect business-related information necessary to facilitate transactions and improve user experience on
            our platform. This includes:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>
              Company Information: Business name, industry, maturity level, technology proficiency, and other
              business-related details.
            </li>
            <li>
              Climate Tech Solutions: Information regarding the products, services, or solutions offered or sought.
            </li>
            <li>
              Onboarding Data: Details required to create a business profile, assess suitability for matchmaking, and
              optimize platform recommendations.
            </li>
            <li>
              Payment Information: Payment transactions are processed securely via Stripe. We do not store or have
              access to your financial data.
            </li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            We do not collect personal data beyond what is required for company profile creation and business
            transactions.
          </p>
        </div>
      )
    case "how-we-use-your-information":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            Your information is used strictly for platform operations and service improvement. Specifically, we use your
            data for:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>
              Profile Creation and Management: To enable businesses to present their climate tech solutions and engage
              with relevant partners.
            </li>
            <li>AI-Powered Matchmaking: To connect buyers and suppliers based on relevant criteria.</li>
            <li>
              Customer Support and Platform Enhancements: To provide assistance and continuously improve our services.
            </li>
            <li>
              Secure Payments and Transactions: Payment processing is handled by Stripe in compliance with PCI DSS
              standards.
            </li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            We do not use your data for marketing purposes without explicit consent.
          </p>
        </div>
      )
    case "data-protection-and-security":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Data Encryption: All stored data is encrypted to prevent unauthorized access.</li>
            <li>
              Secure Payment Processing: Transactions are processed through Stripe, ensuring compliance with global
              security standards.
            </li>
            <li>Access Control: Data access is restricted to authorized personnel only.</li>
            <li>No Third-Party Data Sharing: We do not sell, rent, or disclose user data to third parties.</li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            We regularly review our security protocols to maintain compliance with best practices and evolving data
            protection standards.
          </p>
        </div>
      )
    case "compliance-with-gdpr":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            For users in the European Union and the United Kingdom, we comply with the General Data Protection
            Regulation (GDPR). Under GDPR, you have the following rights:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Right to Access: You can request a copy of the data we hold about your business.</li>
            <li>Right to Rectification: You can request corrections to any inaccurate or incomplete data.</li>
            <li>Right to Erasure: You can request the deletion of your data under certain conditions.</li>
            <li>Right to Data Portability: You can request your data in a structured, commonly used format.</li>
            <li>Right to Object: You can object to data processing under specific circumstances.</li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            To exercise any of these rights, please contact us at [Insert Contact Email]. We will respond within the
            legally mandated timeframe.
          </p>
        </div>
      )
    case "international-data-transfers":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            As a U.S.-based company, we may store and process data outside the European Economic Area (EEA). We
            implement adequate safeguards to ensure that your data remains protected in compliance with GDPR, including:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission.</li>
            <li>Security measures to ensure data protection equivalent to GDPR requirements.</li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            By using our platform, you acknowledge and agree to the transfer of your data outside your country of
            residence.
          </p>
        </div>
      )
    case "data-retention-policy":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">We retain your data only for as long as necessary to:</p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Fulfill the purposes outlined in this Privacy Policy.</li>
            <li>Comply with legal, regulatory, and contractual obligations.</li>
            <li>Resolve disputes and enforce our agreements.</li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            When data is no longer needed, we securely delete or anonymize it in accordance with our data retention
            policies.
          </p>
        </div>
      )
    case "cookies-and-tracking":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            At this time, we do not use cookies or third-party tracking technologies. However, we use session storage to
            ensure that users do not lose progress during onboarding if they leave or experience connectivity issues.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            If we introduce tracking technologies in the future, we will update this Privacy Policy and provide
            appropriate opt-in mechanisms.
          </p>
        </div>
      )
    case "third-party-services":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            We use third-party services strictly for operational purposes, including:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Payment Processing: All financial transactions are securely handled by Stripe.</li>
            <li>Cloud Storage and Hosting: We may use cloud-based infrastructure to ensure platform reliability.</li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            These service providers are contractually obligated to maintain confidentiality and comply with relevant
            data protection regulations.
          </p>
        </div>
      )
    case "how-to-contact-us":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            For any questions, requests, or concerns about this Privacy Policy or your data, you can contact us via:
          </p>
          <ul className="list-disc pl-5 mt-2 max-w-2xl text-sm text-gray-700">
            <li>Email: development@noharm.tech</li>
          </ul>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            We take privacy-related concerns seriously and will address them promptly in accordance with applicable
            regulations.
          </p>
        </div>
      )
    case "changes-to-policy":
      return (
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            We may update this Privacy Policy from time to time to reflect changes in our services, legal requirements,
            or data protection practices. Any updates will be posted on this page with a revised "Last Updated" date.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            If significant changes occur, we may notify users via email or platform notifications. We encourage you to
            review this page periodically to stay informed about how we protect your information.
          </p>
        </div>
      )
    default:
      return null
  }
}

const PrivacyPolicy: React.FC = () => {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />
  
        {/* Main content wrapper */}
        <main className="flex-grow bg-gradient-to-b from-white to-[#f0f2ff] font-arcon pt-20">
          {/* Privacy Policy Header */}
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-black">Privacy Policy</h1>
          </div>
  
          {/* Privacy Policy Content */}
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Table of Contents Sidebar */}
                <nav className="md:w-64 flex-shrink-0">
                  <div className="sticky top-24"> {/* Adjusted to be below navbar */}
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
  
                {/* Privacy Policy Text */}
                <div className="flex-grow">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h2 className="text-lg leading-6 font-medium text-[#00792b] mb-4">Effective Date: 14/01/2025</h2>
                      <h2 className="text-lg leading-6 font-medium text-[#00792b] mb-4">Last Updated: 17/01/2025</h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-700">
                      Noharm ("Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.

                             By accessing or using our services, you agree to the collection and use of your information in accordance with this Privacy Policy. If you do not agree with any part of this policy, please do not use our platform.
                      </p>
  
                      {sections.map((section) => (
                        <PrivacySection key={section.id} id={section.id} title={section.title}>
                          {renderSectionContent(section.id)}
                        </PrivacySection>
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
  
  export default PrivacyPolicy;
  