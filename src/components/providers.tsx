"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

import { Libraries } from "@/types/google";

const libraries: Libraries[] = ["places"];

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={libraries}
      version="weekly"
      region="AU"
      language="en"
    >
      {children}
    </APIProvider>
  );
};
