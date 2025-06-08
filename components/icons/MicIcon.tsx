
import React from 'react';

interface IconProps {
  className?: string;
}

const MicIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 14a2 2 0 0 0 2-2V6a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z" />
    <path d="M12 17c-2.206 0-4-1.794-4-4h2c0 1.103.897 2 2 2s2-.897 2-2h2c0 2.206-1.794 4-4 4z" />
    <path d="M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4zm0 2c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2s-2-.897-2-2V6c0-1.103.897-2 2-2z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1h-2v1a9 9 0 0 0 8 8.941V22h-3v2h8v-2h-3v-2.059A9 9 0 0 0 21 11v-1z" />
  </svg>
);

export default MicIcon;
