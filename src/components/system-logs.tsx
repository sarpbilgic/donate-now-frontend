"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollText } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  type: "INFO" | "SUCCESS" | "SYSTEM"
  name: string
  amount: number
}

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fetch real donations from backend
    const fetchDonations = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/donations/recent`)
        const data = await response.json()
        
        // Transform backend data to our log format
        const transformedLogs: LogEntry[] = data.map((donation: any, index: number) => ({
          id: `${index}`,
          timestamp: new Date(donation.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(',', ''),
          type: donation.donor_name === 'Anonymous' ? 'INFO' : 'SUCCESS',
          name: donation.donor_name,
          amount: donation.amount / 100 // Convert cents to dollars
        }))
        
        // Stagger the appearance of logs
        setIsVisible(true)
        transformedLogs.forEach((log, index) => {
          setTimeout(() => {
            setLogs((prev) => [...prev, log])
          }, index * 200)
        })
      } catch (error) {
        console.error('Error fetching recent donations:', error)
        // Fallback to empty on error
        setIsVisible(true)
      }
    }

    const timeout = setTimeout(() => {
      fetchDonations()
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/donations/recent`)
        const data = await response.json()
        
        const transformedLogs: LogEntry[] = data.map((donation: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          timestamp: new Date(donation.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(',', ''),
          type: donation.donor_name === 'Anonymous' ? 'INFO' : 'SUCCESS',
          name: donation.donor_name,
          amount: donation.amount / 100
        }))
        
        setLogs(transformedLogs)
      } catch (error) {
        console.error('Error polling donations:', error)
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [isVisible])

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "SUCCESS":
        return "text-green-400"
      case "INFO":
        return "text-green-500"
      case "SYSTEM":
        return "text-amber-400"
      default:
        return "text-green-400"
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-green-400 text-sm mb-3">
        <ScrollText className="w-4 h-4" />
        <span className="text-green-500">root@user:~$</span>
        <span className="text-green-300">tail -f donations.log</span>
      </div>

      {/* Log Container */}
      <div className="border border-green-500/30 bg-black/50 p-3 max-h-64 overflow-y-auto">
        <div className="space-y-1 font-mono text-xs md:text-sm">
          <AnimatePresence>
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap gap-x-2 text-green-400/90"
              >
                <span className="text-green-500/60">[{log.timestamp}]</span>
                <span className={getTypeColor(log.type)}>{log.type}:</span>
                <span className="text-green-300">{log.name}</span>
                <span className="text-green-400/60">sent packet</span>
                <span className="text-amber-400">{"{"}</span>
                <span className="text-green-400/70">amount:</span>
                <span className="text-green-300 font-bold">${log.amount}</span>
                <span className="text-amber-400">{"}"}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Blinking cursor at the end */}
          {logs.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500">
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              >
                █
              </motion.span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="text-green-400/50 text-xs mt-2 font-mono">
        --- LIVE FEED ACTIVE --- {logs.length} entries loaded ---
      </div>
    </motion.section>
  )
}
