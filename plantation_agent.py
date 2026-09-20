from agents_core import AgentTrace, BaseAgent
from mock_db import PLANT_KB

class RetrieverAgent(BaseAgent):
    def __init__(self):
        super().__init__("Retriever Agent")

    def run(self, space_type: str, season: str) -> AgentTrace:
        space_lower = space_type.lower()
        season_lower = season.lower()
        
        candidates = []
        for plant in PLANT_KB:
            if space_lower in [s.lower() for s in plant["suitable_spaces"]] and season_lower in [s.lower() for s in plant["season"]]:
                candidates.append(plant)
                
        status = f"Found {len(candidates)} candidates for {space_type} in {season}"
        return AgentTrace(agent_name=self.name, status=status, data=candidates, confidence=100.0)

class RankerAgent(BaseAgent):
    def __init__(self):
        super().__init__("Ranker Agent")

    def run(self, candidates: list) -> AgentTrace:
        if not candidates:
            return AgentTrace(agent_name=self.name, status="No candidates to rank", data=[])
            
        # Rank by difficulty (ascending) and pollinator_friendly (True first)
        # Using a custom score: lower score is better.
        # Difficulty: 1 to 5
        # Pollinator friendly: subtract 1 from score if True.
        
        def rank_key(p):
            return p["difficulty"] - (1 if p["pollinator_friendly"] else 0)
            
        ranked = sorted(candidates, key=rank_key)
        top_recommendations = ranked[:6] # Top 4-6
        
        status = f"Ranked {len(top_recommendations)} recommendations"
        return AgentTrace(agent_name=self.name, status=status, data=top_recommendations)
