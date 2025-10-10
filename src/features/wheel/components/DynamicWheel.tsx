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
      <div className="flex items-center justify-center w-[420px] h-[420px] rounded-full m-4 animate-pulse bg-gray-600">
        {/* TODO: Add an icon instead of text */}
        <div className="text-neutral-100">Loading wheel...</div>
      </div>
    ),
  }
);

export default function DynamicWheel(props: WheelProps) {
  return <ClientsideSafeWheel {...props} />;
}
