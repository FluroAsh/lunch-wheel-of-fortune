export const MapSkeleton = () => (
  <div className="overflow-y-auto p-2 bg-neutral-800/50 max-w-[800px] my-2 rounded-md border border-neutral-300">
    <p className="font-bold ">Places nearby that are currently open</p>
    {Array.from({ length: 10 }).map((_, index) => (
      <div
        className="h-4 bg-neutral-700/50 my-2 rounded-md animate-pulse"
        style={{ width: `${Math.floor(Math.random() * 300 + 100)}px` }}
        key={index}
      />
    ))}
  </div>
);
