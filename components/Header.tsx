import React from 'react';

interface HeaderProps {
  logo: string;
  subtitle: string;
  children?: React.ReactNode; // To accommodate LanguageSwitcher
}

const Header: React.FC<HeaderProps> = ({ logo, subtitle, children }) => {
  return (
    <header className="py-6 px-4 text-center bg-ew-background relative">
      <div className="container mx-auto flex flex-col items-center">
        <h1 className="text-4xl font-bold text-ew-primary tracking-tight sm:text-5xl md:text-6xl">
          {logo}
        </h1>
        <p className="mt-3 text-base text-ew-text-secondary sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
          {subtitle}
        </p>
      </div>
      {children && (
        <div className="absolute top-4 right-4 sm:right-6 lg:right-8">
          {children}
        </div>
      )}
    </header>
  );
};

export default Header;
