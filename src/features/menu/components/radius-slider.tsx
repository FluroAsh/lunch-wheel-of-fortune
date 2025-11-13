import { useRef, useState } from "react";

import { debounce } from "radash";

import { MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";

import { useNearbyPlaces } from "../hooks/use-nearby-places";

export const RadiusSlider = () => {
  const { radius, setRadius } = useMapStore();
  const [localRadius, setLocalRadius] = useState<number>(MAP.defaultRadius);
  const { isLoading: isLoadingPlaces } = useNearbyPlaces();

  const debouncedSetRadius = useRef<ReturnType<typeof debounce>>(null);

  return (
    // Add visual states for loading and interaction
    <div className="absolute bottom-0 left-0 z-10 flex items-center gap-2 rounded-tr-md bg-neutral-800/10 p-2 shadow-md backdrop-blur-sm">
      <input
        id="radius"
        name="radius"
        type="range"
        min={500}
        max={5000}
        step={250}
        value={localRadius}
        disabled={isLoadingPlaces}
        className={cn(
          "h-2 w-24 cursor-pointer appearance-none rounded-lg bg-neutral-200",
          "focus:ring-2 focus:ring-sky-500 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-600",
          "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm",
          "[&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:hover:bg-slate-700",
        )}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          setLocalRadius(value);

          debouncedSetRadius.current?.cancel();

          debouncedSetRadius.current = debounce(
            { delay: MAP.debounceDelay },
            setRadius,
          );

          debouncedSetRadius.current(value);
        }}
      />
      <label
        className={cn(
          "min-w-[3rem] text-right font-bold text-neutral-800",
          isLoadingPlaces && "opacity-50",
        )}
        htmlFor="radius"
      >
        {localRadius}m
      </label>
    </div>
  );
};
