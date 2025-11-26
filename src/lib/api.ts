// TypeScript interfaces matching backend Pydantic models

export interface TotalDonationResponse {
  total_amount_dollars: number;
}

export interface PublicDonationResponse {
  donor_name: string;
  amount: number;
  currency: string;
  created_at: string; // ISO 8601 datetime string
}

export interface DonationIntentResponse {
  client_secret: string;
}

export interface DonationIntentRequest {
  amount: number;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorMessage;
    } catch {
      // If not JSON, use the text
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// Get authorization token from AWS Amplify session
async function getAuthToken(): Promise<string | null> {
  try {
    // Dynamically import to avoid server-side issues
    const { getIdToken } = await import('./auth');
    return await getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Fetch total donations
 * GET /donations/total
 */
export async function fetchTotalDonations(): Promise<TotalDonationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/donations/total`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for real-time data
    });
    
    return handleResponse<TotalDonationResponse>(response);
  } catch (error) {
    console.error('Error fetching total donations:', error);
    throw error;
  }
}

/**
 * Fetch recent donations
 * GET /donations/recent
 */
export async function fetchRecentDonations(): Promise<PublicDonationResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/donations/recent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for real-time data
    });
    
    return handleResponse<PublicDonationResponse[]>(response);
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    throw error;
  }
}

/**
 * Create a donation intent with Stripe
 * POST /donations/create-intent
 * Requires authentication header if user is logged in
 */
export async function createDonationIntent(
  amount: number,
  authToken?: string
): Promise<DonationIntentResponse> {
  try {
    // Get token from session if not provided
    const token = authToken || await getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const requestBody: DonationIntentRequest = {
      amount,
    };
    
    const response = await fetch(`${API_BASE_URL}/donations/create-intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    return handleResponse<DonationIntentResponse>(response);
  } catch (error) {
    console.error('Error creating donation intent:', error);
    throw error;
  }
}

// Export API base URL for other uses
export { API_BASE_URL };

