import sys, os, io, traceback

LOG = "test_log.txt"
f = open(LOG, "w", encoding="utf-8")

def log(msg):
    f.write(str(msg) + "\n")
    f.flush()

try:
    log("STEP 1: Importing...")
    from state import AgentState
    from utils.llm import call_gemini, call_gemini_safe
    from graph import build_graph
    log("STEP 1: All imports OK")

    log("STEP 2: Building graph...")
    graph = build_graph()
    log("STEP 2: Graph built OK")

    log("STEP 3: Testing Gemini API...")
    result = call_gemini("Reply with only the word HELLO")
    log(f"STEP 3: Gemini response = {result}")

    log("STEP 4: Running scenario...")
    state = {
        "meeting_transcript": "Assign the frontend redesign initiative to the design team by first analyzing the current interface to identify gaps in usability, responsiveness, accessibility, and visual consistency with the brand guidelines. Break down the redesign into structured components such as wireframing, prototyping, high-fidelity mockups, and design system updates, and allocate these tasks to appropriate team members based on their roles and expertise. Establish a clear timeline with prioritized milestones, ensuring critical user-facing pages are addressed first, and define collaboration workflows between the design, frontend development, and product teams using suitable tools and communication channels. Additionally, schedule a follow-up meeting for tomorrow with all relevant stakeholders, automatically generating a detailed agenda that includes progress updates, potential blockers, feedback collection, and next steps. Finally, identify possible risks such as delays, misalignment, or scope creep, and include mitigation strategies, while producing a structured summary of task assignments, timelines, meeting details, and risk assessment.",
        "dynamic_plan": [], "current_agent_index": 0, "completed_agents": [],
        "orchestrator_reasoning": "", "meeting_summary": "",
        "assigned_tasks": [], "scheduled_events": [], "bug_tickets": [],
        "followup_items": [], "execution_queue": [], "current_step_index": 0,
        "execution_results": [], "errors": [], "recovery_actions": [], "audit_log": [],
    }
    
    nodes = []
    for step_output in graph.stream(state):
        for node_name, updates in step_output.items():
            nodes.append(node_name)
            if node_name == "orchestrator":
                log(f"  ORCHESTRATOR dynamic_plan = {updates.get('dynamic_plan', [])}")
                log(f"  ORCHESTRATOR reasoning = {updates.get('orchestrator_reasoning', '')}")
    
    log(f"STEP 4: Nodes visited = {nodes}")
    log("SUCCESS")

except Exception as e:
    log(f"ERROR: {e}")
    log(traceback.format_exc())

f.close()

# Print in ASCII so console can handle it
with open(LOG, "r", encoding="utf-8") as rf:
    for line in rf:
        try:
            sys.stdout.write(line.encode("ascii", "replace").decode("ascii"))
        except:
            pass
