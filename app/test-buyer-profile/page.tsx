'use client';

import BuyerProfile, { BuyerProfileData } from '@/components/matches/BuyerProfile';

const dummyBuyerData: BuyerProfileData = {
  id: 'buyer-profile-dummy-123',
  industry: 'Renewable Energy Development',
  region: 'Europe',
  companySize: '500-1000 employees',
  budget: {
    type: 'Project-Based',
    range: '$500,000 - $1,000,000',
  },
  projectRequirements: [
    'Develop a carbon tracking dashboard for our new solar farm portfolio.',
    'Integrate with existing SCADA systems for real-time data.',
    'Provide predictive analytics for maintenance scheduling.',
    'Must comply with GDPR and local data sovereignty laws.',
    'Seeking a solution with a strong focus on UI/UX for non-technical users.'
  ],
  developmentType: 'New Platform Development',
  projectTimeline: {
    urgency: 'High - RFP issued',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
  },
  esgGoals: [
    'Reduce operational carbon footprint by 20% by 2026.',
    'Improve transparency in sustainability reporting.',
    'Enhance community engagement through accessible data.',
    'Achieve ISO 50001 (Energy Management) certification.'
  ],
  technologyReadiness: 'Have existing cloud infrastructure (AWS) and a dedicated IT team.',
  preferredEngagementModel: 'Fixed-Price contract with phased deliverables',
  companyInfo: {
    logo: '/images/placeholder-logo.jpg', // Replace with actual path or remove if none
    name: 'GreenTech Corp Solutions',
    website: 'www.greentechcorp.example.com',
    location: 'Berlin, Germany',
    description: 'GreenTech Corp Solutions is a leading developer of large-scale renewable energy projects across Europe. We are committed to leveraging technology to enhance sustainability and operational efficiency.',
    foundedYear: 2010,
    operatingRegions: ['Germany', 'France', 'Spain', 'United Kingdom'],
  },
  sidebarDescription: 'Seeking innovative software solutions to track and manage carbon emissions for our expanding portfolio of renewable energy assets. Key focus on data integration, analytics, and user-friendly reporting.',
};

export default function TestBuyerProfilePage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <BuyerProfile profile={dummyBuyerData} className="" />
      </div>
    </div>
  );
} 