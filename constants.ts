
import { AppConfig, ResultAction, GeminiSafetySetting, Language } from './types';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

// This configuration is based on the user's provided JSON
// It now serves as the 'en' (English) default or fallback.
export const APP_CONFIG: AppConfig = {
  theme: {
    background: "#0a174e",
    primary: "#00cfff",
    card: "#152a5f",
    textPrimary: "#e0f7ff",
    textSecondary: "#d9e2ec",
    accent: "#00cfff"
  },
  header: {
    logo: "Audit.Web4", // Updated
    subtitle: "Your AI-Powered Gateway to Audit & Business Solutions Insights (Research Only. Verify Info. Not Specific Professional Advice.)", // translatable
  },
  searchBar: {
    placeholder: "Explore Auditing, SME SaaS, Consulting, Contracts... (Info Only)", // translatable
    icon: "mic",
    buttonStyle: {
      background: "#00cfff",
      color: "#0a174e"
    }
  },
  categories: [ // Updated for Audit & Business Solutions Scope
    "Auditing Firms & Internal Audit Tools",
    "SME SaaS Solutions (CRM, ERP)",
    "Sectoral Business Consulting Services",
    "Smart Contracts & Contract Management Systems",
    "Financial Audit & Assurance (Information)",
    "IT Audit & Cybersecurity Auditing (Concepts)",
    "Cloud-Based Business Applications",
    "Regulatory Technology (RegTech) Solutions"
  ],
  categoriesLabel: "Explore Audit & Business Solutions:", // translatable
  categoriesPosition: "belowSearchBar",
  categoryBehavior: {
    onClick: "performAISearch",
    searchQuery: "categoryName"
  },
  featureTags: [ // Updated for Audit & Business Solutions Scope
    "AI in Auditing & Compliance",
    "Cloud ERP & CRM for SMEs",
    "Blockchain & Smart Contract Applications",
    "Data Analytics in Business Consulting",
    "Robotic Process Automation (RPA) in Audit",
    "GRC (Governance, Risk, Compliance) Platforms"
  ],
  featureTagsLabel: "Featured Audit & BizTech Innovations:", // translatable
  searchResults: {
    initialCount: 5,
    maxCount: 33,
    resultCard: {
      background: "#152a5f",
      border: "1px solid #00cfff",
      borderRadius: "12px",
      margin: "8px 0",
      padding: "16px",
      textColor: "#e0f7ff",
      summaryFontWeight: 400,
      iconColor: "#00cfff"
    },
    resultItem: { 
      title: "Result Title",
      summary: "Audit & Business Solutions information. For informational purposes ONLY. This platform DOES NOT provide auditing opinions, accounting, financial, legal, or specific business/software advice. ALWAYS verify critical information and consult qualified professionals.",
      actions: [] // Populated by RESULT_CARD_ACTIONS
    },
    moreResultsButton: {
      label: "Show More Business Insights", // translatable
      icon: "expand",
      style: {
        background: "transparent",
        color: "#00cfff",
        border: "1px solid #00cfff"
      }
    },
    aiOverviewTitle: "Audit & Business Solutions Overview", // translatable
    noResultsYetTitle: "No Audit or Business information found yet for your query.", // translatable
    noResultsYetSubtitle: "Try a new search or select a category. This platform is for informational purposes ONLY. ALWAYS verify critical information and consult qualified professionals.", // translatable
    searchingInsightsText: "Searching for Audit & Business insights...", // translatable
  },
  chatSection: {
    title: "Audit.Web4 Business Resource Finder", // translatable
    prompt: "Welcome to Audit.Web4! I can help find information on auditing, SME SaaS, consulting, and contract management. How can I assist? CRITICAL: I'm an AI assistant. I CANNOT provide professional advice (auditing, financial, legal, implementation), guarantees, or endorsements. My responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.", // translatable
    inputPlaceholder: "Ask about Auditing, SaaS, Consulting... (Info Only)", // translatable
    sendButton: {
      icon: "send",
      background: "#00cfff",
      color: "#0a174e"
    },
    endFocusedChatLabel: "End Focused Audit & Biz Info Chat", // translatable
    suggestedQuestionsLabel: "Suggested questions for your Audit & Business exploration:", // translatable
    loadingSuggestedQuestionsLabel: "Loading Audit & Business insights...", // translatable
    noSuggestionsGeneratedLabel: "No specific suggestions generated. Ask general questions about auditing or business solutions. Remember, this is for informational purposes ONLY. Always verify critical information and consult qualified experts.", // translatable
    aiTypingLabel: "AI is typing...", // translatable
    showMoreSuggestedQuestionsLabel: "Show More ({count})", // translatable
  },
  userExperience: {
    closeResult: "Each result card has an 'X' icon for instant removal.",
    showMore: "Users can expand to see up to 33 results per query.",
    newSearch: "Start a new smart search at any time.",
    responsive: true,
    accessibility: true,
    multiLanguage: true 
  },
  promotion: {
    banner: "Explore Audit.Web4: Your AI guide to Auditing & Business Solutions. Research Only. Verify Info. Not Specific Professional Advice." // translatable
  },
  footer: {
    industryLeadersTitle: "Key Audit & Business Solution Providers", // translatable
    discoverButtonText: "Discover Audit.Web4", // translatable
    poweredByText: "Powered by Web4.0 os Platform WY.USA" // translatable
  }
};

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

export const GEMINI_SAFETY_SETTINGS: GeminiSafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }, 
];

// LabelKeys will be translated in translations.ts
export const RESULT_CARD_ACTIONS: ResultAction[] = [
  { type: "chat", labelKey: "chat", icon: "chat" }, 
  { type: "link", labelKey: "link", icon: "link" }, 
  { type: "pdf", labelKey: "pdf", icon: "filePdf" }, // e.g., "Audit Reports Info/Whitepapers"
  { type: "catalog", labelKey: "catalog", icon: "bookOpen" }, // e.g., "SaaS Features/Service Overviews"
  { type: "image", labelKey: "image", icon: "image" }, 
  { type: "news", labelKey: "news", icon: "newspaper" }, 
  { type: "social", labelKey: "social", icon: "globeAlt" }, 
  { type: "close", labelKey: "close", icon: "x" } 
];

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: "tr", name: "Türkçe" },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文 (简体)' }, // Chinese (Simplified)
  { code: 'ja', name: '日本語' }, // Japanese
  { code: 'ko', name: '한국어' }, // Korean
  { code: 'ar', name: 'العربية' }, // Arabic
  { code: 'ru', name: 'Русский' }, // Russian
  { code: 'pt', name: 'Português' }, // Portuguese
  { code: 'it', name: 'Italiano' }, // Italian
  { code: 'hi', name: 'हिन्दी' }, // Hindi
  { code: 'nl', name: 'Nederlands' }, // Dutch
  { code: 'sv', name: 'Svenska' }, // Swedish
];

export const DEFAULT_LANGUAGE_CODE = 'en';
