import math
import os
import json
import base64
import io
from PIL import Image
from agents_core import AgentTrace, BaseAgent
from mock_db import RECYCLING_FACILITIES

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

class ClassifierAgent(BaseAgent):
    def __init__(self):
        super().__init__("Classifier Agent")

    def run(self, material_description: str, image_base64: str = None) -> AgentTrace:
        if image_base64:
            try:
                import google.generativeai as genai
                api_key = os.environ.get("GEMINI_API_KEY")
                if not api_key:
                    raise ValueError("No GEMINI_API_KEY set")
                
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("gemini-3.6-flash")
                
                if "," in image_base64:
                    image_base64 = image_base64.split(",")[1]
                    
                image_data = base64.b64decode(image_base64)
                image = Image.open(io.BytesIO(image_data))
                
                prompt = "Identify this inorganic waste item. Return JSON with: category (Plastic Type 1-7/Glass/E-waste/Mixed/Non-recyclable), condition (intact/broken), size_estimate, confidence (0-100). If unsure, say so honestly. Respond only with valid JSON."
                response = model.generate_content([prompt, image])
                
                text = response.text.strip()
                if text.startswith('```json'):
                    text = text[7:-3].strip()
                elif text.startswith('```'):
                    text = text[3:-3].strip()
                    
                parsed = json.loads(text)
                category = parsed.get("category", "Mixed/Non-recyclable")
                confidence = float(parsed.get("confidence", 50.0))
                
                return AgentTrace(
                    agent_name=self.name,
                    status=f"Classified via Vision as {category}",
                    data=parsed,
                    confidence=confidence,
                )
            except Exception as e:
                print(f"[LLM Warning] Vision classification failed: {e}. Falling back to text parsing.")

        desc = material_description.lower()
        category = "Mixed/Non-recyclable"
        confidence = 50.0

        if any(kw in desc for kw in ["plastic", "pet", "hdpe"]):
            category = "Plastic Type 1-7"
            confidence = 85.0
        elif any(kw in desc for kw in ["glass", "bottle", "jar"]):
            category = "Glass"
            confidence = 80.0
        elif any(kw in desc for kw in ["phone", "laptop", "battery", "electronic", "wire"]):
            category = "E-waste"
            confidence = 90.0

        status = f"Classified as {category}"
        return AgentTrace(agent_name=self.name, status=status, data={"category": category}, confidence=confidence)

class FacilityMatcherAgent(BaseAgent):
    def __init__(self):
        super().__init__("Facility Matcher Agent")

    def run(self, category: str, confidence: float, user_lat: float, user_lon: float) -> AgentTrace:
        if confidence < 60.0:
            status = "Low confidence fallback"
            return AgentTrace(
                agent_name=self.name, 
                status=status, 
                data={"message": "Not sure? Take to general e-waste center or mixed recycling."}
            )

        best_facility = None
        min_dist = float('inf')

        for facility in RECYCLING_FACILITIES:
            if category in facility["accepted_categories"]:
                dist = haversine_km(user_lat, user_lon, facility["lat"], facility["lon"])
                if dist < min_dist:
                    min_dist = dist
                    best_facility = facility

        if best_facility:
            status = f"Found nearest facility: {best_facility['name']} at {min_dist:.1f}km"
            data = {"facility": best_facility, "distance_km": round(min_dist, 1)}
        else:
            status = "No suitable facility found"
            data = {"message": "Could not find a facility for this material nearby."}

        return AgentTrace(agent_name=self.name, status=status, data=data)
