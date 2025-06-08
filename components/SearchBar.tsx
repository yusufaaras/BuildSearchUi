
import React, { useState } from 'react';
import MicIcon from './icons/MicIcon';
import SearchIcon from './icons/SearchIcon';
import { APP_CONFIG } from '../constants';


interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder: string;
  buttonText: string;
  buttonLoadingText: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, placeholder, buttonText, buttonLoadingText }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleMicClick = () => {
    alert("Microphone functionality for speech-to-text is not yet implemented. Please type your query.");
  };


  return (
    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2 my-6 p-4 bg-ew-card rounded-lg shadow-xl">
      <div className="relative flex-grow min-w-[200px] sm:min-w-[300px]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-[#0d2055] text-ew-text-primary border border-ew-primary rounded-md focus:ring-2 focus:ring-ew-accent focus:border-ew-accent outline-none placeholder-ew-text-secondary"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleMicClick}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-ew-accent hover:text-ew-primary disabled:opacity-50"
          aria-label="Search by voice (feature coming soon)"
          disabled={isLoading}
        >
          <MicIcon className="w-6 h-6" />
        </button>
      </div>
      <button
        type="submit"
        style={{ 
          backgroundColor: APP_CONFIG.searchBar.buttonStyle.background, 
          color: APP_CONFIG.searchBar.buttonStyle.color 
        }}
        className="px-6 py-3 rounded-md font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        disabled={isLoading}
      >
        <SearchIcon className="w-5 h-5" />
        {isLoading ? buttonLoadingText : buttonText}
      </button>
    </form>
  );
};

export default SearchBar;