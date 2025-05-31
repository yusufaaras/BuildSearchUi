// API endpoint ve anahtarlar
const analyticsEndpoint = "https://nlweb.cognitiveservices.azure.com/";
const analyticsKey = "2dv6SQUJoCgsZuu1G3YCz5nkcGdzqMWYj7WLici2pLgzMWPJhCBlJQQJ99BEACYeBjFXJ3w3AAAEACOGPvoX";
const openaiKey = "11x9IG7HZkyphyxj7I41UPWOshDNpWJAvUdiuUeVoxnMy6CPsY5cJQQJ99BDACYeBjFXJ3w3AAAAACOGQMYE";
const openaiEndpoint = "https://ai-gptai749384661431.openai.azure.com/openai/deployments/Phi-4-multimodal-instruct/chat/completions?api-version=2024-05-01-preview";

// Google Custom Search
const apiKey = "AIzaSyDaHV-YfOjdRIcl7gFhLpU61Ev88XI6hQ4";
const cx = "c0ed3e4fd6f094129";

// System prompt
const systemPrompt = `
---
**Formatting Rules (Very Important):
- Always use markdown tables, bullet lists, and the following icons in headings: ✨, 💡, 📌, 🚀, ⭐, ✅, ➡️, 📊, 🌐, 📚
- Start section headings with '' or '' and add one of the above icons in front.
- Use  or - for bullet lists.
- Provide tables as markdown tables (e.g. | Header1 | Header2 | ... |).
- Write links as [Link Title](url).
- Example layout:
    💡 Smart Tips

    - Choose energy-efficient materials.
    - Work with trusted suppliers.

    | Material | Feature | Supplier |
    |----------|---------|----------|
    | Concrete | High strength | CompanyA |
    | Steel    | Lightweight, Durable | CompanyB |

    More info: [Google](https://google.com)
---

1. Company-Based Conversation
based on the NLWeb results this company has the following details owners partnership structure offered services and active locations can you analyze what type of services the company provides how it positions itself and who it competes with

who are the owners of this company in which markets is it active and which services does it specialize in please explain based on the extracted web data

2. Product & Technical Info Conversation
based on the technical documents available online what does [PRODUCT NAME] do what problems does it solve and which customer segments is it designed for

according to the product specifications PDF files and catalog content who is this product ideal for and how does it differentiate from competitors

3. Competitor Comparison & Recommendations
using the data retrieved from NLWeb compare [COMPANY A] and [COMPANY B] which products dominate which markets and why

according to the competitor analysis what are the most recommended solutions which ones are preferred by users and what are the reasons behind this preference

4. User-Oriented Evaluation
I received web data about companies operating in [TOPIC] within the city I want to invest in which of these seem more reliable based on reviews service history and location details

can you evaluate whether this company fits my needs for a real estate project based on web results what kind of potential value can it bring

5. Summary and Deep Analysis
summarize the key insights from NLWeb about the company who they are what they do how they operate which regions they are active in and what others are saying about them

based on the web results provide a detailed summary of the product including its technical features use cases user reviews and reference implementations
User-Friendly and Clear
Speak in a way that users at all levels can understand. Simplify technical terms if they arise.
Explain complex concepts by saying things like: this might sound complicated, but we can think of it like this.
Break down complexity and aim to ease the user's experience, not burden it.

Warm and Natural
Use a conversational tone, not formal language.
Say things like: welcome, that’s a great question, we can work on this together.
Adapt to the user’s emotional tone. Encourage if they’re curious, reassure if they’re anxious, and share the excitement if they’re enthusiastic.

Like a Friend and Companion
Make the user feel they’re not alone.
Rather than handing down knowledge, act like a friend exploring solutions together.
Use supportive phrases like: we can solve this together, let’s try this path together.

Expert and Trustworthy
Show that you are knowledgeable, but never condescending.
Convey professional information in a simple and relatable way.
Use balanced explanations like: the general approach is this, but some experts also suggest that.
If data is uncertain, be honest: there’s no definitive data here, but the most accepted method is this.

Professional and Goal-Oriented
For professional users, provide clear and well-structured responses.
Use bullet points when necessary.
Structure your answer with headings like: quick summary, action steps, risks and opportunities.
Maintain a confident tone, but never be cold—always instill trust.

Supportive and On the User’s Side
Value the user’s need and act like a helpful teammate.
Use supportive phrases like: I can look this up for you, or if you’d like, I can summarize this part.
Save the user time, make decision-making easier.
Offer guidance when needed, but never pressure them.

Emotion, Expertise, and Sector Alignment
Adjust your tone to match the user’s emotional state.
Sense their expertise level and adapt your explanations accordingly.

Use metaphors and simple examples for beginners.
Provide more technical depth for expert users.
When speaking about specific sectors, use relevant jargon—but always explain it clearly.

Solution-Oriented and Inclusive
Don’t just give information—aim to solve problems.
Use constructive responses like: here are two options that might work for you, let’s explore them together.
Treat every question as valuable—never dismiss anything as too simple or too complex.
Always work toward a solution, regardless of the challenge.

Natural Language Behavior Template
I see you're looking for a clear and useful answer. Let's get started right away.

Here’s what we can do:

First, I’ll give a quick summary

Then we can dive into the details

If needed, I can also pull up some extra resources for you
`;

let messageHistory = [
    { role: "system", content: systemPrompt }
];

// Google Custom Search ile webde arama
async function webSearch(query) {
    const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}&num=10`
    );
    const data = await response.json();
    if (!data.items) return [];
    return data.items.map(item => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
    }));
}

// NLWeb ile anahtar kelime çıkarımı (birden fazla snippet için)
async function extractKeyPhrasesBatch(snippets) {
    if (snippets.length === 0) return [];
    const response = await fetch(
        `${analyticsEndpoint}/text/analytics/v3.2-preview.2/keyPhrases`,
        {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": analyticsKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                documents: snippets.map((text, i) => ({
                    id: String(i + 1),
                    language: "tr",
                    text
                }))
            })
        }
    );
    const data = await response.json();
    return (data.documents || []).map(doc => doc.keyPhrases || []);
}

// AI cevabını markdown ve ikonlarla HTML'e dönüştür (daha önce verdiğin gibi)
function formatAiResponse(responseText) {
    let formattedHtml = '';
    const lines = responseText.split('\n').filter(line => line.trim() !== '');

    let inTable = false;
    let tableHeader = [];
    let inList = false;
    let tableBuffer = [];

    const symbols = ['✨', '💡', '📌', '🚀', '⭐', '✅', '➡️', '📊', '🌐', '📚'];
    let symbolIndex = 0;

    lines.forEach(line => {
        if (line.trim().startsWith('|') && line.includes('---')) {
            if (inList) {
                formattedHtml += '</ul>';
                inList = false;
            }
            if (!inTable) {
                inTable = true;
                tableBuffer = [];
                const separatorIndex = lines.indexOf(line);
                if (separatorIndex > 0) {
                    tableHeader = lines[separatorIndex - 1].split('|').map(h => h.trim()).filter(h => h !== '');
                } else {
                    tableHeader = [];
                }
                // tableBuffer'ı başlat, tabloyu henüz yazdırma
                tableBuffer.push('<table class="min-w-full bg-gray-900 rounded-lg overflow-hidden shadow-md mb-4">');
                tableBuffer.push('<thead><tr class="bg-blue-900/20">');
                tableHeader.forEach(header => {
                    tableBuffer.push(`<th class="px-4 py-2 text-left text-blue-300 font-semibold thin-border-blue">${header}</th>`);
                });
                tableBuffer.push('</tr></thead><tbody>');
            }
            return;
        } else if (inTable && line.trim().startsWith('|')) {
            const rowData = line.split('|').map(d => d.trim()).filter(d => d !== '');
            tableBuffer.push('<tr class="thin-border-white">');
            rowData.forEach(data => {
                tableBuffer.push(`<td class="px-4 py-2 thin-border-white text-sm">${data}</td>`);
            });
            tableBuffer.push('</tr>');
        } else if (inTable && !line.trim().startsWith('|')) {
            inTable = false;
            tableBuffer.push('</tbody></table>');
            // Tabloyu kaydırılabilir div ile yazdır!
            formattedHtml += `<div style="overflow-x:auto;">${tableBuffer.join('')}</div>`;
            tableBuffer = [];
            if (line.trim() !== '') {
                formattedHtml += `<p class="mb-2 text-sm">${line}</p>`;
            }
        } else if (line.trim().startsWith('### ')) {
            if (inList) {
                formattedHtml += '</ul>';
                inList = false;
            }
            if (inTable) {
                inTable = false;
                tableBuffer.push('</tbody></table>');
                formattedHtml += `<div style="overflow-x:auto;">${tableBuffer.join('')}</div>`;
                tableBuffer = [];
            }
            const symbol = symbols[symbolIndex % symbols.length];
            symbolIndex++;
            formattedHtml += `<h3 class="text-xl font-semibold text-blue-300 mt-4 mb-2">${symbol} ${line.substring(4).trim()}</h3>`;
        } else if (line.trim().startsWith('## ')) {
            if (inList) {
                formattedHtml += '</ul>';
                inList = false;
            }
            if (inTable) {
                inTable = false;
                tableBuffer.push('</tbody></table>');
                formattedHtml += `<div style="overflow-x:auto;">${tableBuffer.join('')}</div>`;
                tableBuffer = [];
            }
            const symbol = symbols[symbolIndex % symbols.length];
            symbolIndex++;
            formattedHtml += `<h2 class="text-2xl font-bold text-blue-400 mt-6 mb-3">${symbol} ${line.substring(3).trim()}</h2>`;
        } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            if (inTable) {
                inTable = false;
                tableBuffer.push('</tbody></table>');
                formattedHtml += `<div style="overflow-x:auto;">${tableBuffer.join('')}</div>`;
                tableBuffer = [];
            }
            if (!inList) {
                formattedHtml += '<ul class="list-disc list-inside ml-4 mb-2">';
                inList = true;
            }
            formattedHtml += `<li class="text-sm">${line.substring(2).trim()}</li>`;
        } else {
            if (inList) {
                formattedHtml += '</ul>';
                inList = false;
            }
            if (inTable) {
                inTable = false;
                tableBuffer.push('</tbody></table>');
                formattedHtml += `<div style="overflow-x:auto;">${tableBuffer.join('')}</div>`;
                tableBuffer = [];
            }
            if (line.trim() !== '') {
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                let processedLine = line;
                let match;
                while ((match = linkRegex.exec(line)) !== null) {
                    const fullMatch = match[0];
                    const linkText = match[1];
                    const linkUrl = match[2];
                    processedLine = processedLine.replace(fullMatch, `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline text-sm">${linkText}</a>`);
                }
                formattedHtml += `<p class="mb-2 text-sm">${processedLine}</p>`;
            }
        }
    });

    if (inList) {
        formattedHtml += '</ul>';
    }
    if (inTable) {
        inTable = false;
        tableBuffer.push('</tbody></table>');
        formattedHtml += `<div style="overflow-x:auto;">${tableBuffer.join('')}</div>`;
    }

    return formattedHtml;
}

// Modern balonlu gösterim
function displayMessage(sender, textContent) {
    const chatMessages = document.getElementById("chat-messages");
    const messageDiv = document.createElement('div');
    // Satırın sonuna style ekliyoruz:
    if (sender === 'user') {
        messageDiv.className = 'user-bubble max-w-[75%] p-3 ml-auto text-sm';
        // Satıra aşağıdaki style'ı ekle!
        messageDiv.setAttribute("style", "overflow-x:auto;word-break:break-word;");
        messageDiv.innerHTML = `<p>${textContent}</p>`;
    } else {
        messageDiv.className = 'ai-bubble max-w-[75%] p-3 text-sm';
        // Satıra aşağıdaki style'ı ekle!
        messageDiv.setAttribute("style", "overflow-x:auto;word-break:break-word;");
        messageDiv.innerHTML = formatAiResponse(textContent);
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLastBotMessage() {
    const chatMessages = document.getElementById("chat-messages");
    const messages = chatMessages.querySelectorAll(".ai-bubble");
    if (messages.length > 0) {
        messages[messages.length - 1].remove();
    }
}
async function analyzeAndChat(userText) {
    // 1. Web araması
    const webResults = await webSearch(userText);

    // 2. İlk 3 sonucu seç ve snippet'lerini NLWeb'e gönderip anahtar kelime çıkar
    const topSnippets = webResults.slice(0, 3).map(r => r.snippet);
    const keyPhrasesArray = await extractKeyPhrasesBatch(topSnippets);

    // 3. Kaynakları ve anahtar kelimeleri AI'a ilet
    const webContext = webResults.slice(0, 3).map(
        (r, i) => `- [${r.title}](${r.link}): ${r.snippet} _(Anahtar kelimeler: ${keyPhrasesArray[i]?.join(', ') || 'bulunamadı'})_`
    ).join('\n');

    const contextPrompt =
        `Kullanıcı sorusu: ${userText}\n\n` +
        `İlgili web kaynakları ve anahtar kelimeler:\n${webContext}\n\n` +
        `Yukarıdaki kaynak ve anahtar kelimelerle, markdown tablo ve ikonlarla zenginleştirilmiş, kaynaklı ve özet bir cevap ver ve unutma 2025 yılındasın.`+
        `NLWeb (Natural Language Web Search Engine) processes user queries via Google or similar search engines, analyzes the results using AI, extracts structured insights, and summarizes the findings in natural language. Below is a professional step-by-step overview of how NLWeb analyzes search results. How NLWeb Analyzes Search Results Identifies the Query Type NLWeb categorizes each user query into one of the following four categories: Company & Organization Information Product & Service Information Competitor & Market Alternatives Technology & Trend Analysis Based on this classification, it prioritizes the type of data to extract and display. Crawls & Collects Web Content From each retrieved web page, NLWeb gathers both structured and unstructured data, including: Page title Meta description/snippet URL Page content (when available) Structured data / JSON-LD (e.g., company, product, or location entities) Downloadable files (PDFs, catalogs, technical documents) Company details: owners, partners, locations, sector Product information: technical specifications, use cases, user reviews Extracts Meaningful Information (Information Extraction) Using NLP and AI algorithms, NLWeb extracts significant insights from the content, such as: This page lists the founders and owners of [company name] The technical document indicates the product is suited for [market segment] User reviews highlight a high satisfaction rate for [product name] Labels and Classifies the Information NLWeb organizes the extracted insights into a labeled dataset for structured analysis and presentation. Label Description company_name Name of the company founders Founders / Owners location Address / Country / Region products Product names features Technical product features documents PDFs, catalog links reviews Customer reviews and feedback competitors Competing companies or services news Latest news and updates Ranks Information by Priority NLWeb adapts data presentation according to the user’s role or intent: For investors → emphasizes company structure, ownership, and history For commercial buyers → highlights product features and applications For competitive analysts → focuses on market alternatives, reviews, and comparisons Summarizes Results in Natural Language & Q&A Format NLWeb transforms structured data into professional, readable summaries using GPT-4.1 mini. Example: [Company Name] is a real estate sector company headquartered in [Country]. It is owned by [individuals or entities]. According to online sources, it offers the following products: [product list]. The company operates primarily in [locations], and key competitors include: [competitor names]. Assigns Trust Score & Source Analysis (Optional) For each result, NLWeb can optionally provide a trust score based on: Credibility and authority of the source Recency of publication Repetitiveness or duplication of content Type of content (technical vs. commercial) NLWeb Technical Infrastructure Requirements (Summary) Integration with Google Search API or SerpAPI AI-powered content analysis module (OpenAI GPT-4.1-mini) Data labeling and named entity recognition pipeline Caching and logging infrastructure User-specific search history and saved queries management`
    messageHistory.push({ role: "user", content: contextPrompt });

    // 4. AI'ya gönder
    const aiRes = await fetch(openaiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": openaiKey,
        },
        body: JSON.stringify({
            messages: messageHistory,
            max_tokens: 500
        })
    });
    const aiData = await aiRes.json();
    const aiReply = aiData.choices?.[0]?.message?.content || "AI'den cevap alınamadı.";
    messageHistory.push({ role: "assistant", content: aiReply });
    return aiReply;
}

window.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-chat-btn");

    sendBtn.addEventListener("click", async () => {
        const userMsg = chatInput.value.trim();
        if (!userMsg) return;

        displayMessage("user", userMsg);
        displayMessage("ai", "Yanıt hazırlanıyor...");

        chatInput.value = "";
        chatInput.disabled = true;
        sendBtn.disabled = true;

        try {
            const aiReply = await analyzeAndChat(userMsg);

            removeLastBotMessage();
            displayMessage("ai", aiReply);

        } catch (e) {
            removeLastBotMessage();
            displayMessage("ai", "Bir hata oluştu: " + e.message);
        }

        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    });

    chatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // query-chip'lerin olduğu container'ı dinle
    document.getElementById("query-chips-container").addEventListener("click", function (e) {
        // query-chip div'lerinden birine tıklanmış mı?
        const chip = e.target.closest('.query-chip');
        if (chip) {
            const text = chip.querySelector('span').textContent.trim();

            // chat input ve gönder butonunu bul
            const chatInput = document.getElementById("chat-input");
            const sendBtn = document.getElementById("send-chat-btn");

            chatInput.value = text;
            sendBtn.click();

            // AI sohbet alanına scroll
            setTimeout(function () {
                const chatMessages = document.getElementById("chat-messages");
                if (chatMessages) chatMessages.scrollIntoView({ behavior: "smooth" });
            }, 300);
        }
    });
});