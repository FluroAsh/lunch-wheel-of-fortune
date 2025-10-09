"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { type WheelDataType } from "react-custom-roulette-r19";
import DynamicWheel from "@/features/wheel/components/DynamicWheel";

// TODO: Feed data from Google Places/ API
const data: WheelDataType[] = [
  { option: "0" },
  { option: "1" },
  { option: "2" },
];

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
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);

  const handleSpinClick = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const onStop = () => {
    setMustSpin(false);
    if (!hasSpun) {
      setHasSpun(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <DynamicWheel
        mustStartSpinning={mustSpin}
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
        onStopSpinning={onStop}
      />

      <button
        disabled={mustSpin}
        onClick={handleSpinClick}
        className={cn(
          "text-white p-2 rounded-md min-w-[100px]",
          mustSpin ? "bg-gray-600 text-gray-300" : "bg-blue-500"
        )}
      >
        {hasSpun ? "Spin Again" : "Spin"}
      </button>
    </div>
  );
}
