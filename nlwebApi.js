// API endpoint ve anahtarlar
const analyticsEndpoint = "https://nlweb.cognitiveservices.azure.com/";
const analyticsKey = "2dv6SQUJoCgsZuu1G3YCz5nkcGdzqMWYj7WLici2pLgzMWPJhCBlJQQJ99BEACYeBjFXJ3w3AAAEACOGPvoX";
const openaiEndpoint = "https://ai-gptai749384661431.openai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2025-01-01-preview";
const openaiKey = "11x9IG7HZkyphyxj7I41UPWOshDNpWJAvUdiuUeVoxnMy6CPsY5cJQQJ99BDACYeBjFXJ3w3AAAAACOGQMYE";

// Google Custom Search
const apiKey = "AIzaSyDaHV-YfOjdRIcl7gFhLpU61Ev88XI6hQ4";
const cx = "c0ed3e4fd6f094129";

// System prompt
const systemPrompt = `
---
**Formatting Rules (Very Important):**
- Always use markdown tables, bullet lists, and the following icons in headings: ✨, 💡, 📌, 🚀, ⭐, ✅, ➡️, 📊, 🌐, 📚
- Start section headings with '##' or '###' and add one of the above icons in front.
- Use * or - for bullet lists.
- Provide tables as markdown tables (e.g. | Header1 | Header2 | ... |).
- Write links as [Link Title](url).
- Example layout:
    ## 💡 Smart Tips

    - Choose energy-efficient materials.
    - Work with trusted suppliers.

    | Material | Feature | Supplier |
    |----------|---------|----------|
    | Concrete | High strength | CompanyA |
    | Steel    | Lightweight, Durable | CompanyB |

    More info: [Google](https://google.com)
---
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
        `Yukarıdaki kaynak ve anahtar kelimelerle, markdown tablo ve ikonlarla zenginleştirilmiş, kaynaklı ve özet bir cevap ver ve unutma 2025 yılındasın.`;

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
    document.getElementById("query-chips-container").addEventListener("click", function(e) {
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
            setTimeout(function() {
                const chatMessages = document.getElementById("chat-messages");
                if (chatMessages) chatMessages.scrollIntoView({behavior: "smooth"});
            }, 300);
        }
    });
});