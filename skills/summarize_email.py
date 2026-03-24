import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Configure Groq client
api_key = os.getenv("GROQ_API_KEY") or os.getenv("Groq_API_Key")
client = Groq(api_key=api_key) if api_key else None
MODEL_ID = "llama-3.3-70b-versatile"

def summarize_email(email_body):
    """
    Skill 3: Create a short summary of the email using Groq.
    """
    if not client:
        print("Groq client not initialized. Missing GROQ_API_KEY.")
        return "Could not generate summary. Error: Groq API Key missing."

    prompt = f"""
    Summarize the following email in 2-3 short bullet points. 
    Highlight the main request and any deadlines.

    Email Content:
    {email_body}
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
        error_msg = f"Error in summarization: {str(e)}"
        print(error_msg)
        return f"Could not generate summary. Error: {str(e)}"

if __name__ == "__main__":
    test_body = "Hi, I'm checking in on the report. Is it ready yet? We have a meeting tomorrow at 9 AM to discuss it."
    print(f"Summary:\n{summarize_email(test_body)}")
