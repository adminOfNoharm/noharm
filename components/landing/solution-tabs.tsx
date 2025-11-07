'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface Tab {
  id: string
  title: string
  heading: string
  description: string
  image: string, 
  link:string
}

const tabs: Tab[] = [
  {
    id: 'solution-seekers',
    title: 'Buyer',
    heading: 'Tackle your sustainability challenges with a diverse network of Climate solutions.',
    description: 'Collaborate with companies that align with your values and drive positive change.',
    image: '/images/solutionseekerimg.png',
    link:'/buyer'
  },
  {
    id: 'problem-solvers',
    title: 'Climate Solutions',
    heading: 'Connect with Buyers and Service Providers who share your commitment to a sustainable future.',
    description: 'Our platform allows you to easily find and collaborate with Buyers and Service Providers that help you to scale and thrive.',
    image: '/images/problemsolverimg.png', 
    link:'/seller'
  },
  {
    id: 'stay-in-the-lead',
    title: 'Ally',
    heading: 'Contribute to Climate Solutions drive impactful change.',
    description: 'Provide essential services to innovators tackling climate challenges  helping them to survival and thrive.',
    image: '/images/uptodateimg.png',
    link:'/ally'
  },
]

export function SolutionTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  const getActiveTabColor = (tabId: string) => {
    switch(tabId) {
      case 'solution-seekers': return '#1105ff'
      case 'problem-solvers': return '#00792b'
      case 'stay-in-the-lead': return '#9b00ff'
      default: return '#1105ff'
    }
  }

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          Match with the Best Sustainable Tech Solution
        </h2>

        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const isHovered = hoveredTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => !isActive && setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  "hover:scale-105 mx-1",
                  isActive ? "text-white" : "text-gray-600 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      zIndex: 1,
                      backgroundColor: getActiveTabColor(tab.id)
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="hoverTab"
                    className="absolute inset-0 bg-gray-100 rounded-full"
                    style={{ zIndex: 1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.title}</span>
              </button>
            )
          })}
        </div>

        <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <AnimatePresence mode="wait">
            {tabs.map((tab) => (
              activeTab === tab.id && (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >
                  <div className="order-2 md:order-1">
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold leading-tight mb-4 text-gray-900"
                    >
                      {tab.heading}
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-600 mb-6"
                    >
                      {tab.description}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <a 
                        href={tab.link} 
                        className={cn(
                          "inline-flex items-center px-6 py-2 rounded-full text-sm font-medium transition-colors",
                          "hover:bg-opacity-90",
                          activeTab === 'solution-seekers' ? 'bg-blue-600 text-white' :
                          activeTab === 'problem-solvers' ? 'bg-green-600 text-white' :
                          'bg-purple-600 text-white'
                        )}
                      >
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </motion.div>
                  </div>
                  <div className="order-1 md:order-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="relative h-[250px] rounded-xl overflow-hidden"
                    >
                      <Image
                        src={tab.image}
                        alt={tab.title}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

export default SolutionTabs