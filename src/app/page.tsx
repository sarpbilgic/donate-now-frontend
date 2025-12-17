import { SystemBootHero } from "@/components/system-boot-hero"
import { TerminalDonation } from "@/components/terminal-donation"
import { SystemLogs } from "@/components/system-logs"
import { CrtOverlay } from "@/components/crt-overlay"
import { DonationModal } from "@/components/donation-modal"
import { AuthHeader } from "@/components/auth-header"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-green-500 font-mono overflow-hidden">
      <CrtOverlay />

      {/* Auth Header */}
      <header className="relative z-20 border-b border-green-500/20 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-3xl">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <span className="text-green-500">$</span>
            <span className="hidden sm:inline">DONATE_NOW_TERMINAL</span>
            <span className="sm:hidden">DNT</span>
          </div>
          <AuthHeader />
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 flex flex-col gap-8 md:gap-12 max-w-3xl">
        <SystemBootHero />
        <TerminalDonation />
        <SystemLogs />
      </div>

      {/* Global Donation Modal */}
      <DonationModal />
    </main>
  )
}
