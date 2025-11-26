"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface TypingTextProps {
  text: string
  delay?: number
  speed?: number
  className?: string
  showCursor?: boolean
  onComplete?: () => void
}

export function TypingText({
  text,
  delay = 0,
  speed = 30,
  className = "",
  showCursor = false,
  onComplete,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setIsComplete(true)
          onComplete?.()
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, delay, speed, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          className="inline-block ml-0.5"
        >
          █
        </motion.span>
      )}
    </span>
  )
}
