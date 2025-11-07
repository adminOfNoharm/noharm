'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: "What is NoHarm's mission?",
    answer: "NoHarm's mission is to be the first AI-driven eco-tech matchmaking marketplace. We aim to connect solution-seekers with problem-solvers in this realm while providing real-time information on growing trends, industries, and project updates."
  },
  {
    question: "How does it work?",
    answer: "NoHarm works by connecting buyers (solution seekers) and sellers (problem solvers) who are seeking sustainable solutions. Users can tap into our vast network of accredited partners via our simple to use AI tool, access real-time information, and connect with like-minded professionals."
  },
  {
    question: "Why choose NoHarm?",
    answer: "NoHarm is the leading AI-driven sustainable technology marketplace. By choosing NoHarm, you are supporting businesses that are committed to environmental and social responsibility. Our platform offers a wide range of solutions, real-time information, and a community of like-minded individuals."
  },
  {
    question: "How can I get involved?",
    answer: "Getting involved with NoHarm is easy. You can create an account as a solution-seeker or a problem solver, depending on your needs. Join our community, explore sustainable digital products and services, and start making a positive impact today."
  }
]

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{ backgroundColor: activeIndex === index ? 'rgb(243 244 246)' : 'rgb(255 255 255)' }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="flex justify-between items-center w-full p-4 text-left"
              >
                <span className="font-medium">{faq.question}</span>
                {activeIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: 'auto' },
                      collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="p-4 pt-0">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

