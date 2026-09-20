import os
from dotenv import load_dotenv
from agents import ScoutAgent, MatcherAgent, CoordinatorAgent
from plantation_agent import RetrieverAgent, RankerAgent
from recycling_agent import ClassifierAgent, FacilityMatcherAgent
from rag_plant import retrieve_and_generate, chat_assistant_rag

def demo_compost_pipeline():
    print("=== Demo 1: Compost Pipeline ===")
    desc = "3.2kg of wilted marigold flowers"
    print(f"Input: {desc}")
    
    t1 = ScoutAgent().run(desc)
    print(t1)
    
    t2 = MatcherAgent().run(t1.data, lat=12.975, lon=77.590)
    print(t2)
    
    if t2.data:
        t3 = CoordinatorAgent().run(t1.data, t2.data[0])
        print(t3)
    print("\n")

def demo_plantation_pipeline():
    print("=== Demo 2: Plantation Guide ===")
    space = "Balcony"
    season = "Summer"
    print(f"Input: Space='{space}', Season='{season}'")
    
    t1 = RetrieverAgent().run(space, season)
    print(t1)
    
    t2 = RankerAgent().run(t1.data)
    print(t2)
    print("\n")

def demo_recycling_pipeline():
    print("=== Demo 3: Recyclable Sorting ===")
    desc = "An old broken laptop and some wires"
    user_lat, user_lon = 12.980, 77.600
    print(f"Input: '{desc}' at {user_lat}, {user_lon}")
    
    t1 = ClassifierAgent().run(desc)
    print(t1)
    
    t2 = FacilityMatcherAgent().run(t1.data["category"], t1.confidence, user_lat, user_lon)
    print(t2)
    print("\n")

def demo_rag_pipeline():
    print("=== Demo 4: Plant Care RAG & Chat Sub-answers ===")
    plant_name = "Tomato"
    
    print(f"Input: How do I care for {plant_name}?")
    t1 = retrieve_and_generate(f"How do I care for {plant_name}?", plant_name)
    print(t1)
    
    print(f"\nInput: How often should I water my {plant_name}?")
    t2 = chat_assistant_rag("water", plant_name)
    print(t2)
    
    print(f"\nInput: What is wrong with my {plant_name}? The leaves are turning yellow.")
    t3 = chat_assistant_rag("issue", plant_name)
    print(t3)
    print("\n")

if __name__ == "__main__":
    load_dotenv()
    
    if os.environ.get("GEMINI_API_KEY"):
        print("🚀 Running with live LLM generation (Gemini API key detected).\n")
    else:
        print("⚠️ Running with template fallback (no API key detected).\n")

    demo_compost_pipeline()
    demo_plantation_pipeline()
    demo_recycling_pipeline()
    demo_rag_pipeline()
