"use client";

import { ComponentProps, lazy } from "react";

import { LucideLoader } from "lucide-react";
import { Wheel } from "react-custom-roulette-r19";

export type WheelProps = ComponentProps<typeof Wheel>;

export const WheelSkeleton = () => (
  <div className="flex max-w-full flex-col items-center justify-center gap-4 px-4">
    <div className="grid aspect-square w-[80vw] max-w-[445px] animate-pulse place-items-center rounded-full bg-neutral-800/50" />

    <button
      disabled
      className="grid h-10 w-[100px] place-items-center rounded-md bg-gray-600 p-2 text-gray-300"
    >
      <LucideLoader className="size-4 animate-spin text-neutral-100" />
    </button>
  </div>
);

// Lazy over dynamic so we can suspend the component
const ClientSideSafeWheel = lazy(() =>
  import("react-custom-roulette-r19").then((mod) => ({ default: mod.Wheel })),
);

export default function DynamicWheel(props: WheelProps) {
  return <ClientSideSafeWheel {...props} />;
}
