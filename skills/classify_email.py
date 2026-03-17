import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Configure Groq client
client = Groq(api_key=os.getenv("Groq_API_Key"))
MODEL_ID = "llama-3.3-70b-versatile"

def classify_email(email_text):
    """
    Skill 2: Determine how important the email is using Groq.
    Returns: urgent, important, normal, or spam.
    """
    prompt = f"""
    You are an expert Executive Assistant. Classify this email into exactly one category:
    
    1. URGENT: Requires immediate action or response (e.g., meeting today, critical system failure, immediate client request).
    2. IMPORTANT: High value but not time-critical (e.g., project updates, weekly reports, upcoming meeting invites for next week).
    3. NORMAL: Standard communication, newsletters you actually read, or general info.
    4. SPAM: Advertisements, unsolicited offers, or irrelevant automated notifications.

    Return ONLY the single word: URGENT, IMPORTANT, NORMAL, or SPAM.

    Email Content:
    {email_text}
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
        category = chat_completion.choices[0].message.content.strip().lower()
        
        # Validation to ensure only allowed categories are returned
        valid_categories = ["urgent", "important", "normal", "spam"]
        for cat in valid_categories:
            if cat in category:
                return cat
        return "normal"
    
    except Exception as e:
        error_msg = f"Error in classification: {str(e)}"
        print(error_msg)
        return "normal"

if __name__ == "__main__":
    # Test case
    test_email = "Can you approve the contract today? We need it by 5 PM."
    print(f"Classification: {classify_email(test_email)}")
