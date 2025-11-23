"use client";

import { ComponentProps, lazy } from "react";

import { Wheel } from "react-custom-roulette-r19";

export type WheelProps = ComponentProps<typeof Wheel>;

// Lazy over dynamic so we can suspend the component
const ClientSideSafeWheel = lazy(() =>
  import("react-custom-roulette-r19").then((mod) => ({ default: mod.Wheel })),
);

export default function DynamicWheel(props: WheelProps) {
  return (
    <div className="overflow-hidden">
      <ClientSideSafeWheel {...props} />
    </div>
  );
}
