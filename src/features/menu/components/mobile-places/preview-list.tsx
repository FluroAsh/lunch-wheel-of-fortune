import { useEffect, useRef, useState } from "react";

import { debounce } from "radash";

import { cn } from "@/lib/utils";
import { GooglePlace } from "@/types/google";

import { PreviewItem } from "./preview-item";

const PreviewSkeleton = ({ skeletonCount = 6 }: { skeletonCount?: number }) => (
  <div
    className={cn(
      "relative flex-1 overflow-hidden rounded-md border border-neutral-700 bg-gradient-to-b from-neutral-800/50 to-neutral-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]",
      "grid max-h-full max-w-full auto-rows-min grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3",
    )}
  >
    {Array.from({ length: skeletonCount }).map((_, idx) => (
      <div
        key={`preview-skeleton-${idx}`}
        className="flex h-[46px] w-full animate-pulse items-center rounded-full border border-neutral-600/40 bg-neutral-800/50 px-4 py-1.5"
      />
    ))}
  </div>
);

export const PreviewList = ({
  selectedPlaces,
  isLoading,
}: {
  selectedPlaces: GooglePlace[];
  isLoading: boolean;
}) => {
  const [previewHasOverflow, setPreviewHasOverflow] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;

    const checkOverflow = debounce({ delay: 200 }, () =>
      setPreviewHasOverflow(element.scrollHeight > element.clientHeight),
    );

    checkOverflow(); // Initial check

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      checkOverflow.cancel();
    };
  }, [selectedPlaces.length]);

  if (isLoading) {
    return <PreviewSkeleton />;
  }

  return (
    <div className="relative flex-1 overflow-hidden rounded-md border border-neutral-700 bg-gradient-to-b from-neutral-800/50 to-neutral-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
      <div
        ref={previewRef}
        className={cn(
          "grid max-h-full max-w-full auto-rows-min grid-cols-2 gap-2 overflow-y-auto p-4",
          "sm:grid-cols-3",
        )}
      >
        {selectedPlaces.map((place) => (
          <PreviewItem key={place.id} place={place} />
        ))}
      </div>
      {previewHasOverflow && (
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-20 translate-y-1/2 bg-gradient-to-b from-transparent via-neutral-900/80 to-neutral-900" />
      )}
    </div>
  );
};
