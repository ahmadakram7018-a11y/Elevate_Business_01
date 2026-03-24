import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Configure Groq client
api_key = os.getenv("GROQ_API_KEY") or os.getenv("Groq_API_Key")
client = Groq(api_key=api_key) if api_key else None
MODEL_ID = "llama-3.3-70b-versatile"

def generate_reply(email_body, classification="normal", user_context=""):
    """
    Skill 4: Create a draft reply based on email content and importance using Groq.
    """
    if not client:
        print("Groq client not initialized. Missing GROQ_API_KEY.")
        return f"Could not generate draft reply. Error: Groq API Key missing."

    prompt = f"""
    Generate a professional and polite email reply for the following message.
    
    Email Content: {email_body}
    Classification: {classification}
    User Context: {user_context}
    
    The reply should be concise and helpful. 
    If the email is 'urgent', prioritize immediate action.
    Return ONLY the reply text.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL_ID,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        error_msg = f"Error in generating reply: {str(e)}"
        print(error_msg)
        return f"Could not generate draft reply. Error: {str(e)}"

if __name__ == "__main__":
    test_body = "Can you send me the latest sales numbers by end of day?"
    print(f"Draft Reply:\n{generate_reply(test_body, 'urgent', 'Numbers are ready in the shared drive.')}")
