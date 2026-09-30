// @/providers/query-provider.ts
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

// Optimized default query configuration for performance
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce unnecessary refetches by setting reasonable stale time
      staleTime: 5 * 60 * 1000, // 5 minutes before data is considered stale
      gcTime: 10 * 60 * 1000, // 10 minutes before garbage collection (formerly cacheTime)
      // Disable refetch on window focus for better performance (adjust per your needs)
      refetchOnWindowFocus: false,
      // Disable refetch on reconnect for most use cases
      refetchOnReconnect: false,
      // Limit retries to avoid overwhelming your API
      retry: 1,
      // Use structural sharing to prevent unnecessary re-renders
      structuralSharing: true,
    },
    mutations: {
      // Limit mutation retries
      retry: 0,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client once per provider instance to avoid recreation on re-renders
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only load devtools in non-production environments */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
