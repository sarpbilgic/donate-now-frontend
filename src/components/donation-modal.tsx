"use client";

import { useState, useEffect } from 'react';
import { useDonationStore } from '@/lib/store';
import { createDonationIntent } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { signInUser, signUpUser, confirmSignUpUser, getAuthenticatedUser } from '@/lib/auth';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

/**
 * Main Donation Modal Component
 * Controls the overall modal visibility and step flow
 */
export function DonationModal() {
  const { isOpen, closeModal, step, resetModal } = useDonationStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      // Reset after animation completes
      setTimeout(() => resetModal(), 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-black border-2 border-green-500/50 text-green-400 font-mono max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-green-400 font-mono text-lg flex items-center gap-2">
            <span className="text-green-500">&gt;</span>
            {step === 'auth' && 'AUTHENTICATION_TERMINAL'}
            {step === 'payment' && 'PAYMENT_TERMINAL'}
            {step === 'success' && 'TRANSACTION_COMPLETE'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {step === 'auth' && <AuthStep />}
          {step === 'payment' && <PaymentStep />}
          {step === 'success' && <SuccessStep />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Auth Step Component
 * Handles sign in and sign up
 */
function AuthStep() {
  const { setStep, setUser } = useDonationStore();
  const [mode, setMode] = useState<'signin' | 'signup' | 'confirm'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signInUser({ email, password });

    if (result.success) {
      // Get user details and update store
      const userResult = await getAuthenticatedUser();
      if (userResult.success && userResult.user) {
        setUser({
          userId: userResult.user.userId,
          username: userResult.user.username,
        });
      }
      // Proceed to payment
      setStep('payment');
    } else {
      setError(result.error || 'Sign in failed');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signUpUser({ email, password, name });

    if (result.success) {
      if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        setMode('confirm');
      } else {
        // Auto-signed in
        const userResult = await getAuthenticatedUser();
        if (userResult.success && userResult.user) {
          setUser({
            userId: userResult.user.userId,
            username: userResult.user.username,
          });
        }
        setStep('payment');
      }
    } else {
      setError(result.error || 'Sign up failed');
    }

    setLoading(false);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await confirmSignUpUser({ email, code });

    if (result.success) {
      // Sign in after confirmation
      const signInResult = await signInUser({ email, password });
      if (signInResult.success) {
        const userResult = await getAuthenticatedUser();
        if (userResult.success && userResult.user) {
          setUser({
            userId: userResult.user.userId,
            username: userResult.user.username,
          });
        }
        setStep('payment');
      }
    } else {
      setError(result.error || 'Confirmation failed');
    }

    setLoading(false);
  };

  const handleSkipAuth = () => {
    setStep('payment');
  };

  return (
    <div className="space-y-6">
      {/* Terminal Message */}
      <div className="text-green-400/70 text-sm space-y-1">
        <p>&gt; Authentication enables donation history tracking</p>
        <p>&gt; You can also donate anonymously</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-red-500/50 bg-red-500/10 p-3 rounded flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Sign In Form */}
      {mode === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-green-400/70 text-sm flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              EMAIL_ADDRESS:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-black border border-green-500/30 text-green-400 font-mono focus:border-green-500 focus:outline-none rounded"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="text-green-400/70 text-sm flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              PASSWORD:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-black border border-green-500/30 text-green-400 font-mono focus:border-green-500 focus:outline-none rounded"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-green-500 bg-green-500/10 text-green-400 font-mono hover:bg-green-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AUTHENTICATING...
              </>
            ) : (
              <>
                <span className="text-green-500">&gt;</span>
                SIGN_IN [ENTER]
              </>
            )}
          </button>

          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="flex-1 py-2 border border-green-500/30 text-green-400/70 font-mono hover:border-green-500/60 hover:text-green-400 transition-all"
            >
              CREATE_ACCOUNT
            </button>
            <button
              type="button"
              onClick={handleSkipAuth}
              className="flex-1 py-2 border border-green-500/30 text-green-400/70 font-mono hover:border-green-500/60 hover:text-green-400 transition-all"
            >
              SKIP_→
            </button>
          </div>
        </form>
      )}

      {/* Sign Up Form */}
      {mode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-green-400/70 text-sm flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              NAME (Optional):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-green-500/30 text-green-400 font-mono focus:border-green-500 focus:outline-none rounded"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="text-green-400/70 text-sm flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              EMAIL_ADDRESS:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-black border border-green-500/30 text-green-400 font-mono focus:border-green-500 focus:outline-none rounded"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="text-green-400/70 text-sm flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              PASSWORD:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 bg-black border border-green-500/30 text-green-400 font-mono focus:border-green-500 focus:outline-none rounded"
              placeholder="Min. 8 characters"
            />
            <p className="text-green-400/50 text-xs mt-1">
              Must include uppercase, lowercase, number & special char
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-green-500 bg-green-500/10 text-green-400 font-mono hover:bg-green-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                CREATING_ACCOUNT...
              </>
            ) : (
              <>
                <span className="text-green-500">&gt;</span>
                CREATE_ACCOUNT [ENTER]
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('signin')}
            className="w-full py-2 text-green-400/50 font-mono hover:text-green-400 text-sm transition-all"
          >
            &lt; BACK_TO_SIGN_IN
          </button>
        </form>
      )}

      {/* Confirmation Form */}
      {mode === 'confirm' && (
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="border border-green-500/30 bg-green-500/5 p-4 rounded">
            <p className="text-green-400 text-sm">
              Verification code sent to:
            </p>
            <p className="text-green-400 font-bold">{email}</p>
          </div>

          <div>
            <label className="text-green-400/70 text-sm mb-2 block">
              VERIFICATION_CODE:
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              className="w-full px-3 py-2 bg-black border border-green-500/30 text-green-400 font-mono text-center text-2xl tracking-widest focus:border-green-500 focus:outline-none rounded"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-green-500 bg-green-500/10 text-green-400 font-mono hover:bg-green-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                VERIFYING...
              </>
            ) : (
              <>
                <span className="text-green-500">&gt;</span>
                VERIFY_CODE [ENTER]
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('signin')}
            className="w-full py-2 text-green-400/50 font-mono hover:text-green-400 text-sm transition-all"
          >
            &lt; BACK_TO_SIGN_IN
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * Payment Step Component
 * Handles the Stripe payment flow
 */
function PaymentStep() {
  const { amount } = useDonationStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Create payment intent on mount
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert dollars to cents
        const amountInCents = Math.round(amount * 100);
        
        // Create payment intent
        const response = await createDonationIntent(amountInCents);
        setClientSecret(response.client_secret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      initializePayment();
    }
  }, [amount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        <p className="text-green-400/70 text-sm">
          [INITIALIZING PAYMENT TERMINAL...]
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/50 bg-red-500/10 p-4 rounded">
        <p className="text-red-400 text-sm">
          <span className="text-red-500">[ERROR]</span> {error}
        </p>
        <p className="text-red-400/70 text-xs mt-2">
          Please close and try again.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="border border-yellow-500/50 bg-yellow-500/10 p-4 rounded">
        <p className="text-yellow-400 text-sm">
          [WARNING] No payment session available
        </p>
      </div>
    );
  }

  // Stripe Elements options
  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#22c55e',
        colorBackground: '#000000',
        colorText: '#22c55e',
        colorDanger: '#ef4444',
        fontFamily: 'monospace',
        borderRadius: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm amount={amount} />
    </Elements>
  );
}

/**
 * Payment Form Component
 * Handles the actual Stripe payment submission
 */
function PaymentForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { setStep } = useDonationStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donation/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
      } else {
        // Payment successful!
        setStep('success');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Display */}
      <div className="border border-green-500/30 bg-green-500/5 p-4 rounded">
        <div className="flex justify-between items-center">
          <span className="text-green-400/70 text-sm">TRANSACTION_AMOUNT:</span>
          <span className="text-green-400 font-bold text-xl">
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Terminal-style message */}
      <div className="text-green-400/70 text-xs space-y-1">
        <p>&gt; Establishing secure connection...</p>
        <p>&gt; Awaiting payment confirmation...</p>
      </div>

      {/* Payment Element */}
      <div className="border border-green-500/30 p-4 rounded bg-black/50">
        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-red-500/50 bg-red-500/10 p-3 rounded"
        >
          <p className="text-red-400 text-sm">
            <span className="text-red-500">[ERROR]</span> {errorMessage}
          </p>
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 border-2 border-green-500 bg-green-500/10 text-green-400 font-mono text-sm hover:bg-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            PROCESSING_TRANSACTION...
          </>
        ) : (
          <>
            <span className="text-green-500">&gt;&gt;</span>
            EXECUTE_PAYMENT [ENTER]
          </>
        )}
      </button>

      {/* Info */}
      <p className="text-green-400/50 text-xs text-center">
        Secured by Stripe • Your payment information is encrypted
      </p>
    </form>
  );
}

/**
 * Success Step Component
 * Shows success message and invalidates queries
 */
function SuccessStep() {
  const { amount, closeModal, resetModal } = useDonationStore();
  const queryClient = useQueryClient();

  // Invalidate queries to update the UI
  useEffect(() => {
    // Invalidate total donations query to update the counter
    queryClient.invalidateQueries({ queryKey: ['donations', 'total'] });
    // Also invalidate recent donations to show the new donation
    queryClient.invalidateQueries({ queryKey: ['donations', 'recent'] });
  }, [queryClient]);

  const handleClose = () => {
    closeModal();
    setTimeout(() => resetModal(), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 py-4"
    >
      {/* ASCII Art Success */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" />
        </motion.div>

        <pre className="text-green-400 text-xs mt-4 leading-tight">
{`
╔═══════════════════════════════════════╗
║                                       ║
║      TRANSACTION SUCCESSFUL           ║
║                                       ║
╚═══════════════════════════════════════╝
`}
        </pre>
      </div>

      {/* Transaction Details */}
      <div className="border border-green-500/50 bg-green-500/5 p-6 rounded space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-green-400/70">STATUS:</span>
          <span className="text-green-400 font-bold">[COMPLETED]</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-green-400/70">AMOUNT:</span>
          <span className="text-green-400 font-bold text-xl">
            ${amount.toFixed(2)} USD
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-green-400/70">TIMESTAMP:</span>
          <span className="text-green-400">
            {new Date().toISOString().replace('T', ' ').split('.')[0]}
          </span>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="border border-green-500/30 bg-black/50 p-4 rounded space-y-1 text-xs">
        <p className="text-green-400/70">&gt; Payment processed successfully</p>
        <p className="text-green-400/70">&gt; Receipt sent to email</p>
        <p className="text-green-400/70">&gt; Updating donation counter...</p>
        <p className="text-green-400">&gt; [OK] All systems updated</p>
      </div>

      {/* Thank You Message */}
      <div className="text-center space-y-2">
        <p className="text-green-400 text-lg font-bold">
          THANK YOU FOR YOUR SUPPORT!
        </p>
        <p className="text-green-400/70 text-sm">
          Your contribution helps keep this project alive.
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="w-full py-3 border-2 border-green-500 bg-green-500/10 text-green-400 font-mono text-sm hover:bg-green-500/20 transition-all"
      >
        <span className="text-green-500">&gt;</span> CLOSE_TERMINAL [ESC]
      </button>
    </motion.div>
  );
}

