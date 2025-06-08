import React from 'react';
import { SearchResultItem, ResultAction, ViewAdaptableProps, TranslatedStrings } from '../types';
// APP_CONFIG is still used for non-translatable style parts of moreResultsButton
import { APP_CONFIG } from '../constants'; 
import ResultCard from './ResultCard';
import ExpandIcon from './icons/ExpandIcon';

interface SearchResultsProps extends ViewAdaptableProps {
  results: SearchResultItem[];
  overallSummary: string | null;
  isLoading: boolean;
  error: string | null;
  displayedCount: number;
  onShowMore: () => void;
  onResultAction: (actionType: ResultAction['type'], result: SearchResultItem) => void;
  T: TranslatedStrings; // For translated UI text
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  overallSummary,
  isLoading,
  error,
  displayedCount,
  onShowMore,
  onResultAction,
  isExpandedView,
  T,
}) => {
  if (isLoading && !results.length) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ew-primary mx-auto"></div>
        <p className="mt-4 text-lg text-ew-text-secondary">{T.searchResults_searchingInsightsText}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-400 bg-red-900 bg-opacity-30 p-4 rounded-lg">Error: {error}</div>;
  }

  if (!results.length && !isLoading) {
     return (
      <div className="text-center py-10 text-ew-text-secondary">
        <p className="text-xl">{T.searchResults_noResultsYetTitle}</p>
        <p>{T.searchResults_noResultsYetSubtitle}</p>
      </div>
    );
  }
  
  const visibleResults = results.slice(0, displayedCount);

  const gridClass = isExpandedView 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";


  return (
    <div className={`my-8 ${isExpandedView ? 'px-2' : ''}`}>
      {overallSummary && (
        <div className="mb-6 p-4 bg-ew-card border border-ew-primary rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-ew-primary mb-2">{T.searchResults_AIOverviewTitle}</h2>
          <p className="text-ew-text-secondary whitespace-pre-wrap">{overallSummary}</p>
        </div>
      )}
      
      <div className={gridClass}>
        {visibleResults.map((result) => (
          <ResultCard 
            key={result.id} 
            result={result} 
            onAction={onResultAction} 
            T_ResultCardActions={T.resultCardActions}
          />
        ))}
      </div>

      {results.length > displayedCount && (
        <div className="text-center mt-8">
          <button
            onClick={onShowMore}
            style={{ // Style comes from APP_CONFIG as it's visual theme
              backgroundColor: APP_CONFIG.searchResults.moreResultsButton.style.background,
              color: APP_CONFIG.searchResults.moreResultsButton.style.color,
              border: APP_CONFIG.searchResults.moreResultsButton.style.border,
            }}
            className="px-6 py-3 rounded-md font-semibold hover:bg-ew-primary hover:text-ew-background transition-colors flex items-center gap-2 mx-auto"
            aria-label={T.searchResults_showMoreButtonLabel}
          >
            {T.searchResults_showMoreButtonLabel}
            <ExpandIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
