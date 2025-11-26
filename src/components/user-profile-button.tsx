"use client";

import { useDonationStore, useIsAuthenticated } from '@/lib/store';
import { signOutUser } from '@/lib/auth';
import { User, LogOut, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * User Profile Button
 * Shows sign in button when not authenticated
 * Shows user menu when authenticated
 */
export function UserProfileButton() {
  const isAuthenticated = useIsAuthenticated();
  const { user, setUser, setIsAuthenticated, openModal, setStep, setAmount } = useDonationStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignIn = () => {
    setAmount(0);
    setStep('auth');
    openModal();
  };

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      setUser(null);
      setIsAuthenticated(false);
      setShowMenu(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={handleSignIn}
        className="px-4 py-2 border border-green-500/50 text-green-400 font-mono text-sm hover:bg-green-500/10 transition-all flex items-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        <span>SIGN_IN</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 border border-green-500/50 text-green-400 font-mono text-sm hover:bg-green-500/10 transition-all flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        <span className="max-w-[150px] truncate">{user.username}</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-2 w-48 border border-green-500/50 bg-black z-50"
          >
            <div className="p-3 border-b border-green-500/30">
              <p className="text-green-400/70 text-xs">USER_ID:</p>
              <p className="text-green-400 text-sm font-mono truncate">
                {user.userId}
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 text-left text-green-400 font-mono text-sm hover:bg-green-500/10 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN_OUT</span>
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

