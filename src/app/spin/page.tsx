"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import {
  LucideArrowLeft,
  LucideCookingPot,
  LucideRefreshCw,
} from "lucide-react";

import { WheelSkeleton } from "@/components/skeleton";
import { useNearbyPlaces } from "@/features/menu/hooks/use-nearby-places";
import DynamicWheel from "@/features/wheel/components/dynamic-wheel";
import { PrizeBanner } from "@/features/wheel/components/prize-banner-modal";
import { truncateText } from "@/lib/utils";
import { useMapStore } from "@/store";

export default function Page() {
  const router = useRouter();
  const { places } = useNearbyPlaces();
  const { selectedPlaceIds } = useMapStore();

  const selectedPlaces = places.filter((p) => selectedPlaceIds.includes(p.id));

  const [prizeIndex, setPrizeIndex] = useState<number>(0);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const segments = selectedPlaces.map((place) => ({
    label: truncateText(12, place.displayName.text ?? ""),
  }));

  const handleSpinClick = () => {
    if (isSpinning) return;
    const newPrizeIndex = Math.floor(Math.random() * selectedPlaces.length);
    setPrizeIndex(newPrizeIndex);
    setHasSpun(false);
    setIsSpinning(true);
  };

  const onSpinComplete = () => {
    setIsSpinning(false);
    setHasSpun(true);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only redirect check
  useEffect(() => {
    if (places.length === 0) {
      router.replace("/");
    }
  }, []);

  if (places.length === 0) {
    return <p className="text-neutral-400">Redirecting…</p>;
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
        {/* Page context */}
        <div className="text-center">
          <div className="flex items-center gap-2">
            <h2 className="bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-lg font-bold tracking-widest text-transparent uppercase">
              {selectedPlaces.length} place
              {selectedPlaces.length !== 1 ? "s" : ""} in the pot
            </h2>
            <LucideCookingPot className="inline-block size-6 stroke-neutral-300" />
          </div>
          <p className="text-sm text-neutral-400 italic">
            {!isSpinning ? "Let's get cooking..." : "Cooking up a storm..."}
          </p>
        </div>

        {/* Wheel */}
        <PrizeBanner
          winner={selectedPlaces[prizeIndex]}
          onClose={() => setHasSpun(false)}
          onRespin={handleSpinClick}
          open={hasSpun && !isSpinning}
        />

        <Suspense fallback={<WheelSkeleton />}>
          <DynamicWheel
            segments={segments}
            prizeIndex={prizeIndex}
            mustSpin={isSpinning}
            onSpinComplete={onSpinComplete}
          />
        </Suspense>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={isSpinning}
            onClick={handleSpinClick}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:cursor-pointer hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
          >
            <LucideRefreshCw
              className={`size-4 ${isSpinning ? "animate-spin" : ""}`}
            />
            {hasSpun ? "Spin Again" : "Spin the Wheel"}
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
          >
            <LucideArrowLeft className="size-3.5" />
            Back to the Map
          </Link>
        </div>
      </main>
    </div>
  );
}
