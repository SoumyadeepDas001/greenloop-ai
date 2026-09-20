from agents_core import AgentTrace, BaseAgent
import os
import re
import json
import base64
import io
from PIL import Image

class ScoutAgent(BaseAgent):
    def __init__(self):
        super().__init__("Scout Agent")

    # Freshness keywords → base confidence modifier
    FRESHNESS_MAP = {
        "fresh": 95.0,
        "wilted": 70.0,
        "dried": 55.0,
        "rotting": 40.0,
    }

    def run(self, description: str, image_base64: str = None) -> AgentTrace:
        if image_base64:
            try:
                import google.generativeai as genai
                api_key = os.environ.get("GEMINI_API_KEY")
                if not api_key:
                    raise ValueError("No GEMINI_API_KEY set")
                
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("gemini-3.6-flash")
                
                # strip potential data URI scheme
                if "," in image_base64:
                    image_base64 = image_base64.split(",")[1]
                    
                image_data = base64.b64decode(image_base64)
                image = Image.open(io.BytesIO(image_data))
                
                prompt = "Identify this waste item. Return JSON with: material (flower/leaves/vegetable), species_guess, freshness (fresh/wilted/dried/rotting), estimated_weight_kg, confidence (0-100). If unsure, say so honestly. Respond only with valid JSON."
                response = model.generate_content([prompt, image])
                
                text = response.text.strip()
                if text.startswith('```json'):
                    text = text[7:-3].strip()
                elif text.startswith('```'):
                    text = text[3:-3].strip()
                    
                parsed = json.loads(text)
                material = parsed.get("material", "organic")
                freshness = parsed.get("freshness", "unknown")
                est_weight_kg = float(parsed.get("estimated_weight_kg", 1.0))
                confidence = float(parsed.get("confidence", 50.0))
                
                return AgentTrace(
                    agent_name=self.name,
                    status=f"Classified via Vision as {material} (freshness={freshness}, est_weight={est_weight_kg}kg)",
                    data={
                        "type": material,
                        "confidence": confidence,
                        "freshness": freshness,
                        "quantityKg": est_weight_kg,
                        "species_guess": parsed.get("species_guess")
                    },
                    confidence=confidence,
                )
            except Exception as e:
                print(f"[LLM Warning] Vision classification failed: {e}. Falling back to text parsing.")

        desc = description.lower()

        # --- Material classification ---
        material = "organic"
        base_confidence = 50.0
        if "flower" in desc or "marigold" in desc:
            material = "flower"
            base_confidence = 80.0
        elif "leaves" in desc:
            material = "leaves"
            base_confidence = 70.0
        elif "vegetable" in desc or "fruit" in desc:
            material = "vegetable"
            base_confidence = 85.0

        # --- Freshness detection ---
        freshness = "unknown"
        for keyword, conf in self.FRESHNESS_MAP.items():
            if keyword in desc:
                freshness = keyword
                base_confidence = conf
                break

        # --- Weight extraction via regex ---
        weight_match = re.search(r'(\d+(?:\.\d+)?)\s*kg', desc)
        est_weight_kg = float(weight_match.group(1)) if weight_match else 1.0

        data = {
            "type": material,
            "confidence": base_confidence,
            "freshness": freshness,
            "quantityKg": est_weight_kg,
            "species_guess": None
        }

        return AgentTrace(
            agent_name=self.name,
            status=f"Classified as {material} (freshness={freshness}, est_weight={est_weight_kg}kg)",
            data=data,
            confidence=base_confidence,
        )

class MatcherAgent(BaseAgent):
    def __init__(self):
        super().__init__("Matcher Agent")
        
    def haversine_distance(self, lat1, lon1, lat2, lon2):
        import math
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) * math.sin(dlon / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def run(self, classification: dict, lat: float, lon: float) -> AgentTrace:
        print(f"[DEBUG] MatcherAgent.run classification input: {classification}")
        
        waste_type = classification.get("type", "").lower()
        type_aliases = {
            "marigold": ["marigold", "flower"],
            "rose": ["rose", "flower"],
            "jasmine": ["jasmine", "flower"],
            "hibiscus": ["hibiscus", "flower"],
            "sunflower": ["sunflower", "flower"],
            "chrysanthemum": ["chrysanthemum", "flower"],
            "lily": ["lily", "flower"],
            "zinnia": ["zinnia", "flower"],
            "petunia": ["petunia", "flower"],
            "orchid": ["orchid", "flower"],
            "flower": ["flower"],
            "leaves": ["leaves"],
            "vegetable": ["vegetable"],
            "fruit": ["fruit_waste", "vegetable"],
            "food_waste": ["food_waste", "vegetable"],
            "garden_trimmings": ["garden_trimmings", "leaves"]
        }
        search_tags = type_aliases.get(waste_type, [waste_type])

        units = [
            {
                "name": "EcoPark Community Compost", "lat": 12.9716, "lon": 77.5946, 
                "capacity_kg": 200, "currentLoadKg": 45, "rating": 4.4, 
                "acceptedMaterials": ["flower", "leaves", "vegetable"],
                "pickupsCompleted": 85, "type": "community_pit", "operatingHours": "7:00 AM - 6:00 PM (Daily)"
            },
            {
                "name": "Temple Trust Incense Maker", "lat": 12.9816, "lon": 77.5846, 
                "capacity_kg": 50, "currentLoadKg": 20, "rating": 4.7, 
                "acceptedMaterials": ["flower", "marigold"],
                "pickupsCompleted": 124, "type": "temple", "operatingHours": "6:00 AM - 12:00 PM (Daily)"
            }
        ]
        
        est_weight = classification.get("quantityKg", 1.0)
        scored_units = []

        for u in units:
            if not any(tag in u["acceptedMaterials"] for tag in search_tags):
                continue
            
            available = u["capacity_kg"] - u.get("currentLoadKg", 0)
            if available < est_weight:
                continue
                
            dist = self.haversine_distance(lat, lon, u["lat"], u["lon"])
            distance_score = max(0, 100 - (dist * 5))
            capacity_score = min(100, (available / 200) * 100)
            rating_score = (u.get("rating", 3.0) / 5) * 100
            
            specific_match = waste_type in u["acceptedMaterials"]
            materialBonus = 15 if (specific_match and len(u["acceptedMaterials"]) <= 4) else 0
            
            total_score = (distance_score * 0.40) + (capacity_score * 0.25) + (rating_score * 0.20) + materialBonus
            
            if u["name"] == "EcoPark Community Compost":
                print(f"[DEBUG] EcoPark scoring: distance_score={distance_score}, capacity_score={capacity_score}, rating_score={rating_score}, total_score={total_score}")
                
            u_copy = dict(u)
            u_copy["matchScore"] = round(total_score, 1)
            u_copy["distanceKm"] = round(dist, 2)
            u_copy["availableCapacityKg"] = available
            u_copy["location"] = {"lat": u["lat"], "lng": u["lon"]}
            scored_units.append(u_copy)

        scored_units.sort(key=lambda x: x["matchScore"], reverse=True)
        return AgentTrace(agent_name=self.name, status=f"Found {len(scored_units)} matches (for {est_weight}kg)", data=scored_units)

def call_llm_generate(classification: dict, match: dict) -> str:
    weight = classification.get('quantityKg', 'some')
    freshness = classification.get('freshness', 'unknown')
    distance = match.get('distance_km', 'a short distance')
    accepted = match.get('accepted', [])
    prompt = (f"Draft a short, friendly message to {match['name']} asking if I can "
              f"drop off approximately {weight}kg of {freshness} {classification.get('type', '')} waste today. "
              f"The facility is {distance} km away and accepts {accepted}.")
    try:
        import google.generativeai as genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("No GEMINI_API_KEY set")
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-3.6-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"\n[LLM Warning] Fallback triggered due to: {e}\n")
        return f"Hi {match['name']}, I have ~{weight}kg of {freshness} {classification.get('type', 'organic')} waste to drop off!"

class CoordinatorAgent(BaseAgent):
    def __init__(self):
        super().__init__("Coordinator Agent")
    def run(self, classification: dict, match: dict) -> AgentTrace:
        msg = call_llm_generate(classification, match)
        return AgentTrace(agent_name=self.name, status="Drafted message", data={"message": msg})


# Backwards compatibility wrappers for adk_agents.py
def scoutClassify(description: str, image_base64: str = None) -> dict:
    return ScoutAgent().run(description, image_base64).data

def matcherRankUnits(classification: dict, lat: float, lon: float) -> list:
    return MatcherAgent().run(classification, lat, lon).data

def coordinatorDraftMessage(classification: dict, match: dict) -> str:
    return CoordinatorAgent().run(classification, match).data["message"]
