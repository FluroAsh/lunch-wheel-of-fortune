import { LucideLoader } from "lucide-react";

import { cn } from "@/lib/utils";

const sizes = {
  small: "w-48",
  medium: "w-60",
  large: "w-80",
  extraLarge: "w-96",
};

type Size = keyof typeof sizes;

export const Skeleton = ({
  className,
  size,
}: {
  className?: string;
  size?: Size;
}) => (
  <div
    className={cn(
      "h-4 animate-pulse rounded-md bg-neutral-700/50",
      size && sizes[size],
      className,
    )}
  />
);

export const ListSkeleton = () => (
  <div className="[&>*:not(:last-child)]:my-2">
    <Skeleton className="w-48" />
    <Skeleton className="w-96" />
    <Skeleton className="w-60" />
    <Skeleton className="w-80" />
    <Skeleton className="w-96" />
  </div>
);

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
