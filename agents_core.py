from dataclasses import dataclass, field
from typing import Any, Optional, Dict

@dataclass
class AgentTrace:
    agent_name: str
    status: str
    data: Any
    confidence: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __str__(self):
        conf_str = f" (Confidence: {self.confidence}%)" if self.confidence is not None else ""
        return f"[{self.agent_name}] {self.status}{conf_str}\n  Data: {self.data}"

class BaseAgent:
    def __init__(self, name: str):
        self.name = name

    def run(self, *args, **kwargs) -> AgentTrace:
        raise NotImplementedError("Agents must implement the run method.")
