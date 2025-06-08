
import React from 'react';
import { SearchResultItem, ResultAction, TranslatedStrings } from '../types';
import { APP_CONFIG, RESULT_CARD_ACTIONS } from '../constants';
import ChatIcon from './icons/ChatIcon';
import LinkIcon from './icons/LinkIcon';
import CloseIcon from './icons/CloseIcon';
import FilePdfIcon from './icons/FilePdfIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ImageIcon from './icons/ImageIcon';
import NewspaperIcon from './icons/NewspaperIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';


interface ResultCardProps {
  result: SearchResultItem;
  onAction: (actionType: ResultAction['type'], result: SearchResultItem) => void;
  T_ResultCardActions: TranslatedStrings['resultCardActions'];
}

const iconMap: { [key: string]: React.ElementType } = {
  chat: ChatIcon,
  link: LinkIcon,
  x: CloseIcon,
  filePdf: FilePdfIcon,
  bookOpen: BookOpenIcon,
  image: ImageIcon,
  newspaper: NewspaperIcon,
  globeAlt: GlobeAltIcon,
};

const ResultCard: React.FC<ResultCardProps> = ({ result, onAction, T_ResultCardActions }) => {
  const cardStyle = APP_CONFIG.searchResults.resultCard;

  return (
    <div
      className="rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl flex flex-col h-full"
      style={{
        background: cardStyle.background,
        border: cardStyle.border,
        borderRadius: cardStyle.borderRadius,
        color: cardStyle.textColor,
      }}
    >
      <div style={{ padding: cardStyle.padding }} className="flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-ew-primary mb-2 line-clamp-2" title={result.title}>{result.title}</h3>
        <p className="text-sm text-ew-text-secondary mb-3 line-clamp-3 flex-grow" style={{ fontWeight: cardStyle.summaryFontWeight }}>
          {result.summary}
        </p>
        {/* Removed redundant source URL display:
        {result.url && (
          <p className="text-xs text-ew-accent mb-4 truncate">
            Source: <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline" title={result.url}>{result.url}</a>
          </p>
        )}
        */}
        <div className="flex flex-wrap gap-2 mt-auto pt-3"> {/* Added pt-3 for spacing after summary */}
          {RESULT_CARD_ACTIONS.map((action) => {
            const IconComponent = iconMap[action.icon];
            const translatedLabel = T_ResultCardActions[action.labelKey] || action.labelKey;
            return (
              <button
                key={action.type}
                onClick={() => onAction(action.type, result)}
                className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-md transition-colors
                  ${action.type === 'close' 
                    ? 'bg-red-500 bg-opacity-20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500' 
                    : `bg-ew-primary bg-opacity-10 text-ew-primary hover:bg-ew-primary hover:text-ew-background border border-ew-primary`
                  }
                `}
                style={{ color: action.type !== 'close' ? cardStyle.iconColor : undefined }}
                aria-label={`${translatedLabel} for ${result.title}`}
                title={translatedLabel}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                {translatedLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
