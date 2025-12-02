import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LucideMapPin, LucideX } from "lucide-react";
import { debounce } from "radash";
import { Drawer as VDrawer } from "vaul";

import { getPlacesSearchUrl } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";
import { GooglePlace } from "@/types/google";

import { useNearbyPlaces } from "../../hooks/use-nearby-places";
import { WheelSpinButton } from "../wheel-spin-button";
import { ListRow } from "./list-row";
import { PreviewList } from "./preview-list";

// --- Components --- //
export const Trigger = ({ onClick }: { onClick: () => void }) => {
  return (
    <div>
      <button onClick={onClick}>Open Drawer</button>
    </div>
  );
};

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
      <div className="flex flex-wrap justify-center gap-2">
        <VDrawer.Trigger
          disabled={isLoading}
          className="rounded-md border border-emerald-500 bg-emerald-950 px-4 py-2 text-sm text-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => !isLoading && setIsOpen(true)}
        >
          Change Places
        </VDrawer.Trigger>
        <WheelSpinButton
          isLoading={isLoading}
          className="h-full text-sm [svg]:size-4"
        />
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
      disabled={isLoading}
      className="px-2 py-1 text-xs leading-tight text-sky-500 underline hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleSelectionClick}
    >
      {action === "clear" ? "Clear Selection" : "Select All"}
    </button>
  );
};

export const MobilePlacesWithDrawer = () => {
  const { selectedPlaceIds } = useMapStore();
  const { places, isFetching: isFetchingPlaces } = useNearbyPlaces();
  const selectedPlaces = places.filter((p) => selectedPlaceIds.includes(p.id));

  if (!isFetchingPlaces && !places.length) {
    return (
      <div>
        <p className="text-center text-sm text-neutral-400">
          Couldn't find any places near you!
        </p>
        <p className="text-center text-sm text-neutral-400">
          Try again by either searching for a different location or adjusting
          the radius of your search.
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-h-full flex-col gap-2 overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <LucideMapPin className="size-3" />
          <h3 className="text-xs font-bold text-neutral-400 uppercase">
            Selected Places{" "}
            {selectedPlaces.length > 0 ? `(${selectedPlaceIds.length})` : ""}
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
