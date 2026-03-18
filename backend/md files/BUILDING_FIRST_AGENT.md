# 🚀 Building the First Agent: Classifier

## Quick Start Guide - Classifier Agent

The **Classifier Agent** is the entry point. It reads the transcript and detects workflow types.

---

## Task

Create [backend/agents/classifier.py](../agents/classifier.py) that:
1. ✅ Reads `state.transcript`
2. ✅ Uses LLM to detect workflow types
3. ✅ Outputs `state.workflows`
4. ✅ Logs every decision with reasoning

---

## Template

```python
# backend/agents/classifier.py
"""
Classifier Agent
Detects workflow types from meeting transcript.

Workflow Types:
- task_creation: "Build feature X by Friday"
- approval_needed: "Need $5K budget approval"
- scheduling: "Schedule meeting with client"
- issue_resolution: "Fix the bug in authentication"
"""
import uuid
from typing import List
from core import BaseAgent, AgentState, Workflow, WorkflowType, DecisionType

class ClassifierAgent(BaseAgent):
    """
    Analyzes meeting transcript and detects workflow types.
    
    Uses LLM with structured prompting to ensure consistent JSON output.
    """
    
    def __init__(self, llm_client):
        """
        Initialize classifier.
        
        Args:
            llm_client: Gemini or Groq client for LLM calls
        """
        super().__init__(name="classifier", llm_client=llm_client)
    
    async def execute(self, state: AgentState) -> AgentState:
        """
        Classify the meeting transcript into workflow types.
        
        Args:
            state: Current agent state with transcript
            
        Returns:
            Updated state with detected workflows
        """
        
        # 1. Read transcript from state
        transcript = state.transcript
        self.logger.info(f"Classifying meeting: {state.meeting_id}")
        
        # 2. Create LLM prompt with structured output
        prompt = self._create_classification_prompt(transcript)
        
        # 3. Call LLM
        try:
            response = self.llm_client.generate(
                prompt=prompt,
                temperature=0.3,  # Lower temperature for classification
            )
            
            # 4. Parse response
            workflows = self._parse_workflows(response)
            
        except Exception as e:
            self.logger.error(f"LLM call failed: {e}")
            # Add error to state (orchestrator will handle retry)
            state.errors.append({
                "agent": "classifier",
                "error": str(e),
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            })
            return state
        
        # 5. Update state with detected workflows
        state.workflows = workflows
        
        # 6. 🔥 CRITICAL: Add audit decision with REASON
        self.add_audit_decision(
            state=state,
            action=f"Detected {len(workflows)} workflow types: {', '.join([w.type.value for w in workflows])}",
            reason=self._get_classification_reason(transcript, workflows),
            input_data={
                "transcript": transcript[:500],  # Truncate for audit storage
            },
            output_data={
                "workflows_count": len(workflows),
                "workflows": [w.to_dict() for w in workflows],
            },
            success=True,
        )
        
        self.logger.info(f"Classifier detected {len(workflows)} workflows")
        return state
    
    def _create_classification_prompt(self, transcript: str) -> str:
        """
        Create structured prompt for workflow classification.
        
        Args:
            transcript: Meeting transcript/text
            
        Returns:
            Prompt string
        """
        return f"""
You are an AI assistant analyzing meeting transcripts to detect workflow types.

Analyze the following meeting transcript and identify ALL workflow types mentioned:

WORKFLOW TYPES (with examples):
1. task_creation - Mentions specific deliverables or TODOs
   Examples: "Build backend by Friday", "Create landing page", "Fix auth bug"

2. approval_needed - Mentions need for approval or decision
   Examples: "Need budget approval", "Requires sign-off", "Pending CEO review"

3. scheduling - Mentions scheduling meetings or events
   Examples: "Schedule client demo", "Book meeting with product team", "Calendar invite needed"

4. issue_resolution - Mentions problem-solving or debugging
   Examples: "Fix the crash", "Debug performance issue", "Resolve customer complaint"

TRANSCRIPT:
---
{transcript}
---

Your task: Extract ALL workflow types detected in the transcript.

Return ONLY valid JSON (no markdown, no extra text):
{{
  "workflows": [
    {{
      "type": "task_creation",
      "confidence": 0.95,
      "description": "Backend development with Friday deadline",
      "key_phrases": ["build backend", "by Friday"]
    }},
    {{
      "type": "approval_needed",
      "confidence": 0.88,
      "description": "Budget approval for 5 lakh rupees",
      "key_phrases": ["need approval", "5L"]
    }}
  ]
}}

Rules:
- type MUST be one of: task_creation, approval_needed, scheduling, issue_resolution
- confidence MUST be 0-1 float
- Only include workflows explicitly mentioned or strongly implied
- Return empty array if no workflows detected
"""
    
    def _parse_workflows(self, response: str) -> List[Workflow]:
        """
        Parse LLM response into Workflow objects.
        
        Args:
            response: LLM response (should be JSON)
            
        Returns:
            List of Workflow objects
        """
        import json
        
        try:
            # Try to parse JSON
            data = json.loads(response)
        except json.JSONDecodeError:
            # If parsing fails, try to extract JSON from response
            import re
            match = re.search(r'\{.*\}', response, re.DOTALL)
            if match:
                data = json.loads(match.group())
            else:
                self.logger.error("Could not parse LLM response as JSON")
                return []
        
        workflows = []
        for w in data.get("workflows", []):
            try:
                workflow = Workflow(
                    type=WorkflowType(w["type"]),
                    description=w.get("description", ""),
                    confidence=min(1.0, max(0.0, w.get("confidence", 0.5))),
                )
                workflows.append(workflow)
            except (ValueError, KeyError) as e:
                self.logger.warning(f"Failed to parse workflow: {w}, error: {e}")
                continue
        
        return workflows
    
    def _get_classification_reason(self, transcript: str, workflows: List[Workflow]) -> str:
        """
        Generate explanation of why these workflows were detected.
        THIS IS CRITICAL FOR AUDIT TRAIL EXPLAINABILITY!
        
        Args:
            transcript: Original transcript
            workflows: Detected workflows
            
        Returns:
            Explanation string for audit trail
        """
        if not workflows:
            return "No workflow patterns detected in transcript"
        
        type_explanations = {
            WorkflowType.TASK_CREATION: "mentions deliverables or action items",
            WorkflowType.APPROVAL_NEEDED: "mentions need for approval or decision",
            WorkflowType.SCHEDULING: "mentions scheduling meetings or calendar events",
            WorkflowType.ISSUE_RESOLUTION: "mentions problems requiring resolution",
        }
        
        reasons = []
        for w in workflows:
            reason = type_explanations.get(w.type, "workflow detected")
            reasons.append(f"{w.type.value} ({reason}, confidence: {w.confidence:.0%})")
        
        return "Detected workflows: " + "; ".join(reasons)


# ============ USAGE ============
if __name__ == "__main__":
    """
    Example usage (for testing):
    
    from agents.classifier import ClassifierAgent
    from core import AgentState
    
    # Create agent
    classifier = ClassifierAgent(llm_client=gemini_client)
    
    # Create state
    state = AgentState(
        meeting_id="test-1",
        transcript="Rahul will build backend by Friday. Need ₹5L approval.",
    )
    
    # Execute
    state = await classifier.execute(state)
    
    # Check results
    print(f"Workflows: {state.workflows}")
    print(f"Audit trail: {state.audit_trail}")
    """
    pass
```

---

## Key Points

### 1. Inherit from BaseAgent
```python
class ClassifierAgent(BaseAgent):
    def __init__(self, llm_client):
        super().__init__(name="classifier", llm_client=llm_client)
```

### 2. Implement execute() method
```python
async def execute(self, state: AgentState) -> AgentState:
    # Read from state
    transcript = state.transcript
    
    # Do work
    workflows = classify(transcript)
    
    # Modify state
    state.workflows = workflows
    
    # Return
    return state
```

### 3. Log Every Decision (🔥 CRITICAL)
```python
self.add_audit_decision(
    state=state,
    action="Detected 2 workflows",  # What did you do?
    reason="Transcript mentions...",  # WHY did you do it? (for explainability)
    input_data={"transcript": "..."},
    output_data={"workflows": [...]},
    success=True,
)
```

### 4. Handle Errors Gracefully
```python
try:
    response = self.llm_client.generate(prompt)
except Exception as e:
    state.errors.append({"agent": "classifier", "error": str(e)})
    return state  # Don't crash - let orchestrator handle it
```

---

## Testing the Classifier

```python
import asyncio
from agents.classifier import ClassifierAgent
from core import AgentState

async def test_classifier():
    # Mock LLM client
    class MockLLM:
        def generate(self, prompt, temperature=0.3):
            return """{
                "workflows": [
                    {
                        "type": "task_creation",
                        "confidence": 0.95,
                        "description": "Backend development",
                        "key_phrases": ["build backend"]
                    }
                ]
            }"""
    
    # Create agent
    classifier = ClassifierAgent(llm_client=MockLLM())
    
    # Create state
    state = AgentState(
        meeting_id="test-1",
        transcript="Rahul will build backend by Friday."
    )
    
    # Execute
    state = await classifier.execute(state)
    
    # Check results
    print(f"✅ Workflows detected: {len(state.workflows)}")
    print(f"✅ Audit entries: {len(state.audit_trail)}")
    
    for entry in state.audit_trail:
        print(f"\n  Agent: {entry.agent_name}")
        print(f"  Action: {entry.action}")
        print(f"  Reason: {entry.reason}")

# Run test
asyncio.run(test_classifier())
```

---

## Integration with Orchestrator

Once built, add to orchestrator:

```python
from agents.classifier import ClassifierAgent

# Initialize orchestrator
orchestrator = AgentOrchestrator()

# Create and register classifier
classifier = ClassifierAgent(llm_client=gemini_client)
orchestrator.register_agent(classifier)

# If you build a Planner next
from agents.planner import PlannerAgent
planner = PlannerAgent(llm_client=gemini_client)
orchestrator.register_agent(planner)

# Define flow
orchestrator.add_flow("classifier", "planner")

# Process meeting
state = await orchestrator.process_meeting(
    meeting_id="m-123",
    transcript="Rahul will build backend by Friday..."
)

# Check results
print(f"Workflows: {state.workflows}")
print(f"Audit trail:")
for entry in state.audit_trail:
    print(f"  - {entry.agent_name}: {entry.action}")
    print(f"    Reason: {entry.reason}")
```

---

## Next Agents to Build

After Classifier, build in this order:

1. ✅ **Classifier** (detect workflow types) ← START HERE
2. **Planner** (decompose into tasks)
3. **Executor** (run tools)
4. **Monitor** (track progress)
5. **Recovery** (error handling)

Each follows the same pattern!

---

## Tips

✅ **Use structured prompts** - JSON schema output ensures parseable responses  
✅ **Handle LLM failures** - Add to state.errors, don't crash  
✅ **Log with reasons** - Every audit entry needs a "reason" field  
✅ **Keep it simple** - Do one job well (Classifier only classifies)  
✅ **Test with mock LLM** - Don't call real API during development  

---

Ready to implement? Create the file and start coding! 🚀
