
import React from 'react';

interface IconProps {
  className?: string;
}

const NewspaperIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H5V6h14v13z"/>
    <path d="M7 9h10v2H7zM7 12h10v2H7zM7 15h6v2H7z"/>
  </svg>
);

export default NewspaperIcon;
