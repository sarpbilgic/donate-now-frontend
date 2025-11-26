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

// Mock data - TODO: Replace with real-time data fetching
const initialLogs: LogEntry[] = [
  { id: "1", timestamp: "2023-10-27 14:00:23", type: "INFO", name: "Anonymous", amount: 25 },
  { id: "2", timestamp: "2023-10-27 13:45:12", type: "SUCCESS", name: "Sarah_M", amount: 10 },
  { id: "3", timestamp: "2023-10-27 12:30:45", type: "INFO", name: "Anonymous", amount: 5 },
  { id: "4", timestamp: "2023-10-27 11:15:33", type: "SUCCESS", name: "Mike_T", amount: 50 },
  { id: "5", timestamp: "2023-10-27 10:00:18", type: "INFO", name: "Anonymous", amount: 10 },
]

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Simulate loading logs with stagger
    const timeout = setTimeout(() => {
      setIsVisible(true)
      initialLogs.forEach((log, index) => {
        setTimeout(() => {
          setLogs((prev) => [...prev, log])
        }, index * 200)
      })
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  // TODO: Replace with real-time subscription for live updates

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
