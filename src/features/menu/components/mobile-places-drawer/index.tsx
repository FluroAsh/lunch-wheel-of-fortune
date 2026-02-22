import { useState } from "react";

import { LucideMapPin, LucideX } from "lucide-react";
import { Drawer as VDrawer } from "vaul";

import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";
import type { GooglePlace } from "@/types/google";

import { useNearbyPlaces } from "../../hooks/use-nearby-places";
import { WheelSpinButton } from "../wheel-spin-button";
import { ListRow } from "./list-row";
import { PreviewList } from "./preview-list";


export const Drawer = ({
  places,
  isLoading,
}: {
  places: GooglePlace[];
  isLoading: boolean;
}) => {
  const [open, setIsOpen] = useState(false);

  return (
    <VDrawer.Root open={open} onOpenChange={setIsOpen}>
      <div className="flex gap-2">
        <VDrawer.Trigger
          disabled={isLoading}
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => !isLoading && setIsOpen(true)}
        >
          Change Places
        </VDrawer.Trigger>
        <WheelSpinButton isLoading={isLoading} className="flex-1 text-sm" />
      </div>

      <VDrawer.Portal>
        <VDrawer.Content
          className={cn(
            "fixed -right-px -bottom-px -left-px flex max-h-[50dvh] w-[calc(100%+px)] flex-col overflow-hidden bg-neutral-900 p-4 backdrop-blur-sm",
            "rounded-t-xl border border-neutral-700",
          )}
        >
          <VDrawer.Handle className="w-[50px]! bg-neutral-400!" />

          <div className="flex flex-1 justify-between pb-4">
            <VDrawer.Title className="text-lg font-bold">
              Nearby Places
            </VDrawer.Title>
            <VDrawer.Description className="sr-only">
              Select which places you want to include in your Flavour of the
              Week spin.
            </VDrawer.Description>

            <VDrawer.Close>
              <LucideX className="size-6" />
            </VDrawer.Close>
          </div>

          <ul className="flex flex-col gap-2 overflow-y-scroll">
            {places.map((place) => (
              <ListRow key={place.id} place={place} />
            ))}
          </ul>
        </VDrawer.Content>

        <VDrawer.Overlay />
      </VDrawer.Portal>
    </VDrawer.Root>
  );
};

const SelectionButton = ({
  places = [],
  isLoading,
}: {
  places?: GooglePlace[];
  isLoading: boolean;
}) => {
  const { selectedPlaceIds, setSelectedPlaceIds } = useMapStore();

  const action = selectedPlaceIds.length > 1 ? "clear" : "select";

  const handleSelectionClick = () => {
    setSelectedPlaceIds(
      action === "clear" ? [selectedPlaceIds[0]] : places.map((p) => p.id),
    );
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      className="rounded-md px-2 py-0.5 text-xs font-medium text-sky-400 transition-colors hover:cursor-pointer hover:bg-neutral-800 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleSelectionClick}
    >
      {action === "clear" ? "Clear" : "Select All"}
    </button>
  );
};

export const MobilePlacesWithDrawer = () => {
  const { selectedPlaceIds } = useMapStore();
  const { places, isFetching: isFetchingPlaces } = useNearbyPlaces();
  const selectedPlaces = places.filter((p) => selectedPlaceIds.includes(p.id));

  if (!isFetchingPlaces && !places.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-amber-800/50 bg-amber-950/30 p-4 text-center">
        <p className="text-sm font-semibold text-amber-300">
          No places found nearby
        </p>
        <p className="text-xs text-amber-500">
          Try searching a different location or expanding your radius.
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-h-full flex-col gap-2 overflow-hidden">
      {/* Selection header */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <LucideMapPin className="size-3 text-neutral-500" />
          <h3 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            Selected
            {selectedPlaces.length > 0 ? (
              <span className="ml-1.5 rounded-full bg-neutral-700 px-1.5 py-0.5 font-medium text-neutral-300 normal-case tracking-normal">
                {selectedPlaceIds.length}
              </span>
            ) : null}
          </h3>
        </span>

        <SelectionButton places={places} isLoading={isFetchingPlaces} />
      </div>

      <PreviewList
        selectedPlaces={selectedPlaces}
        isLoading={isFetchingPlaces}
      />
      <Drawer places={places} isLoading={isFetchingPlaces} />
    </div>
  );
};
