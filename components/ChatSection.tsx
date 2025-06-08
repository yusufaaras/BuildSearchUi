

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, SearchResultItem, SuggestedQuestion, ViewAdaptableProps, TranslatedStrings } from '../types';
import { APP_CONFIG } from '../constants'; // For button style
import SendIcon from './icons/SendIcon';
import ChatIcon from './icons/ChatIcon'; 

interface ChatSectionProps extends ViewAdaptableProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, context?: SearchResultItem) => Promise<void>;
  isLoading: boolean; 
  activeChatResult?: SearchResultItem | null;
  clearActiveChatResult: () => void;
  suggestedQuestions: SuggestedQuestion[];
  isGeneratingQuestions: boolean;
  onSuggestedQuestionClick: (questionText: string) => void;
  T: TranslatedStrings;
}

const INITIAL_SUGGESTED_DISPLAY_COUNT = 7;

const ChatSection: React.FC<ChatSectionProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  activeChatResult,
  clearActiveChatResult,
  suggestedQuestions,
  isGeneratingQuestions,
  onSuggestedQuestionClick,
  isExpandedView,
  T,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestedQuestionsContainerRef = useRef<HTMLDivElement>(null);
  const [showAllSuggestedQuestions, setShowAllSuggestedQuestions] = useState(false);


  const chatTitle = activeChatResult 
    ? T.chat_titleFocused(activeChatResult.title)
    : T.chat_title;
  
  const inputPlaceholder = activeChatResult
    ? T.chat_inputPlaceholderFocused(activeChatResult.title)
    : T.chat_inputPlaceholder;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Reset the "show more" state when the list of suggested questions changes
    // (e.g., when activeChatResult changes and new questions are loaded)
    setShowAllSuggestedQuestions(false);
  }, [suggestedQuestions]);


  const handleSend = async (messageToSend?: string) => {
    const currentMessage = (typeof messageToSend === 'string' ? messageToSend : input).trim();
    if (currentMessage) {
      setInput(''); 
      await onSendMessage(currentMessage, activeChatResult || undefined);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleSuggestedQuestionClick = (questionText: string) => {
    onSuggestedQuestionClick(questionText);
  };

  const displayedSuggestedQs = showAllSuggestedQuestions 
    ? suggestedQuestions 
    : suggestedQuestions.slice(0, INITIAL_SUGGESTED_DISPLAY_COUNT);
  
  // Responsive height for chat section:
  // Mobile default: h-[65vh] max-h-[65vh]
  // SM and up default: h-[700px] max-h-[80vh]
  // Expanded view: h-auto min-h-[400px] (or lg:min-h-[500px] if activeChatResult)
  const chatSectionHeightClasses = isExpandedView 
    ? `h-auto min-h-[400px] ${activeChatResult ? 'lg:min-h-[500px]' : ''}`
    : 'h-[65vh] max-h-[65vh] sm:h-[700px] sm:max-h-[80vh]';

  return (
    <div 
      className={`p-6 bg-ew-card rounded-lg shadow-xl flex flex-col 
        ${chatSectionHeightClasses}
      `}
      role="log" 
      aria-live="polite"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-ew-primary truncate pr-2" title={chatTitle} id="chat-title">{chatTitle}</h2>
        {activeChatResult && (
           <button 
            onClick={clearActiveChatResult} 
            className="text-sm text-ew-accent hover:underline flex-shrink-0"
            aria-label={T.chat_endFocusedChatLabel}
          >
            {T.chat_endFocusedChatLabel}
          </button>
        )}
      </div>

      {activeChatResult && (
        <div className="mb-3 border-b border-ew-primary border-opacity-20 pb-3">
          {isGeneratingQuestions && (
            <div className="text-ew-text-secondary text-sm flex items-center" role="status">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ew-primary mr-2"></div>
              {T.chat_loadingSuggestedQuestionsLabel}
            </div>
          )}
          {!isGeneratingQuestions && suggestedQuestions.length > 0 && (
            <div>
              <p className="text-sm text-ew-text-secondary mb-1.5" id="suggested-questions-label">{T.chat_suggestedQuestionsLabel}</p>
              <div ref={suggestedQuestionsContainerRef} className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-ew-primary scrollbar-track-transparent" aria-labelledby="suggested-questions-label" role="toolbar">
                {displayedSuggestedQs.map((sq) => (
                  <button
                    key={sq.id}
                    onClick={() => handleSuggestedQuestionClick(sq.text)}
                    className="flex-shrink-0 bg-ew-primary bg-opacity-20 text-ew-primary whitespace-nowrap text-xs px-3 py-1.5 rounded-full hover:bg-ew-primary hover:text-ew-background transition-colors border border-ew-primary border-opacity-50"
                    title={sq.text}
                    aria-label={`Ask: ${sq.text}`}
                  >
                    {sq.text.length > 50 ? sq.text.substring(0, 47) + "..." : sq.text}
                  </button>
                ))}
                {!showAllSuggestedQuestions && suggestedQuestions.length > INITIAL_SUGGESTED_DISPLAY_COUNT && (
                  <button
                    onClick={() => setShowAllSuggestedQuestions(true)}
                    className="flex-shrink-0 bg-ew-primary bg-opacity-30 text-ew-primary whitespace-nowrap text-xs px-3 py-1.5 rounded-full hover:bg-ew-primary hover:text-ew-background transition-colors border border-ew-primary border-opacity-50"
                    title={T.chat_showMoreSuggestedQuestionsLabel(suggestedQuestions.length - INITIAL_SUGGESTED_DISPLAY_COUNT)}
                    aria-label={T.chat_showMoreSuggestedQuestionsLabel(suggestedQuestions.length - INITIAL_SUGGESTED_DISPLAY_COUNT)}
                  >
                    {T.chat_showMoreSuggestedQuestionsLabel(suggestedQuestions.length - INITIAL_SUGGESTED_DISPLAY_COUNT)}
                  </button>
                )}
              </div>
            </div>
          )}
           {!isGeneratingQuestions && suggestedQuestions.length === 0 && activeChatResult && !messages.find(m => m.text.includes("Sorry, I couldn't generate suggested questions")) && (
             <p className="text-ew-text-secondary text-sm">{T.chat_noSuggestionsGeneratedLabel}</p>
           )}
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4 scrollbar-thin scrollbar-thumb-ew-primary scrollbar-track-transparent" aria-labelledby="chat-title">
        {messages.length === 0 && !activeChatResult && (
          <div className="text-center text-ew-text-secondary opacity-75 mt-10">
            <ChatIcon className="w-16 h-16 mx-auto mb-4 text-ew-primary opacity-50" aria-hidden="true" />
            <p>{T.chat_prompt}</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            role="listitem"
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg shadow ${
                msg.sender === 'user'
                  ? 'bg-ew-primary text-ew-background'
                  : 'bg-[#0d2055] text-ew-text-primary'
              } ${msg.sender === 'system' ? 'bg-opacity-50 text-center w-full max-w-full text-sm' : ''}`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              {msg.sender !== 'system' && (
                <p className="text-xs opacity-70 mt-1 text-right">
                  <time dateTime={msg.timestamp.toISOString()}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user' && (
             <div className="flex justify-start" role="status" aria-label={T.chat_aiTypingLabel}>
                <div className="max-w-[70%] p-3 rounded-lg shadow bg-[#0d2055] text-ew-text-primary">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-ew-primary rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-ew-primary rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-ew-primary rounded-full animate-pulse delay-300"></div>
                        <span className="text-sm">{T.chat_aiTypingLabel}</span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-4 border-t border-ew-primary border-opacity-30" role="form" aria-label="Chat input form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          className="flex-grow p-3 bg-[#0d2055] text-ew-text-primary border border-ew-primary rounded-md focus:ring-2 focus:ring-ew-accent focus:border-ew-accent outline-none placeholder-ew-text-secondary"
          disabled={isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user'}
          aria-label={inputPlaceholder}
          aria-describedby={activeChatResult ? "suggested-questions-label" : undefined}
        />
        <button
          type="submit"
          style={{ // Style from APP_CONFIG as it's visual theme
            backgroundColor: APP_CONFIG.chatSection.sendButton.background,
            color: APP_CONFIG.chatSection.sendButton.color,
          }}
          className="p-3 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user'}
          aria-label="Send message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatSection;