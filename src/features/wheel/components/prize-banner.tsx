"use client";

import Link from "next/link";
import { useEffect } from "react";

import { LucideX } from "lucide-react";
import { useReward } from "react-rewards";

import { getPlacesSearchUrl } from "@/lib/helpers";
import { NearbyPlaces } from "@/types/google";

type PrizeBannerProps = {
  winner: NearbyPlaces[number];
  onClose?: () => void;
  onRespin: () => void;
  open: boolean;
};

export const PrizeBanner = ({
  winner,
  open,
  onClose,
  onRespin,
}: PrizeBannerProps) => {
  const { reward: confettiReward } = useReward("confettiReward", "confetti", {
    lifetime: 500,
    spread: 150,
    decay: 0.9,
  });

  useEffect(() => {
    if (open) {
      confettiReward();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && onClose) {
      onClose();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid min-h-full place-items-center bg-slate-800/70 px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prize-title"
    >
      <div className="relative w-[400px] rounded-xl border border-slate-200 bg-slate-50 p-8 shadow-xl">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-slate-400 transition-colors hover:cursor-pointer hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <LucideX className="size-6" />
          </button>
        )}

        <div
          id="confettiReward"
          className="absolute top-0 left-1/2 size-[50px]"
        />

        {/* Content */}
        <div className="space-y-4 text-center">
          {/* Celebration Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          {/* Title */}
          <h2 id="prize-title" className="text-2xl font-bold text-slate-800">
            According to the chef...
          </h2>

          {/* Winner Name */}
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-800">
              {winner.displayName.text}
            </p>
            <p className="text-lg text-slate-600">Is on the menu!</p>
          </div>

          {/* Additional Info */}
          {winner.rating && (
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <svg
                className="h-4 w-4 text-amber-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{winner.rating} stars</span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {/* TODO: Add Google Maps app deeplink using URL scheme & device detection */}
            {winner.id && (
              <button
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm hover:cursor-pointer hover:bg-slate-50 hover:shadow-md"
                onClick={() =>
                  window.open(getPlacesSearchUrl(winner), "_blank")
                }
              >
                View on Google Maps
              </button>
            )}

            <button
              onClick={() => {
                onClose?.();
                onRespin();
              }}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:cursor-pointer hover:from-emerald-700 hover:to-teal-700 hover:shadow-md"
            >
              Spin Again
            </button>

            <div>
              <Link
                className="pt-2 text-xs text-neutral-600 underline"
                href="/"
              >
                Back to the Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
