import Link from "next/link";

import { LucideLoader2, LucideShipWheel } from "lucide-react";

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
      className={cn(
        "flex flex-col items-end space-y-2",
        absolute && "absolute top-4 right-4 z-10",
      )}
    >
      <Link
        href="/spin"
        className={cn(
          "flex min-w-[160.35px] items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-white shadow-lg transition-all duration-200",
          "hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none",
          isLoading && "opacity-75",
          className,
        )}
        title="Spin the Wheel for a Lunch Decision"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <LucideLoader2 className="mr-2 size-5 animate-spin stroke-white" />
        ) : (
          <LucideShipWheel className="mr-2 size-5 stroke-white" />
        )}
        <span className="font-semibold">
          {isLoading ? "" : "Spin the Wheel"}
        </span>
      </Link>
    </div>
  );
};
