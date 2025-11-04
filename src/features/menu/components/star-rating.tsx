"use client";

const SIZE = "size-4" as const;

// const STAR_SVG_PATH =
//   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const STAR_SVG_PATH =
  "M11.4434703,19.4783366 L7.11534027,21.8561884 C6.53071469,22.1773786 5.80762087,21.9424899 5.50026501,21.3315498 C5.3778743,21.0882703 5.3356403,20.8096129 5.38010133,20.5387172 L6.2067006,15.5023462 C6.27323987,15.0969303 6.14461904,14.6832584 5.86275418,14.3961413 L2.36122346,10.8293635 C1.88825143,10.3475782 1.87857357,9.55633639 2.33960735,9.06207547 C2.52319342,8.86525818 2.76374635,8.73717345 3.02402575,8.69765029 L7.8630222,7.96285367 C8.25254987,7.90370429 8.58928356,7.64804097 8.76348563,7.27918144 L10.9275506,2.69693973 C11.2198634,2.07798981 11.936976,1.82386417 12.5292664,2.12933421 C12.7651196,2.25097399 12.9560234,2.45047063 13.0724239,2.69693973 L15.2364889,7.27918144 C15.410691,7.64804097 15.7474247,7.90370429 16.1369524,7.96285367 L20.9759488,8.69765029 C21.6295801,8.79690353 22.0824579,9.43108706 21.9874797,10.1141388 C21.9496589,10.3861337 21.827091,10.6375141 21.6387511,10.8293635 L18.1372204,14.3961413 C17.8553555,14.6832584 17.7267347,15.0969303 17.793274,15.5023462 L18.6198732,20.5387172 C18.7315268,21.219009 18.2943081,21.8650816 17.6433179,21.9817608 C17.3840902,22.028223 17.1174353,21.984088 16.8846343,21.8561884 L12.5565043,19.4783366 C12.2081001,19.2869252 11.7918744,19.2869252 11.4434703,19.4783366 Z";

export const StarRating = ({ rating }: { rating: number }) => {
  if (!rating) {
    return null;
  }

  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;

  const FullStar = () => (
    <svg
      className={`${SIZE} text-amber-500`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={STAR_SVG_PATH} />
    </svg>
  );

  const EmptyStar = () => (
    <svg
      className={`${SIZE} text-neutral-400`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={STAR_SVG_PATH} />
    </svg>
  );

  const HalfStar = () => (
    <div className={`relative ${SIZE}`}>
      {/* Empty star background */}
      <svg
        className={`absolute ${SIZE} text-neutral-400`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d={STAR_SVG_PATH} />
      </svg>

      {/* Filled star clipped to show only left half */}
      <svg
        className={`absolute ${SIZE} text-amber-500`}
        fill="currentColor"
        viewBox="0 0 24 24"
        style={{ clipPath: "inset(0 50% 0 0)" }}
      >
        <path d={STAR_SVG_PATH} />
      </svg>
    </div>
  );

  const renderStars = () => {
    const stars: React.ReactElement[] = [];

    // Use switch statement to determine full stars to render
    switch (fullStars) {
      case 0: {
        // No full stars
        break;
      }
      case 1: {
        stars.push(<FullStar key="full-0" />);
        break;
      }
      case 2: {
        stars.push(<FullStar key="full-0" />, <FullStar key="full-1" />);
        break;
      }
      case 3: {
        stars.push(
          <FullStar key="full-0" />,
          <FullStar key="full-1" />,
          <FullStar key="full-2" />,
        );
        break;
      }
      case 4: {
        stars.push(
          <FullStar key="full-0" />,
          <FullStar key="full-1" />,
          <FullStar key="full-2" />,
          <FullStar key="full-3" />,
        );
        break;
      }
      case 5: {
        stars.push(
          <FullStar key="full-0" />,
          <FullStar key="full-1" />,
          <FullStar key="full-2" />,
          <FullStar key="full-3" />,
          <FullStar key="full-4" />,
        );
        break;
      }
    }

    // Render half star if needed (only if not already at 5 stars)
    if (hasHalfStar && fullStars < 5) {
      stars.push(<HalfStar key="half" />);
    }

    // Render empty stars to fill up to 5 using switch
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    switch (remainingStars) {
      case 0: {
        // No empty stars needed
        break;
      }
      case 1: {
        stars.push(<EmptyStar key="empty-0" />);
        break;
      }
      case 2: {
        stars.push(<EmptyStar key="empty-0" />, <EmptyStar key="empty-1" />);
        break;
      }
      case 3: {
        stars.push(
          <EmptyStar key="empty-0" />,
          <EmptyStar key="empty-1" />,
          <EmptyStar key="empty-2" />,
        );
        break;
      }
      case 4: {
        stars.push(
          <EmptyStar key="empty-0" />,
          <EmptyStar key="empty-1" />,
          <EmptyStar key="empty-2" />,
          <EmptyStar key="empty-3" />,
        );
        break;
      }
      case 5: {
        stars.push(
          <EmptyStar key="empty-0" />,
          <EmptyStar key="empty-1" />,
          <EmptyStar key="empty-2" />,
          <EmptyStar key="empty-3" />,
          <EmptyStar key="empty-4" />,
        );
        break;
      }
    }

    return stars;
  };

  return <div className="flex items-center gap-0.5">{renderStars()}</div>;
};
