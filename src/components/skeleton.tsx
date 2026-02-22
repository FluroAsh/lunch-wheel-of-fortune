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

const LIST_SKELETON_IDS = ["a", "b", "c", "d", "e"];

export const ListSkeleton = () => (
  <div className="flex flex-col gap-0.5">
    {LIST_SKELETON_IDS.map((id) => (
      <Skeleton key={id} className="h-[36px] w-full" />
    ))}
  </div>
);

export const WheelSkeleton = () => (
  <div className="w-full max-w-[420px]">
    <div className="aspect-square w-full animate-pulse rounded-full bg-neutral-800/50" />
  </div>
);
