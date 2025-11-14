"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { APIProvider } from "@vis.gl/react-google-maps";

import { Libraries } from "@/types/google";

import { MSWProvider } from "./msw-provider";

const libraries: Libraries[] = ["places"];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <MSWProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
          libraries={libraries}
          version="weekly"
          region="AU"
          language="en"
        >
          {children}
        </APIProvider>
      </QueryClientProvider>
    </MSWProvider>
  );
};
