import os
import json
import streamlit as st
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Securely get API Key
hf_token = os.getenv("HUGGINGFACE_API_KEY")

# Initialize Inference Client
client = InferenceClient(model="mistralai/Mistral-7B-Instruct-v0.2", token=hf_token)

# System Prompt Template
SYSTEM_PROMPT = """You are an AI Meeting Intelligence Agent.

Your role is to analyze meeting conversations and extract all actionable events from the transcript provided by the user.

TASK:
From the given meeting transcript, identify and extract all real, actionable events.

An event includes:
- Meetings
- Deadlines
- Tasks / action items
- Follow-ups
- Calls / discussions
- Any decision requiring action

Ignore greetings, filler content, and casual conversation.

OUTPUT REQUIREMENT:
Return ONLY valid JSON in the following format:
{
  "events": [
    {
      "event_name": "",
      "description": "",
      "date": null,
      "time": null,
      "participants": [],
      "location": null,
      "priority": ""
    }
  ]
}

FIELD RULES:
- event_name -> short title (e.g., "Client Meeting", "Submit Report")
- description -> clear explanation of the event
- date -> convert into YYYY-MM-DD if possible, else null
- time -> HH (24-hour format), else null
- participants -> list of names, else []
- location -> meeting place/platform (Zoom, Office), else null
- priority:
  - "high" -> urgent tasks, deadlines
  - "medium" -> scheduled meetings
  - "low" -> optional or flexible items

IMPORTANT RULES:
- Do NOT hallucinate missing data
- Do NOT add extra fields
- Do NOT include explanations or text outside JSON
- Ensure valid JSON format (no trailing commas)
- If no events are found, return: { "events": [] }
"""

# Streamlit App UI
st.set_page_config(page_title="AI Meeting Intelligence Agent", layout="wide")

st.title("📅 AI Meeting Intelligence Agent")
st.markdown("Paste your meeting transcript below to extract actionable events, deadlines, and tasks.")

# Layout: Input on the left, Output on the right
col1, col2 = st.columns(2)

with col1:
    st.subheader("Input Transcript")
    transcript = st.text_area(
        "Enter the meeting conversation here:",
        height=400,
        placeholder="e.g., John: Let's schedule a follow-up on Friday at 10 AM to discuss the budget..."
    )
    analyze_button = st.button("Extract Actionable Events", type="primary")

with col2:
    st.subheader("Extracted Events (JSON)")
    if analyze_button and transcript:
        with st.spinner("Analyzing transcript..."):
            try:
                # Prepare messages for the model
                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"INPUT TRANSCRIPT:\n{transcript}"}
                ]
                
                # Call Inference API
                response = client.chat_completion(
                    messages=messages,
                    max_tokens=1000,
                    stream=False
                )
                
                raw_content = response.choices[0].message.content.strip()
                
                # Attempt to parse JSON to ensure it's valid
                try:
                    # Clean the response in case the model adds markdown code blocks
                    if raw_content.startswith("```json"):
                        raw_content = raw_content.replace("```json", "", 1).replace("```", "", 1).strip()
                    elif raw_content.startswith("```"):
                        raw_content = raw_content.replace("```", "", 1).replace("```", "", 1).strip()
                    
                    json_data = json.loads(raw_content)
                    st.json(json_data)
                    
                    # Also show as a nice table
                    if json_data.get("events"):
                        st.subheader("Event Summary")
                        st.table(json_data["events"])
                    else:
                        st.info("No actionable events were found in this transcript.")
                        
                except json.JSONDecodeError:
                    st.error("Failed to parse the model's response as valid JSON.")
                    st.code(raw_content, language="json")
                    
            except Exception as e:
                st.error(f"Error during analysis: {e}")
    elif analyze_button:
        st.warning("Please provide a transcript first.")
    else:
        st.info("Waiting for input...")

st.sidebar.title("About")
st.sidebar.info(
    "This agent uses **Mistral-7B-Instruct-v0.2** via Hugging Face Inference API "
    "to identify actionable items from meetings."
)
