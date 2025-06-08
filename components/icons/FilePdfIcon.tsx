
import React from 'react';

interface IconProps {
  className?: string;
}

const FilePdfIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM9.5 18H8v-1.5h1.5V18zm0-3H8v-1.5h1.5V15zm0-3H8V10.5h1.5V12zM13 9V3.5L18.5 9H13zM16 18h-2v-1.5H12V15h2v-1.5h-1.25c-.41 0-.75-.34-.75-.75s.34-.75.75-.75H14V10.5h2V12h-2v1.5h2V18z"/>
  </svg>
);

export default FilePdfIcon;
