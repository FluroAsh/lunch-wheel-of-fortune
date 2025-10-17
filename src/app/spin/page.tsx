"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type WheelDataType } from "react-custom-roulette-r19";

import DynamicWheel from "@/features/wheel/components/DynamicWheel";
import { cn, truncateText } from "@/lib/utils";
import { usePlacesStore } from "@/store";

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
  const { places } = usePlacesStore();

  const [prizeNumber, setPrizeNumber] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [state, setState] = useState<"idle" | "spinning">("idle");

  const data: WheelDataType[] = places.map((place) => ({
    option: truncateText(10, place.name ?? ""),
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

  return places.length > 0 ? (
    <div className="flex h-screen flex-col items-center justify-center">
      {prizeNumber && <p>{places[prizeNumber].name}</p>}
      <DynamicWheel
        mustStartSpinning={state === "spinning"}
        onStopSpinning={onStop}
        prizeNumber={prizeNumber}
        data={data.map((option, idx) => {
          const colorScheme = baseColors[idx % baseColors.length];

          return {
            ...option,
            style: {
              // backgroundColor: idx % 2 === 0 ? "white" : "black",
              // textColor: idx % 2 === 0 ? "black" : "white",
              backgroundColor: colorScheme.bg,
              textColor: colorScheme.text,
            },
          };
        })}
        backgroundColors={["#3e3e3e", "#df3428"]}
        textColors={["#ffffff"]}
        spinDuration={0.1}
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
    </div>
  ) : null;
}
