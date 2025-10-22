export const MapSkeleton = () => (
  <div className="my-2 max-w-[800px] overflow-y-auto rounded-md border border-neutral-300 bg-neutral-800/50 p-2">
    <p className="font-bold">Places nearby that are currently OPEN! 🍽️</p>
    {Array.from({ length: 10 }).map((_, index) => (
      <div
        className="my-2 h-4 animate-pulse rounded-md bg-neutral-700/50"
        style={{ width: `${Math.floor(Math.random() * 300 + 100)}px` }}
        key={index}
      />
    ))}
  </div>
);
