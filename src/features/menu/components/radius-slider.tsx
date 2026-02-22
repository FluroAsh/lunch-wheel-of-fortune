import { useRef, useState } from "react";

import { debounce } from "radash";

import { MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";

import { useNearbyPlaces } from "../hooks/use-nearby-places";

const MIN_METERS = 500;
const MAX_METERS = 5000;
const STEP_METERS = 250;

const formatRadius = (r: number) =>
  r >= 1000 ? `${(r / 1000).toFixed(1).replace(/\.0$/, "")} km` : `${r} m`;

export const RadiusSlider = () => {
  const { setRadius } = useMapStore();
  const [localRadius, setLocalRadius] = useState<number>(MAP.defaultRadius);
  const { isLoading: isLoadingPlaces } = useNearbyPlaces();

  const debouncedSetRadius = useRef<ReturnType<typeof debounce>>(null);

  const fillPct =
    ((localRadius - MIN_METERS) / (MAX_METERS - MIN_METERS)) * 100;

  return (
    <div
      className={cn(
        "absolute bottom-2 left-2 z-10 flex items-center gap-2.5 backdrop-blur-md",
        "rounded-full bg-black/50 px-3 py-1.5",
      )}
    >
      <input
        id="radius"
        name="radius"
        type="range"
        min={MIN_METERS}
        max={MAX_METERS}
        step={STEP_METERS}
        value={localRadius}
        disabled={isLoadingPlaces}
        style={{
          background: `linear-gradient(to right, #10b981 ${fillPct}%, #404040 ${fillPct}%)`,
        }}
        className={cn(
          "h-0.5 w-28 cursor-pointer appearance-none rounded-full",
          "focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-40",
          // Thumb — webkit
          "[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
          "[&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.4)]",
          "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125",
          // Thumb — firefox
          "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:appearance-none",
          "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-white",
          "[&::-moz-range-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.4)]",
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
        htmlFor="radius"
        className={cn(
          "min-w-[3rem] text-xs font-semibold text-neutral-200",
          "drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
          isLoadingPlaces && "opacity-40",
        )}
      >
        {formatRadius(localRadius)}
      </label>
    </div>
  );
};
