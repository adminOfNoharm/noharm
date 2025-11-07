'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function TextGenerateEffect({ words, className = '' }: { words: string; className?: string }) {
  const [wordArray, setWordArray] = useState<string[]>([])

  useEffect(() => {
    setWordArray(words.split(' '))
  }, [words])

  return (
    <div className={className}>
      {wordArray.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}

