import os
from dotenv import load_dotenv
from rag_plant import retrieve_and_generate, chat_assistant_rag
from agents import ScoutAgent, MatcherAgent, CoordinatorAgent

def test_questions():
    print("=== Testing Plant Care RAG ===")
    plant_name = "Marigold"
    
    questions = [
        ("Tell me about Marigold.", "general"),
        ("How often should I water my Marigold?", "water"),
        ("Does my Marigold need a lot of sunlight?", "sun"),
        ("What kind of soil pH is best for Marigold?", "soil"),
        ("My Marigold is dying! What's wrong?", "issue"),
        ("How much water does a Rose need?", "water"), # Testing a plant with missing data
    ]
    
    for q, intent in questions:
        print(f"\nQuestion: {q}")
        if intent == "general":
            t = retrieve_and_generate(q, plant_name)
        else:
            t = chat_assistant_rag(intent, "Rose" if "Rose" in q else plant_name)
        print(f"[{t.agent_name}] {t.status}")
        print(f"Response: {t.data['response']}")

    print("\n=== Testing Compost Message Coordinator ===")
    scout_data = {'material': 'vegetable', 'confidence': 85.0, 'freshness': 'rotting', 'est_weight_kg': 12.5}
    match_data = {'name': 'Central Composter', 'distance_km': 4.2, 'accepted': ['vegetable', 'fruit', 'leaves']}
    
    print("Scenario: Rotting vegetables, 12.5kg, Central Composter (4.2km away)")
    t = CoordinatorAgent().run(scout_data, match_data)
    print(f"Drafted Message:\n{t.data['message']}")

if __name__ == "__main__":
    load_dotenv()
    if os.environ.get("GEMINI_API_KEY"):
        print("Running with Gemini API live LLM mode.")
    else:
        print("Running in fallback template mode.")
    test_questions()
