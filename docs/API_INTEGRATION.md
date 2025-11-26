# API Integration Guide

This guide explains how to use the FastAPI backend integration in the frontend.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root of the frontend project:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Stripe Public Key (get from Stripe dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# AWS Amplify (if using Cognito)
# NEXT_PUBLIC_AWS_REGION=us-east-1
# NEXT_PUBLIC_USER_POOL_ID=your_pool_id
# NEXT_PUBLIC_USER_POOL_CLIENT_ID=your_client_id
```

### 2. Start Your Backend

Make sure your FastAPI backend is running on the URL specified in `NEXT_PUBLIC_API_URL`:

```bash
cd donate-now
uvicorn api.main:app --reload
```

## API Functions

### Direct API Calls

```typescript
import { 
  fetchTotalDonations, 
  fetchRecentDonations, 
  createDonationIntent 
} from '@/lib/api';

// Get total donations
const total = await fetchTotalDonations();
console.log(total.total_amount_dollars); // e.g., 1250.00

// Get recent donations
const recent = await fetchRecentDonations();
console.log(recent); // Array of PublicDonationResponse

// Create payment intent
const intent = await createDonationIntent(2500); // $25.00 in cents
console.log(intent.client_secret); // Stripe client secret
```

### Using React Query Hooks

```typescript
import { 
  useTotalDonations, 
  useRecentDonations, 
  useCreateDonationIntent 
} from '@/hooks/useDonations';

function MyComponent() {
  // Fetch total donations (auto-refetches every 30s)
  const { data: total, isLoading, error } = useTotalDonations();
  
  // Fetch recent donations (auto-refetches every 30s)
  const { data: donations } = useRecentDonations();
  
  // Create donation intent mutation
  const createIntent = useCreateDonationIntent();
  
  const handleDonate = async () => {
    try {
      const result = await createIntent.mutateAsync({ 
        amount: 2500 // $25.00 in cents
      });
      console.log('Client secret:', result.client_secret);
    } catch (error) {
      console.error('Failed to create intent:', error);
    }
  };
  
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p>Total: ${total?.total_amount_dollars}</p>
      )}
      
      <button onClick={handleDonate}>Donate</button>
    </div>
  );
}
```

## Type Safety

All API responses are fully typed using TypeScript interfaces that match your backend Pydantic models:

```typescript
interface TotalDonationResponse {
  total_amount_dollars: number;
}

interface PublicDonationResponse {
  donor_name: string;
  amount: number;  // Amount in cents
  currency: string;
  created_at: string;  // ISO 8601 datetime
}

interface DonationIntentResponse {
  client_secret: string;
}
```

## Authentication

To add authentication to the `createDonationIntent` call:

```typescript
// Option 1: Pass token directly
const intent = await createDonationIntent(2500, 'your-auth-token');

// Option 2: Modify getAuthToken() in src/lib/api.ts
// to automatically retrieve the token from your auth provider
```

### Example with AWS Amplify:

```typescript
// In src/lib/api.ts, update getAuthToken():

import { fetchAuthSession } from 'aws-amplify/auth';

function getAuthToken(): string | null {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() || null;
}
```

## Error Handling

All API functions include error handling:

```typescript
try {
  const total = await fetchTotalDonations();
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

With React Query hooks, errors are automatically managed:

```typescript
const { data, error, isError } = useTotalDonations();

if (isError) {
  return <div>Error: {error.message}</div>;
}
```

## Real-time Updates

The React Query hooks are configured to automatically refetch data:

- **Refetch Interval**: 30 seconds
- **Stale Time**: 10 seconds
- **Retry**: 3 attempts with exponential backoff

You can customize these in `src/hooks/useDonations.ts`.

## Components Already Integrated

The following components are already connected to the backend:

1. **SystemBootHero** - Fetches and displays total donations
2. **SystemLogs** - Fetches and displays recent donations (polls every 30s)
3. **TerminalDonation** - Creates payment intents when user clicks donate

## Next Steps

1. **Add Stripe Checkout**: Integrate Stripe Elements to handle payment after creating the intent
2. **Add Authentication**: Integrate AWS Cognito to allow authenticated donations
3. **WebSocket Support**: For real-time updates instead of polling
4. **Error UI**: Add better error handling UI components

## API Endpoints Reference

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/donations/total` | GET | No | Get total donations in dollars |
| `/donations/recent` | GET | No | Get recent donations (limit 10) |
| `/donations/create-intent` | POST | Yes | Create Stripe payment intent |

## Testing

To test the integration without a running backend:

```bash
# The components include fallback behavior
# Total donations falls back to mock data on error
# Recent donations shows empty on error
```

For full testing, ensure your backend is running with proper CORS configuration.

