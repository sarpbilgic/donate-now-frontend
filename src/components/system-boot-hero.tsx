"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Terminal, Cpu, Wifi, Github, Linkedin } from "lucide-react"
import { TypingText } from "@/components/typing-text"

const bootSequence = [
  { text: "[OK] Loading kernel modules...", delay: 0 },
  { text: "[OK] Initializing network interface...", delay: 400 },
  { text: "[OK] Mounting filesystem...", delay: 800 },
  { text: "[OK] Starting DONATE_NOW_SYSTEMS v2.0.25...", delay: 1200 },
]

export function SystemBootHero() {
  const [bootComplete, setBootComplete] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [fundAmount, setFundAmount] = useState(0)
  const [targetAmount, setTargetAmount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setBootComplete(true)
      setTimeout(() => setShowStats(true), 500)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  // Fetch real total donations from backend
  useEffect(() => {
    if (showStats) {
      const fetchTotalDonations = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/donations/total`)
          const data = await response.json()
          const target = Math.floor(data.total_amount_dollars)
          setTargetAmount(target)
          
          // Animate fund counter
          const duration = 1500
          const steps = 60
          const increment = target / steps
          let current = 0
          const interval = setInterval(() => {
            current += increment
            if (current >= target) {
              setFundAmount(target)
              clearInterval(interval)
            } else {
              setFundAmount(Math.floor(current))
            }
          }, duration / steps)
          
          return () => clearInterval(interval)
        } catch (error) {
          console.error('Error fetching total donations:', error)
          // Fallback to mock data on error
          setTargetAmount(1250)
          setFundAmount(1250)
        }
      }
      
      fetchTotalDonations()
    }
  }, [showStats])

  const progressBars = Math.floor((fundAmount / 2000) * 20)
  const progressBar = "[" + "█".repeat(progressBars) + "░".repeat(20 - progressBars) + "]"

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 text-green-400 mb-4">
        <Terminal className="w-5 h-5" />
        <span className="text-sm">sarp@terminal:~$</span>
        <TypingText text="./init_system.sh" delay={100} speed={50} showCursor />
      </div>

      {/* Boot Sequence Logs */}
      <div className="space-y-1 text-sm">
        {bootSequence.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: line.delay / 1000, duration: 0.3 }}
            className="text-green-400/80"
          >
            {line.text}
          </motion.div>
        ))}
      </div>

      {/* ASCII Art Title */}
      {bootComplete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="py-4">
          <pre className="text-green-500 text-xs md:text-sm leading-tight font-mono">
            {`
 ██████╗  ██████╗ ███╗   ██╗ █████╗ ████████╗███████╗    ███╗   ██╗ ██████╗ ██╗    ██╗
 ██╔══██╗██╔═══██╗████╗  ██║██╔══██╗╚══██╔══╝██╔════╝    ████╗  ██║██╔═══██╗██║    ██║
 ██║  ██║██║   ██║██╔██╗ ██║███████║   ██║   █████╗      ██╔██╗ ██║██║   ██║██║ █╗ ██║
 ██║  ██║██║   ██║██║╚██╗██║██╔══██║   ██║   ██╔══╝      ██║╚██╗██║██║   ██║██║███╗██║
 ██████╔╝╚██████╔╝██║ ╚████║██║  ██║   ██║   ███████╗    ██║ ╚████║╚██████╔╝╚███╔███╔╝
 ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ 
`}
          </pre>
          <div className="text-green-400/60 text-xs mt-2">
            ═══════════════════════════════════════════════════════════════════════════════
          </div>
        </motion.div>
      )}

      {/* System Stats */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 border border-green-500/30 p-4 bg-black/50"
        >
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <span className="text-green-500">&gt;</span>
            <TypingText text="LOAD USER_PROFILE --target SARP" speed={40} />
          </div>

          <div className="space-y-2 text-sm pl-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-green-400" />
              <span className="text-green-400/70">STATUS:</span>
              <span className="text-green-500">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400/70">MISSION:</span>
              <span className="text-green-300">Building open source tools</span>
            </div>
            <div className="text-green-400/70">
              <span className="text-green-400/70">BIO:</span>
              <span className="text-green-300 ml-2">Independent developer & creator</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 pt-2 pl-4">
            <a
              href="https://github.com/sarpbilgic"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm group"
            >
              <Github className="w-4 h-4" />
              <span className="group-hover:underline">./github.sh</span>
            </a>
            <a
              href="https://www.linkedin.com/in/sarp-emre-bilgi%C3%A7-160808298"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm group"
            >
              <Linkedin className="w-4 h-4" />
              <span className="group-hover:underline">./linkedin.sh</span>
            </a>
          </div>

          {/* Fund Monitor */}
          <div className="pt-4 border-t border-green-500/20">
            <div className="text-green-400 text-sm">
              <span className="text-green-500">[SYSTEM_FUNDS]:</span>{" "}
              <span className="text-green-300 font-bold">${fundAmount.toLocaleString()}.00</span>
              <span className="text-green-400/60"> / UNLIMITED</span>
            </div>
            <div className="text-green-500 text-xs mt-1 font-mono">
              {progressBar} {Math.floor((fundAmount / 2000) * 100)}%
            </div>
          </div>
        </motion.div>
      )}
    </motion.section>
  )
}
