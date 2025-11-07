"use client"

import { motion } from "framer-motion"
import { ArrowRight, Building2, Target, Leaf, Shield, Zap, LineChart, Users, Award } from "lucide-react"
import Image from "next/image"
import DashboardRedirectButton from "./DashboardRedirectButton"

interface BuyersContentProps {
  isAuthenticated?: boolean
}

export default function BuyersContent({ isAuthenticated = false }: BuyersContentProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/climateTechBulb.jpg"
            alt="Modern office building"
            fill
            className="object-cover opacity-60 brightness-110"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Transform Your
              <span className="text-[#00792b] block">Sustainability</span>
              Strategy
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Connect with verified climate tech solutions that align with your business goals. Make data-driven decisions to accelerate your sustainability journey.
            </p>
            <DashboardRedirectButton
              size="lg"
              className="group bg-[#00792b] hover:bg-[#00792b]/90 text-white font-semibold text-lg px-8 py-4"
            >
              {isAuthenticated ? "Continue to Dashboard" : "Explore Solutions"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </DashboardRedirectButton>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Strategic
                <span className="text-[#00792b]"> Partnerships</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                In today's business landscape, environmental responsibility isn't just about compliance—it's about leadership and innovation. NoHarm connects you with cutting-edge climate technologies that drive both sustainability and business growth.
              </p>
              <p className="text-gray-300 text-lg">
                Our platform offers a curated selection of verified solutions, each vetted for their impact, scalability, and business value. Make informed decisions backed by data and expert insights.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-zinc-800 p-8 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-6 text-[#00792b]">Why NoHarm</h3>
              <div className="space-y-6">
                {[
                  {
                    icon: <Shield className="h-6 w-6 text-[#00792b]" />,
                    title: "Verified Solutions",
                    description: "Every technology is thoroughly vetted for reliability and impact"
                  },
                  {
                    icon: <Target className="h-6 w-6 text-[#00792b]" />,
                    title: "Precision Matching",
                    description: "Find solutions that align perfectly with your industry and goals"
                  },
                  {
                    icon: <LineChart className="h-6 w-6 text-[#00792b]" />,
                    title: "Impact Tracking",
                    description: "Measure and report on your sustainability progress"
                  }
                ].map((point, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 bg-zinc-700 p-2 rounded-full">{point.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{point.title}</h4>
                      <p className="text-gray-300">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Solutions Portfolio</h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Discover innovative climate technologies across key business areas, each selected for maximum impact and ROI.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Energy Management",
                description: "Smart solutions for optimizing energy consumption and costs",
                image: "/images/energyManagement.jpg",
                icon: <Zap className="h-12 w-12 text-[#00792b]" />
              },
              {
                title: "Supply Chain Optimization",
                description: "Sustainable logistics and inventory management systems",
                image: "/images/supplyChain.jpeg",
                icon: <Building2 className="h-12 w-12 text-[#00792b]" />
              },
              {
                title: "Carbon Management",
                description: "Tools for measuring and reducing carbon footprint",
                image: "/images/carbonManagement.jpg",
                icon: <Leaf className="h-12 w-12 text-[#00792b]" />
              },
              {
                title: "Waste Reduction",
                description: "Innovative solutions for circular economy initiatives",
                image: "/images/wasteReduction.jpg",
                icon: <Users className="h-12 w-12 text-[#00792b]" />
              }
            ].map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg"
              >
                <Image
                  src={solution.image}
                  alt={solution.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-[300px] transition-transform duration-500 group-hover:scale-110 opacity-75"
                />
                <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                  <div className="mb-4">{solution.icon}</div>
                  <h3 className="text-2xl font-semibold mb-2">{solution.title}</h3>
                  <p className="text-gray-300">{solution.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1"
            >
              <h2 className="text-4xl font-bold mb-6">
                Measurable
                <span className="text-[#00792b]"> Impact</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Award className="h-6 w-6 text-[#00792b]" />,
                    title: "ESG Excellence",
                    description: "Strengthen your ESG performance with verified impact metrics"
                  },
                  {
                    icon: <LineChart className="h-6 w-6 text-[#00792b]" />,
                    title: "Cost Efficiency",
                    description: "Reduce operational costs while advancing sustainability goals"
                  },
                  {
                    icon: <Shield className="h-6 w-6 text-[#00792b]" />,
                    title: "Risk Mitigation",
                    description: "Stay ahead of regulations and market expectations"
                  },
                  {
                    icon: <Users className="h-6 w-6 text-[#00792b]" />,
                    title: "Stakeholder Trust",
                    description: "Build credibility with transparent sustainability efforts"
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 bg-zinc-800 p-2 rounded-full">{benefit.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-gray-300">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-1 md:order-2"
            >
              <div className="relative aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                <Image
                  src="/images/businessVisual.jpeg"
                  alt="Business analytics"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-2xl font-bold text-white">Drive Business Growth with</p>
                  <p className="text-4xl font-bold text-[#00792b]">Sustainable Innovation</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/leadTheChange.jpg"
            alt="Modern office"
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Lead the
              <span className="text-[#00792b]"> Change</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join forward-thinking businesses already leveraging climate tech to create sustainable competitive advantages.
            </p>
            <DashboardRedirectButton
              size="lg"
              className="group bg-[#00792b] hover:bg-[#00792b]/90 text-white font-semibold text-lg px-8 py-4"
            >
              {isAuthenticated ? "Continue to Dashboard" : "Start Your Journey"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </DashboardRedirectButton>
          </motion.div>
        </div>
      </section>
    </div>
  )
}