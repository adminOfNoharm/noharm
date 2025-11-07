import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Users, Layers } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "Smart Matchmaking",
    description: "Our intelligent system connects climate innovators with buyers and allies, ensuring the right fit based on industry needs, sustainability goals, and impact potential.",
    color: "#0D9B3F", // Green
    gradient: "from-[#0D9B3F]/10 to-transparent",
    animation: "/images/smart-matching-animation.svg"
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: "Verified & Curated Solutions",
    description: "Every listed solution undergoes a vetting process to ensure credibility, scalability, and alignment with industry standards.",
    color: "#2152CC", // Blue
    gradient: "from-[#2152CC]/10 to-transparent",
    animation: "/images/verification-animation.svg"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Collaborative Growth",
    description: "Through knowledge sharing, funding access, and strategic partnerships, we empower every stakeholder in our ecosystem to grow and make a meaningful difference.",
    color: "#A239CA", // Purple
    gradient: "from-[#A239CA]/10 to-transparent",
    animation: "/images/collaboration-animation.svg"
  },
  {
    icon: <Layers className="h-8 w-8" />,
    title: "Integrated Platform",
    description: "From discovery to due diligence, our ecosystem streamlines the entire journey—helping climate solutions gain traction faster and more efficiently.",
    color: "#00A3B4", // Teal
    gradient: "from-[#00A3B4]/10 to-transparent",
    animation: "/images/integration-animation.svg"
  }
]

export default function Features() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.span 
            className="text-gray-500 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            How it works
          </motion.span>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6 font-display bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            The NoHarm Ecosystem at Work
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Our platform integrates cutting-edge climate tech solutions with sustainable partnerships, making meaningful impact accessible and efficient.
          </motion.p>
        </motion.div>

        {/* Interactive Feature Cards */}
        <div className="grid md:grid-cols-2 gap-12 mt-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="group">
                {/* Card with hover effects */}
                <div className={`
                  relative overflow-hidden rounded-2xl p-8 h-full
                  border border-gray-100 bg-white
                  transition-all duration-300
                  hover:shadow-xl hover:shadow-${feature.color}/5
                  hover:border-${feature.color}/20
                `}>
                  {/* Gradient background on hover */}
                  <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100
                    bg-gradient-to-br ${feature.gradient}
                    transition-opacity duration-500
                  `} />
                  
                  <div className="relative z-10">
                    {/* Icon with colored background */}
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                      style={{ 
                        backgroundColor: `${feature.color}10`,
                        color: feature.color
                      }}
                    >
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-4" style={{ color: feature.color }}>
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-8">
                      {feature.description}
                    </p>
                    
                    {/* Interactive Animation */}
                    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-50 group-hover:shadow-lg transition-all duration-300">
                      <Image
                        src={feature.animation}
                        alt={feature.title}
                        fill
                        className="object-contain p-4"
                      />
                      
                      {/* Animated overlay elements */}
                      <motion.div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                        
                        {/* Animated dots */}
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={`dot-${i}`}
                            className="absolute w-2 h-2 rounded-full"
                            style={{ 
                              backgroundColor: feature.color,
                              left: `${20 + i * 15}%`,
                              top: `${70 + (i % 3) * 5}%`
                            }}
                            animate={{
                              y: [0, -10, 0],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Central connecting element */}
        {/* Central connecting element - now with vertical adjustment */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ marginTop: '11rem' }}>
          <motion.div 
            className="w-40 hidden lg:block h-40 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-gray-100 animate-spin-slow-reverse" />
              <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center">
                <Image
                  src="/images/noharm-ecosystem-icon.svg"
                  alt="NoHarm Ecosystem"
                  width={60}
                  height={60}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

