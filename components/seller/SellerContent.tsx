"use client"

import { motion } from "framer-motion"
import { ArrowRight, Leaf, Globe2, LineChart, Shield, Users, Rocket, Zap } from "lucide-react"
import Image from "next/image"
import DashboardRedirectButton from "./DashboardRedirectButton"

const impactMetrics = [
  { value: "$45M", label: "Total Investment" },
  { value: "58M", label: "Carbon Credits" },
  { value: "5.2M", label: "Trees Planted" },
  { value: "1.2M", label: "Lives Impacted" },
]

const focusAreas = [
  {
    title: "Global Carbon Mitigation",
    description: "Connect with buyers committed to reducing their carbon footprint",
    image: "/images/carbonMitigation.jpg",
  },
  {
    title: "Eco-Conscious Reforestation",
    description: "Scale your impact through sustainable forestry initiatives",
    image: "images/reforestation.jpg",
  },
  {
    title: "Clean Energy Solutions",
    description: "Accelerate the adoption of renewable energy technologies",
    image: "/images/energy.jpg",
  },
  {
    title: "Environmental Empowerment",
    description: "Drive positive change through innovative climate solutions",
    image: "images/environment.jpg",
  },
]

interface SellerContentProps {
  isAuthenticated: boolean
}

export default function SellerContent({ isAuthenticated }: SellerContentProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/windmill.jpg"
            alt="Aerial forest view"
            fill
            className="object-cover opacity-60 brightness-110"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Driving
              <span className="text-[#ACFF3D] block">Sustainable</span>
              Change
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              You are a driving force behind impactful and sustainable change. Our mission is to empower developers of high-quality energy, water and waste efficiency projects creating a positive ripple effect across the globe.
            </p>
            <DashboardRedirectButton
              size="lg"
              className="group bg-[#ACFF3D] text-black hover:bg-[#9EEF2F] font-semibold text-lg px-8 py-4"
            >
              {isAuthenticated ? "Continue to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </DashboardRedirectButton>
          </motion.div>
        </div>
      </section>

      {/* About NoHarm Section */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                About
                <span className="text-[#ACFF3D]"> NoHarm</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                NoHarm emerged from a simple yet powerful vision: to accelerate the adoption of climate technologies by connecting innovative solutions with the right buyers. We understand the challenges climate tech sellers face in finding committed, sustainability-focused buyers.
              </p>
              <p className="text-gray-300 text-lg">
                Our platform bridges this gap, creating a marketplace where impactful solutions meet genuine commitment to environmental change.
              </p>
            </motion.div>
            <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[9/16] bg-zinc-800 rounded-lg overflow-hidden"
          >
            {/* MP4 Video */}
            <video 
              src="/images/noharmVideo.mp4" 
              controls 
              autoPlay 
              loop 
              muted 
              className="absolute inset-0 w-full h-full object-cover"
            ></video>
          </motion.div>

          </div>
        </div>
      </section>

      {/* Onboarding Journey Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Your Journey to Impact</h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Our streamlined onboarding process is designed to maximize your potential for creating meaningful environmental change.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-12 w-12 text-[#ACFF3D]" />,
                title: "Profile Creation",
                description: "Build a comprehensive profile showcasing your climate tech solutions and their potential impact.",
                impact: ""
              },
              {
                icon: <LineChart className="h-12 w-12 text-[#ACFF3D]" />,
                title: "Impact Verification",
                description: "Validate your solution's environmental impact through our rigorous assessment process.",
                impact: ""
              },
              {
                icon: <Users className="h-12 w-12 text-[#ACFF3D]" />,
                title: "Buyer Matching",
                description: "Get matched with pre-qualified buyers actively seeking climate solutions like yours.",
                impact: ""
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-zinc-900 p-8 rounded-lg"
              >
                <div className="mb-6">{step.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-300 mb-6">{step.description}</p>
                <p className="text-[#ACFF3D] font-semibold">{step.impact}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/vision.jpg"
            alt="Sustainable future"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6">
              Our Vision for
              <span className="text-[#ACFF3D]"> Climate Action</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              We both envision a world where innovative climate solutions are rapidly adopted and scaled, creating measurable impact in the fight against climate change. Your technology is a crucial part of this vision.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-black/40 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-[#ACFF3D] text-xl font-semibold mb-4">2025 Goals</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• Facilitate climate tech transactions</li>
                  <li>• Enable a high number of carbon reduction</li>
                  <li>• Support 100+ climate tech solutions</li>
                </ul>
              </div>
              <div className="bg-black/40 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-[#ACFF3D] text-xl font-semibold mb-4">Your Impact</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• Scale your solution globally</li>
                  <li>• Access verified impact metrics</li>
                  <li>• Join a community of change-makers</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mb-16 text-center"
          >
            Global
            <span className="text-[#ACFF3D]"> Impact</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {focusAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg"
              >
                <Image
                  src={area.image}
                  alt={area.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-[300px] transition-transform duration-500 group-hover:scale-110 opacity-75 brightness-110"
                />
                <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-semibold mb-2">{area.title}</h3>
                  <p className="text-gray-300">{area.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/vision.jpg"
            alt="Forest sunlight"
            fill
            className="object-cover opacity-50 brightness-110"
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
              Become a
              <span className="text-[#ACFF3D]"> Partner</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our network of climate tech innovators and make a lasting impact on the future of our planet.
            </p>
            <DashboardRedirectButton
              size="lg"
              className="group bg-[#ACFF3D] text-black hover:bg-[#9EEF2F] font-semibold text-lg px-8 py-4"
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