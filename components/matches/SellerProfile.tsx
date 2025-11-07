'use client';


import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { Globe, MapPin, ChevronRight, Info, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Certificate, CompanyInfo, ToolInfo } from '@/lib/interfaces';

// Custom CSS for scrollbar styling and fixed height card
const globalStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #c7c7c7;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #c7c7c7 #f1f1f1;
  }

  .fixed-height-score-card {
    min-height: 350px;
    max-height: 350px;
  }
  
  @media (max-width: 1024px) {
    .fixed-height-score-card {
      min-height: unset;
      max-height: unset;
    }
  }
`;



// Modified interface for profile that doesn't require password
interface SellerProfileData {
  id: string;
  name: string;
  uuid?: string; // Optional uuid property that may be referenced in the code
  data: {
    companyInfo: CompanyInfo;
    toolInfo: ToolInfo;
    companyName: string;
    howItWorks: {
      steps: Array<{
        title: string;
        description: string;
      }>;
    };
    useCases: string[];
    sidebarDescription: string;
    toolDescription: {
      short: string;
      long: string;
    };
    ipStatus: string[];
    certificates?: Certificate[];
    media?: {
      video_url?: string;
    };
  };
}

interface SellerProfileProps {
  profile: SellerProfileData;
  className?: string;
}

export default function SellerProfile({ profile, className = '' }: SellerProfileProps) {
  const [showFullCompanyDetails, setShowFullCompanyDetails] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  // Track if this is the specific UUID we want to modify
  const isSunwiseUUID = profile.id === '6e692f49-6ef1-4ec8-a14b-9cbd60a4e9f0';
  const isOriginalUUID = profile.id === '93abe9c3-7f1f-4832-ace9-05a549b91a71';

  // Calculate overall score from components
  const calculateOverallScore = (components: CompanyInfo['scoreComponents']) => {
    if (!components) return 0;
    
    // Only include specific components in average calculation
    const relevantScores = [
      components.technologyReadiness,
      components.impactPotential,
      components.marketViability,
      components.regularityFit
    ].filter(score => typeof score === 'number');

    if (relevantScores.length === 0) return 0;
    return Math.round(relevantScores.reduce((sum, score) => sum + score, 0) / relevantScores.length);
  };

  // Reset all expanded states when profile changes
  useEffect(() => {
    setShowFullCompanyDetails(false);
    setShowScoreBreakdown(false);
    setShowFullDescription(false);
  }, [profile.id]); // Use profile.id instead of profile.uuid

  // Default data to use as fallbacks if profile data is missing
  const defaultData = {
    companyInfo: {
      logo: '/images/placeholder-logo.jpg',
      location: 'Belfast, Northern Ireland',
      website: 'https://sustainiq.com',
      sustainabilityScore: 85,
      description: 'SustainIQ is an innovative sustainability management and reporting platform designed to help organizations measure, monitor and improve their sustainability performance.',
      operatingRegions: ['United Kingdom', 'Ireland', 'Europe'],
      foundedYear: 2018,
      scoreComponents: {
        technologyReadiness: 83,
        impactPotential: 82,
        marketViability: 84,
        regularityFit: 88,
        documentationAndVerification: 90,
        platformEngagement: 88,
        innovationType: 90
      }
    },
    toolInfo: {
      name: 'SustainIQ Platform',
      description: 'A comprehensive sustainability management and reporting solution.',
      usp: ['Simplifying sustainability data collection, monitoring, and reporting for businesses of all sizes.'],
      category: 'Sustainability Management',
      inProduction: true,
      technologies: ['Cloud-based', 'Analytics', 'Reporting', 'Dashboard'],
      customerSupport: 'Premium Support',
      updateFrequency: 'Monthly',
      coverage: ['ESG', 'Carbon', 'Social Impact', 'Governance'],
      compliance: ['GRI Standards', 'SASB', 'TCFD']
    },
    certificates: [
      {
        name: 'ISO 14001',
        status: 'Verified',
        image: '/images/certificates/iso-logo.png'
      },
      {
        name: 'B Corp',
        status: 'Verified',
        image: '/images/certificates/ghg-logo.png'
      }
    ],
    companyName: 'SustainIQ',
    howItWorks: {
      steps: [
        {
          title: 'Data Collection',
          description: 'Gather sustainability data across your organization through intuitive forms and integrations'
        },
        {
          title: 'Analysis',
          description: 'Our platform automatically analyzes your data to identify trends, gaps, and opportunities'
        },
        {
          title: 'Reporting',
          description: 'Generate comprehensive reports aligned with major sustainability frameworks and standards'
        }
      ]
    },
    useCases: [
      'ESG performance measurement and reporting',
      'Carbon footprint tracking',
      'Sustainability goal setting and monitoring',
      'Regulatory compliance management',
      'Stakeholder communication'
    ],
    sidebarDescription: 'A powerful sustainability management platform that simplifies data collection, monitoring, and reporting for organizations committed to improving their environmental and social impact.',
    toolDescription: {
      short: 'SustainIQ helps organizations effectively measure, monitor and improve their sustainability performance through an intuitive, cloud-based platform.',
      long: 'Our platform features comprehensive data collection tools, real-time analytics, custom dashboards, and automated reporting capabilities that align with global sustainability standards. SustainIQ integrates seamlessly with existing business systems, making sustainability tracking and reporting efficient and accurate.'
    },
    ipStatus: [
      'Proprietary Software',
      'Trademark Protected'
    ],
    media: {
      video_url: ''
    }
  };

  // Extract data from profile or use defaults
  const scoreComponents = {
    ...defaultData.companyInfo.scoreComponents,
    ...(profile.data?.companyInfo?.scoreComponents || {})
  };

  const companyInfo = {
    ...defaultData.companyInfo,
    ...profile.data?.companyInfo,
    scoreComponents,
    sustainabilityScore: calculateOverallScore(scoreComponents)
  };
  const toolInfo = profile.data?.toolInfo || defaultData.toolInfo;
  const certificates = profile.data?.certificates || defaultData.certificates;
  const companyName = profile.data?.companyName || defaultData.companyName;
  const howItWorks = profile.data?.howItWorks || defaultData.howItWorks;
  const useCases = profile.data?.useCases || defaultData.useCases;
  const sidebarDescription = profile.data?.sidebarDescription || defaultData.sidebarDescription;
  const toolDescription = profile.data?.toolDescription || defaultData.toolDescription;
  const ipStatus = profile.data?.ipStatus || defaultData.ipStatus;
  const media = profile.data?.media || defaultData.media;



  return (
    <>
      <style jsx global>{globalStyles}</style>
      <div className={`h-full p-6 overflow-y-auto ${className}`}>
        <div className="space-y-6">
          {/* Hero Section with dynamic heights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch auto-rows-fr">
            {/* Company Details Card - Dynamic height */}
            <div className="lg:col-span-7 bg-gradient-to-r from-blue-100/80 to-purple-100/80 rounded-2xl shadow-xl overflow-hidden h-auto backdrop-blur-sm border border-white/20">
              <div className="p-6 flex flex-col h-full">
                {showFullCompanyDetails ? (
                  /* Expanded company details */
                  <div className="h-full flex flex-col">
                    <button
                      onClick={() => setShowFullCompanyDetails(false)}
                      className="flex items-center px-3 py-1.5 mb-4 text-sm font-medium bg-white/20 text-gray-700 hover:bg-white/30 rounded-lg transition-colors w-fit"
                    >
                      <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                      <span>Back to summary</span>
                    </button>
                    
                    <div className="space-y-6 overflow-y-auto flex-1">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About Company</h3>
                        <p className="text-gray-700">{companyInfo.description}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Founded</h3>
                        <p className="text-gray-700">{companyInfo.foundedYear}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Company summary */
                  <>
                    {/* Company Header - Now Tool Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {companyInfo.logo && companyInfo.logo.trim() !== '' && (
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <div className="absolute inset-0 rounded-lg bg-white"></div>
                          <Image
                            src={companyInfo.logo}
                            alt="Company Logo"
                            fill
                            className="object-contain p-1.5"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">
                          {toolInfo.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {companyName}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tool description */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-base leading-relaxed">
                        {sidebarDescription}
                      </p>
                    </div>

                    {/* Company location and website */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 mr-1.5" />
                        <p className="text-sm text-gray-600">{companyInfo.location}</p>
                      </div>
                      <div className="hidden sm:block h-4 w-[1px] bg-gray-200"></div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-500 mr-1.5" />
                        <a 
                          href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          {companyInfo.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                    
                    {/* Toggle button for more details */}
                    <button
                      onClick={() => setShowFullCompanyDetails(true)}
                      className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white/20 hover:bg-white/30 rounded-lg transition-colors mt-auto"
                    >
                      <span>View company details</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* NoHarm Score Card - Fixed height with scrolling */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-auto fixed-height-score-card">
              <div className="p-6 flex flex-col h-full">
                {showScoreBreakdown ? (
                  /* Score breakdown - Using scrolling with fixed height */
                  <div className="h-full flex flex-col">
                    <button
                      onClick={() => setShowScoreBreakdown(false)}
                      className="flex items-center px-3 py-1.5 mb-4 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0 w-fit"
                    >
                      <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                      <span>Back to summary</span>
                    </button>
                    
                    <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Score Components</h3>
                        <div className="space-y-3">
                          {companyInfo.scoreComponents && Object.entries({
                            'Technology Readiness': companyInfo.scoreComponents.technologyReadiness,
                            'Impact Potential': companyInfo.scoreComponents.impactPotential,
                            'Market Viability': companyInfo.scoreComponents.marketViability,
                            'Regulatory Fit': companyInfo.scoreComponents.regularityFit,
                            // Commented out components that don't count towards average
                            // 'Documentation & Verification': companyInfo.scoreComponents.documentationAndVerification,
                            // 'Platform Engagement': companyInfo.scoreComponents.platformEngagement,
                            // 'Innovation Type': companyInfo.scoreComponents.innovationType
                          }).map(([name, score], index) => (
                            <div key={index} className="flex flex-col">
                              <div className="flex justify-between items-center mb-1">
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
                        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">About the NoHarm Score</h3>
                        <p className="text-gray-700 mb-2 text-sm">
                          The NoHarm score is a comprehensive sustainability assessment metric designed to evaluate a company's environmental impact, technological readiness, and market viability.
                        </p>
                        <p className="text-gray-700 text-sm">
                          Higher scores indicate better alignment with sustainable practices and lower environmental impact.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Score summary view */
                  <>
                    {/* Header - Tightened spacing */}
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
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
                    
                    {/* Score content */}
                    <div className="flex-1 flex flex-col justify-center items-center">
                      <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5 py-4">
                        {/* Score circle */}
                        <div className="relative mb-3 sm:mb-0">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 animate-gradient-xy"></div>
                          <div className={`relative w-24 h-24 flex items-center justify-center rounded-full m-1 ${
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
                          <p className="text-sm font-medium text-gray-700 mb-1">Overall Rating</p>
                          <p className="text-xs text-gray-500 mb-1">Sustainability assessment</p>
                          <p className="text-xs text-gray-600 mb-2">Used to evaluate a company's environmental impact and sustainable practices.</p>
                          <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
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
                      className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mt-auto flex-shrink-0"
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
                  Solution Details
                </h3>
                {/* Removed In Development/Production Badge */}
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

              {/* Tech Stack and Compliance */}
              <div className="space-y-5">
                {/* Technologies - Only show if not the specific UUID */}
                {toolInfo.technologies && toolInfo.technologies.length > 0 && !isSunwiseUUID && !isOriginalUUID && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {toolInfo.technologies.map((tech: string, index: number) => {
                        // Split technology if it contains a colon to separate the title from description
                        const parts = tech.split(':');
                        const title = parts[0].trim();
                        const description = parts.length > 1 ? parts[1].trim() : null;
                        
                        return (
                          <div key={index} className="group relative">
                            <Badge 
                              className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 border border-blue-200"
                            >
                              {title}
                            </Badge>
                            {description && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-[200px] break-words shadow-lg">
                                {description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Container Image and Video - Only show for the Sunwise UUID */}
                {isSunwiseUUID && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Container Media</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative w-full rounded-lg overflow-hidden">
                        <Image
                          src="/images/profilepreview/sunwise/container_pic.png"
                          alt="SUS-10 Container"
                          width={800}
                          height={450}
                          className="object-cover w-full"
                        />
                      </div>
                      <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden">
                        <video
                          src="/images/profilepreview/sunwise/container_video.mp4"
                          controls
                          className="absolute inset-0 w-full h-full object-cover"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  </div>
                )}

                {/* YouTube Video */}
                {media?.video_url && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Demo Video</h4>
                    <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden">
                      <iframe 
                        src={media.video_url}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="absolute inset-0 w-full h-full object-cover"
                      ></iframe>
                    </div>
                  </div>
                )}
                
                {/* IP Status - Optional and only show if not the specific UUID */}
                {ipStatus && ipStatus.length > 0 && !isSunwiseUUID && !isOriginalUUID && (
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
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Operating Regions</h3>
                    <div className="flex flex-wrap gap-2">
                      {companyInfo.operatingRegions.map((region: string, index: number) => (
                        <Badge 
                          key={index}
                          variant="outline"
                          className="bg-white border-gray-200"
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
                    <h4 className="font-semibold text-gray-900 mb-3">Sustainability Certifications and Standards</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {certificates.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-md border border-blue-200">
                          {cert.image && cert.image.trim() !== "" && (
                            <div className="relative w-7 h-7">
                              <Image
                                src={cert.image}
                                alt={`${cert.name} Logo`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
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
                  {useCases.map((point: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 group">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 flex items-center justify-center mt-0.5 group-hover:border-blue-300 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      </div>
                      <p className="text-gray-700 group-hover:text-gray-900 transition-colors">{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 