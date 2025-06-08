import React from 'react';

interface PromotionalBannerProps {
  bannerText: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ bannerText }) => {
  return (
    <div className="bg-ew-primary text-ew-background py-3 px-4 text-center font-semibold">
      <p>{bannerText}</p>
    </div>
  );
};

export default PromotionalBanner;
