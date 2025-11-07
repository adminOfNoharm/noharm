import { motion } from "framer-motion"
import { ArrowRight, Briefcase, Code, Scale, Megaphone, Palette, Lightbulb, Users, Award, Clock, Target, Leaf } from "lucide-react"
import Image from "next/image"
import DashboardRedirectButton from "./DashboardRedirectButton"

const serviceCategories = [
  {
    title: "Legal Services",
    description: "Specialized legal expertise for climate tech regulations and compliance",
    image: "/images/legalServices.jpg",
    icon: <Scale className="h-12 w-12 text-[#ACFF3D]" />
  },
  {
    title: "Marketing & Communications",
    description: "Strategic marketing to amplify climate tech impact stories",
    image: "/images/marketing.jpg",
    icon: <Megaphone className="h-12 w-12 text-[#ACFF3D]" />
  },
  {
    title: "Software Development",
    description: "Custom software solutions for climate tech innovations",
    image: "/images/softwareDev.jpg",
    icon: <Code className="h-12 w-12 text-[#ACFF3D]" />
  },
  {
    title: "Design & UX",
    description: "User-centered design for climate tech products and interfaces",
    image: "/images/design.jpg",
    icon: <Palette className="h-12 w-12 text-[#ACFF3D]" />
  },
]

interface AlliesContentProps {
  isAuthenticated?: boolean
}

export default function AlliesContent({ isAuthenticated = false }: AlliesContentProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/world.jpg"
            alt="Digital world connection"
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
              Be the
              <span className="text-[#ACFF3D] block">Catalyst</span>
              for Change
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Climate tech companies need your expertise to overcome critical challenges. Your specialized services can be the difference between a promising solution and world-changing impact.
            </p>
            <DashboardRedirectButton
              size="lg"
              className="group bg-[#ACFF3D] text-black hover:bg-[#9EEF2F] font-semibold text-lg px-8 py-4"
            >
              {isAuthenticated ? "Continue to Dashboard" : "Join as an Ally"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </DashboardRedirectButton>
          </motion.div>
        </div>
      </section>

      {/* About Alliance Program Section */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                The NoHarm
                <span className="text-[#ACFF3D]"> Alliance</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Climate tech innovators face unique challenges that go beyond funding. They need specialized expertise to navigate regulations, communicate their impact, build scalable solutions, and design intuitive interfaces.
              </p>
              <p className="text-gray-300 text-lg">
                This is where you come in. By joining our alliance, you become part of a carefully curated network of service providers who understand the climate tech landscape. Your expertise doesn't just help a business—it helps accelerate solutions our planet urgently needs.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-zinc-800 p-8 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-6 text-[#ACFF3D]">Why Climate Tech Needs You</h3>
              <div className="space-y-6">
                {[
                  {
                    icon: <Clock className="h-6 w-6 text-[#ACFF3D]" />,
                    title: "Time-Critical Solutions",
                    description: "Climate tech companies are racing against time. Your expertise helps them move faster."
                  },
                  {
                    icon: <Target className="h-6 w-6 text-[#ACFF3D]" />,
                    title: "Specialized Knowledge Gap",
                    description: "Many founders have technical expertise but lack specialized business services."
                  },
                  {
                    icon: <Leaf className="h-6 w-6 text-[#ACFF3D]" />,
                    title: "Impact Amplification",
                    description: "Your services directly contribute to scaling climate solutions when they're needed most."
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

      {/* Service Categories Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Critical Services in Demand</h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              These are the specialized services climate tech companies consistently struggle to find—services that can transform their trajectory.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceCategories.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg"
              >
                <Image
                  src={service.image}
                  alt={service.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-[300px] transition-transform duration-500 group-hover:scale-110 opacity-75 brightness-110"
                />
                <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-300">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Your Path to Meaningful Impact</h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              We've designed a straightforward process to connect your expertise with the climate tech companies that need it most.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Briefcase className="h-12 w-12 text-[#ACFF3D]" />,
                title: "Share Your Expertise",
                description: "Tell us about your services, experience, and how you can specifically help climate tech companies.",
                step: "01"
              },
              {
                icon: <Users className="h-12 w-12 text-[#ACFF3D]" />,
                title: "Connect Directly",
                description: "We'll introduce you to climate tech companies facing challenges your expertise can solve.",
                step: "02"
              },
              {
                icon: <Lightbulb className="h-12 w-12 text-[#ACFF3D]" />,
                title: "Create Real Change",
                description: "Your services help climate solutions reach their potential and maximize their impact.",
                step: "03"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-zinc-800 p-8 rounded-lg relative"
              >
                <span className="absolute top-4 right-4 text-4xl font-bold text-zinc-700">{step.step}</span>
                <div className="mb-6">{step.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Real Stories, Real Impact</h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Hear from service providers who've helped climate tech companies overcome critical challenges.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "A climate tech startup came to us struggling with complex regulatory barriers. Through our partnership, we developed a compliance strategy that helped them secure their first major contract. It's incredibly rewarding to see their solution now being implemented.",
                name: "Sarah Johnson",
                role: "Environmental Law Specialist",
                image: "/images/femaleProfile.jpg"
              },
              {
                quote: "We helped a carbon capture startup redesign their monitoring dashboard. What started as a UX project evolved into a partnership where our team now supports their entire digital infrastructure. Knowing our work helps scale climate solutions gives purpose to our technical expertise.",
                name: "Michael Chen",
                role: "Tech Solutions Director",
                image: "/images/maleProfile.jpg"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-zinc-900 p-8 rounded-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-[#ACFF3D]">{testimonial.role}</p>
                  </div>
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
                Beyond Business:
                <span className="text-[#ACFF3D]"> Your Impact</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Users className="h-6 w-6 text-[#ACFF3D]" />,
                    title: "Meaningful Connections",
                    description: "Work with purpose-driven founders solving our planet's most urgent challenges."
                  },
                  {
                    icon: <Award className="h-6 w-6 text-[#ACFF3D]" />,
                    title: "Specialized Recognition",
                    description: "Build your reputation in the growing climate tech ecosystem."
                  },
                  {
                    icon: <Briefcase className="h-6 w-6 text-[#ACFF3D]" />,
                    title: "Aligned Opportunities",
                    description: "Connect with clients who value your expertise and share your commitment to impact."
                  },
                  {
                    icon: <Lightbulb className="h-6 w-6 text-[#ACFF3D]" />,
                    title: "Amplified Influence",
                    description: "Your specialized services can help scale solutions with global environmental impact."
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
                  src="/images/collaboration.jpg"
                  alt="Climate tech collaboration"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-2xl font-bold text-white">Our growing community of</p>
                  <p className="text-4xl font-bold text-[#ACFF3D]">Climate Allies</p>
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
            src="/images/world.jpg"
            alt="Digital world"
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
              Your Expertise,
              <span className="text-[#ACFF3D]"> Their Breakthrough</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Climate tech companies are waiting for the specialized services only you can provide. Join our alliance and become an essential part of the climate solution.
            </p>
            <DashboardRedirectButton
              size="lg"
              className="group bg-[#ACFF3D] text-black hover:bg-[#9EEF2F] font-semibold text-lg px-8 py-4"
            >
              {isAuthenticated ? "Continue to Dashboard" : "Become an Ally"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </DashboardRedirectButton>
          </motion.div>
        </div>
      </section>
    </div>
  )
}