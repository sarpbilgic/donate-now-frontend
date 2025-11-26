import { SystemBootHero } from "@/components/system-boot-hero"
import { TerminalDonation } from "@/components/terminal-donation"
import { SystemLogs } from "@/components/system-logs"
import { CrtOverlay } from "@/components/crt-overlay"
import { DonationModal } from "@/components/donation-modal"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-green-500 font-mono overflow-hidden">
      <CrtOverlay />

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
