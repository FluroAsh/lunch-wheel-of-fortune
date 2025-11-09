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
