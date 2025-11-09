"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { type WheelDataType } from "react-custom-roulette-r19";

import { WheelSkeleton } from "@/components/skeleton";
import DynamicWheel from "@/features/wheel/components/dynamic-wheel";
import { PrizeBanner } from "@/features/wheel/components/prize-banner";
import { cn, truncateText } from "@/lib/utils";
import { useMapStore } from "@/store";

const baseColors = [
  { bg: "#3e3e3e", text: "#ffffff" },
  { bg: "#df3428", text: "#ffffff" },
  { bg: "#4a90e2", text: "#ffffff" },
  { bg: "#f39c12", text: "#000000" },
  { bg: "#27ae60", text: "#ffffff" },
  { bg: "#9b59b6", text: "#ffffff" },
  { bg: "#e74c3c", text: "#ffffff" },
  { bg: "#f1c40f", text: "#000000" },
];

export default function Page() {
  const router = useRouter();
  const { places } = useMapStore();

  const [prizeNumber, setPrizeNumber] = useState<number>(0);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [state, setState] = useState<"idle" | "spinning">("idle");

  const data: WheelDataType[] = places.map((place) => ({
    option: truncateText(10, place.displayName.text ?? ""),
  }));

  useEffect(() => {
    // Do not redirect in-render to avoid setState issues
    if (places.length === 0) {
      router.replace("/");
    }
  }, [places, router]);

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * places.length);
    setPrizeNumber(newPrizeNumber);
    setState("spinning");
  };

  const onStop = () => {
    setState("idle");
    setHasSpun(true);
  };

  if (places.length === 0) {
    return <p>Redirecting... Please wait.</p>;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {hasSpun && state === "idle" ? (
        <p>{places[prizeNumber].displayName.text}</p>
      ) : (
        <div className="h-6 opacity-0" />
      )}

      <PrizeBanner
        winner={places[prizeNumber]}
        onClose={() => setHasSpun(false)}
        onRespin={handleSpinClick}
        open={hasSpun && state === "idle"}
      />

      <Suspense fallback={<WheelSkeleton />}>
        <DynamicWheel
          mustStartSpinning={state === "spinning"}
          onStopSpinning={onStop}
          prizeNumber={prizeNumber}
          data={data.map((option, idx) => {
            const colorScheme = baseColors[idx % baseColors.length];

            return {
              ...option,
              style: {
                backgroundColor: colorScheme.bg,
                textColor: colorScheme.text,
              },
            };
          })}
          backgroundColors={["#3e3e3e", "#df3428"]}
          textColors={["#ffffff"]}
          spinDuration={0.25}
        />

        <button
          disabled={state === "spinning"}
          onClick={handleSpinClick}
          className={cn(
            "min-w-[100px] rounded-md p-2 text-white",
            state === "idle" ? "bg-blue-500" : "bg-gray-600 text-gray-300",
          )}
        >
          {hasSpun ? "Spin Again" : "Spin"}
        </button>
      </Suspense>
    </div>
  );
}
