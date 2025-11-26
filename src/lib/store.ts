import { create } from 'zustand';

// Define the donation flow steps
export type DonationStep = 'amount' | 'auth' | 'payment' | 'success';

// Define user state
export interface User {
  userId: string;
  username: string;
  email?: string;
  name?: string;
}

// Define the store state interface
interface DonationState {
  // State
  isOpen: boolean;
  amount: number;
  step: DonationStep;
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  openModal: () => void;
  closeModal: () => void;
  setAmount: (value: number) => void;
  setStep: (value: DonationStep) => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  
  // Helper action to reset the modal state
  resetModal: () => void;
}

// Initial state values
const initialState = {
  isOpen: false,
  amount: 0,
  step: 'amount' as DonationStep,
  user: null,
  isAuthenticated: false,
};

/**
 * Zustand store for managing donation modal state and flow
 * 
 * Usage:
 * ```tsx
 * const { isOpen, amount, step, openModal, setAmount } = useDonationStore();
 * ```
 */
export const useDonationStore = create<DonationState>((set) => ({
  // Initial state
  ...initialState,
  
  // Actions
  openModal: () => set({ isOpen: true }),
  
  closeModal: () => set({ isOpen: false }),
  
  setAmount: (value: number) => set({ amount: value }),
  
  setStep: (value: DonationStep) => set({ step: value }),
  
  setUser: (user: User | null) => set({ user, isAuthenticated: user !== null }),
  
  setIsAuthenticated: (isAuth: boolean) => set({ isAuthenticated: isAuth }),
  
  // Helper to reset modal to initial state (but keep user info)
  resetModal: () => set((state) => ({
    ...initialState,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  })),
}));

// Selector hooks for optimized re-renders (optional but recommended)
export const useDonationModalOpen = () => useDonationStore((state) => state.isOpen);
export const useDonationAmount = () => useDonationStore((state) => state.amount);
export const useDonationStep = () => useDonationStore((state) => state.step);
export const useDonationUser = () => useDonationStore((state) => state.user);
export const useIsAuthenticated = () => useDonationStore((state) => state.isAuthenticated);

