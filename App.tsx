
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import PromotionalBanner from './components/PromotionalBanner';
import SearchBar from './components/SearchBar';
import CategoryPills from './components/CategoryPills';
import FeatureTags from './components/FeatureTags';
import SearchResults from './components/SearchResults';
import ChatSection from './components/ChatSection';
import LanguageSwitcher from './components/LanguageSwitcher';
import { SearchResultItem, ChatMessage, ResultAction, SuggestedQuestion, TranslatedStrings } from './types';
import { performAISearch, createNewChatSession, sendMessageToChat, generateQuestionsForLink } from './services/geminiService';
import { APP_CONFIG, DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGES } from './constants';
import { translations } from './translations';
import MaximizeIcon from './components/icons/MaximizeIcon';
import MinimizeIcon from './components/icons/MinimizeIcon';
import CloseIcon from './components/icons/CloseIcon';
import LogoCarousel from './components/LogoCarousel';


const DUMMY_COMPANY_LOGOS = [ // Updated for Audit.Web4 Scope
  "Deloitte", "PwC", "EY", "KPMG", 
  "Salesforce", "SAP", "Oracle NetSuite", "Zoho CRM",
  "McKinsey & Company", "Boston Consulting Group (BCG)", "Bain & Company",
  "Contract Tech Solutions", "RegTech Providers", "Audit Tool Developers"
];


const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [overallSummary, setOverallSummary] = useState<string | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [activeChatResult, setActiveChatResult] = useState<SearchResultItem | null>(null);
  
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  const [displayedResultsCount, setDisplayedResultsCount] = useState<number>(APP_CONFIG.searchResults.initialCount);

  const [showResultsSection, setShowResultsSection] = useState<boolean>(false);
  const [isResultsExpanded, setIsResultsExpanded] = useState<boolean>(false);

  const [currentLanguage, setCurrentLanguage] = useState<string>(DEFAULT_LANGUAGE_CODE);

  const T = useMemo((): TranslatedStrings => {
    return translations[currentLanguage] || translations[DEFAULT_LANGUAGE_CODE];
  }, [currentLanguage]);

  const baseSystemInstruction = `You are Audit.Web4 AI, an Audit & Business Solutions informational assistant.
You provide GENERAL INFORMATION on auditing, SME SaaS (CRM, ERP), sectoral consulting, smart contracts, and contract management.
Current user language: ${currentLanguage}. Respond in this language.
CRITICAL DISCLAIMER: You are an AI assistant. You CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. Your responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.`;


  useEffect(() => {
    createNewChatSession(baseSystemInstruction);
    const initialMessage: ChatMessage = {
      id: `ai-init-${Date.now()}`,
      text: T.chat_prompt,
      sender: 'ai',
      timestamp: new Date(),
      type: 'message',
    };
    setChatMessages([initialMessage]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [T.chat_prompt, baseSystemInstruction]); 

  useEffect(() => {
    if (isResultsExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { // Cleanup
      document.body.style.overflow = 'auto';
    };
  }, [isResultsExpanded]);

  const handleLanguageChange = (langCode: string) => {
    if (SUPPORTED_LANGUAGES.find(l => l.code === langCode)) {
      setCurrentLanguage(langCode);
       const newGeneralChatInstruction = `You are Audit.Web4 AI, an Audit & Business Solutions informational assistant.
You provide GENERAL INFORMATION on auditing, SME SaaS (CRM, ERP), sectoral consulting, smart contracts, and contract management.
Current user language: ${langCode}. Respond in this language.
CRITICAL DISCLAIMER: You are an AI assistant. You CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. Your responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.`;
       createNewChatSession(newGeneralChatInstruction); 
        setChatMessages([{
          id: `ai-lang-change-${Date.now()}`,
          text: translations[langCode]?.chat_prompt || translations[DEFAULT_LANGUAGE_CODE].chat_prompt,
          sender: 'ai',
          timestamp: new Date(),
          type: 'message',
        }]);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchTerm(query);
    setIsLoadingSearch(true);
    setSearchError(null);
    setSearchResults([]); 
    setOverallSummary(null);
    setDisplayedResultsCount(APP_CONFIG.searchResults.initialCount); 
    setShowResultsSection(true); 
    setIsResultsExpanded(false); 

    if (activeChatResult) {
      setActiveChatResult(null); 
      setSuggestedQuestions([]);
    }
    
    const currentGeneralChatInstruction = `You are Audit.Web4 AI, an Audit & Business Solutions informational assistant.
You provide GENERAL INFORMATION on auditing, SME SaaS (CRM, ERP), sectoral consulting, smart contracts, and contract management.
Current user language: ${currentLanguage}. Respond in this language.
CRITICAL DISCLAIMER: You are an AI assistant. You CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. Your responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.`;
    createNewChatSession(currentGeneralChatInstruction); 
    setChatMessages(prevMessages => {
        const systemMessage: ChatMessage = {
            id: `ai-newsearch-${Date.now()}`,
            text: T.chat_systemMessageNewSearch(query),
            sender: 'ai',
            timestamp: new Date(),
            type: 'message',
        };
        
        let messagesToShow: ChatMessage[] = [systemMessage];
        const lastMeaningfulMessage = prevMessages.filter(m => m.sender === 'user' || (m.sender === 'ai' && m.text !== T.chat_prompt && !m.text.startsWith("Focused chat ended") && !m.text.startsWith("Now discussing:"))).pop();

        if(!lastMeaningfulMessage) { 
             const initialPromptMessage: ChatMessage = {
                id: `ai-init-${Date.now()}-search`,
                text: T.chat_prompt,
                sender: 'ai',
                timestamp: new Date(),
                type: 'message',
            };
            messagesToShow.push(initialPromptMessage);
        }
        return messagesToShow;
    });

    try {
      const { summary, sources } = await performAISearch(query, currentLanguage);
      setOverallSummary(summary);
      setSearchResults(sources);
    } catch (err) {
      setSearchError((err as Error).message || 'An unknown error occurred during search.');
    } finally {
      setIsLoadingSearch(false);
    }
  }, [activeChatResult, T, currentLanguage]); 

  const handleCategorySelect = (category: string) => {
    handleSearch(category);
  };

  const handleShowMoreResults = () => {
    setDisplayedResultsCount(prevCount => 
      Math.min(prevCount + APP_CONFIG.searchResults.initialCount, APP_CONFIG.searchResults.maxCount, searchResults.length)
    );
  };

  const handleResultAction = async (actionType: ResultAction['type'], result: SearchResultItem) => {
    let newSearchQuery = "";

    switch (actionType) {
      case 'chat':
        setActiveChatResult(result);
        setSuggestedQuestions([]);
        setIsGeneratingQuestions(true);
        setChatError(null); 
        setShowResultsSection(true); 

        const systemInstruction = `You are Audit.Web4 AI, an Audit & Business Solutions informational assistant. The user is specifically asking for information about the following resource:
Title: "${result.title}"
Source URL: ${result.url}
Focus your answers on providing GENERAL INFORMATION related to this specific resource, which could be about auditing, SME SaaS, consulting, contracts, etc.
Current user language: ${currentLanguage}. Respond in this language.
CRITICAL DISCLAIMER: You are an AI assistant. You CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. Your responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.`;
        createNewChatSession(systemInstruction);
        
        const systemMessage: ChatMessage = {
          id: `sys-${Date.now()}`,
          text: T.chat_systemMessageNowChatting(result.title),
          sender: 'ai', 
          timestamp: new Date(),
          type: 'message',
        };
        setChatMessages([systemMessage]);
        
        const chatElement = document.getElementById('chat-section-wrapper'); 
        if (chatElement) {
            chatElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        try {
          const questions = await generateQuestionsForLink(result.title, result.url, currentLanguage); 
          setSuggestedQuestions(questions.map((q, i) => ({ id: `sq-${Date.now()}-${i}`, text: q })));
        } catch (err) {
          setChatError((err as Error).message || 'Failed to load suggested questions.');
          const errorMessage: ChatMessage = {
            id: `err-sq-${Date.now()}`,
            text: `Sorry, I couldn't generate suggested questions for this item. Error: ${(err as Error).message}. Remember, this is for informational purposes ONLY. Always verify critical information and consult qualified experts.`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'message',
          };
          setChatMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsGeneratingQuestions(false);
        }
        break;
      case 'link':
        window.open(result.url, '_blank', 'noopener,noreferrer');
        break;
      case 'close':
        setSearchResults(prevResults => prevResults.filter(r => r.id !== result.id));
        if (activeChatResult?.id === result.id) { 
          clearActiveChatResultContext();
        }
        break;
      case 'pdf': // "Audit Reports Info/Whitepapers"
        newSearchQuery = `Audit reports, whitepapers, or technical documents related to "${result.title}" from ${result.url}`;
        handleSearch(newSearchQuery);
        break;
      case 'catalog':  // "SaaS Features/Service Overviews"
        newSearchQuery = `SaaS features, service overviews, or product catalogs concerning "${result.title}" from ${result.url}`;
        handleSearch(newSearchQuery);
        break;
      case 'image': 
        newSearchQuery = `Infographics or diagrams related to "${result.title}" concerning audit, business solutions, or contracts from ${result.url}`;
        handleSearch(newSearchQuery);
        break;
      case 'news': 
        newSearchQuery = `News articles or recent updates concerning "${result.title}" in audit, business solutions, or contract management`;
        handleSearch(newSearchQuery);
        break;
      case 'social': 
        newSearchQuery = `Official social media or community discussions related to "${result.title}" for audit, business solutions, or contract tech`;
        handleSearch(newSearchQuery);
        break;
      default:
        console.warn("Unknown action type:", actionType);
    }
  };
  
  const clearActiveChatResultContext = useCallback(() => {
    setActiveChatResult(null);
    setSuggestedQuestions([]);
    const currentGeneralChatInstruction = `You are Audit.Web4 AI, an Audit & Business Solutions informational assistant.
You provide GENERAL INFORMATION on auditing, SME SaaS (CRM, ERP), sectoral consulting, smart contracts, and contract management.
Current user language: ${currentLanguage}. Respond in this language.
CRITICAL DISCLAIMER: You are an AI assistant. You CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. Your responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.`;
    createNewChatSession(currentGeneralChatInstruction);
    const systemMessages: ChatMessage[] = [
      {
        id: `sys-clear-${Date.now()}`,
        text: T.chat_systemMessageEndedFocusedChat,
        sender: 'ai',
        timestamp: new Date(),
        type: 'message',
      },
      { 
        id: `ai-init-${Date.now()}-clear`,
        text: T.chat_prompt,
        sender: 'ai',
        timestamp: new Date(),
        type: 'message',
      }
    ];
    setChatMessages(systemMessages);
  }, [T, currentLanguage]); 

  const handleSendMessage = async (message: string, context?: SearchResultItem) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'message',
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setChatError(null);

    try {
      const currentContext = context || activeChatResult || undefined;
      // Ensure chat session is correctly initialized with appropriate system instruction
      if (currentContext && (!activeChatResult || activeChatResult.id !== currentContext.id)) {
         const systemInstruction = `You are Audit.Web4 AI, an Audit & Business Solutions informational assistant. The user is specifically asking for information about the following resource:
Title: "${currentContext.title}"
Source URL: ${currentContext.url}
Focus your answers on providing GENERAL INFORMATION related to this specific resource, which could be about auditing, SME SaaS, consulting, contracts, etc.
Current user language: ${currentLanguage}. Respond in this language.
CRITICAL DISCLAIMER: You are an AI assistant. You CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. Your responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.`;
        createNewChatSession(systemInstruction);
      } else if (!currentContext) { 
         const currentGeneralChatInstruction = `You are Audit.Web4 AI, an Audit & Business Solutions informational assistant.
You provide GENERAL INFORMATION on auditing, SME SaaS (CRM, ERP), sectoral consulting, smart contracts, and contract management.
Current user language: ${currentLanguage}. Respond in this language.
CRITICAL DISCLAIMER: You are an AI assistant. You CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. Your responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.`;
        createNewChatSession(currentGeneralChatInstruction); 
      }
      // If currentContext and activeChatResult are the same and valid, the existing chat session with its focused instruction is maintained.
      
      const aiResponseText = await sendMessageToChat(message, currentContext); 
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: aiResponseText, // Disclaimer is appended by sendMessageToChat
        sender: 'ai',
        timestamp: new Date(),
        type: 'message',
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg = (err as Error).message || 'An unknown error occurred in chat.';
      setChatError(errorMsg);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        text: `Error: ${errorMsg}. Please try rephrasing your question. Remember, this is for informational purposes ONLY. Always verify critical information and consult qualified experts.`,
        sender: 'ai', 
        timestamp: new Date(),
        type: 'message',
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-ew-background text-ew-text-primary">
      <div className="sticky top-0 z-50 bg-ew-background shadow-lg">
        <Header logo={APP_CONFIG.header.logo} subtitle={T.headerSubtitle}>
           <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
        </Header>
        <PromotionalBanner bannerText={T.promotionalBanner} />
      </div>
      
      <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isResultsExpanded ? 'overflow-hidden' : ''}`}>
        <SearchBar 
            onSearch={handleSearch} 
            isLoading={isLoadingSearch} 
            placeholder={T.searchBarPlaceholder}
            buttonText={T.searchButton}
            buttonLoadingText={T.searchButtonLoading}
        />
        
        {APP_CONFIG.categoriesPosition === 'belowSearchBar' && (
          <CategoryPills 
            onCategorySelect={handleCategorySelect} 
            isLoading={isLoadingSearch}
            categories={APP_CONFIG.categories} 
            label={T.categoriesLabel}
          />
        )}
        
        <FeatureTags 
            tags={APP_CONFIG.featureTags} 
            label={T.featureTagsLabel}
        />

        {showResultsSection && (
          <div 
            id="results-chat-container"
            className={`
              ${isResultsExpanded 
                ? 'fixed inset-0 bg-ew-background z-40 p-4 flex flex-col' 
                : 'mt-8 relative'
              }
              transition-all duration-300 ease-in-out
            `}
            aria-live="polite"
          >
            <div 
              className={`flex items-center mb-4 
                ${isResultsExpanded ? 'justify-end sticky top-0 bg-ew-background py-2 z-50 border-b border-ew-primary border-opacity-20' : 'justify-between'}
              `}
            >
              {!isResultsExpanded && (
                <h2 className="text-3xl font-bold text-ew-primary">
                  {searchTerm ? `${T.searchResults_AIOverviewTitle}: "${searchTerm}"` : T.searchResults_AIOverviewTitle}
                </h2>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsResultsExpanded(!isResultsExpanded)}
                  className="p-2 text-ew-primary hover:bg-ew-primary hover:bg-opacity-10 rounded-md"
                  title={isResultsExpanded ? "Restore View" : "Expand View"}
                  aria-label={isResultsExpanded ? "Restore View from full screen" : "Expand Results and Chat to full screen"}
                >
                  {isResultsExpanded ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setShowResultsSection(false); setIsResultsExpanded(false); }}
                  className="p-2 text-ew-primary hover:bg-ew-primary hover:bg-opacity-10 rounded-md"
                  title="Close Results & Chat"
                  aria-label="Close results and chat section"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div 
              className={
                isResultsExpanded 
                ? 'flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-ew-primary scrollbar-track-transparent' 
                : '' 
              }
            >
              <SearchResults
                results={searchResults}
                overallSummary={overallSummary}
                isLoading={isLoadingSearch}
                error={searchError}
                displayedCount={displayedResultsCount}
                onShowMore={handleShowMoreResults}
                onResultAction={handleResultAction}
                isExpandedView={isResultsExpanded}
                T={T} 
              />
              
              <div id="chat-section-wrapper" className={`${isResultsExpanded ? 'mt-8 pb-4' : 'mt-12'}`}>
                {!isResultsExpanded && <hr className="border-ew-primary border-opacity-30 my-8"/>}
                <ChatSection
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isChatLoading}
                  activeChatResult={activeChatResult}
                  clearActiveChatResult={clearActiveChatResultContext}
                  suggestedQuestions={suggestedQuestions}
                  isGeneratingQuestions={isGeneratingQuestions}
                  onSuggestedQuestionClick={(questionText) => {
                      const contextForResult = activeChatResult; 
                      handleSendMessage(questionText, contextForResult || undefined)
                  }}
                  isExpandedView={isResultsExpanded}
                  T={T} 
                />
                {chatError && !isChatLoading && <p className="text-red-400 text-center mt-2 bg-red-900 bg-opacity-20 p-2 rounded">{chatError}</p>}
              </div>
            </div>
          </div>
        )}
        
        {!showResultsSection && searchTerm && (searchResults.length > 0 || searchError || isLoadingSearch) && (
            <div className="text-center mt-12">
                <button
                    onClick={() => setShowResultsSection(true)}
                    className="px-6 py-3 bg-ew-primary text-ew-background font-semibold rounded-md hover:opacity-90 transition-opacity"
                    aria-label={`Show results for ${searchTerm}`}
                >
                    {isLoadingSearch ? T.searchResults_searchingInsightsText : `${T.searchResults_showMoreButtonLabel} for "${searchTerm}"`}
                </button>
            </div>
        )}
      </main>

      <footer className={`py-8 text-center bg-ew-card text-ew-text-secondary text-sm ${isResultsExpanded ? 'hidden' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h3 className="text-lg text-ew-text-primary mb-3 font-semibold">{T.footer_industryLeadersTitle}</h3>
            <LogoCarousel logos={DUMMY_COMPANY_LOGOS.map(logo => <span key={logo}>{logo}</span>)} />
          </div>
          <div className="mb-6 mt-8">
            <a
              href="https://audit.web4.com" // Placeholder link for Audit.Web4
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-ew-primary text-ew-background px-8 py-3 font-semibold rounded-lg shadow-lg hover:bg-opacity-80 transition-colors text-lg"
            >
              {T.footer_discoverButtonText}
            </a>
          </div>
          <p className="mb-1">&copy; {new Date().getFullYear()} {APP_CONFIG.header.logo}. All rights reserved.</p>
          <p className="mb-2 text-xs text-ew-text-secondary opacity-80">
            <strong>CRITICAL DISCLAIMER:</strong> Audit.Web4 is an AI-powered informational platform for discovering resources on Auditing, SME SaaS, Business Consulting, and Contract Management. 
            Information provided is for general research and informational purposes ONLY. It is <strong>NOT</strong> auditing opinions, accounting advice, financial advice, legal advice, specific business consulting recommendations, or software implementation guidance. 
            This platform <strong>CANNOT</strong> and <strong>DOES NOT</strong> replace consultation with qualified professionals. 
            <strong>You MUST independently verify all critical information and consult with qualified experts (e.g., CPAs, certified auditors, financial advisors, lawyers, specialized business/IT consultants) for any specific advice or before making any business, financial, legal, or software implementation decisions.</strong> Do not rely on any information provided by this platform as a substitute for professional counsel or official verified information. This platform does not guarantee accuracy for rapidly changing data, regulations, or software specifications.
          </p>
          <p>{T.footer_poweredByText}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
