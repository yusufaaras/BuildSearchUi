
import React from 'react';

interface IconProps {
  className?: string;
}

const GlobeAltIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253m0 0A11.971 11.971 0 0012 13.5c2.998 0 5.74 1.1 7.843 2.918m0 0c.185.72.284 1.475.284 2.253 0 2.485-2.015 4.5-4.5 4.5S7.5 18.985 7.5 16.5s2.015-4.5 4.5-4.5M12 6.75A2.25 2.25 0 1012 11.25a2.25 2.25 0 000-4.5z" />
  </svg>
);

export default GlobeAltIcon;
