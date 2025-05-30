document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("main-search-input");
    const searchBtn = document.getElementById("nlworld-search-btn");
    const resultsOutput = document.getElementById("nlworld-results-output");
    const domainSelect = document.getElementById("domain-select");

    // Mapping domain values to readable text, matching your select options
    const domainLabels = {
        "property-development": "Property & Project Development",
        "residential-properties": "Residential Properties (Houses, Villas, Complexes)",
        "commercial-properties": "Commercial Properties (Offices, Retail, Industrial)",
        "public-properties": "Public & Social Properties",
        "luxury-niche-properties": "Luxury & Niche Properties",
        "property-valuation": "Property Valuation & Investment Models",
        "sustainable-green-buildings": "Sustainable & Green Buildings (LEED)",
        "prefabricated-modular-buildings": "Prefabricated & Modular Buildings",
        "real-estate-agencies": "Real Estate Agencies & Brokerage",
        "property-finance-loans": "Property Finance & Loans",
        "rental-management": "Rental & Property Management",
        "design-architecture": "Design, Architecture & Interior Decoration",
        "marketing-promotion": "Marketing & Promotion for Real Estate",
        "logistics-storage": "Logistics, Storage & Distribution",
        "human-resources": "Human Resources in Real Estate",
        "all": "All Domains"
    };

    domainSelect.addEventListener("change", function () {
        const val = domainSelect.value;
        if (val && domainLabels[val]) {
            searchInput.value = domainLabels[val];
        } else if (!val) {
            searchInput.value = "";
        }
    });

    // --- AI Integration Variables and Functions ---
    let webResults = [];
    // Holds the current conversation as an array of messages (for chat continuity)
    let aiConversation = [];
    // Holds the context (url, title, snippet) of the selected source for focused chat
    let currentWebContext = null;

    const openaiEndpoint = "https://ai-gptai749384661431.openai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2025-01-01-preview";
    const openaiKey = "11x9IG7HZkyphyxj7I41UPWOshDNpWJAvUdiuUeVoxnMy6CPsY5cJQQJ99BDACYeBjFXJ3w3AAAAACOGQMYE";
    const apiKey = "AIzaSyDaHV-YfOjdRIcl7gFhLpU61Ev88XI6hQ4";
    const cx = "c0ed3e4fd6f094129";

    function formatResult(query, item, i) {
        return `
            <div class="nlworld-result-item mb-3 p-2 border-b border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-800" data-index="${i}">
                <div class="font-semibold text-sky-400 text-base mb-1">
                    <a href="${item.link}" target="_blank" rel="noopener" class="nlworld-result-link">
                        ${item.title || `Real Estate Trends: ${query}`}
                    </a>
                </div>
                <div class="text-neutral-200 text-sm mb-1 nlworld-result-snippet">
                    ${item.snippet || `Latest trends and analyses related to ${query} in the 2024 real estate market. Opportunities for investors.`}
                </div>
                <div class="text-neutral-400 text-xs">
                    <a href="${item.link}" target="_blank" rel="noopener" class="nlworld-result-link">${item.link}</a>
                    <button class="ml-2 px-2 py-1 text-xs bg-sky-900 text-sky-100 rounded ai-trigger-btn" data-index="${i}" type="button">AI ile Aç</button>
                </div>
            </div>
        `;
    }

    function formatStaticResult(query) { 
        return ``;
    }

    async function search(query) {
        if (!query) return;
        resultsOutput.innerHTML = `<div class="mb-2 text-lg font-bold text-sky-300">"${query}" için Web Aramaları</div>`;
        resultsOutput.style.display = "block";
        resultsOutput.innerHTML += formatStaticResult(query);

        try {
            const response = await fetch(
                `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}&num=10`
            );
            const data = await response.json();
            if (data.items && Array.isArray(data.items)) {
                webResults = data.items.map(item => ({
                    link: item.link,
                    title: item.title,
                    snippet: item.snippet
                }));
                data.items.forEach((item, i) => {
                    resultsOutput.innerHTML += formatResult(query, item, i);
                });
            } else {
                resultsOutput.innerHTML += `<div class="text-neutral-300 mt-4">Sonuç bulunamadı.</div>`;
            }
        } catch (e) {
            resultsOutput.innerHTML += `<div class="text-red-400 mt-4">Arama yapılırken hata oluştu.</div>`;
        }
    }

    // Search on Enter key
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            search(query);
        }
    });

    // Search on button click
    searchBtn.addEventListener("click", function () {
        const query = searchInput.value.trim();
        search(query);
    });

    // Optional: Search again when domain changes (if you want to append domain to query)
    domainSelect.addEventListener("change", function () {
        const domain = domainSelect.value;
        const query = searchInput.value.trim();
        if (query) {
            let fullQuery = query;
            if (domain && domain !== "all") {
                fullQuery = `${query} ${domain.replace(/-/g, ' ')}`;
            }
            search(fullQuery);
        }
    });

    // --- AI Integration: Select web source and interact with GPT ---

    // Results click handler for both AI button and card
    resultsOutput.addEventListener("click", function (e) {
        // AI butonuna tıklanırsa
        if (e.target.classList.contains("ai-trigger-btn")) {
            const idx = e.target.getAttribute("data-index");
            const selectedSource = webResults[idx];
            // Set context for this conversation
            currentWebContext = selectedSource;
            aiConversation = [
                {
                    role: "system",
                    content:
                        "Yanıtlarını sadece verilen web kaynağı (URL, başlık ve özet bilgi) ile sınırla. Her yeni kullanıcı sorusunda bu kaynağı referans al. Bilgi kaynağın dışına çıkma."
                },
                {
                    role: "user",
                    content:
                        `Aşağıdaki web kaynağı hakkındaki tüm önemli bilgileri, verileri, içerikleri ve özetini yaz:\n\n` +
                        `Başlık: ${selectedSource.title}\n` +
                        `URL: ${selectedSource.link}\n` +
                        `Özet: ${selectedSource.snippet}\n\n` +
                        `Yalnızca yukarıdaki bilgilerle ve bu URL'den çıkmadan detaylı bir özet ver.`
                }
            ];
            document.getElementById("web4-ai-source-display").style.display = "block";
            document.getElementById("web4-ai-source-display").textContent = `Current Source: ${selectedSource.title || selectedSource.link}`;
            document.getElementById("property-description-input").value = ""; // Temiz başlat
            sendAIConversation();

            // AI alanına yumuşak kaydır
            setTimeout(function() {
                // AI kutusunun bulunduğu bölümü veya section'ı hedefle
                const aiSection = document.getElementById("generated-description-output");
                if (aiSection) aiSection.scrollIntoView({behavior: "smooth"});
            }, 300);

            return;
        }
        // Eğer tıklanan bir <a> etiketi ise (link ise), default davranışı uygula (yeni sekmede açılır)
        if (e.target.classList.contains("nlworld-result-link")) {
            return;
        }
        // Kartın başka bir kısmına tıklandıysa
        const item = e.target.closest(".nlworld-result-item");
        if (item) {
            const idx = item.getAttribute("data-index");
            const selectedSource = webResults[idx];
            currentWebContext = selectedSource;
            aiConversation = [
                {
                    role: "system",
                    content:
                        "Yanıtlarını sadece verilen web kaynağı (URL, başlık ve özet bilgi) ile sınırla. Her yeni kullanıcı sorusunda bu kaynağı referans al. Bilgi kaynağın dışına çıkma."
                },
                {
                    role: "user",
                    content:
                        `Aşağıdaki web kaynağı hakkındaki tüm önemli bilgileri, verileri, içerikleri ve özetini yaz:\n\n` +
                        `Başlık: ${selectedSource.title}\n` +
                        `URL: ${selectedSource.link}\n` +
                        `Özet: ${selectedSource.snippet}\n\n` +
                        `Yalnızca yukarıdaki bilgilerle ve bu URL'den çıkmadan detaylı bir özet ver.`
                }
            ];
            document.getElementById("web4-ai-source-display").style.display = "block";
            document.getElementById("web4-ai-source-display").textContent = `Current Source: ${selectedSource.title || selectedSource.link}`;
            document.getElementById("property-description-input").value = ""; // Temiz başlat
            sendAIConversation();

            // AI alanına yumuşak kaydır
            setTimeout(function() {
                const aiSection = document.getElementById("generated-description-output");
                if (aiSection) aiSection.scrollIntoView({behavior: "smooth"});
            }, 300);
        }
    });

    // Alt tarafta kullanıcı mesajı ile devam eden AI chat
    document.getElementById("generate-description-btn").addEventListener("click", function () {
        const userMessage = document.getElementById("property-description-input").value.trim();
        if (!currentWebContext) {
            alert("Lütfen önce bir NLWorld kaynağı seçin ve AI ile başlatın.");
            return;
        }
        if (!userMessage) {
            alert("Lütfen bir mesaj girin.");
            return;
        }
        aiConversation.push({
            role: "user",
            content:
                `KAYNAK:\nBaşlık: ${currentWebContext.title}\nURL: ${currentWebContext.link}\nÖzet: ${currentWebContext.snippet}\n\n` +
                `KULLANICI SORUSU:\n${userMessage}\n\n` +
                `Yanıtın sadece yukarıdaki kaynaktaki bilgilerle sınırlı olsun.`
        });
        document.getElementById("property-description-input").value = "";
        sendAIConversation();
    });

    async function sendAIConversation() {
        const outputDiv = document.getElementById("generated-description-output");
        outputDiv.innerHTML = `<span class="text-neutral-400">Yanıt hazırlanıyor...</span>`;
        outputDiv.style.display = "block";
        try {
            const body = {
                messages: aiConversation,
                max_tokens: 512,
                temperature: 0.1
            };
            const response = await fetch(openaiEndpoint, {
                method: "POST",
                headers: {
                    "api-key": openaiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const result = await response.json();
            const aiMessage = result.choices?.[0]?.message?.content || "Yanıt alınamadı.";
            outputDiv.textContent = aiMessage;
            // Add AI response to the conversation for continued context
            aiConversation.push({ role: "assistant", content: aiMessage });
        } catch (err) {
            outputDiv.textContent = "AI yanıtı alınırken bir hata oluştu.";
        }
    }
});