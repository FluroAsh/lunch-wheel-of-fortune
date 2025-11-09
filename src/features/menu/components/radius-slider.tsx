import { useRef } from "react";

import { useMap } from "@vis.gl/react-google-maps";
import { debounce } from "radash";

import { MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";
import { Coords } from "@/types/google";

import { useNearbyPlaces } from "../hooks/use-nearby-places";

export const RadiusSlider = ({
  currentLocation,
}: {
  currentLocation: Coords;
}) => {
  const map = useMap();
  const { radius, setRadius, setPlaces } = useMapStore();
  const { searchPlaces, isLoadingPlaces } = useNearbyPlaces(map);

  const debouncedSearch = useRef<ReturnType<typeof debounce> | null>(null);

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
        value={radius}
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
          debouncedSearch.current?.cancel();

          setRadius(parseInt(e.target.value));

          // TODO: Investigate why a wider range returns fewer results...
          debouncedSearch.current = debounce(
            { delay: MAP.searchDebounceDelay },
            () => {
              return searchPlaces(
                currentLocation.lat,
                currentLocation.lng,
              ).then((places) => setPlaces(places));
            },
          );

          debouncedSearch.current();
        }}
      />
      <label
        className={cn(
          "min-w-[3rem] text-right font-bold text-neutral-800",
          isLoadingPlaces && "opacity-50",
        )}
        htmlFor="radius"
      >
        {radius}m
      </label>
    </div>
  );
};
