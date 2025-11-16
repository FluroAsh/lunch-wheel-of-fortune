import { createContext, useContext, useEffect, useRef, useState } from "react";

import { LucideX } from "lucide-react";
import { Drawer as VDrawer } from "vaul";

import { Checkbox, Label } from "@/components/checkbox";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store";
import { GooglePlace } from "@/types/google";

import { useNearbyPlaces } from "../../hooks/use-nearby-places";
import { ListRow } from "./list-row";

// --- Components --- //
export const Trigger = ({ onClick }: { onClick: () => void }) => {
  return (
    <div>
      <button onClick={onClick}>Open Drawer</button>
    </div>
  );
};
export const Drawer = ({ places }: { places: GooglePlace[] }) => {
  const [open, setIsOpen] = useState(false);

  return (
    <VDrawer.Root open={open} onOpenChange={setIsOpen}>
      <div className="flex justify-center">
        <VDrawer.Trigger
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-neutral-100"
          onClick={() => setIsOpen(true)}
        >
          Change Places
        </VDrawer.Trigger>
      </div>

      <VDrawer.Portal>
        <VDrawer.Content
          className={cn(
            "fixed -right-px -bottom-px -left-px flex max-h-[50dvh] w-[calc(100%+px)] flex-col overflow-hidden bg-neutral-900 p-4 backdrop-blur-sm",
            "rounded-t-xl border border-neutral-700",
          )}
        >
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

const SelectionButton = ({ places = [] }: { places?: GooglePlace[] }) => {
  const { selectedPlaceIds, setSelectedPlaceIds } = useMapStore();

  const action = selectedPlaceIds.length > 1 ? "clear" : "select";

  const handleSelectionClick = () => {
    setSelectedPlaceIds(
      action === "clear" ? [selectedPlaceIds[0]] : places.map((p) => p.id),
    );
  };

  return (
    <button
      className="px-2 py-1 text-xs leading-tight text-sky-500 underline hover:cursor-pointer"
      onClick={handleSelectionClick}
    >
      {action === "clear" ? "Clear Selection" : "Select All"}
    </button>
  );
};

export const MobilePlacesWithDrawer = () => {
  const { selectedPlaceIds, setSelectedPlaceIds } = useMapStore();
  const { places, isFetching: isFetchingPlaces } = useNearbyPlaces();
  const selectedPlaces = places.filter((p) => selectedPlaceIds.includes(p.id));

  if (!places.length || isFetchingPlaces) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-neutral-400 uppercase">
          Selected Places ({selectedPlaceIds.length})
        </h3>

        {places.length > 0 && <SelectionButton places={places} />}
      </div>

      <div className="flex max-w-full flex-wrap gap-1 rounded-md border border-neutral-700 bg-neutral-900 p-4">
        {selectedPlaces.map((p) => (
          <div
            key={p.id}
            className="size-fit rounded-full border border-neutral-500 bg-neutral-700/40 px-3 py-0.5"
          >
            <span className="truncate text-xs">{p.displayName.text}</span>
          </div>
        ))}
      </div>

      <Drawer places={places} />
    </div>
  );
};
