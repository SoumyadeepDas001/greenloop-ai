# Note: No live external tool is connected in this build.
# This demonstrates the Anthropic MCP protocol, not a production integration.

from mcp.server.fastmcp import FastMCP
from adk_agents import compost_pipeline

# Create the MCP server instance
mcp = FastMCP("GreenLoop")

@mcp.tool()
def match_compost_waste(description: str, lat: float, lon: float) -> str:
    """
    Runs the compost-matching ADK pipeline as a single MCP tool.
    This exposes our multi-agent workflow to any MCP-compatible client.
    """
    # In a real environment, this would run the ADK pipeline:
    # return compost_pipeline.run({"description": description, "lat": lat, "lon": lon})
    return f"Executed compost pipeline for '{description}' at ({lat}, {lon})"

if __name__ == "__main__":
    # Start the MCP server
    mcp.run()
