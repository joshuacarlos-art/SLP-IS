'use client';

import { Suspense } from 'react';
import { useSearchParams as useSearchParamsOriginal } from 'next/navigation';

// Create a wrapper component that uses Suspense
export function SearchParamsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}

// Custom hook that safely uses searchParams
export function useSearchParams() {
  return useSearchParamsOriginal();
}