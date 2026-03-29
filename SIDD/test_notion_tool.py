import os
import sys
from dotenv import load_dotenv

# Add parent directory to path to import tools
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Try to load .env from the root notion directory for testing purposes
notion_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "notion", ".env")
if os.path.exists(notion_env):
    print(f"ℹ️  Loading credentials from {notion_env}")
    load_dotenv(notion_env)

# Now import the tool
from tools.external_apis import create_notion_task

def test_notion_integration():
    print("🚀 Testing Notion Integration...")
    print(f"DEBUG: NOTION_TOKEN in env: {'Found' if os.getenv('NOTION_TOKEN') else 'NOT FOUND'}")
    print(f"DEBUG: NOTION_DATABASE_ID in env: {'Found' if os.getenv('NOTION_DATABASE_ID') else 'NOT FOUND'}")
    
    # Sample task data
    title = "Test Task from Meeting Mind"
    description = "This is a test task created by the new Notion integration in Meeting Mind."
    deadline = "2026-04-30"
    priority = "High"
    effort = 2.5
    
    # Run the tool
    result = create_notion_task(
        title=title,
        description=description,
        deadline=deadline,
        priority=priority,
        effort=effort
    )
    
    print(f"\n📊 Result: {result}")
    
    if result.get("status") == "success":
        if result.get("mock"):
            print("\n⚠️  Note: The tool ran in MOCK mode because credentials were not found.")
        else:
            print(f"\n✅ Success! Task created: {result.get('task_id')}")
            print(f"🔗 URL: {result.get('url')}")
    else:
        print(f"\n❌ Failed: {result.get('error')}")

if __name__ == "__main__":
    test_notion_integration()
