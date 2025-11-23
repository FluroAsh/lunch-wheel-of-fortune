import Link from "next/link";

import { LucideShipWheel } from "lucide-react";

import { cn } from "@/lib/utils";

export const WheelSpinButton = ({
  absolute = false,
  className,
}: {
  absolute?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-end space-y-2",
      absolute && "absolute top-4 right-4 z-10",
    )}
  >
    <Link
      href="/spin"
      className={cn(
        "flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white shadow-lg transition-colors duration-200 hover:bg-emerald-700",
        className,
      )}
      title="Spin the Wheel for a Lunch Decision"
    >
      <LucideShipWheel className="mr-2 size-5 stroke-white" />
      <span className="font-semibold">Spin the Wheel</span>
    </Link>
  </div>
);
