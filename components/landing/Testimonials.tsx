import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const testimonials = [
  {
    quote: "NoHarm has revolutionized our approach to sustainable technology partnerships.",
    name: "Sarah Chen",
    title: "CEO, GreenTech Solutions",
    avatar: "SC"
  },
  {
    quote: "The AI-powered matching capability has significantly enhanced our ability to identify optimal climate tech solutions.",
    name: "Michael Rodriguez",
    title: "Sustainability Director, EcoInnovate",
    avatar: "MR"
  },
  {
    quote: "A game-changing platform for climate tech collaboration and innovation.",
    name: "Emma Thompson",
    title: "Founder, CleanEnergy Systems",
    avatar: "ET"
  },
  {
    quote: "NoHarm's platform has accelerated our sustainable product development timeline considerably.",
    name: "David Patel",
    title: "CTO, EcoTech Innovations",
    avatar: "DP"
  }
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Hear from our partners about their experience with NoHarm
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <p className="flex-1 text-gray-600 mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/placeholder.svg?text=${testimonial.avatar}`} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

