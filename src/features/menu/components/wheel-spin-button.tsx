import Link from "next/link";

import { LucideLoader2, LucideRefreshCw, LucideShipWheel } from "lucide-react";

import { cn } from "@/lib/utils";

export const WheelSpinButton = ({
  absolute = false,
  isLoading = false,
  className,
}: {
  absolute?: boolean;
  isLoading?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn("flex flex-col", absolute && "absolute top-4 right-4 z-10")}
    >
      <Link
        href="/spin"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all duration-200",
          "hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none",
          isLoading && "pointer-events-none opacity-60",
          className,
        )}
        title="Spin the Wheel for a Lunch Decision"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <LucideLoader2 className="size-4 animate-spin" />
        ) : (
          <LucideRefreshCw className="size-4" />
        )}
        <span>{isLoading ? "Loading places…" : "Spin the Wheel"}</span>
      </Link>
    </div>
  );
};
