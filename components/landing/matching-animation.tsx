"use client"

import { useEffect, useState } from "react"

export default function MatchingAnimation() {
  const [activeConnection, setActiveConnection] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnection((prev) => (prev + 1) % 3)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Circular path */}
        <circle cx="200" cy="200" r="150" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
        
        {/* Center logo */}
        <g transform="translate(180, 180)">
          {/* Logo circle */}
          <circle cx="20" cy="20" r="25" fill="white" stroke="#1105ff" strokeWidth="2" />
          <image href="/images/logos/new-favicon.png" x="5" y="5" width="30" height="30" />
        </g>
        
        {/* Top box - Climate Solutions */}
        <g transform="translate(120, 10)">
          <rect x="0" y="0" width="160" height="160" rx="8" fill="white" stroke="#00792b" strokeWidth="2" />
          <rect x="0" y="0" width="160" height="30" rx="10" fill="#00792b" />
          <text x="80" y="20" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Climate Solutions</text>
          
          {/* Energy */}
          <rect 
            x="10" y="40" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 0 ? "#dcfce7" : "#f9fafb"} 
          />
          <text x="20" y="60" fill="black" fontSize="12">☀️ Energy</text>
          
          {/* Water */}
          <rect 
            x="10" y="80" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 1 ? "#dcfce7" : "#f9fafb"} 
          />
          <text x="20" y="100" fill="black" fontSize="12">🌱 Water</text>
          
          {/* Waste */}
          <rect 
            x="10" y="120" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 2 ? "#dcfce7" : "#f9fafb"} 
          />
          <text x="20" y="140" fill="black" fontSize="12">🔋 Waste</text>
        </g>
        
        {/* Left box - Buyers */}
        <g transform="translate(30, 220)">
          <rect x="0" y="0" width="160" height="160" rx="8" fill="white" stroke="#1105ff" strokeWidth="2" />
          <rect x="0" y="0" width="160" height="30" rx="10" fill="#1105ff" />
          <text x="80" y="20" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Buyers</text>
          
          {/* Startups */}
          <rect 
            x="10" y="40" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 0 ? "#dbeafe" : "#f9fafb"} 
          />
          <text x="20" y="60" fill="black" fontSize="12">🚀 Startups</text>
          
          {/* SMEs */}
          <rect 
            x="10" y="80" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 1 ? "#dbeafe" : "#f9fafb"} 
          />
          <text x="20" y="100" fill="black" fontSize="12">🏢 SMEs</text>
          
          {/* Government */}
          <rect 
            x="10" y="120" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 2 ? "#dbeafe" : "#f9fafb"} 
          />
          <text x="20" y="140" fill="black" fontSize="12">🏛️ Government</text>
        </g>
        
        {/* Right box - Service Providers */}
        <g transform="translate(210, 220)">
          <rect x="0" y="0" width="160" height="160" rx="8" fill="white" stroke="#9b00ff" strokeWidth="2" />
          <rect x="0" y="0" width="160" height="30" rx="10" fill="#9b00ff" />
          <text x="80" y="20" fill="white" textAnchor="middle" fontSize="14" fontWeight="bold">Service Providers</text>
          
          {/* Investors */}
          <rect 
            x="10" y="40" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 0 ? "#f3e8ff" : "#f9fafb"} 
          />
          <text x="20" y="60" fill="black" fontSize="12">💰 Investors</text>
          
          {/* Essential Services */}
          <rect 
            x="10" y="80" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 1 ? "#f3e8ff" : "#f9fafb"} 
          />
          <text x="20" y="100" fill="black" fontSize="12">🔧 Essential Services</text>
          
          {/* Expertise */}
          <rect 
            x="10" y="120" 
            width="140" height="30" 
            rx="16" 
            fill={activeConnection === 2 ? "#f3e8ff" : "#f9fafb"} 
          />
          <text x="20" y="140" fill="black" fontSize="12">👥 Expertise</text>
        </g>
      </svg>
    </div>
  )
}