"use client";

import { useState } from 'react';
import { useDonationStore, useDonationModalOpen, useDonationStep } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Example Donation Modal Component
 * 
 * This demonstrates how to use the useDonationStore to control
 * a multi-step donation flow.
 */
export function DonationModalExample() {
  const isOpen = useDonationModalOpen();
  const step = useDonationStep();
  const { closeModal, resetModal, setStep, amount, setAmount } = useDonationStore();

  const handleClose = () => {
    closeModal();
    // Reset state after animation completes
    setTimeout(() => resetModal(), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-black border border-green-500/50 max-w-lg w-full rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/30 bg-green-500/5">
                <h2 className="text-green-400 font-mono text-sm">
                  {step === 'amount' && 'SELECT AMOUNT'}
                  {step === 'auth' && 'AUTHENTICATE'}
                  {step === 'payment' && 'PROCESS PAYMENT'}
                  {step === 'success' && 'SUCCESS'}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-green-400 hover:text-green-300 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 min-h-[300px]">
                {step === 'amount' && (
                  <AmountStep
                    amount={amount}
                    onAmountChange={setAmount}
                    onNext={() => setStep('auth')}
                  />
                )}

                {step === 'auth' && (
                  <AuthStep
                    onBack={() => setStep('amount')}
                    onNext={() => setStep('payment')}
                    onSkip={() => setStep('payment')}
                  />
                )}

                {step === 'payment' && (
                  <PaymentStep
                    amount={amount}
                    onBack={() => setStep('auth')}
                    onSuccess={() => setStep('success')}
                  />
                )}

                {step === 'success' && (
                  <SuccessStep
                    amount={amount}
                    onClose={handleClose}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Step Components

function AmountStep({
  amount,
  onAmountChange,
  onNext,
}: {
  amount: number;
  onAmountChange: (amount: number) => void;
  onNext: () => void;
}) {
  const presets = [10, 25, 50, 100];

  return (
    <div className="space-y-4">
      <p className="text-green-400 font-mono text-sm">
        &gt; SELECT_DONATION_AMOUNT
      </p>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onAmountChange(preset)}
            className={`px-4 py-3 border font-mono transition-all ${
              amount === preset
                ? 'border-green-500 bg-green-500/20 text-green-400'
                : 'border-green-500/30 text-green-400/70 hover:border-green-500/60'
            }`}
          >
            ${preset}
          </button>
        ))}
      </div>

      <div>
        <label className="text-green-400/70 font-mono text-sm">
          Custom Amount ($)
        </label>
        <input
          type="number"
          value={amount || ''}
          onChange={(e) => onAmountChange(Number(e.target.value))}
          className="w-full mt-1 px-3 py-2 bg-transparent border border-green-500/30 text-green-400 font-mono focus:border-green-500 focus:outline-none"
          placeholder="Enter amount"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!amount || amount <= 0}
        className="w-full py-2 border border-green-500 bg-green-500/10 text-green-400 font-mono hover:bg-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        CONTINUE &gt;
      </button>
    </div>
  );
}

function AuthStep({
  onBack,
  onNext,
  onSkip,
}: {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-green-400 font-mono text-sm">
        &gt; AUTHENTICATE (Optional)
      </p>

      <p className="text-green-400/70 text-sm">
        Log in to save your donation history and receive receipts.
      </p>

      <button
        onClick={onNext}
        className="w-full py-2 border border-green-500 bg-green-500/10 text-green-400 font-mono hover:bg-green-500/20"
      >
        LOG IN
      </button>

      <button
        onClick={onSkip}
        className="w-full py-2 border border-green-500/30 text-green-400/70 font-mono hover:border-green-500/60"
      >
        CONTINUE AS GUEST
      </button>

      <button
        onClick={onBack}
        className="w-full py-2 text-green-400/50 font-mono hover:text-green-400 text-sm"
      >
        &lt; BACK
      </button>
    </div>
  );
}

function PaymentStep({
  amount,
  onBack,
  onSuccess,
}: {
  amount: number;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessing(false);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <p className="text-green-400 font-mono text-sm">
        &gt; PROCESS_PAYMENT
      </p>

      <div className="border border-green-500/30 p-4 bg-green-500/5">
        <div className="text-green-400/70 text-sm">Amount:</div>
        <div className="text-green-400 font-mono text-2xl">${amount}</div>
      </div>

      <div className="text-green-400/70 text-sm">
        Payment form would go here (Stripe Elements)
      </div>

      <button
        onClick={handlePayment}
        disabled={processing}
        className="w-full py-2 border border-green-500 bg-green-500/10 text-green-400 font-mono hover:bg-green-500/20 disabled:opacity-40"
      >
        {processing ? 'PROCESSING...' : 'COMPLETE PAYMENT'}
      </button>

      <button
        onClick={onBack}
        disabled={processing}
        className="w-full py-2 text-green-400/50 font-mono hover:text-green-400 text-sm"
      >
        &lt; BACK
      </button>
    </div>
  );
}

function SuccessStep({
  amount,
  onClose,
}: {
  amount: number;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="text-green-400 font-mono text-6xl">✓</div>
      
      <p className="text-green-400 font-mono text-lg">
        PAYMENT SUCCESSFUL
      </p>

      <div className="border border-green-500/30 p-4 bg-green-500/5">
        <div className="text-green-400/70 text-sm">Donation Amount:</div>
        <div className="text-green-400 font-mono text-2xl">${amount}</div>
      </div>

      <p className="text-green-400/70 text-sm">
        Thank you for your support!
      </p>

      <button
        onClick={onClose}
        className="w-full py-2 border border-green-500 bg-green-500/10 text-green-400 font-mono hover:bg-green-500/20"
      >
        CLOSE
      </button>
    </div>
  );
}


