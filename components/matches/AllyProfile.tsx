'use client';

import Image from 'next/image';
import { Globe, MapPin, ChevronDown, Building, Users, DollarSign, Target, Calendar, CheckCircle, Info, Star, MessageSquare, ChevronsUpDown, ExternalLink, ChevronRight, Briefcase, BarChart3, Award } from 'lucide-react'; // Added Briefcase, BarChart3, Award
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

// Custom CSS for scrollbar styling
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
  .fixed-height-card {
    min-height: 350px; 
    max-height: 350px; 
    display: flex;
    flex-direction: column;
  }
  @media (max-width: 1024px) {
    .fixed-height-card {
      min-height: unset;
      max-height: unset;
    }
  }
`;

// Ally-specific interfaces based on the provided schema
export interface AllyCompanyInfo { // Reused from Buyer, fields are similar enough for now
  logo?: string;
  name: string;
  website?: string;
  location?: string;
  description?: string;
  foundedYear?: number | null;
  operatingRegions?: string[]; // This will be part of the main AllyProfileData
}

export interface AllyCost {
  type: string;
  range: string;
}

export interface AllyClimateTechExperience {
  years: number | null;
  sectors: string[];
}

export interface AllyCertificate {
  name: string;
  image?: string; // Made optional as per schema
  status: string;
}

export interface AllyProfileData {
  region: string;
  name: string; // This seems to be the main name of the Ally/service, separate from companyInfo.name
  serviceOffered: string;
  cost: AllyCost;
  useCases: string[];
  clientTypesServed: string[];
  climateTechExperience: AllyClimateTechExperience;
  certificates: AllyCertificate[];
  preferredStageOfInnovators: string;
  successMetrics: string;
  availability: string;
  companyInfo: AllyCompanyInfo; // This is for the Ally's company itself
  sidebarDescription?: string;
}

export interface AllyProfileProps {
  profile: AllyProfileData & { id: string }; // Assuming 'id' will be passed similarly
  className?: string;
}

// Reusable DetailItem component
const DetailItem: React.FC<{
  icon?: React.ElementType, // General icon for the item (less used now)
  label: string, 
  value?: string | number | null, 
  children?: React.ReactNode, 
  itemClassName?: string, 
  labelClassName?: string, 
  valueClassName?: string,
  labelIcon?: React.ElementType // Optional icon specifically for the label
}> = ({ icon: ItemIcon, label, value, children, itemClassName, labelClassName = 'text-sm text-gray-500', valueClassName = 'text-base text-gray-700', labelIcon: LabelIcon }) => {
  if (!value && !children) return null;
  return (
    <div className={`flex ${itemClassName} ${!ItemIcon && !LabelIcon ? 'flex-col' : 'items-start'}`}>
      {ItemIcon && <ItemIcon className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />}
      <div>
        <div className="flex items-center">
          {LabelIcon && <LabelIcon className="w-4 h-4 text-gray-700 mr-1.5" />}
          <p className={labelClassName}>{label}</p>
        </div>
        {children ? children : (value && <p className={valueClassName}>{value}</p>)}
      </div>
    </div>
  );
};

// Reusable SectionCard component (copied from BuyerProfile)
const SectionCard: React.FC<{ title: string, children: React.ReactNode, className?: string, contentClassName?: string, titleClassName?: string }> = ({ title, children, className, contentClassName, titleClassName = 'text-xl text-gray-900 font-bold' }) => (
  <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-7 border border-gray-100 flex flex-col ${className}`}>
    <h3 className={`${titleClassName} mb-5 md:mb-6`}>
      {title}
    </h3>
    <div className={`space-y-4 md:space-y-5 flex-grow ${contentClassName}`}>
      {children}
    </div>
  </div>
);

export default function AllyProfile({ profile, className = '' }: AllyProfileProps) {
  const [showFullCompanyDetails, setShowFullCompanyDetails] = useState(false);

  useEffect(() => {
    setShowFullCompanyDetails(false);
  }, [profile.id]);

  const {
    id,
    region,
    name: allyOrServiceName,
    serviceOffered,
    cost,
    useCases,
    clientTypesServed,
    climateTechExperience,
    certificates,
    preferredStageOfInnovators,
    successMetrics,
    availability,
    companyInfo,
    sidebarDescription
  } = profile;

  const displayCompanyInfo = companyInfo || { name: 'Company Information Not Provided' }; 
  const companySummaryText = sidebarDescription || displayCompanyInfo.description || "Details about the ally's services and expertise.";

  const valueBubbleStyle = "inline-block bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 border border-blue-200/70 text-xs font-medium mr-2 px-2.5 py-1 rounded-full";
  const labelStyle = "text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <>
      <style jsx global>{globalStyles}</style>
      <div className={`p-6 md:p-8 custom-scrollbar ${className} space-y-6 md:space-y-8 bg-gray-50/50`}>
        {/* Top Row: Ally Info and Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch auto-rows-fr">
          {/* Ally/Service Details Card (Gradient Background) */}
          <div className="lg:col-span-7 bg-gradient-to-r from-blue-100/80 to-purple-100/80 rounded-2xl shadow-xl overflow-hidden h-auto backdrop-blur-sm border border-white/20">
            <div className="p-6 md:p-7 flex flex-col h-full">
              {!showFullCompanyDetails ? (
                <>
                  <div className="flex items-start gap-4 mb-4">
                    {displayCompanyInfo.logo && displayCompanyInfo.logo.trim() !== '' && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <div className="absolute inset-0 rounded-lg bg-white p-1 shadow"></div>
                        <Image
                          src={displayCompanyInfo.logo}
                          alt={`${displayCompanyInfo.name || 'Ally'} Logo`}
                          fill
                          className="object-contain p-1.5"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {allyOrServiceName || 'Service/Ally Name Not Provided'}
                      </h2>
                      {displayCompanyInfo.name && displayCompanyInfo.name !== allyOrServiceName && 
                        <p className="text-sm text-gray-600 mt-1"><em>by {displayCompanyInfo.name}</em></p>
                      }
                      {serviceOffered && 
                        <span className="inline-block bg-purple-600 text-white text-xs font-semibold mr-2 px-2.5 py-1 rounded-md mt-1.5">
                          {serviceOffered}
                        </span>
                      }
                    </div>
                  </div>
                  
                  <div className="mb-4 flex-grow">
                    <p className="text-gray-700 text-base leading-relaxed">
                      {companySummaryText}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
                    {displayCompanyInfo.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 mr-1.5" />
                        <p className="text-sm text-gray-600">{displayCompanyInfo.location}</p>
                      </div>
                    )}
                    {displayCompanyInfo.location && displayCompanyInfo.website && <div className="hidden sm:block h-4 w-[1px] bg-gray-200"></div>}
                    {displayCompanyInfo.website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-500 mr-1.5" />
                        <a 
                          href={displayCompanyInfo.website.startsWith('http') ? displayCompanyInfo.website : `https://${displayCompanyInfo.website}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-gray-600 hover:text-gray-900 hover:underline truncate"
                        >
                          {displayCompanyInfo.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowFullCompanyDetails(true)}
                    className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white/20 hover:bg-white/30 rounded-lg transition-colors mt-auto"
                  >
                    <span>View company details</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </>
              ) : (
                // EXPANDED Company View
                <div className="h-full flex flex-col">
                  <button
                    onClick={() => setShowFullCompanyDetails(false)}
                    className="flex items-center px-3 py-1.5 mb-4 text-sm font-medium bg-white/20 text-gray-700 hover:bg-white/30 rounded-lg transition-colors w-fit"
                  >
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                    <span>Back to summary</span>
                  </button>
                  
                  <div className="space-y-5 overflow-y-auto flex-1 custom-scrollbar pr-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">About {displayCompanyInfo.name || 'the Company'}</h3>
                      <p className="text-gray-700 text-sm">{displayCompanyInfo.description || 'No description available.'}</p>
                    </div>
                    
                    {displayCompanyInfo.foundedYear && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Founded</h3>
                        <p className="text-gray-700 text-sm">{displayCompanyInfo.foundedYear}</p>
                      </div>
                    )}
                    {companyInfo.operatingRegions && companyInfo.operatingRegions.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Operating Regions</h3>
                            <div className="flex flex-wrap gap-2">
                            {companyInfo.operatingRegions.map((opRegion, index) => (
                                <Badge key={index} variant="secondary" className="bg-white border-gray-200 text-gray-700">
                                {opRegion}
                                </Badge>
                            ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl p-6 md:p-7 border border-gray-100 flex flex-col justify-center items-center text-center fixed-height-card">
            <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-3" />
            <h3 className="text-xl text-gray-800 font-semibold mb-1.5">Reviews & Testimonials</h3>
            <p className="text-sm text-gray-500">No reviews yet. Check back later!</p>
          </div>
        </div>

        {/* Subsequent sections in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pt-2">
          <SectionCard title="Service & Client Focus">
             <DetailItem label="Primary Client Types" labelClassName={labelStyle}>
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {clientTypesServed.map((type, idx) => <span key={idx} className={valueBubbleStyle}>{type}</span>)}
                </div>
            </DetailItem>
            <DetailItem label="Preferred Stage of Innovators" labelClassName={labelStyle}>
                <span className={valueBubbleStyle}>{preferredStageOfInnovators}</span>
            </DetailItem>
            <DetailItem label="Availability" labelClassName={labelStyle}>
                 <span className={valueBubbleStyle}>{availability}</span>
            </DetailItem>
             <DetailItem label="Primary Operating Region(s)" labelClassName={labelStyle}>
                 <span className={valueBubbleStyle}>{region}</span>
            </DetailItem>
            <DetailItem label="Cost Structure" labelClassName={labelStyle}>
                <span className={valueBubbleStyle}>{`${cost.type} - ${cost.range}`}</span>
            </DetailItem>
          </SectionCard>
          
          <SectionCard title="Climate Tech Expertise">
            {/* Service Offered Display */} 
            <div>
                <p className={labelStyle}>Specialized In:</p>
                <span className={`${valueBubbleStyle} text-sm px-3 py-1.5`}>{serviceOffered}</span>
            </div>

            {/* Prominent Years of Experience Div */} 
            {climateTechExperience.years && 
              <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-100 text-teal-700 border border-teal-200/70 shadow-lg">
                <div className="flex items-center mb-1.5">
                  <BarChart3 className="w-5 h-5 mr-2" /> 
                  <h4 className="text-md font-semibold">Years of Experience</h4> 
                </div>
                <p className="text-3xl font-bold ml-1">{climateTechExperience.years} <span className="text-xl font-medium">years</span></p> 
              </div>
            }

            {/* Sectors of Experience */} 
            {climateTechExperience.sectors && climateTechExperience.sectors.length > 0 && (
              <div className={`${climateTechExperience.years ? 'mt-5' : 'mt-1'}`}> 
                <p className={labelStyle}>Sectors of Experience</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {climateTechExperience.sectors.map((sector, index) => (
                    <span key={index} className={valueBubbleStyle}>
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Success Metrics */} 
            {(successMetrics && successMetrics.trim() !== '') && (() => {
              const metricsArray = successMetrics.split(',').map(metric => metric.trim()).filter(Boolean);
              if (metricsArray.length === 0) return null;
              return (
                <div className="mt-5">
                  <p className={labelStyle}>Key Success Metrics Achieved</p>
                  <div className="mt-2 space-y-2.5">
                    {metricsArray.map((metric, index) => (
                      <div key={index} className="flex items-start p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/80 shadow-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2.5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 leading-normal">{metric}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </SectionCard>

          {useCases && useCases.length > 0 && (
            <SectionCard title="Common Use Cases" contentClassName="text-sm">
              <div className="space-y-3">
                {useCases.map((uc, index) => (
                  <div key={index} className="flex items-start gap-2 group">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/70 flex items-center justify-center mt-0.5 group-hover:border-blue-300 transition-colors shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <p className="text-gray-700 group-hover:text-gray-900 transition-colors leading-normal">{uc}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {certificates && certificates.length > 0 && (
            <SectionCard title="Certifications & Credentials" contentClassName="text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certificates.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2.5 rounded-lg border border-blue-200/70 shadow-sm">
                    {cert.image && cert.image.trim() !== '' && (
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <Image src={cert.image} alt={`${cert.name} Logo`} fill className="object-contain" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900 text-sm">{cert.name}</p>
                      <p className="text-xs text-gray-600">{cert.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </>
  );
} 