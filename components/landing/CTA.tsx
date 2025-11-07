import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section className="py-24   relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10 bg-[url('/images/grid-pattern.svg')]" />
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Make a <span className="text-[#00792b]">Sustainable Impact</span>?
          </h2>
          <motion.p 
            className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Join innovators and buyers transforming climate tech today.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-[#00792b] hover:bg-[#006624] text-white px-8 py-6 text-lg shadow-lg hover:shadow-[#00792b]/30 transition-all"
            >
              <Link href="/onboarding">
                Get Started Now →
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating abstract shapes */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#1105ff] opacity-5 mix-blend-multiply blur-xl" />
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-[#00792b] opacity-5 mix-blend-multiply blur-xl" />
    </section>
  )
}