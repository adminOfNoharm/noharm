'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { Globe, MapPin, ChevronRight, Info, ChevronDown } from 'lucide-react';
import { ProfileData } from './data';

interface Template2Props {
  profile: ProfileData;
}

export default function Template2({ profile }: Template2Props) {
  const [showFullCompanyDetails, setShowFullCompanyDetails] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Extract data from profile
  const { companyInfo, toolInfo, certificates, companyName, howItWorks, useCases, sidebarDescription, toolDescription, ipStatus } = profile.data;

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Hero Section with optimized heights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">
          {/* Company Details Card - Dynamically sized but coordinated with score card */}
          <div className="lg:col-span-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden h-auto lg:h-[350px]">
            <div className="p-6 flex flex-col h-full">
              {showFullCompanyDetails ? (
                /* Expanded company details */
                <div className="h-full flex flex-col">
                  <button
                    onClick={() => setShowFullCompanyDetails(false)}
                    className="flex items-center mb-6 text-sm font-medium text-white hover:text-blue-200 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                    <span>Back to summary</span>
                  </button>
                  
                  <div className="space-y-6 overflow-y-auto">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">About Company</h3>
                      <p className="text-blue-100">{companyInfo.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Founded</h3>
                      <p className="text-blue-100">{companyInfo.foundedYear}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Company summary */
                <>
                  {/* Company Header - Now Tool Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <div className="absolute inset-0 rounded-lg bg-white"></div>
                      <Image
                        src={companyInfo.logo}
                        alt="Company Logo"
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">
                        {toolInfo.name}
                      </h2>
                      <p className="text-sm text-blue-100 mt-1">
                        {companyName}
                      </p>
                    </div>
                  </div>
                  
                  {/* Tool description */}
                  <div className="mb-5">
                    <p className="text-white text-lg leading-relaxed font-medium">
                      {sidebarDescription}
                    </p>
                  </div>

                  {/* Company location and website */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-5">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-blue-200 mr-1.5" />
                      <p className="text-sm text-blue-100">{companyInfo.location}</p>
                    </div>
                    <div className="hidden sm:block h-4 w-[1px] bg-blue-200/30"></div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-blue-200 mr-1.5" />
                      <a 
                        href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-100 hover:text-white"
                      >
                        {companyInfo.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                  
                  {/* Toggle button for more details */}
                  <button
                    onClick={() => setShowFullCompanyDetails(true)}
                    className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors mt-auto"
                  >
                    <span>More company details</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* NoHarm Score Card - Optimized layout */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-auto lg:h-[350px]">
            <div className="p-6 flex flex-col h-full">
              {showScoreBreakdown ? (
                /* Score breakdown */
                <div className="h-full flex flex-col">
                  <button
                    onClick={() => setShowScoreBreakdown(false)}
                    className="flex items-center mb-6 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                    <span>Back to summary</span>
                  </button>
                  
                  <div className="overflow-y-auto">
                    <div className="mb-5">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Score Components</h3>
                      <div className="space-y-5">
                        {companyInfo.scoreComponents && Object.entries({
                          'Technology Readiness': companyInfo.scoreComponents.technologyReadiness,
                          'Impact Potential': companyInfo.scoreComponents.impactPotential,
                          'Market Viability': companyInfo.scoreComponents.marketViability,
                          'Regulatory Fit': companyInfo.scoreComponents.regularityFit,
                          'Documentation & Verification': companyInfo.scoreComponents.documentationAndVerification,
                          'Platform Engagement': companyInfo.scoreComponents.platformEngagement,
                          'Innovation Type': companyInfo.scoreComponents.innovationType
                        }).map(([name, score], index) => (
                          <div key={index} className="flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">{name}</span>
                              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                                score >= 80 ? 'bg-green-100 text-green-800' :
                                score >= 60 ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {score}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  score >= 80 ? 'bg-green-500' :
                                  score >= 60 ? 'bg-blue-500' :
                                  'bg-purple-500'
                                }`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {score >= 80 ? 'Excellent' :
                              score >= 60 ? 'Good' :
                              'Needs Improvement'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">About the NoHarm Score</h3>
                      <p className="text-gray-700 mb-2">
                        The NoHarm score is a comprehensive sustainability assessment metric designed to evaluate a company's environmental impact, technological readiness, and market viability.
                      </p>
                      <p className="text-gray-700">
                        Higher scores indicate better alignment with sustainable practices and lower environmental impact. This assessment helps potential partners and customers understand the commitment to sustainable development.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Score summary with optimized spacing */
                <>
                  {/* Header - Tightened spacing */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                    NoHarm Score
                      <div className="relative ml-1.5 group">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          The NoHarm score evaluates sustainability impact, technology readiness, and other key performance indicators.
                        </div>
                      </div>
                    </h3>
                  </div>
                  
                  {/* Score content with better spacing */}
                  <div className="flex-1 flex flex-col justify-center items-center py-4">
                    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5">
                      {/* Score circle */}
                      <div className="relative mb-4 sm:mb-0">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 animate-gradient-xy"></div>
                        <div className={`relative w-28 h-28 flex items-center justify-center rounded-full m-1 ${
                          companyInfo.sustainabilityScore >= 80 ? 'bg-green-100 text-green-800' :
                          companyInfo.sustainabilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          <div className="text-center">
                            <span className="text-4xl font-bold block">{companyInfo.sustainabilityScore}</span>
                            <span className="text-xs opacity-75 block">/100</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Score details */}
                      <div className="flex flex-col text-center sm:text-left">
                        <p className="text-sm font-medium text-gray-700 mb-1.5">Overall Rating</p>
                        <p className="text-xs text-gray-500 mb-1.5">Sustainability assessment</p>
                        <p className="text-xs text-gray-600 mb-2.5">Used to evaluate a company's environmental impact and sustainable practices.</p>
                        <div className={`inline-block px-3 py-1.5 rounded text-sm font-medium ${
                          companyInfo.sustainabilityScore >= 80 ? 'bg-green-100 text-green-800' :
                          companyInfo.sustainabilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                        {companyInfo.sustainabilityScore >= 80 ? 'Excellent' :
                        companyInfo.sustainabilityScore >= 60 ? 'Good' :
                        'Needs Improvement'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Toggle button for score breakdown */}
                  <button
                    onClick={() => setShowScoreBreakdown(true)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <span>View breakdown</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tool Information and Features - Symmetrical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Technology Details */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-gray-900 font-bold">
                Technology Details
              </h3>
              <Badge 
                variant="secondary" 
                className={`px-4 py-1 ${
                  toolInfo.inProduction 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {toolInfo.inProduction ? 'In Production' : 'In Development'}
              </Badge>
            </div>

            {/* Tool Description */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <div className="text-gray-700 leading-relaxed">
                <p>{toolDescription.short}</p>
                
                {showFullDescription && (
                  <p className="mt-4">{toolDescription.long}</p>
                )}
                
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Customer Support</div>
                <div className="font-semibold text-gray-900">{toolInfo.customerSupport}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Update Frequency</div>
                <div className="font-semibold text-gray-900">{toolInfo.updateFrequency}</div>
              </div>
            </div>

            {/* Tech Stack and Compliance */}
            <div className="space-y-5">
              {/* Tech Stack */}
              {toolInfo.technologies && toolInfo.technologies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Technology Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {toolInfo.technologies.map((tech, index) => (
                      <Badge 
                        key={index} 
                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 border-none"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Standards */}
              {toolInfo.compliance && toolInfo.compliance.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Standards</h4>
                  <div className="flex flex-wrap gap-2">
                    {toolInfo.compliance.map((cert, index) => (
                      <Badge 
                        key={index} 
                        className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 border border-blue-200"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* IP Status - Moved from How It Works section */}
              {ipStatus && ipStatus.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">IP Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {ipStatus.map((status, index) => (
                      <Badge 
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 border border-blue-200"
                      >
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Unique Value Proposition */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl text-gray-900 font-bold mb-6">Unique Value Proposition</h3>
            
            {/* USP List - With nicer bullets like Template 1 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100/50 mb-6">
              {Array.isArray(toolInfo.usp) ? (
                toolInfo.usp.length > 1 ? (
                  <div className="space-y-3">
                    {toolInfo.usp.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 flex items-center justify-center mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{toolInfo.usp[0]}</p>
                )
              ) : (
                <p className="text-gray-700 leading-relaxed">{toolInfo.usp}</p>
              )}
            </div>

            {/* Regions and Certifications */}
            <div className="space-y-5">
              {/* Regions of Operation */}
              {companyInfo.operatingRegions && companyInfo.operatingRegions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Regions of Operation</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyInfo.operatingRegions.map((region, index) => (
                      <Badge 
                        key={index} 
                        className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 border border-blue-200"
                      >
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certificates && certificates.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {certificates.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-md border border-blue-200">
                        <div className="relative w-7 h-7">
                          <Image
                            src={cert.image || '/images/certificates/default-logo.png'}
                            alt={`${cert.name} Logo`}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{cert.name}</div>
                          <div className="text-xs text-gray-500">{cert.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information - Symmetrical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - How It Works */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl text-gray-900 font-bold mb-6">How It Works</h3>
            
            {howItWorks && howItWorks.steps && howItWorks.steps.length > 0 && (
              <div className="space-y-5">
                {howItWorks.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Use Cases */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl text-gray-900 font-bold mb-6">Use Cases</h3>
            
            {/* Use Cases - With nicer bullets like Template 1 */}
            {useCases && useCases.length > 0 && (
              <div className="space-y-3">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-start gap-2 group">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 flex items-center justify-center mt-0.5 group-hover:border-blue-300 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <p className="text-gray-700 group-hover:text-gray-900 transition-colors">{useCase}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 