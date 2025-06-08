import React from 'react';

interface LogoCarouselProps {
  logos: React.ReactNode[];
  speed?: string; // Tailwind duration class like 'duration-[20s]' etc. Not directly used for animation speed here, using Tailwind config.
}

const LogoCarousel: React.FC<LogoCarouselProps> = ({ logos }) => {
  const displayLogos = [...logos, ...logos]; // Duplicate for seamless scroll

  return (
    <div className="w-full overflow-hidden py-4 relative group">
      {/* Optional: Add fading edges for a smoother look */}
      <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-16 bg-gradient-to-r from-ew-card to-transparent z-10 group-hover:from-ew-card"></div>
      <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-16 bg-gradient-to-l from-ew-card to-transparent z-10 group-hover:from-ew-card"></div>
      
      <div className="flex animate-ewScrollLogos group-hover:[animation-play-state:paused]">
        {displayLogos.map((logoContent, index) => (
          <div
            key={`logo-${index}`}
            className="flex-shrink-0 mx-3 sm:mx-4 px-4 py-2 min-h-[3rem] flex items-center justify-center bg-[#0d2055] border border-ew-primary border-opacity-30 rounded-lg shadow-md"
          >
            <span className="text-ew-text-secondary text-xs sm:text-sm font-medium whitespace-nowrap">
              {logoContent}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Note on group-hover:[animation-play-state:paused]:
// This uses Tailwind's arbitrary property syntax to pause the animation on hover.
// It relies on the `animate-ewScrollLogos` class being correctly defined and applied.
// The `ewScrollLogos` animation is defined in `index.html` via `tailwind.config`.

export default LogoCarousel;