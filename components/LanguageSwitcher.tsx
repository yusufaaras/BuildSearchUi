import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';
import LanguageIcon from './icons/LanguageIcon';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLanguage, onLanguageChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLanguageSelect = (code: string) => {
    onLanguageChange(code);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const selectedLanguageName = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.name.substring(0,3) || currentLanguage.toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 text-ew-primary hover:bg-ew-primary hover:bg-opacity-10 rounded-md flex items-center"
        aria-label="Change language"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
      >
        <LanguageIcon className="w-6 h-6" />
        <span className="ml-1 text-xs font-medium">{selectedLanguageName}</span>
      </button>
      {isDropdownOpen && (
        <div 
            className="absolute right-0 mt-2 w-48 bg-ew-card border border-ew-primary rounded-md shadow-lg py-1 z-60 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-ew-primary scrollbar-track-transparent"
            role="menu"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                currentLanguage === lang.code 
                  ? 'bg-ew-primary text-ew-background' 
                  : 'text-ew-text-primary hover:bg-ew-primary hover:bg-opacity-20'
              }`}
              role="menuitem"
              aria-current={currentLanguage === lang.code}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
