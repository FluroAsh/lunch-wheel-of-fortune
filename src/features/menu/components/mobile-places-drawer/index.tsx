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
      <div className="flex flex-wrap justify-center gap-2">
        <VDrawer.Trigger
          className="rounded-md border border-emerald-500 bg-emerald-950 px-4 py-2 text-sm text-emerald-400"
          onClick={() => setIsOpen(true)}
        >
          Change Places
        </VDrawer.Trigger>
        <WheelSpinButton className="h-full text-sm [svg]:size-4" />
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

// TODO: Clean up this component a bit more - initial generation by AI, needs a human touch! 💅
export const MobilePlacesWithDrawer = () => {
  const { selectedPlaceIds, setSelectedPlaceIds } = useMapStore();
  const { places, isFetching: isFetchingPlaces } = useNearbyPlaces();
  const selectedPlaces = places.filter((p) => selectedPlaceIds.includes(p.id));
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewHasOverflow, setPreviewHasOverflow] = useState(false);

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

  if (!places.length || isFetchingPlaces) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex max-h-full flex-col gap-2 overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1">
          <LucideMapPin className="size-3" />
          <h3 className="text-xs font-bold text-neutral-400 uppercase">
            Selected Places ({selectedPlaceIds.length})
          </h3>
        </span>

        {places.length > 0 && <SelectionButton places={places} />}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-md border border-neutral-700 bg-gradient-to-b from-neutral-800/50 to-neutral-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
        <div
          ref={previewRef}
          className={cn(
            "grid max-h-full max-w-full auto-rows-min grid-cols-2 gap-2 overflow-y-auto p-4",
            "sm:grid-cols-3",
          )}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#404040 transparent",
          }}
        >
          {selectedPlaces.length > 0 ? (
            selectedPlaces.map((p) => (
              <Link
                key={p.id}
                href={getPlacesSearchUrl({
                  placeName: p.displayName.text,
                  placeId: p.id,
                })}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${p.displayName.text} in Google Maps`}
                className={cn(
                  "group relative flex min-h-[36px] w-full rounded-full border px-4 py-1.5",
                  "border-neutral-600/60 bg-gradient-to-br from-neutral-700/60 to-neutral-800/50 shadow-sm",
                  "transition-all duration-200 hover:border-emerald-500/60 hover:bg-gradient-to-br hover:from-emerald-950/40 hover:to-emerald-900/30 hover:shadow-md",
                  "focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:outline-none active:scale-95",
                )}
              >
                <div className="mt-0.5 mr-2 flex items-center">
                  <img
                    src={
                      p.iconMaskBaseUri ? `${p.iconMaskBaseUri}.svg` : undefined
                    }
                    alt={p.primaryTypeDisplayName.text}
                    className="size-3 invert"
                  />
                </div>

                <div className="overflow-hidden">
                  <p className="truncate text-xs text-neutral-100">
                    {p.displayName.text}
                  </p>
                  <p className="truncate text-xs text-neutral-400">
                    {p.primaryTypeDisplayName.text}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex w-full items-center justify-center py-8">
              <span className="text-sm text-neutral-500">
                No places selected. Open the drawer to select places.
              </span>
            </div>
          )}
        </div>
        {previewHasOverflow && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-20 translate-y-1/2 bg-gradient-to-b from-transparent via-neutral-900/80 to-neutral-900" />
        )}
      </div>

      <Drawer places={places} />
    </div>
  );
};
