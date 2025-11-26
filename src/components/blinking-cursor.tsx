"use client"

import { motion } from "framer-motion"

interface BlinkingCursorProps {
  className?: string
}

export function BlinkingCursor({ className = "" }: BlinkingCursorProps) {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      className={`inline-block ${className}`}
    >
      █
    </motion.span>
  )
}
