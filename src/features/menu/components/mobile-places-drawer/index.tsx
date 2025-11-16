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
      <VDrawer.Trigger
        className="rounded-md bg-emerald-600 px-4 py-2 font-bold text-neutral-100"
        onClick={() => setIsOpen(true)}
      >
        Change Places
      </VDrawer.Trigger>

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

export const MobilePlacesWithDrawer = () => {
  const { selectedPlaceIds } = useMapStore();
  const { places, isFetching: isFetchingPlaces } = useNearbyPlaces();
  const selectedPlaces = places.filter((p) => selectedPlaceIds.includes(p.id));

  if (!places.length || isFetchingPlaces) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {selectedPlaces.map((p) => (
        <div key={p.id}>{p.displayName.text}</div>
      ))}

      <Drawer places={places} />
    </div>
  );
};
