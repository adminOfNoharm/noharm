import type { Metadata } from "next";
import "../globals.css";
import { Inter, DM_Sans } from 'next/font/google'
import React from 'react';
import OnboardingProtected from "@/components/onboarding/OnboardingProtected";

export const metadata: Metadata = {
  title: "NoHarm On-boarding",
  description: "Fostering a greener future",
};

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
 
const dm_sans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
})

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardingProtected>
      <div className={`${inter.variable} ${dm_sans.variable} antialiased`}>
        {children}
      </div>
    </OnboardingProtected>
  );
}
