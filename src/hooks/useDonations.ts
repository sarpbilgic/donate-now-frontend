"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTotalDonations,
  fetchRecentDonations,
  createDonationIntent,
  type TotalDonationResponse,
  type PublicDonationResponse,
  type DonationIntentResponse,
} from '@/lib/api';

/**
 * Hook to fetch total donations
 */
export function useTotalDonations() {
  return useQuery<TotalDonationResponse, Error>({
    queryKey: ['donations', 'total'],
    queryFn: fetchTotalDonations,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Hook to fetch recent donations
 */
export function useRecentDonations() {
  return useQuery<PublicDonationResponse[], Error>({
    queryKey: ['donations', 'recent'],
    queryFn: fetchRecentDonations,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Hook to create a donation intent
 */
export function useCreateDonationIntent() {
  const queryClient = useQueryClient();
  
  return useMutation<DonationIntentResponse, Error, { amount: number; authToken?: string }>({
    mutationFn: ({ amount, authToken }) => createDonationIntent(amount, authToken),
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

