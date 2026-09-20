from google_adk import Agent, tool, Pipeline
from agents import scoutClassify, matcherRankUnits, coordinatorDraftMessage

@tool
def scout_tool(description: str) -> dict:
    """Tool that wraps the existing scoutClassify logic."""
    return scoutClassify(description)

@tool
def matcher_tool(classification: dict, lat: float, lon: float) -> list:
    """Tool that wraps the existing matcherRankUnits logic."""
    return matcherRankUnits(classification, lat, lon)

@tool
def coordinator_tool(classification: dict, match: dict) -> str:
    """Tool that wraps the existing coordinatorDraftMessage logic."""
    return coordinatorDraftMessage(classification, match)

# 1. Scout Agent: Responsible for analyzing the input description.
ScoutAgent = Agent(
    name="ScoutAgent",
    instruction="Analyze the user's waste description, determine the material type, and assess confidence.",
    tools=[scout_tool]
)

# 2. Matcher Agent: Responsible for finding the best compost unit matches.
MatcherAgent = Agent(
    name="MatcherAgent",
    instruction="Find the best compost units matching the classified material and location coordinates.",
    tools=[matcher_tool]
)

# 3. Coordinator Agent: Responsible for drafting the drop-off message.
CoordinatorAgent = Agent(
    name="CoordinatorAgent",
    instruction="Draft a message for the best matching compost unit so the user can drop off their waste.",
    tools=[coordinator_tool]
)

# Orchestrate the agents sequentially so ADK handles the hand-offs
compost_pipeline = Pipeline(
    agents=[ScoutAgent, MatcherAgent, CoordinatorAgent],
    sequence=["ScoutAgent", "MatcherAgent", "CoordinatorAgent"]
)
