"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Zap } from "lucide-react"
import { BlinkingCursor } from "@/components/blinking-cursor"
import { useDonationStore } from "@/lib/store"

const presetAmounts = [10, 25, 50]

export function TerminalDonation() {
  const { setAmount, setStep, openModal, isAuthenticated } = useDonationStore()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25)
  const [customAmount, setCustomAmount] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "")
    setCustomAmount(numericValue)
    if (numericValue) {
      setSelectedAmount(null)
    }
  }

  const handleExecute = () => {
    const donationAmount = customAmount ? Number.parseInt(customAmount) : selectedAmount
    
    if (!donationAmount || donationAmount <= 0) {
      console.error('Invalid amount')
      return
    }
    
    // Simulate brief loading animation
    setIsExecuting(true)
    
    setTimeout(() => {
      // Set amount in store
      setAmount(donationAmount)
      
      // If user is authenticated, go straight to payment
      // Otherwise, show auth step first
      if (isAuthenticated) {
        setStep('payment')
      } else {
        setStep('auth')
      }
      
      openModal()
      setIsExecuting(false)
    }, 800)
  }

  const currentAmount = customAmount || selectedAmount || 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="w-full"
    >
      {/* Terminal Window */}
      <div className="border border-green-500/50 bg-black/80">
        {/* Window Title Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-green-400/60 text-xs font-mono">donation_terminal.exe</span>
          <div className="w-16" />
        </div>

        {/* Terminal Content */}
        <div className="p-4 space-y-4">
          {/* Command Prompt Header */}
          <div className="text-green-400 text-sm">
            <span className="text-green-500">root@user:~$</span> <span className="text-green-300">donate --amount</span>{" "}
            <span className="text-amber-400">[{currentAmount}]</span>
            <BlinkingCursor className="ml-1" />
          </div>

          {/* Preset Amount Scripts */}
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handlePresetClick(amount)}
                className={`px-4 py-2 border font-mono text-sm transition-all duration-200 ${
                  selectedAmount === amount
                    ? "border-green-500 bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    : "border-green-500/30 text-green-400/70 hover:border-green-500/60 hover:text-green-400"
                }`}
              >
                [ ./donate_{amount}.sh ]
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <ChevronRight className="w-4 h-4 text-green-500" />
            <span className="text-green-400/70">custom_amount:</span>
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-500">$</span>
              <input
                type="text"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="___"
                className={`w-full pl-6 pr-3 py-2 bg-transparent border font-mono text-green-300 placeholder:text-green-500/30 focus:outline-none ${
                  customAmount
                    ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    : "border-green-500/30 focus:border-green-500/60"
                }`}
              />
            </div>
          </div>

          {/* Execute Button */}
          <motion.button
            onClick={handleExecute}
            disabled={(!selectedAmount && !customAmount) || isExecuting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 border-2 font-mono text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isExecuting
                ? "border-amber-500 bg-amber-500/20 text-amber-400"
                : "border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {isExecuting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Zap className="w-4 h-4" />
                </motion.span>
                PROCESSING...
              </>
            ) : (
              <>
                <span className="text-green-500">&gt;</span>
                EXECUTE_TRANSFER [ENTER]
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                >
                  _
                </motion.span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.section>
  )
}
