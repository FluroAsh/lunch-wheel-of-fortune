import { ListSkeleton } from "@/components/skeleton";

export const MapSkeleton = () => (
  <div className="my-2 max-w-[800px] overflow-y-auto rounded-md border border-neutral-300 bg-neutral-800/50 p-2">
    <p className="font-bold">Places nearby that are currently OPEN! 🍽️</p>
    <ListSkeleton />
  </div>
);
