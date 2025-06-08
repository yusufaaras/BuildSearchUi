// From user's JSON structure - used for initial config
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

export interface AppConfig {
  theme: {
    background: string;
    primary: string;
    card: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
  };
  header: {
    logo: string;
    subtitle: string;
  };
  searchBar: {
    placeholder: string;
    icon: string; // 'mic'
    buttonStyle: {
      background: string;
      color: string;
    };
  };
  categories: string[]; // These might need a different approach for translation if dynamic
  categoriesLabel: string; // New for translation
  categoriesPosition: string; // 'belowSearchBar'
  categoryBehavior: {
    onClick: string; // 'performAISearch'
    searchQuery: string; // 'categoryName'
  };
  featureTags: string[]; // Also might need different approach
  featureTagsLabel: string; // New for translation
  searchResults: {
    initialCount: number;
    maxCount: number;
    resultCard: {
      background: string;
      border: string;
      borderRadius: string;
      margin: string;
      padding: string;
      textColor: string;
      summaryFontWeight: number;
      iconColor: string;
    };
    resultItem: { // Example structure
      title: string;
      summary: string;
      actions: ResultAction[];
    };
    moreResultsButton: {
      label: string;
      icon: string; // 'expand'
      style: {
        background: string;
        color: string;
        border: string;
      };
    };
    aiOverviewTitle: string; // New
    noResultsYetTitle: string; // New
    noResultsYetSubtitle: string; // New
    searchingInsightsText: string; // New
  };
  chatSection: {
    title: string;
    prompt: string; // Initial prompt/greeting from AI
    inputPlaceholder: string;
    sendButton: {
      icon: string; // 'send'
      background: string;
      color: string;
    };
    endFocusedChatLabel: string; // New
    suggestedQuestionsLabel: string; // New
    loadingSuggestedQuestionsLabel: string; // New
    noSuggestionsGeneratedLabel: string; // New
    aiTypingLabel: string; // New
    showMoreSuggestedQuestionsLabel: string; // New
  };
  userExperience: {
    closeResult: string;
    showMore: string;
    newSearch: string;
    responsive: boolean;
    accessibility: boolean;
    multiLanguage: boolean;
  };
  promotion: {
    banner: string;
  };
  footer: {
    industryLeadersTitle: string;
    discoverButtonText: string;
    poweredByText: string; // Replaces direct text for easier translation
  };
}

export interface ResultAction {
  type: 'chat' | 'link' | 'close' | 'pdf' | 'catalog' | 'image' | 'news' | 'social';
  labelKey: keyof TranslatedStrings['resultCardActions']; // Key to lookup translated label
  icon: string;
}


export interface SearchResultItem {
  id: string;
  title: string;
  summary: string; // For Energy.Web4, this will be a short note about the source
  url: string;
  // rawChunk?: any; // Optional: store original groundingChunk
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  type?: 'suggestion' | 'message'; // Optional: for different styling or handling
  timestamp: Date;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
}

// From @google/genai, simplified for use
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}
export interface Candidate {
  groundingMetadata?: GroundingMetadata;
}
export interface GeminiSafetySetting {
    category: HarmCategory;
    threshold: HarmBlockThreshold;
}

export interface QuestionsResponse {
    questions: string[];
}

// Props for components that might adapt to expanded view
export interface ViewAdaptableProps {
  isExpandedView?: boolean;
}

// Language related types
export interface Language {
  code: string;
  name: string; // Native name of the language
}

export interface TranslatedStrings {
  headerSubtitle: string;
  promotionalBanner: string;
  searchBarPlaceholder: string;
  searchButton: string;
  searchButtonLoading: string;
  categoriesLabel: string;
  featureTagsLabel: string;
  searchResults_AIOverviewTitle: string;
  searchResults_noResultsYetTitle: string;
  searchResults_noResultsYetSubtitle: string;
  searchResults_searchingInsightsText: string;
  searchResults_showMoreButtonLabel: string;
  chat_title: string;
  chat_prompt: string;
  chat_inputPlaceholder: string;
  chat_inputPlaceholderFocused: (title: string) => string;
  chat_titleFocused: (title: string) => string;
  chat_endFocusedChatLabel: string;
  chat_suggestedQuestionsLabel: string;
  chat_loadingSuggestedQuestionsLabel: string;
  chat_noSuggestionsGeneratedLabel: string;
  chat_aiTypingLabel: string;
  chat_showMoreSuggestedQuestionsLabel: (count: number) => string; // New
  chat_systemMessageNewSearch: (query: string) => string;
  chat_systemMessageNowChatting: (title: string) => string;
  chat_systemMessageEndedFocusedChat: string;
  resultCardActions: {
    chat: string;
    link: string;
    pdf: string;
    catalog: string;
    image: string;
    news: string;
    social: string;
    close: string;
  };
  footer_industryLeadersTitle: string;
  footer_discoverButtonText: string;
  footer_poweredByText: string;
  // Add more keys as needed for UI elements
}
