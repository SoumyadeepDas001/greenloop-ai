import os
import json
import base64
import io
from PIL import Image
from agents_core import AgentTrace
from mock_db import PLANT_KB

def generate_with_llm(context: str, query: str, fallback_response: str) -> str:
    prompt = f"""You are a helpful plant care assistant. Answer the user's query using ONLY the provided context. Do not add any outside facts.
    
Context:
{context}

Query:
{query}"""
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
        return fallback_response


def retrieve_and_generate(query: str, plant_name: str, image_base64: str = None) -> AgentTrace:
    # 0. If image provided, identify species via Gemini Vision
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
            
            prompt = "Identify the plant species in this image. Return JSON with a single key 'species_guess' containing the common name. If unsure, return 'unknown'."
            response = model.generate_content([prompt, image])
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:-3].strip()
            elif text.startswith('```'):
                text = text[3:-3].strip()
            parsed = json.loads(text)
            guess = parsed.get("species_guess", "unknown")
            if guess.lower() != "unknown":
                plant_name = guess
                print(f"[RAG Plant] Vision identified species: {plant_name}")
        except Exception as e:
            print(f"[LLM Warning] Vision plant ID failed: {e}. Falling back to provided text '{plant_name}'.")

    # 1. Retrieve
    plant = next((p for p in PLANT_KB if plant_name.lower() in p["species"].lower()), None)
    if not plant:
        return AgentTrace(agent_name="PlantCareRAG", status="Plant not found in KB", data={"response": f"I identified a {plant_name}, but I don't have detailed care information for it in my database yet." if image_base64 else f"Sorry, I don't have information on {plant_name}."})
    
    # Context building
    context = (f"Species: {plant.get('species')}\n"
               f"Watering: {plant.get('watering', 'N/A')}\n"
               f"Sunlight: {plant.get('sunlight', 'N/A')}\n"
               f"Soil pH: {plant.get('soilPH', 'N/A')}\n"
               f"Common Issues: {', '.join(plant.get('commonIssues', []))}\n")
    
    fallback = (f"Here is some information about {plant.get('species')}:\n"
                f"- Watering: {plant.get('watering')}\n"
                f"- Sunlight: {plant.get('sunlight')}\n"
                f"- Issues: {', '.join(plant.get('commonIssues', []))}")
    
    # 2. Generate
    response_text = generate_with_llm(context, query, fallback)
    return AgentTrace(agent_name="PlantCareRAG", status="Generated response", data={"response": response_text})


def chat_assistant_rag(sub_intent: str, plant_name: str) -> AgentTrace:
    # sub_intent can be 'water', 'sun', 'issue', 'soil'
    plant = next((p for p in PLANT_KB if plant_name.lower() in p["species"].lower()), None)
    if not plant:
        return AgentTrace(agent_name="ChatAssistantRAG", status="Plant not found", data={"response": f"Sorry, I don't have information on {plant_name}."})
    
    short_name = plant['species'].split(' ')[0]
    
    if sub_intent == 'water':
        context = f"Watering needs for {short_name}: {plant.get('watering', 'N/A')}"
        fallback = f"Make sure to water your {short_name} {plant.get('watering', 'regularly').lower()}."
        query = f"How often should I water my {short_name}?"
    elif sub_intent == 'sun':
        context = f"Sunlight needs for {short_name}: {plant.get('sunlight', 'N/A')}"
        fallback = f"{short_name}s love {plant.get('sunlight', 'good sunlight').lower()}."
        query = f"How much sunlight does my {short_name} need?"
    elif sub_intent == 'issue':
        issues = ", ".join(plant.get('commonIssues', []))
        context = f"Common issues for {short_name}: {issues}"
        fallback = f"Watch out for these issues with your {short_name}: {issues}."
        query = f"What are common problems with {short_name}?"
    elif sub_intent == 'soil':
        soil = plant.get('soilPH', '6.0 - 7.0')
        context = f"Soil pH for {short_name}: {soil}"
        fallback = f"The ideal soil pH for a {short_name} is {soil.lower()}."
        query = f"What soil pH does {short_name} need?"
    else:
        context = str(plant)
        fallback = f"Here is info about {short_name}."
        query = f"Tell me about {short_name}."
        
    response_text = generate_with_llm(context, query, fallback)
    return AgentTrace(agent_name="ChatAssistantRAG", status=f"Generated {sub_intent} response", data={"response": response_text})
