'use client';

import Image from 'next/image';
import { Globe, MapPin, ChevronDown, Building, Users, DollarSign, Target, Calendar, CheckCircle, Info, Star, MessageSquare, ChevronsUpDown, ExternalLink, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

// Custom CSS for scrollbar styling (from SellerProfile for consistency)
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
    min-height: 350px; /* Or your desired fixed height */
    max-height: 350px; /* Or your desired fixed height */
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

interface BuyerCompanyInfo {
  logo?: string;
  name: string;
  website?: string;
  location?: string;
  description?: string;
  foundedYear?: number | null;
  operatingRegions?: string[];
}

export interface Budget {
  type: string;
  range: string;
}

export interface ProjectTimeline {
  urgency: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface BuyerProfileData {
  id: string;
  industry: string;
  region: string;
  companySize: string;
  budget: Budget;
  projectRequirements: string[];
  developmentType: string;
  projectTimeline: ProjectTimeline;
  esgGoals: string[];
  technologyReadiness: string;
  preferredEngagementModel: string;
  companyInfo: BuyerCompanyInfo;
  sidebarDescription?: string;
}

export interface BuyerProfileProps {
  profile: BuyerProfileData;
  className?: string;
}

const DetailItem: React.FC<{ icon?: React.ElementType, label: string, value?: string | number | null, children?: React.ReactNode, itemClassName?: string, labelClassName?: string, valueClassName?: string }> = ({ icon: Icon, label, value, children, itemClassName, labelClassName = 'text-sm text-gray-500', valueClassName = 'text-base text-gray-700' }) => {
  if (!value && !children) return null;
  return (
    <div className={`flex ${itemClassName} ${!Icon ? 'flex-col' : 'items-start'}`}>
      {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />}
      <div>
        <p className={labelClassName}>{label}</p>
        {/* Render children first if available (for badge/bubble), then value as fallback */}
        {children ? children : (value && <p className={valueClassName}>{value}</p>)}
      </div>
    </div>
  );
};

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

export default function BuyerProfile({ profile, className = '' }: BuyerProfileProps) {
  const [showFullCompanyDetails, setShowFullCompanyDetails] = useState(false);

  useEffect(() => {
    setShowFullCompanyDetails(false);
  }, [profile.id]);

  const {
    id,
    industry,
    region,
    companySize,
    budget,
    projectRequirements,
    developmentType,
    projectTimeline,
    esgGoals,
    technologyReadiness,
    companyInfo,
    sidebarDescription,
    preferredEngagementModel
  } = profile;

  const displayCompanyInfo = companyInfo || {};
  const companySummaryText = sidebarDescription || displayCompanyInfo.description || "Details about the company's focus and procurement needs.";

  // Define styles for Project Overview items
  const overviewLabelStyle = "text-sm font-semibold text-gray-800 mb-1";
  const overviewValueBubble = (text: string | number) => (
    <span className="inline-flex items-center rounded-full text-xs font-semibold px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 border border-blue-200">
      {text}
    </span>
  );

  const timelineValueStyle = "text-sm text-gray-700"; // Style for timeline values

  return (
    <>
      <style jsx global>{globalStyles}</style>
      <div className={`p-6 md:p-8 custom-scrollbar ${className} space-y-6 md:space-y-8 bg-gray-50/50`}>
        {/* Top Row: Company Info and Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch auto-rows-fr">
          {/* Company Details Card (Gradient Background) */}
          <div className="lg:col-span-7 bg-gradient-to-r from-blue-100/80 to-purple-100/80 rounded-2xl shadow-xl overflow-hidden h-auto backdrop-blur-sm border border-white/20">
            <div className="p-6 md:p-7 flex flex-col h-full">
              {!showFullCompanyDetails ? (
                // COLLAPSED View - Matches SellerProfile
                <>
                  <div className="flex items-start gap-4 mb-4">
                    {displayCompanyInfo.logo && displayCompanyInfo.logo.trim() !== '' && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <div className="absolute inset-0 rounded-lg bg-white p-1 shadow"></div>
                        <Image
                          src={displayCompanyInfo.logo}
                          alt={`${displayCompanyInfo.name || 'Company'} Logo`}
                          fill
                          className="object-contain p-1.5"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {displayCompanyInfo.name || 'Company Name Not Provided'}
                      </h2>
                      {industry && <p className="text-sm text-gray-600 mt-1">{industry}</p>}
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
                    <ChevronRight className="w-4 h-4 ml-1" /> {/* No rotate class here for initial state */}
                  </button>
                </>
              ) : (
                // EXPANDED View - Matches SellerProfile
                <div className="h-full flex flex-col">
                  <button
                    onClick={() => setShowFullCompanyDetails(false)}
                    className="flex items-center px-3 py-1.5 mb-4 text-sm font-medium bg-white/20 text-gray-700 hover:bg-white/30 rounded-lg transition-colors w-fit"
                  >
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                    <span>Back to summary</span>
                  </button>
                  <div className="space-y-6 overflow-y-auto flex-1 custom-scrollbar pr-2 md:pr-3">
                    {displayCompanyInfo.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About {displayCompanyInfo.name || 'Company'}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{displayCompanyInfo.description}</p>
                      </div>
                    )}
                    {displayCompanyInfo.foundedYear && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Founded</h3>
                        <p className="text-sm text-gray-700">{displayCompanyInfo.foundedYear}</p>
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
            <h3 className="text-xl text-gray-800 font-semibold mb-1.5">Reviews</h3>
            <p className="text-sm text-gray-500">No reviews yet. Check back later!</p>
          </div>
        </div>

        {/* Subsequent Rows: Project Overview, Project Requirements, ESG & Compliance Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pt-2">
          <SectionCard title="Project Overview" className="lg:col-span-1">
            <DetailItem label="Development Type" labelClassName={overviewLabelStyle}>
              {overviewValueBubble(developmentType)}
            </DetailItem>
            <DetailItem label="Technology Readiness" labelClassName={overviewLabelStyle}>
              {overviewValueBubble(technologyReadiness)}
            </DetailItem>
            <DetailItem label="Preferred Engagement Model" labelClassName={overviewLabelStyle}>
              {overviewValueBubble(preferredEngagementModel)}
            </DetailItem>
            <DetailItem label="Budget" labelClassName={overviewLabelStyle}>
              {overviewValueBubble(`${budget.type} - ${budget.range}`)}
            </DetailItem>
            
            <div className="pt-5 mt-5 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Timeline</h4>
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-6 sm:flex-wrap">
                    <DetailItem itemClassName="flex-1 min-w-[150px]" label="Urgency" labelClassName={overviewLabelStyle} value={projectTimeline.urgency} valueClassName={timelineValueStyle} />
                    {projectTimeline.startDate && (
                        <DetailItem itemClassName="flex-1 min-w-[150px]" label="Est. Start" labelClassName={overviewLabelStyle} value={new Date(projectTimeline.startDate).toLocaleDateString()} valueClassName={timelineValueStyle} />
                    )}
                    {projectTimeline.endDate && (
                        <DetailItem itemClassName="flex-1 min-w-[150px]" label="Est. End" labelClassName={overviewLabelStyle} value={new Date(projectTimeline.endDate).toLocaleDateString()} valueClassName={timelineValueStyle} />
                    )}
                </div>
            </div>
          </SectionCard>

          <SectionCard title="Project Requirements" contentClassName="text-sm" className="lg:col-span-1">
            {projectRequirements.length > 0 ? (
              <ul className="space-y-3.5">
                {projectRequirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/70 flex items-center justify-center mr-2.5 mt-0.5 shadow-sm">
                        <CheckCircle className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 leading-normal">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No project requirements listed.</p>
            )}
          </SectionCard>

          <SectionCard title="ESG & Compliance Goals" contentClassName="text-sm" className="lg:col-span-2 lg:col-start-1">
            {esgGoals.length > 0 ? (
              <ul className="space-y-3.5">
                {esgGoals.map((goal, index) => (
                  <li key={index} className="flex items-start">
                     <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/70 flex items-center justify-center mr-2.5 mt-0.5 shadow-sm">
                        <Target className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 leading-normal">{goal}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No ESG or compliance goals listed.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
} 