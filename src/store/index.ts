import { create } from "zustand";

import { MAP } from "@/lib/constants";
import { NearbyPlaces } from "@/types/google";

type MapState = {
  places: NearbyPlaces;
  setPlaces: (places: NearbyPlaces) => void;
  radius: number;
  setRadius: (radius: number) => void;
  isLoadingPlaces: boolean;
  setIsLoadingPlaces: (isLoadingPlaces: boolean) => void;
  activeMarker: string | undefined;
  setActiveMarker: (id: string | undefined) => void;
};

export const useMapStore = create<MapState>((set) => ({
  places: [],
  setPlaces: (places: NearbyPlaces | undefined) => set({ places }),
  radius: MAP.defaultRadius,
  setRadius: (radius: number) => set({ radius }),
  isLoadingPlaces: false,
  setIsLoadingPlaces: (isLoadingPlaces: boolean) => set({ isLoadingPlaces }),
  activeMarker: undefined,
  setActiveMarker: (id: string | undefined) => set({ activeMarker: id }),
}));
