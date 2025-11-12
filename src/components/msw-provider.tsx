"use client";

import { useEffect, useState } from "react";

import Cookies from "js-cookie";

export const MSWProvider = ({ children }: { children: React.ReactNode }) => {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMsw = async () => {
      // Only initialize MSW in the browser and in development mode
      if (typeof window !== "undefined") {
        // Check if we should enable MSW (development mode or explicit env var)
        const shouldEnableMSW =
          process.env.NODE_ENV === "development" &&
          Cookies.get("MSW_ENABLED") === "true";

        if (shouldEnableMSW) {
          try {
            const { worker } = await import("@/mocks/browser");
            await worker.start({
              onUnhandledRequest: "bypass",
            });
            console.log("[MSW] Mock Service Worker started");
          } catch (error) {
            console.error("[MSW] Failed to start worker:", error);
          }
        }
      }
      setMswReady(true);
    };

    initMsw();
  }, []);

  if (!mswReady) {
    return null;
  }

  return <>{children}</>;
};
