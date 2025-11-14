import { create } from "zustand";

import { MAP } from "@/lib/constants";
import { Coords } from "@/types/google";

type MapState = {
  radius: number;
  setRadius: (radius: number) => void;
  activeMarker: string | undefined;
  setActiveMarker: (id: string | undefined) => void;
  searchLocation: Coords | undefined;
  setSearchLocation: (location: Coords) => void;
  selectedPlaceIds: string[];
  setSelectedPlaceIds: (ids: string[]) => void;
};

export const useMapStore = create<MapState>((set) => ({
  radius: MAP.defaultRadius,
  setRadius: (radius: number) => set({ radius }),
  activeMarker: undefined,
  setActiveMarker: (id: string | undefined) => set({ activeMarker: id }),
  searchLocation: undefined,
  setSearchLocation: (location: Coords) => set({ searchLocation: location }),
  selectedPlaceIds: [],
  setSelectedPlaceIds: (ids: string[]) => set({ selectedPlaceIds: ids }),
}));
