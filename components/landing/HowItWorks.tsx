import { motion } from 'framer-motion'
import { Rocket, Users, Handshake } from 'lucide-react'
import Link from 'next/link'

const cards = [
  {
    icon: <Rocket className="h-8 w-8" />,
    title: "Climate Solutions",
    description: "Gain visibility, access growth resources, and connect with key market players to scale your impact.",
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    link: "/seller"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Buyers",
    description: "Discover curated, verified climate solutions that align with your business needs and sustainability objectives.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    link: "/buyer"
  },
  {
    icon: <Handshake className="h-8 w-8" />,
    title: "Allies",
    description: "Collaborate with top innovators, leverage diverse opportunities, and expand your influence in the climate tech space.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    link: "/ally"
  }
]

export default function HowItWorks() {
  return (
    <section className="relative py-24 bg-gray-50 overflow-hidden">
      {/* Subtle Floating Circles (neutral colors) */}
      <div className="absolute -right-20 top-20 w-96 h-96 bg-gray-100/20 rounded-full blur-3xl" />
      <div className="absolute -left-20 bottom-20 w-96 h-96 bg-gray-100/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6 font-display text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Why NoHarm?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            We create seamless connections between innovation and implementation, making sustainable technology adoption straightforward and effective.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              <Link href={card.link}>
                <div className={`
                  group cursor-pointer
                  rounded-2xl bg-white border ${card.borderColor}
                  p-8 h-full transition-all duration-300
                  hover:shadow-lg hover:shadow-gray-200/50
                  hover:-translate-y-2
                `}>
                  <div className="space-y-6">
                    {/* Icon */}
                    <div className={`
                      ${card.bgColor} ${card.color}
                      w-14 h-14 rounded-xl
                      flex items-center justify-center
                      transition-transform duration-300
                      group-hover:scale-110
                    `}>
                      {card.icon}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className={`text-xl font-semibold mb-3 ${card.color}`}>
                        {card.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Learn More Link */}
                    <div className={`
                      flex items-center space-x-2
                      text-sm font-medium ${card.color}
                      opacity-0 transform translate-y-2
                      transition-all duration-300
                      group-hover:opacity-100 group-hover:translate-y-0
                    `}>
                      <span>Learn more</span>
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}