"use client";

import { useState } from "react";
import { User, LogIn, LogOut, UserPlus, Loader2 } from "lucide-react";
import { useDonationStore } from "@/lib/store";
import { signOutUser } from "@/lib/auth";

export function AuthHeader() {
  const { user, setUser, isAuthenticated, setIsAuthenticated, openModal, setStep } = useDonationStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    // Open donation modal at auth step
    setStep('auth');
    openModal();
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOutUser();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      {isAuthenticated && user ? (
        <>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{user.username.split("@")[0]}</span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-3 py-1.5 border border-green-500/50 text-green-400 text-sm hover:bg-green-500/10 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">LOGIN</span>
          </button>
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-3 py-1.5 border border-green-500 bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">REGISTER</span>
          </button>
        </>
      )}
    </div>
  );
}
