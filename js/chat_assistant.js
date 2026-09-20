import { PLANT_KNOWLEDGE_BASE, CRAFT_KB } from './mock_db.js?v=2';
import { getUserMetrics } from './supabase_client.js?v=3';

let sessionContext = {
    lastEntity: null
};

const SYNONYMS = {
    "genda": "marigold",
    "tulsi": "holy basil",
    "pudina": "mint"
};

/**
 * RouterAgent
 * Classifies intent only: 'plant-care', 'match-status', 'general', or 'fallback'
 */
function RouterAgent(text) {
    const hasPlantName = PLANT_KNOWLEDGE_BASE.some(p => {
        const primary = p.species.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        const secondary = (p.species.match(/\(([^)]+)\)/) || [])[1]?.toLowerCase();
        return text.includes(primary) || (secondary && text.includes(secondary));
    });
    
    const isCareTopic = /care|water|sun|light|soil|ph|issue|problem|wrong|dying|yellow|wilting/i.test(text);

    if ((hasPlantName && isCareTopic) || text.includes("plant image") || (sessionContext.lastEntity && isCareTopic)) {
        return 'plant-care';
    }
    
    if (text.includes("pickup") || text.includes("match") || text.includes("where") || text.includes("status")) {
        return 'match-status';
    }

    if (text.includes("list an item") || text.includes("exchange") || text.includes("sell") || text.includes("marketplace")) {
        return 'reuse-info';
    }

    if (text.includes("upcycle") || text.includes("craft") || text.includes("reuse") || text.includes("diy")) {
        return 'craft-advisor';
    }

    if (text.includes("co2") || text.includes("saved") || text.includes("streak") || text.includes("stats") || text.includes("metrics")) {
        return 'stats';
    }

    if (text.includes("how does this work") || text.includes("how does matching work") || text.includes("what is greenloop") || text.includes("help") || text.includes("about")) {
        return 'general';
    }

    return 'fallback';
}

/**
 * PlantCareAgent
 * Handles plant-care and space-query intents using existing PLANT_KB retrieval logic.
 */
async function PlantCareAgent(text, prefix) {
    let matchedPlant = PLANT_KNOWLEDGE_BASE.find(p => {
        const primaryName = p.species.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        const secondaryName = (p.species.match(/\(([^)]+)\)/) || [])[1]?.toLowerCase();
        
        return text.includes(primaryName) || (secondaryName && text.includes(secondaryName));
    });

    if (!matchedPlant && sessionContext.lastEntity) {
        matchedPlant = PLANT_KNOWLEDGE_BASE.find(p => {
            const primaryName = p.species.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
            return sessionContext.lastEntity === primaryName;
        });
    }

    if (matchedPlant) {
        sessionContext.lastEntity = matchedPlant.species.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        
        const isWater = /water|how often/i.test(text);
        const isSun = /sun|light/i.test(text);
        const isSoil = /soil|ph/i.test(text);
        const isIssue = /issue|problem|wrong|dying|yellow|wilting/i.test(text);
        
        const shortName = matchedPlant.species.split(' ')[0];
        const pluralName = shortName.endsWith('s') ? shortName : shortName + 's';
        
        const formatList = (arr) => {
            if (!arr || arr.length === 0) return "general issues";
            if (arr.length === 1) return arr[0].toLowerCase();
            if (arr.length === 2) return arr[0].toLowerCase() + " and " + arr[1].toLowerCase();
            return arr.slice(0, -1).map(x => x.toLowerCase()).join(", ") + ", or " + arr[arr.length - 1].toLowerCase();
        };

        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        
        const soilPH = matchedPlant.soilPH || "6.0 - 7.0 (Slightly Acidic to Neutral)";
        const commonIssues = matchedPlant.commonIssues || ["Spider Mites", "Powdery Mildew", "Root Rot"];
        
        let fallbackText = "";
        
        if (isWater) {
             console.log("[PlantCareAgent] Checking 'water' intent.");
             const tmpls = [
                 `A ${shortName} needs watering ${matchedPlant.watering.toLowerCase()}.`,
                 `For a ${shortName}, you should water it ${matchedPlant.watering.toLowerCase()}.`,
                 `Make sure to water your ${shortName} ${matchedPlant.watering.toLowerCase()}.`
             ];
             fallbackText = pick(tmpls);
        } else if (isSun) {
             console.log("[PlantCareAgent] Checking 'sun' intent.");
             const tmpls = [
                 `${pluralName} love ${matchedPlant.sunlight.toLowerCase()}.`,
                 `Place your ${shortName} somewhere with ${matchedPlant.sunlight.toLowerCase()}.`,
                 `A ${shortName} needs ${matchedPlant.sunlight.toLowerCase()} to thrive.`
             ];
             fallbackText = pick(tmpls);
        } else if (isSoil) {
             console.log("[PlantCareAgent] Checking 'soil' intent.");
             const tmpls = [
                 `The ideal soil pH for a ${shortName} is ${soilPH.toLowerCase()}.`,
                 `A ${shortName} prefers a soil pH of ${soilPH.toLowerCase()}.`,
                 `Aim for a soil pH around ${soilPH.toLowerCase()} for your ${shortName}.`
             ];
             fallbackText = pick(tmpls);
        } else if (isIssue) {
             console.log("[PlantCareAgent] Checking 'issue' intent.");
             const issuesText = formatList(commonIssues);
             const tmpls = [
                 `A few things to check: ${issuesText}.`,
                 `Common problems with a ${shortName} include ${issuesText}.`,
                 `Watch out for these issues: ${issuesText}.`
             ];
             fallbackText = pick(tmpls);
        } else {
             console.log("[PlantCareAgent] Checking 'full-guide' intent.");
             const issuesText = formatList(commonIssues);
             const tmpls = [
                 `Here is the care guide for ${matchedPlant.species}. It needs watering ${matchedPlant.watering.toLowerCase()} and prefers ${matchedPlant.sunlight.toLowerCase()}. The ideal soil pH is ${soilPH.toLowerCase()}. Watch out for common issues like ${issuesText}.`,
                 `Caring for ${matchedPlant.species} is straightforward! Place it in ${matchedPlant.sunlight.toLowerCase()} and water it ${matchedPlant.watering.toLowerCase()}. Ensure the soil pH is ${soilPH.toLowerCase()}. Be mindful of problems such as ${issuesText}.`
             ];
             fallbackText = pick(tmpls);
        }

        let responseText = fallbackText;
        const apiKey = localStorage.getItem('GEMINI_API_KEY');
        
        if (apiKey) {
            try {
                console.log("[PlantCareAgent] Attempting LLM route...");
                const contextStr = `Plant: ${matchedPlant.species}\nWatering: ${matchedPlant.watering}\nSunlight: ${matchedPlant.sunlight}\nSoil pH: ${soilPH}\nCommon Issues: ${commonIssues.join(', ')}`;
                
                const prompt = `You are a helpful plant care assistant. Answer the user's query using ONLY the provided context. Do not add outside facts.\n\nContext:\n${contextStr}\n\nQuery:\n${text}`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        responseText = data.candidates[0].content.parts[0].text.trim();
                        console.log("[PlantCareAgent] LLM response successful.");
                    } else {
                        console.warn("[PlantCareAgent] LLM returned empty response, using template fallback.");
                    }
                } else {
                    console.warn("[PlantCareAgent] LLM API call failed, using template fallback.");
                }
            } catch (error) {
                console.warn("[PlantCareAgent] LLM fallback triggered due to error:", error);
            }
        } else {
            console.warn("[PlantCareAgent] GEMINI_API_KEY not found in localStorage, using template fallback.");
        }

        return {
            text: prefix + responseText,
            buttons: [{ label: "View Plant Guide", action: "plantation_guide" }],
            handledBy: "PlantCareAgent"
        };
    }
    
    // If it hit the RouterAgent based on "plant image" but couldn't find a match
    return FallbackAgent(text);
}

/**
 * MatchStatusAgent
 * Handles match-status intent, mocking a query to Supabase user_loops.
 */
async function MatchStatusAgent(userId) {
    const composterName = "EcoPark Community Compost";
    const distance = "1.2 km away";
    const pickupWindow = "tomorrow between 8:00 AM and 6:00 PM";
    
    const fallbackText = `Your active compost pickup with **${composterName}** (${distance}) is scheduled. The coordinator has accepted your flower waste and will be ready for drop-off ${pickupWindow}.`;

    let finalText = fallbackText;

    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (apiKey) {
        try {
            const prompt = `Do not alter, invent, or omit any of the following facts: 
Name: ${composterName}
Distance: ${distance}
Time: ${pickupWindow}
Only vary the sentence structure around them. e.g., "Good news — your pickup with X is confirmed for Y" vs "Your compost pickup at X is set for Y". 
Include the name in bold markdown (**Name**). Return ONLY the sentence.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    finalText = data.candidates[0].content.parts[0].text.trim();
                }
            } else {
                console.warn("[LLM Warning] API call failed, using fallback.");
            }
        } catch (error) {
            console.warn("[LLM Warning] Fallback triggered due to error:", error);
        }
    }

    return {
        text: finalText,
        buttons: [
            { label: "View Full Match", action: "match_result" },
            { label: "Message Composter", action: "chat" }
        ],
        handledBy: "MatchStatusAgent"
    };
}

/**
 * GeneralInfoAgent
 * Handles general app questions.
 */
function GeneralInfoAgent() {
    return {
        text: "GreenLoop connects organic waste to local composters, and inorganic waste to upcycling or recycling centers! When you scan an item, our **Scout** AI classifies it. Then, the **Matcher** searches for nearby facilities that can accept your specific item and have enough capacity. Finally, a **Coordinator** drafts a message so you can easily drop it off. \n\nYou can also use the Market tab to buy or sell upcycled goods!",
        buttons: [],
        handledBy: "GeneralInfoAgent"
    };
}

/**
 * ReuseInfoAgent
 * Explains how to list an item on the market.
 */
function ReuseInfoAgent() {
    return {
        text: "Listing an item for exchange is easy! You can give a second life to upcycled goods, homemade compost, or plant cuttings. Just head over to the **Market** tab and tap the 'List Item' button at the bottom to get started.",
        buttons: [{ label: "Go to Market", action: "marketplace" }],
        handledBy: "ReuseInfoAgent"
    };
}

/**
 * CraftAdvisorAgent
 * Provides upcycling ideas from the CRAFT_KB.
 */
function CraftAdvisorAgent(text) {
    const materials = Object.keys(CRAFT_KB);
    let matchedMaterial = null;
    for (let mat of materials) {
        if (text.includes(mat)) {
            matchedMaterial = mat;
            break;
        }
    }
    
    if (matchedMaterial && CRAFT_KB[matchedMaterial] && CRAFT_KB[matchedMaterial].length > 0) {
        const idea = CRAFT_KB[matchedMaterial][0];
        return {
            text: `For a ${matchedMaterial}, a great upcycling idea is a **${idea.title}**! ${idea.reason} It takes about ${idea.time} and the difficulty is ${idea.difficulty}.`,
            buttons: [],
            handledBy: "CraftAdvisorAgent"
        };
    } else {
        return {
            text: "I have lots of upcycling ideas! Try asking me what you can craft from a 'glass jar', 'plastic bottle', or 'old clothes'.",
            buttons: [],
            handledBy: "CraftAdvisorAgent"
        };
    }
}

/**
 * StatsAgent
 * Retrieves user metrics from Supabase.
 */
async function StatsAgent(userId) {
    const metrics = await getUserMetrics(userId);
    return {
        text: `You've saved **${metrics.co2}kg of CO2** and diverted **${metrics.kg}kg of waste** from landfills! You currently have ${metrics.matches} completed matches and an active streak of ${metrics.streak} ${metrics.streak === 1 ? 'loop' : 'loops'}. Keep up the great work! 🌍`,
        buttons: [{ label: "View Dashboard", action: "home" }],
        handledBy: "StatsAgent"
    };
}

/**
 * FallbackAgent
 * Conversational handler for general queries, unrecognized items, and fallback intent.
 */
async function FallbackAgent(message) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    const defaultText = "I can help with plant care questions or your active compost matches — try asking about a specific plant (like 'marigold' or 'hibiscus') or 'where's my pickup?'.";

    if (!apiKey) {
        return {
            text: defaultText,
            buttons: [],
            handledBy: "FallbackAgent"
        };
    }

    const availablePlants = PLANT_KNOWLEDGE_BASE.map(p => p.species).join(", ");
    const userLoops = "1 active pickup with EcoPark Community Compost";

    const prompt = `You are the GreenLoop Assistant, a sustainability app helper. Answer naturally and helpfully.
If asked about a plant not in this list (${availablePlants}), say you don't have data on it.
If asked something unrelated to the app, gently redirect. Never invent specific care instructions beyond what's provided.
User's current active loops: ${userLoops}

User message: ${message}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return {
                    text: data.candidates[0].content.parts[0].text.trim(),
                    buttons: [],
                    handledBy: "FallbackAgent (LLM)"
                };
            }
        }
    } catch (error) {
        console.warn("[FallbackAgent] LLM API call failed:", error);
    }

    return {
        text: defaultText,
        buttons: [],
        handledBy: "FallbackAgent"
    };
}

/**
 * Orchestrator
 * Processes a user's chat message using agent routing and returns a response.
 */
export async function processChatMessage(message, isImage = false, userId = null) {
    let text = message.toLowerCase();

    // Apply synonyms
    for (const [synonym, standard] of Object.entries(SYNONYMS)) {
        text = text.replace(new RegExp(`\\b${synonym}\\b`, 'g'), standard);
    }

    // Resolve context ("it", "that", "this")
    if (sessionContext.lastEntity && (text.match(/\bit\b/) || text.match(/\bthat\b/) || text.match(/\bthis\b/))) {
        text += " " + sessionContext.lastEntity;
    }

    let prefix = "";
    if (isImage) {
        // Simulate image classification finding a marigold by default for the prototype
        if (!text || text === "plant image") text += " marigold";
        prefix = "I've analyzed the image. ";
    }

    // 1. Router Agent evaluates intent
    const intent = RouterAgent(text);
    console.log("Router returned:", intent);

    // 2. Dispatch to designated Agent
    switch (intent) {
        case 'plant-care':
            console.log("Dispatching to:", "PlantCareAgent");
            return await PlantCareAgent(text, prefix);
        case 'match-status':
            console.log("Dispatching to:", "MatchStatusAgent");
            return await MatchStatusAgent(userId);
        case 'reuse-info':
            console.log("Dispatching to:", "ReuseInfoAgent");
            return ReuseInfoAgent();
        case 'craft-advisor':
            console.log("Dispatching to:", "CraftAdvisorAgent");
            return CraftAdvisorAgent(text);
        case 'stats':
            console.log("Dispatching to:", "StatsAgent");
            return await StatsAgent(userId);
        case 'general':
            console.log("Dispatching to:", "GeneralInfoAgent");
            return GeneralInfoAgent();
        case 'fallback':
        default:
            console.log("Dispatching to:", "FallbackAgent");
            return await FallbackAgent(text);
    }
}
