'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup logic
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  return (
    <section className="py-20 bg-gradient-to-r from-green-400 to-blue-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated with NoHarm</h2>
          <p className="text-xl text-white mb-8">Join our newsletter for the latest in sustainable technology and climate solutions.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full sm:w-auto px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-2 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

