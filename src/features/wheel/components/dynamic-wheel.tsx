"use client";

import { lazy } from "react";

import type { WheelSegment } from "./wheel-canvas";

export type { WheelSegment };

export type DynamicWheelProps = {
  segments: WheelSegment[];
  prizeIndex: number;
  mustSpin: boolean;
  onSpinComplete: () => void;
};

// Lazy-loaded so the Canvas API is only accessed client-side
const ClientSideSafeWheel = lazy(() =>
  import("./wheel-canvas").then((mod) => ({ default: mod.WheelCanvas })),
);

export default function DynamicWheel(props: DynamicWheelProps) {
  return <ClientSideSafeWheel {...props} />;
}
