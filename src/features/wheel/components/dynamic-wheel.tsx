"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

import { Wheel } from "react-custom-roulette-r19";

export type WheelProps = ComponentProps<typeof Wheel>;

// Dynamically import with no SSR - Wheel library othewise accesses window object during initial SSR render
const ClientsideSafeWheel = dynamic(
  () =>
    import("react-custom-roulette-r19").then((mod) => ({ default: mod.Wheel })),
  {
    ssr: false,
    loading: () => (
      <div className="m-4 flex h-[420px] w-[420px] animate-pulse items-center justify-center rounded-full bg-gray-600">
        {/* TODO: Add an icon instead of text */}
        <div className="text-neutral-100">Loading wheel...</div>
      </div>
    ),
  },
);

export default function DynamicWheel(props: WheelProps) {
  return <ClientsideSafeWheel {...props} />;
}
