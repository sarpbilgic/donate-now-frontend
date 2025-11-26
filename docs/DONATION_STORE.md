# Donation Store (Zustand)

This document explains how to use the `useDonationStore` Zustand store for managing the donation modal flow.

## Overview

The donation store manages the state and flow of the donation modal across your application. It handles:
- Modal visibility
- Selected donation amount
- Current step in the donation flow
- Flow control actions

## Store Structure

### State

```typescript
{
  isOpen: boolean;      // Is the payment modal open?
  amount: number;       // Selected donation amount in dollars
  step: DonationStep;   // Current step: 'amount' | 'auth' | 'payment' | 'success'
}
```

### Actions

```typescript
{
  openModal: () => void;              // Open the donation modal
  closeModal: () => void;             // Close the donation modal
  setAmount: (value: number) => void; // Set the donation amount
  setStep: (step: DonationStep) => void; // Set the current step
  resetModal: () => void;             // Reset modal to initial state
}
```

## Usage Examples

### Basic Usage

```tsx
import { useDonationStore } from '@/lib/store';

function DonateButton() {
  const { openModal, setAmount } = useDonationStore();
  
  const handleQuickDonate = () => {
    setAmount(25);
    openModal();
  };
  
  return (
    <button onClick={handleQuickDonate}>
      Donate $25
    </button>
  );
}
```

### Using Optimized Selectors

For better performance, use the provided selector hooks that only re-render when specific values change:

```tsx
import { 
  useDonationModalOpen, 
  useDonationAmount, 
  useDonationStep 
} from '@/lib/store';

function DonationModal() {
  // Only re-renders when isOpen changes
  const isOpen = useDonationModalOpen();
  
  // Only re-renders when amount changes
  const amount = useDonationAmount();
  
  // Only re-renders when step changes
  const step = useDonationStep();
  
  return (
    <Modal open={isOpen}>
      {step === 'amount' && <AmountStep />}
      {step === 'auth' && <AuthStep />}
      {step === 'payment' && <PaymentStep amount={amount} />}
      {step === 'success' && <SuccessStep />}
    </Modal>
  );
}
```

### Complete Flow Example

```tsx
import { useDonationStore } from '@/lib/store';

function DonationFlow() {
  const { 
    isOpen, 
    amount, 
    step, 
    openModal, 
    closeModal, 
    setAmount, 
    setStep,
    resetModal 
  } = useDonationStore();
  
  const handleStartDonation = () => {
    setAmount(0);
    setStep('amount');
    openModal();
  };
  
  const handleAmountSelected = (value: number) => {
    setAmount(value);
    setStep('auth'); // Move to authentication step
  };
  
  const handleAuthComplete = () => {
    setStep('payment'); // Move to payment step
  };
  
  const handlePaymentComplete = () => {
    setStep('success'); // Show success message
  };
  
  const handleClose = () => {
    closeModal();
    // Reset after animation completes
    setTimeout(() => resetModal(), 300);
  };
  
  return (
    <>
      <button onClick={handleStartDonation}>
        Donate Now
      </button>
      
      {isOpen && (
        <DonationModal
          step={step}
          amount={amount}
          onClose={handleClose}
        />
      )}
    </>
  );
}
```

### Integration with Terminal Donation Component

```tsx
// src/components/terminal-donation.tsx
import { useDonationStore } from '@/lib/store';

export function TerminalDonation() {
  const { setAmount, setStep, openModal } = useDonationStore();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  
  const handleExecute = () => {
    const amount = selectedAmount || 0;
    
    // Update store and open modal
    setAmount(amount);
    setStep('payment');
    openModal();
  };
  
  return (
    <button onClick={handleExecute}>
      EXECUTE_TRANSFER
    </button>
  );
}
```

### Accessing Store Outside Components

You can access the store outside of React components:

```typescript
import { useDonationStore } from '@/lib/store';

// Get current state
const currentAmount = useDonationStore.getState().amount;

// Subscribe to changes
const unsubscribe = useDonationStore.subscribe(
  (state) => console.log('Amount changed:', state.amount)
);

// Update state
useDonationStore.setState({ amount: 50 });

// Cleanup
unsubscribe();
```

## Flow Diagram

```
[Closed] 
   ↓ openModal()
[Step: amount] → User selects amount
   ↓ setStep('auth')
[Step: auth] → User authenticates (optional)
   ↓ setStep('payment')
[Step: payment] → User completes payment
   ↓ setStep('success')
[Step: success] → Show success message
   ↓ closeModal() + resetModal()
[Closed]
```

## Step Descriptions

### 1. `amount` - Amount Selection
- User selects or enters donation amount
- Can be preset buttons ($10, $25, $50) or custom input
- Validates amount before proceeding

### 2. `auth` - Authentication (Optional)
- User can log in with AWS Cognito
- Or continue as anonymous
- May be skipped if already authenticated

### 3. `payment` - Payment Processing
- Creates payment intent via API
- Shows Stripe payment form
- Processes the payment

### 4. `success` - Success Message
- Shows confirmation
- Displays receipt/thank you message
- Option to close or donate again

## Best Practices

### 1. Reset State on Close

Always reset the modal state when closing to ensure clean state for next open:

```tsx
const handleClose = () => {
  closeModal();
  setTimeout(() => resetModal(), 300); // Wait for close animation
};
```

### 2. Use Selectors for Performance

Use the optimized selector hooks to prevent unnecessary re-renders:

```tsx
// ❌ Bad - Re-renders on any store change
const { isOpen, amount, step } = useDonationStore();

// ✅ Good - Only re-renders when isOpen changes
const isOpen = useDonationModalOpen();
```

### 3. Validate State Transitions

Always validate that the current step makes sense before transitioning:

```tsx
const handleNextStep = () => {
  const { step, amount } = useDonationStore.getState();
  
  if (step === 'amount' && amount > 0) {
    setStep('auth');
  } else if (step === 'auth') {
    setStep('payment');
  }
  // ... etc
};
```

### 4. Handle Errors Gracefully

Reset to appropriate step on errors:

```tsx
const handlePaymentError = () => {
  setStep('payment'); // Stay on payment step
  // Show error message
};
```

## TypeScript Support

The store is fully typed. Here are the available types:

```typescript
import { DonationStep, useDonationStore } from '@/lib/store';

// Type for the step
type Step = DonationStep; // 'amount' | 'auth' | 'payment' | 'success'

// Type for the entire store state
type StoreState = ReturnType<typeof useDonationStore.getState>;
```

## Debugging

### DevTools

Zustand integrates with Redux DevTools for debugging:

```typescript
import { devtools } from 'zustand/middleware';

export const useDonationStore = create<DonationState>()(
  devtools(
    (set) => ({
      // ... your store implementation
    }),
    { name: 'DonationStore' }
  )
);
```

### Logging

Add middleware to log state changes:

```typescript
const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous State:', get());
      set(...args);
      console.log('New State:', get());
    },
    get,
    api
  );

export const useDonationStore = create<DonationState>(
  log((set) => ({
    // ... your store implementation
  }))
);
```

## Testing

Example test with Zustand:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDonationStore } from '@/lib/store';

describe('useDonationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useDonationStore.setState({
      isOpen: false,
      amount: 0,
      step: 'amount',
    });
  });
  
  it('should open modal', () => {
    const { result } = renderHook(() => useDonationStore());
    
    act(() => {
      result.current.openModal();
    });
    
    expect(result.current.isOpen).toBe(true);
  });
  
  it('should set amount', () => {
    const { result } = renderHook(() => useDonationStore());
    
    act(() => {
      result.current.setAmount(50);
    });
    
    expect(result.current.amount).toBe(50);
  });
});
```

## Common Patterns

### Conditional Modal Content

```tsx
function DonationModal() {
  const step = useDonationStep();
  
  const renderContent = () => {
    switch (step) {
      case 'amount':
        return <AmountSelector />;
      case 'auth':
        return <AuthenticationForm />;
      case 'payment':
        return <StripePaymentForm />;
      case 'success':
        return <ThankYouMessage />;
      default:
        return null;
    }
  };
  
  return <Modal>{renderContent()}</Modal>;
}
```

### Multi-Component Coordination

```tsx
// Component A - Triggers donation
function DonateButton() {
  const { openModal, setAmount } = useDonationStore();
  
  return (
    <button onClick={() => {
      setAmount(25);
      openModal();
    }}>
      Donate
    </button>
  );
}

// Component B - Shows modal
function DonationModalContainer() {
  const isOpen = useDonationModalOpen();
  
  return isOpen ? <DonationModal /> : null;
}

// Both components stay in sync automatically!
```

## Migration from useState

If you're migrating from local component state:

```tsx
// ❌ Before - Local state
function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  
  // Pass props down to children...
}

// ✅ After - Zustand store
function Component() {
  const { isOpen, amount } = useDonationStore();
  
  // Children can access store directly - no prop drilling!
}
```

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://github.com/pmndrs/zustand#best-practices)
- [TypeScript Guide](https://github.com/pmndrs/zustand#typescript)

