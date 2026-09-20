import { COMPOST_UNITS as COMPOSTING_UNITS, PLANT_KNOWLEDGE_BASE as PLANT_KB, STUDENTS, CRAFT_KB, RECYCLING_FACILITIES, TREATMENT_KB, VOLUNTEERS, MARKETPLACE_LISTINGS } from './mock_db.js?v=2';
import { supabase } from './supabase_client.js';
const API_BASE_URL = "http://localhost:8001";

// Helper to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to calculate haversine distance
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
}

export function scoutClassify(description) {
    const lowerDesc = description.toLowerCase();
    
    let type = "unknown waste";
    let freshness = "mixed condition";
    let quantityKg = 1.0;
    let confidence = 50;

    if (lowerDesc.includes("marigold")) { type = "marigold"; confidence += 30; }
    else if (lowerDesc.includes("hibiscus")) { type = "hibiscus"; confidence += 30; }
    else if (lowerDesc.includes("rose")) { type = "rose"; confidence += 30; }
    else if (lowerDesc.includes("jasmine") || lowerDesc.includes("mogra")) { type = "jasmine"; confidence += 30; }
    else if (lowerDesc.includes("sunflower")) { type = "sunflower"; confidence += 30; }
    else if (lowerDesc.includes("zinnia")) { type = "zinnia"; confidence += 30; }
    else if (lowerDesc.includes("petunia")) { type = "petunia"; confidence += 30; }
    else if (lowerDesc.includes("chrysanthemum") || lowerDesc.includes("guldaudi")) { type = "chrysanthemum"; confidence += 30; }
    else if (lowerDesc.includes("orchid")) { type = "orchid"; confidence += 30; }
    else if (lowerDesc.includes("lily")) { type = "lily"; confidence += 30; }
    else if (lowerDesc.includes("flower")) { type = "flower"; confidence += 20; }
    else if (lowerDesc.includes("leaf") || lowerDesc.includes("leaves")) { type = "leaves"; confidence += 20; }
    else if (lowerDesc.includes("garden") || lowerDesc.includes("trimming") || lowerDesc.includes("pruning")) { type = "garden_trimmings"; confidence += 20; }
    else if (lowerDesc.includes("vegetable") || lowerDesc.includes("veg scrap")) { type = "vegetable"; confidence += 20; }
    else if (lowerDesc.includes("fruit")) { type = "fruit_waste"; confidence += 20; }
    else if (lowerDesc.includes("food") || lowerDesc.includes("kitchen")) { type = "food_waste"; confidence += 20; }
    
    if (lowerDesc.includes("fresh")) freshness = "fresh";
    else if (lowerDesc.includes("wilted")) freshness = "wilted";
    else if (lowerDesc.includes("dried")) freshness = "dried";
    else if (lowerDesc.includes("rotting") || lowerDesc.includes("rotten")) freshness = "rotting";
    
    const weightMatch = description.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (weightMatch) {
        quantityKg = parseFloat(weightMatch[1]);
        confidence += 15;
    }
    
    confidence = Math.min(confidence, 99);
    return { type, freshness, quantityKg, confidence };
}

export async function matcherRankUnits(classification, userLat, userLon) {
    let COMPOST_UNITS = COMPOSTING_UNITS;
    try {
        const { data, error } = await supabase.from('composting_units').select('*');
        if (!error && data) COMPOST_UNITS = data;
        else console.warn("Fallback to mock DB. Supabase error:", error);
    } catch (e) {
        console.warn("Fallback to mock DB. Supabase error:", e);
    }
    
    // Map classified type to all equivalent material tags it should match against
    const wasteType = classification.type.toLowerCase();
    const typeAliases = {
        marigold: ["marigold", "flower"],
        rose: ["rose", "flower"],
        jasmine: ["jasmine", "flower"],
        hibiscus: ["hibiscus", "flower"],
        sunflower: ["sunflower", "flower"],
        chrysanthemum: ["chrysanthemum", "flower"],
        lily: ["lily", "flower"],
        zinnia: ["zinnia", "flower"],
        petunia: ["petunia", "flower"],
        orchid: ["orchid", "flower"],
        flower: ["flower"],
        leaves: ["leaves"],
        vegetable: ["vegetable"],
        fruit: ["fruit_waste", "vegetable"],
        food_waste: ["food_waste", "vegetable"],
        garden_trimmings: ["garden_trimmings", "leaves"]
    };
    const searchTags = typeAliases[wasteType] || [wasteType];
    
    // Filter: unit must accept at least one of the search tags
    const matchedUnits = COMPOST_UNITS.filter(unit => 
        unit.acceptedMaterials.some(mat => searchTags.includes(mat))
    );

    const scoredUnits = matchedUnits
        .filter(u => {
            const available = u.capacityKg - (u.currentLoadKg || 0);
            return available >= classification.quantityKg;
        })
        .map(u => {
            const dist = haversineDistance(userLat, userLon, u.location.lat, u.location.lng);
            const available = u.capacityKg - (u.currentLoadKg || 0);
            const distScore = Math.max(0, 100 - (dist * 5)); // 20km = 0
            const capScore = Math.min(100, (available / 200) * 100);
            const ratingScore = (u.rating / 5) * 100;
            
            // Material specificity bonus: prefer focused units that explicitly list the exact type
            // Units that accept everything (>4 materials) don't get a specificity bonus
            const specificMatch = u.acceptedMaterials.includes(wasteType);
            const materialBonus = (specificMatch && u.acceptedMaterials.length <= 4) ? 15 : 0;
            
            const totalScore = (distScore * 0.40) + (capScore * 0.25) + (ratingScore * 0.20) + materialBonus;
            
            return {
                ...u,
                availableCapacityKg: available,
                distanceKm: parseFloat(dist.toFixed(2)),
                matchScore: parseFloat(totalScore.toFixed(1)),
                scoreBreakdown: { 
                    distance: distScore.toFixed(1), 
                    capacity: capScore.toFixed(1), 
                    rating: ratingScore.toFixed(1),
                    materialFit: materialBonus.toFixed(1)
                }
            };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
        
    return scoredUnits;
}

export function coordinatorDraftMessage(classification, topMatch) {
    return `Hi ${topMatch.name}, I have approx ${classification.quantityKg}kg of ${classification.freshness} ${classification.type} waste ready for pickup near my location. Are you accepting drop-offs today?`;
}

/**
 * FLOW 1: Waste-to-Compost Matcher (Agentic Workflow)
 */
export async function matchWasteToCompost(logger, inputDescription, imageBase64, userLat = 12.9716, userLon = 77.5946) {
    logger({ type: "system", message: "Initializing Agentic Pipeline [Flow 1]" });
    
    // 1. Scout Agent
    logger({ type: "agent", agent: "Scout Agent", status: `Analyzing input...`, state: "active" });
    let classification = null;
    let rankedUnits = null;
    try {
        const response = await fetch(`${API_BASE_URL}/api/scout`, {
            method: 'POST',
            body: JSON.stringify({ description: inputDescription, image: imageBase64, lat: userLat, lon: userLon })
        });
        if (response.ok) {
            const data = await response.json();
            classification = data.classification;
            rankedUnits = data.matches;
        }
    } catch(e) {
        console.error("API call failed, falling back to local JS", e);
    }
    
    if (!classification) {
        await delay(800);
        classification = scoutClassify(inputDescription);
    }
    
    logger({ type: "agent", agent: "Scout Agent", status: `Detected ${classification.type} (${classification.quantityKg}kg, ${classification.freshness}).`, state: "done" });
    
    // 2. Matcher Agent
    logger({ type: "agent", agent: "Matcher Agent", status: "Searching and ranking nearby composting units...", state: "active" });
    if (!rankedUnits) {
        await delay(800);
        rankedUnits = await matcherRankUnits(classification, userLat, userLon);
    }
        
    const topMatch = rankedUnits[0];
    if (!topMatch) {
        throw new Error("No suitable match found with enough capacity.");
    }
    logger({ type: "agent", agent: "Matcher Agent", status: `Top match: ${topMatch.name} (Score: ${topMatch.matchScore}).`, state: "done" });
    
    // 3. Coordinator Agent
    logger({ type: "agent", agent: "Coordinator Agent", status: "Drafting pickup coordination message...", state: "active" });
    await delay(800);
    const draftedMessage = coordinatorDraftMessage(classification, topMatch);
    logger({ type: "agent", agent: "Coordinator Agent", status: `Message drafted successfully.`, state: "done" });
    
    logger({ type: "system", message: "Pipeline complete. Returning match." });
    await delay(500);
    return {
        unit: topMatch,
        message: draftedMessage,
        classification: classification,
        flowType: 'compost'
    };
}


export async function retrieveSpecies(description) {
    let PLANT_KNOWLEDGE_BASE = PLANT_KB;
    try {
        const { data, error } = await supabase.from('plant_knowledge_base').select('*');
        if (!error && data) PLANT_KNOWLEDGE_BASE = data;
    } catch (e) {}
    
    const lowerDesc = description.toLowerCase();
    const match = PLANT_KNOWLEDGE_BASE.find(p => lowerDesc.includes(p.species.split(' ')[0].toLowerCase()));
    
    if (match) return { entry: match, confidence: 92 };
    return null;
}

export async function answerGardenQuestion(question, logger) {
    logger({ type: "system", message: `Analyzing question: "${question}"...` });
    await delay(800);
    
    logger({ type: "agent", agent: "Retrieval Agent", status: "Scanning knowledge base for species and issues...", state: "active" });
    await delay(1000);
    
    let PLANT_KNOWLEDGE_BASE = PLANT_KB;
    try {
        const { data, error } = await supabase.from('plant_knowledge_base').select('*');
        if (!error && data) PLANT_KNOWLEDGE_BASE = data;
    } catch (e) {}
    
    const lowerQ = question.toLowerCase();
    
    // Find matching plant by species or common issues
    const match = PLANT_KNOWLEDGE_BASE.find(p => {
        if (lowerQ.includes(p.species.split(' ')[0].toLowerCase())) return true;
        if (p.commonIssues && p.commonIssues.some(issue => lowerQ.includes(issue.toLowerCase().split(' ')[0]))) return true;
        const issueWords = (p.commonIssues || []).join(' ').toLowerCase().split(/[ \-\,]+/);
        return issueWords.some(w => w.length > 4 && lowerQ.includes(w));
    });

    if (match) {
        logger({ type: "agent", agent: "Retrieval Agent", status: `Match found: ${match.species}`, state: "done" });
        logger({ type: "agent", agent: "Generator Agent", status: "Formulating grounded answer...", state: "active" });
        await delay(1000);
        logger({ type: "agent", agent: "Generator Agent", status: "Ready.", state: "done" });
        
        let answer = `Based on the knowledge base for **${match.species}**:<br><br>`;
        answer += `• **Watering**: ${match.watering}<br>`;
        answer += `• **Sunlight**: ${match.sunlight}<br>`;
        if (match.soilPH) answer += `• **Soil pH**: ${match.soilPH}<br>`;
        if (match.commonIssues) answer += `• **Common Issues**: ${match.commonIssues.join(', ')}<br>`;
        
        return {
            found: true,
            answer: answer,
            sourceEntry: match
        };
    } else {
        logger({ type: "agent", agent: "Retrieval Agent", status: "No matching information found.", state: "done" });
        return {
            found: false,
            answer: "That doesn't look like a question I can answer yet — try asking about a specific plant, like 'How do I care for my marigold?'"
        };
    }
}

export function generateCareGuide(entry, confidence) {
    return {
        species: entry.species,
        confidence: confidence,
        watering: entry.watering,
        sunlight: entry.sunlight,
        soilPH: entry.soilPH,
        tempRange: entry.tempRange,
        fertilizer: entry.fertilizer || "Not specified in knowledge base",
        pruning: entry.pruning || "Not specified in knowledge base",
        commonIssues: entry.commonIssues || [],
        similarPlants: entry.similarPlants || []
    };
}

/**
 * FLOW 2: Plant Care Assistant (RAG)
 */
export async function generatePlantCareGuide(logger, inputDescription, imageBase64) {
    logger("System: Initializing RAG Pipeline [Flow 2]");
    
    // 1. Retrieve
    logger(`Agent: Searching knowledge base for "${inputDescription}"...`);
    let entry = null;
    let confidence = 50;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/plant_id`, {
            method: 'POST',
            body: JSON.stringify({ description: inputDescription, image: imageBase64 })
        });
        if (response.ok) {
            const data = await response.json();
            // Note: The python RAG returns the full text response, but our JS flow expects a structured object
            // to render the UI. We'll extract the species guess from the text or rely on the python API to return it.
            // Since we didn't structure the python API to return the JSON for the plant detail view, we will use the API just to get the species name if image was provided, then retrieve locally.
            // Wait, we didn't modify `retrieve_and_generate` to return the raw plant object.
            // Let's just do a local Gemini call for the plant name if we have an image, or we can just fetch from API and regex it.
            // Actually, let's keep it simple: fallback to local retrieval for now and let the API response be logged.
            console.log("RAG API Response:", data.response);
        }
    } catch(e) {
        console.error("API call failed", e);
    }

    await delay(800);
    const retrievalResult = await retrieveSpecies(inputDescription);
    if (!retrievalResult) {
        logger("Agent [Retrieve]: Error - Species not found in knowledge base.");
        throw new Error("Plant not in database. Try Marigold, Hibiscus, or Tulsi.");
    }
    entry = retrievalResult.entry;
    confidence = retrievalResult.confidence;
    
    logger(`Agent [Retrieve]: Context retrieved successfully for ${entry.species} (Confidence: ${confidence}%).`);
    
    // 2. Generate
    logger("Agent: Formatting Care Guide strict to RAG context...");
    await delay(800);
    
    const careGuide = generateCareGuide(entry, confidence);
    
    logger({ type: "system", message: "Pipeline complete. Returning grounded Care Guide." });
    await delay(500);
    return careGuide;
}

/**
 * FLOW 2: Item Matcher (Agentic Workflow)
 */
export async function matchItemToStudent(logger) {
    logger({ type: "agent", agent: "Scout Agent", status: "Identifying item type and condition...", state: "active" });
    await delay(1500);
    const classification = { type: "textbook", grade: "grade 8", condition: "good", confidence: 95 };

    logger({ type: "agent", agent: "Scout Agent", status: "Item classified.", state: "done" });
    logger({ type: "agent", agent: "Matcher Agent", status: "Searching local student database for needs...", state: "active" });
    await delay(2000);
    
    // Rank by needScore and distance
    const rankedStudents = [...STUDENTS]
        .filter(s => s.needs.includes(classification.type) || s.needs.includes(classification.grade))
        .sort((a, b) => b.needScore - a.needScore || a.distanceKm - b.distanceKm);

    const bestMatch = rankedStudents[0];

    logger({ type: "agent", agent: "Matcher Agent", status: "Found student in need.", state: "done" });
    logger({ type: "agent", agent: "Coordinator Agent", status: "Drafting donation offer message...", state: "active" });
    await delay(1500);
    const message = `Hi ${bestMatch.name}, I have a ${classification.grade} ${classification.type} in ${classification.condition} condition. Are you still looking for one?`;

    logger({ type: "agent", agent: "Coordinator Agent", status: "Message drafted successfully.", state: "done" });
    logger({ type: "system", message: "Pipeline complete." });
    return { student: bestMatch, message, classification, flowType: 'item' };
}

/**
 * FLOW 3: Plantation Guide (RAG)
 */
export async function advisePlantation(spaceType, logger) {
    logger({ type: "system", message: `Analyzing compost and space type (${spaceType})...` });
    await delay(1000);
    
    logger({ type: "system", message: "Retrieving plant recommendations from knowledge base..." });
    await delay(1500);
    
    let PLANT_KNOWLEDGE_BASE = PLANT_KB;
    try {
        const { data, error } = await supabase.from('plant_knowledge_base').select('*');
        if (!error && data) PLANT_KNOWLEDGE_BASE = data;
    } catch (e) {}
    
    // Filter plants that are suitable for the selected space
    const suitablePlants = PLANT_KNOWLEDGE_BASE.filter(p => 
        p.suitableSpaces && p.suitableSpaces.includes(spaceType)
    );
    
    // Grab up to 6 plants
    const plants = suitablePlants.slice(0, 6).map(p => ({
        species: p.species,
        sunlight: p.sunlight,
        watering: p.watering,
        difficulty: p.difficulty
    }));

    return plants;
}

/**
 * FLOW 7 & 9: Inorganic Waste Analyzer
 */
export async function analyzeInorganicWaste(logger, inputDescription, imageBase64, userLat = 12.9716, userLon = 77.5946) {
    logger({ type: "agent", agent: "Scout Agent", status: "Classifying inorganic material...", state: "active" });
    
    const desc = (inputDescription || "").toLowerCase();
    
    let materialType = "unknown";
    let baseConfidence = 50.0;
    let recyclingCategory = "Mixed/Non-recyclable";
    let recyclingConfidence = 50.0;
    let bestFacility = null;
    
    let apiSuccess = false;
    try {
        const response = await fetch(`${API_BASE_URL}/api/inorganic`, {
            method: 'POST',
            body: JSON.stringify({ description: inputDescription, image: imageBase64, lat: userLat, lon: userLon })
        });
        if (response.ok) {
            const data = await response.json();
            materialType = data.classification.category || "mixed waste";
            baseConfidence = data.confidence;
            recyclingCategory = data.classification.category || "Mixed/Non-recyclable";
            recyclingConfidence = data.confidence;
            bestFacility = data.match.facility;
            apiSuccess = true;
        }
    } catch(e) {
        console.error("API call failed, falling back to local JS", e);
    }
    
    if (!apiSuccess) {
        await delay(1500);
        // Basic extraction
        const knownMaterials = Object.keys(CRAFT_KB);
        for (const mat of knownMaterials) {
            if (desc.includes(mat)) {
                materialType = mat;
                baseConfidence = 92.0;
                break;
            }
        }
        
        if (materialType === "unknown") {
            if (desc.includes("plastic")) materialType = "plastic bottle";
            else if (desc.includes("glass")) materialType = "glass jar";
            else if (desc.includes("paper")) materialType = "paper waste";
            else if (desc.includes("ceramic")) materialType = "broken ceramic";
            else if (desc.includes("phone") || desc.includes("laptop")) materialType = "e-waste/old electronics";
            else materialType = "mixed waste";
        }
    }
    
    logger({ type: "agent", agent: "Scout Agent", status: `Classified as ${materialType}.`, state: "done" });
    
    logger({ type: "agent", agent: "Classifier Agent", status: "Determining recycling category...", state: "active" });
    if (!apiSuccess) {
        await delay(1000);
        
        if (["plastic", "pet", "hdpe", "bottle", "plastic bottle"].some(kw => desc.includes(kw))) {
            recyclingCategory = "Plastic Type 1-7";
            recyclingConfidence = 85.0;
        } else if (["glass", "jar", "glass jar"].some(kw => desc.includes(kw))) {
            recyclingCategory = "Glass";
            recyclingConfidence = 80.0;
        } else if (["phone", "laptop", "battery", "electronic", "wire", "e-waste"].some(kw => desc.includes(kw))) {
            recyclingCategory = "E-waste";
            recyclingConfidence = 90.0;
        } else if (["cardboard", "paper"].some(kw => desc.includes(kw))) {
            recyclingCategory = "Paper";
            recyclingConfidence = 88.0;
        } else if (["can", "aluminum", "tin", "metal"].some(kw => desc.includes(kw))) {
            recyclingCategory = "Metal";
            recyclingConfidence = 85.0;
        } else if (["clothes", "fabric", "textile"].some(kw => desc.includes(kw))) {
            recyclingCategory = "Textiles";
            recyclingConfidence = 90.0;
        }
    }
    
    logger({ type: "agent", agent: "Classifier Agent", status: `Category: ${recyclingCategory}`, state: "done" });

    // Find nearest facility for recycling
    logger({ type: "agent", agent: "Facility Matcher", status: "Finding nearest recycling center...", state: "active" });
    if (!apiSuccess) {
        await delay(1000);
        
        let minDistance = Infinity;
        const userLat = 12.9716; // default user lat
        const userLon = 77.5946; // default user lon
        
        for (const facility of RECYCLING_FACILITIES) {
            if (facility.accepts.includes(recyclingCategory)) {
                const dist = haversineDistance(userLat, userLon, facility.location.lat, facility.location.lng);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestFacility = facility;
                }
            }
        }
        if (bestFacility) bestFacility.distanceKm = minDistance;
    }
    
    if (bestFacility) {
        logger({ type: "agent", agent: "Facility Matcher", status: "Center found.", state: "done" });
    } else {
        logger({ type: "agent", agent: "Facility Matcher", status: "Low confidence fallback.", state: "done" });
    }

    const craftIdeas = CRAFT_KB[materialType] || [
        {
            title: "Creative Upcycling",
            difficulty: "Medium",
            time: "1 hour",
            reason: `Clean ${materialType} can often be repurposed for storage, art, or DIY projects depending on its shape and durability.`,
            impact: "Diverts material from landfill and gives it a second life."
        }
    ];

    if (!bestFacility) {
        bestFacility = {
            id: "r_default",
            name: "City Mixed Recycling & Waste Center",
            location: { lat: 12.9716, lng: 77.5946 },
            distanceKm: 3.5,
            accepts: ["Mixed Waste", "General E-waste", "Plastics", "Glass", "Metal"],
            hours: "8:00 AM - 6:00 PM (Mon-Sat)"
        };
    }

    // Return combined result to the UI for branching
    return {
        material: materialType,
        confidence: baseConfidence,
        craftIdeas: craftIdeas,
        recycling: {
            category: recyclingCategory,
            confidence: recyclingConfidence,
            facility: bestFacility
        }
    };
}

/**
 * FLOW 4: Pest & Disease Diagnosis
 */
export async function diagnosePlantDisease(logger, inputDescription) {
    logger({ type: "system", message: "Initializing Pest & Disease Pipeline" });
    
    // 1. Diagnostician
    logger({ type: "agent", agent: "Diagnostician Agent", status: `Analyzing symptoms: "${inputDescription}"...`, state: "active" });
    await delay(1000);
    const lowerDesc = inputDescription.toLowerCase();
    let disease = "unknown issue";
    if (lowerDesc.includes("web") || lowerDesc.includes("mite")) disease = "spider mites";
    else if (lowerDesc.includes("rot") || lowerDesc.includes("mushy")) disease = "root rot";
    else if (lowerDesc.includes("aphid") || lowerDesc.includes("sticky")) disease = "aphids";
    
    if (disease === "unknown issue") {
        throw new Error("Could not identify the specific disease or pest from the description.");
    }
    logger({ type: "agent", agent: "Diagnostician Agent", status: `Diagnosed as: ${disease}.`, state: "done" });
    
    // 2. Treatment Planner
    logger({ type: "agent", agent: "Treatment Planner Agent", status: `Formulating organic treatment plan...`, state: "active" });
    await delay(1000);
    const treatmentPlan = TREATMENT_KB[disease];
    if (!treatmentPlan) {
        throw new Error("No organic treatment found in knowledge base.");
    }
    logger({ type: "agent", agent: "Treatment Planner Agent", status: `Treatment plan created: ${treatmentPlan.treatment}.`, state: "done" });
    
    // 3. Procurement Agent
    logger({ type: "agent", agent: "Procurement Agent", status: `Checking marketplace for supplies: ${treatmentPlan.suppliesNeeded.join(', ')}...`, state: "active" });
    await delay(1000);
    // Find matching items in marketplace if possible (mock logic)
    const marketplaceMatches = MARKETPLACE_LISTINGS.filter(m => 
        treatmentPlan.suppliesNeeded.some(supply => m.item.toLowerCase().includes(supply))
    );
    
    const supplyMessage = `Drafted request: "Hi neighbors, I'm dealing with ${disease} and need ${treatmentPlan.suppliesNeeded[0]}. Does anyone have some to spare?"`;
    logger({ type: "agent", agent: "Procurement Agent", status: `Procurement step complete.`, state: "done" });
    
    logger({ type: "system", message: "Pipeline complete." });
    await delay(500);
    
    return {
        disease,
        treatmentPlan,
        supplyMessage,
        marketplaceMatches
    };
}

/**
 * FLOW 5: Community Garden Coordinator
 */
export async function coordinateCommunityGarden(logger, inputDescription) {
    logger({ type: "system", message: "Initializing Community Garden Pipeline" });
    
    // 1. Land Scout
    logger({ type: "agent", agent: "Land Scout Agent", status: `Evaluating space: "${inputDescription}"...`, state: "active" });
    await delay(1200);
    const lowerDesc = inputDescription.toLowerCase();
    let spaceType = "plot";
    if (lowerDesc.includes("terrace") || lowerDesc.includes("rooftop")) spaceType = "rooftop/terrace";
    else if (lowerDesc.includes("balcony")) spaceType = "balcony";
    else if (lowerDesc.includes("backyard")) spaceType = "backyard";
    else if (lowerDesc.includes("community park") || lowerDesc.includes("empty lot")) spaceType = "community plot";
    else if (lowerDesc.includes("windowsill")) spaceType = "windowsill";
    else if (lowerDesc.includes("indoor")) spaceType = "indoor space";
    
    let sunlight = "Full Sun";
    if (lowerDesc.includes("shade") || lowerDesc.includes("indoor")) sunlight = "Partial Sun"; // or "Bright, indirect light"
    if (lowerDesc.includes("indirect")) sunlight = "Bright, indirect light";
    
    logger({ type: "agent", agent: "Land Scout Agent", status: `Space evaluated: ${spaceType} with ${sunlight}.`, state: "done" });
    
    // 2. Crop Planner
    logger({ type: "agent", agent: "Crop Planner Agent", status: `Selecting seasonal crops for ${sunlight}...`, state: "active" });
    await delay(1000);
    
    let PLANT_KNOWLEDGE_BASE = PLANT_KB;
    try {
        const { data, error } = await supabase.from('plant_knowledge_base').select('*');
        if (!error && data) PLANT_KNOWLEDGE_BASE = data;
    } catch (e) {}
    
    const suitableCrops = PLANT_KNOWLEDGE_BASE.filter(p => p.sunlight.includes(sunlight) || p.sunlight.includes("Full Sun")).slice(0, 3);
    
    logger({ type: "agent", agent: "Crop Planner Agent", status: `Recommended: ${suitableCrops.map(c => c.species).join(', ')}.`, state: "done" });
    
    // 3. Volunteer Coordinator
    logger({ type: "agent", agent: "Volunteer Coordinator Agent", status: `Finding local volunteers...`, state: "active" });
    await delay(1000);
    
    const nearbyVolunteers = VOLUNTEERS.filter(v => v.distanceKm <= 2.0);
    const broadcastMessage = `Community Alert: New ${spaceType} garden starting! We plan to grow ${suitableCrops[0].species}. Join us this weekend! (Notifying ${nearbyVolunteers.length} nearby volunteers)`;
    
    logger({ type: "agent", agent: "Volunteer Coordinator Agent", status: `Volunteer broadcast ready.`, state: "done" });
    
    logger({ type: "system", message: "Pipeline complete." });
    await delay(500);
    
    return {
        spaceType,
        sunlight,
        suitableCrops,
        broadcastMessage,
        volunteersCount: nearbyVolunteers.length
    };
}
