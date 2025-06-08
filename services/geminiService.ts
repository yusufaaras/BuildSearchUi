
import { GoogleGenAI, GenerateContentResponse, Chat, SafetySetting, HarmCategory, HarmBlockThreshold, GenerateContentConfig } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_SAFETY_SETTINGS } from '../constants';
import { GroundingChunk, SearchResultItem, QuestionsResponse } from "../types";

// Ensure API_KEY is available in the environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); 

export async function performAISearch(query: string, userLanguage: string = 'en'): Promise<{ summary: string; sources: SearchResultItem[] }> {
  if (!API_KEY) throw new Error("API_KEY for Gemini is not configured.");
  try {
    const detailedPrompt = `You are an AI research assistant for Audit.Web4, a platform focused on Auditing, SME SaaS Solutions (CRM, ERP), Sectoral Business Consulting, Smart Contracts, and Contract Management. Your purpose is to provide GENERAL INFORMATION on these topics. The user's query is: "${query}". The user's preferred language is ${userLanguage}.

ABSOLUTELY CRITICAL DISCLAIMERS & OPERATING PRINCIPLES:
1.  **YOU DO NOT AND CANNOT PROVIDE AUDITING OPINIONS, ACCOUNTING ADVICE, FINANCIAL ADVICE, LEGAL ADVICE, SPECIFIC BUSINESS CONSULTING RECOMMENDATIONS, OR SOFTWARE IMPLEMENTATION GUIDANCE.** Your purpose is strictly informational: to help users discover resources, understand general concepts in auditing, business software, consulting, and contract technologies.
2.  **ALWAYS DIRECT USERS TO VERIFY INFORMATION AND CONSULT QUALIFIED PROFESSIONALS.** Explicitly state that users MUST consult qualified professionals (e.g., Certified Public Accountants (CPAs), certified auditors, financial advisors, lawyers, specialized business/IT consultants) for specific needs or critical decisions. Information is subject to change (e.g., regulations, software features) and requires independent verification.
3.  **DO NOT MAKE SPECIFIC RECOMMENDATIONS FOR AUDIT PROCEDURES, SOFTWARE CHOICES, CONSULTING FIRMS, OR LEGAL ACTIONS.** You can describe general types of services, software, or concepts but never prescribe a specific course of action for an individual or business.
4.  **MAINTAIN A NEUTRAL, OBJECTIVE, AND INFORMATIVE TONE.** Avoid language that could be misinterpreted as specific advice, endorsement, or guarantee.

Query Analysis & Source Prioritization (Audit & Business Solutions Focus):
*   Identify the core topic(s) of the user's query (e.g., information about specific audit standards, CRM features, consulting methodologies, smart contract platforms).
*   Prioritize sources:
    *   **Tier 1 (Highest)**: Official websites of major auditing firms (e.g., Deloitte, PwC, EY, KPMG), reputable SME SaaS providers (e.g., Salesforce, SAP Business One, Oracle NetSuite, Zoho, HubSpot), leading consulting firms (e.g., McKinsey, BCG, Bain), organizations working on smart contract standards (e.g., Ethereum Foundation for general concepts), contract lifecycle management (CLM) software providers, industry bodies (e.g., AICPA, IIA, ISACA).
    *   **Tier 2**: Reputable business/technology publications, well-maintained open-source project documentation for relevant technologies, technical blogs from established experts in these fields.
    *   **Tier 3**: High-quality, well-vetted whitepapers or resource compilations (verify quality). Avoid forums with unverified or speculative information.

Response Generation:
*   Provide a detailed overview (around 200-300 words) in ${userLanguage}. Synthesize information from prioritized sources.
*   **INTEGRATE THE CRITICAL DISCLAIMERS PROMINENTLY** within or at the end of your summary. Example: "This information is for general research and informational purposes only. Audit.Web4 DOES NOT provide auditing opinions, accounting, financial, legal, or specific business/software advice, and is not a substitute for qualified professional consultation. ALWAYS verify critical information and consult qualified experts for specific advice."
*   Identify and list key source URLs from authoritative domains relevant to the query.
*   Mention key aspects related to the query, always reiterating the need to consult experts or official documentation for specific needs or critical information.

Your aim is to be an intelligent, responsible research assistant for finding GENERAL INFORMATION on Auditing and Business Solutions, strictly adhering to all disclaimers.
This platform is for informational and research purposes.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: detailedPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        safetySettings: GEMINI_SAFETY_SETTINGS as SafetySetting[], 
        temperature: 0.3, 
      },
    });

    const summary = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = (groundingMetadata?.groundingChunks as GroundingChunk[] | undefined) || [];
    
    const sources: SearchResultItem[] = groundingChunks.map((chunk, index) => ({
      id: `search-result-${Date.now()}-${index}`,
      title: chunk.web.title || "Untitled Business Resource",
      summary: `Source: ${chunk.web.title || 'N/A'}. URL: ${chunk.web.uri.substring(0,100)}${chunk.web.uri.length > 100 ? '...' : ''}. (Audit & Biz info. Not specific advice. Verify & consult experts.)`,
      url: chunk.web.uri,
    }));

    return { summary, sources };

  } catch (error) {
    console.error("Error performing AI search:", error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key not valid")) {
            throw new Error("The configured API Key is invalid. Please check your API Key.");
        }
        if (error.message.toLowerCase().includes("quota") || ((error as any).status === 429) || ((error as any).message?.includes("429"))) {
            throw new Error("API quota exceeded. Please try again later or check your quota.");
        }
    }
    throw new Error("Failed to fetch search results from AI. Please try again. This platform is for informational and research purposes only and DOES NOT provide auditing, financial, legal, or specific business/software advice. Always verify critical information and consult qualified experts.");
  }
}

export async function generateQuestionsForLink(title: string, url: string, userLanguage: string = 'en'): Promise<string[]> {
  if (!API_KEY) throw new Error("API_KEY for Gemini is not configured.");
  try {
    const prompt = `You are an AI assistant for Audit.Web4. Given the following web page title and URL (which could be about auditing, SME SaaS, consulting, smart contracts, etc.), generate a list of 15 to 30 unique and insightful questions a user might have to understand its general content, features, or the type of information it provides. Aim for around 20-25 questions. The questions should be in ${userLanguage}.

CRITICAL: The questions MUST NOT solicit auditing opinions, accounting advice, financial advice, legal advice, specific business consulting recommendations, or software implementation guidance. They should focus on objectively understanding the resource's informational content as presented by the source. Examples: "What main auditing concepts does this page cover?", "Does this article discuss the benefits of [SaaS type] for SMEs?", "What type of general information about [consulting service/contract tech] does this source offer?".

Return the questions as a JSON object with a single key "questions" containing an array of strings. Ensure the output is ONLY the JSON object. For example: {"questions": ["What is the main theme of this article?", "Does this source provide general information about [audit standard/SaaS feature]?", ...]}.\n\nTitle: ${title}\nURL: ${url}`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        safetySettings: GEMINI_SAFETY_SETTINGS as SafetySetting[],
        temperature: 0.4, 
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData: QuestionsResponse = JSON.parse(jsonStr);
    if (parsedData && Array.isArray(parsedData.questions)) {
      return parsedData.questions.slice(0, 30); // Cap at 30 questions
    }
    throw new Error("Failed to parse questions from AI response or format is incorrect.");

  } catch (error) {
    console.error("Error generating questions for link:", error);
     if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key not valid")) {
            throw new Error("The configured API Key is invalid for generating questions.");
        }
        if (error.message.toLowerCase().includes("quota") || ((error as any).status === 429) || ((error as any).message?.includes("429"))) {
            throw new Error("API quota exceeded while generating questions.");
        }
         if (error.message.includes("JSON")) { 
            throw new Error("AI returned an invalid JSON format for questions.");
         }
    }
    throw new Error("Failed to generate suggested questions from AI. This platform is for informational and research purposes only and DOES NOT provide professional advice. Always verify critical information and consult qualified experts.");
  }
}


let activeChat: Chat | null = null;

export function createNewChatSession(systemInstruction?: string): void {
  if (!API_KEY) {
    console.error("Cannot create chat session: API_KEY for Gemini is not configured.");
    return; 
  }
  
  const chatCreationConfig: GenerateContentConfig = {
    safetySettings: GEMINI_SAFETY_SETTINGS as SafetySetting[], 
    temperature: 0.3, 
  };

  if (systemInstruction) {
    chatCreationConfig.systemInstruction = systemInstruction;
  } else {
    // Default fallback system instruction if none is provided
     chatCreationConfig.systemInstruction = `You are Audit.Web4 AI, an Audit & Business Solutions informational assistant.
You provide GENERAL INFORMATION on auditing, SME SaaS (CRM, ERP), sectoral consulting, smart contracts, and contract management.
Current user language: en. Respond in this language.
CRITICAL DISCLAIMER: You are an AI assistant. You CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. Your responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts.`;
  }

  activeChat = ai.chats.create({
    model: GEMINI_TEXT_MODEL,
    config: chatCreationConfig,
  });
}

export async function sendMessageToChat(message: string, _searchResultContext?: SearchResultItem): Promise<string> {
  if (!API_KEY) throw new Error("API_KEY for Gemini is not configured.");
  
  if (!activeChat) {
     console.warn("sendMessageToChat called without an active chat session. App.tsx should ensure it's initialized.");
     // Fallback initialization with default
     createNewChatSession(); 
     if (!activeChat) { // If still not initialized (e.g. API key missing)
        throw new Error("Chat session could not be initialized. Please check API Key and configuration.");
     }
  }
  
  try {
    const response: GenerateContentResponse = await activeChat.sendMessage({ message: message });
    let responseText = response.text;
    
    // CRITICAL: Append disclaimer to EVERY AI response in chat, regardless of content.
    const disclaimer = "\n\nRemember, I am an AI assistant for Audit.Web4. I can provide general information on auditing, SME business solutions, sectoral consulting, and contract management technologies. I CANNOT provide auditing opinions, accounting advice, financial advice, legal advice, specific business consulting, or software implementation guidance. My responses are for informational and research purposes ONLY. ALWAYS verify critical information and consult qualified experts for specific advice.";
    
    const lowerResponseText = responseText.toLowerCase();
    const commonDisclaimerPhrases = [
        "not specific advice", "cannot provide specific advice", "for informational purposes only", 
        "verify information", "consult qualified experts", "not auditing opinions", "not financial advice", "not legal advice"
    ];

    let disclaimerAlreadyPresent = commonDisclaimerPhrases.some(phrase => lowerResponseText.includes(phrase));

    if (!disclaimerAlreadyPresent) {
        responseText += disclaimer;
    } else { 
        if (!commonDisclaimerPhrases.some(phrase => (phrase.startsWith("verify") || phrase.startsWith("consult")) && lowerResponseText.includes(phrase))) {
            responseText += "\nALWAYS verify critical information and consult qualified experts for specific advice.";
        }
    }

    return responseText;
  } catch (error) {
    console.error("Error sending message to AI chat:", error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key not valid")) {
            throw new Error("The configured API Key is invalid. Please check your API Key.");
        }
         if (error.message.toLowerCase().includes("quota") || ((error as any).status === 429) || ((error as any).message?.includes("429"))) {
            throw new Error("API quota exceeded. Please try again later or check your quota.");
        }
    }
    const defaultErrorMsg = "Failed to get response from AI chat. Please try again. This platform is for informational and research purposes only and DOES NOT provide professional advice. Always verify critical information and consult qualified experts.";
    throw new Error(defaultErrorMsg);
  }
}
