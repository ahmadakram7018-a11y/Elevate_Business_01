import time
import os
import sys

# Ensure current directory is in sys.path for module discovery
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from skills.read_email import read_emails, mark_as_read
from skills.classify_email import classify_email
from skills.summarize_email import summarize_email
from skills.generate_reply import generate_reply
from skills.send_reply import send_reply
from skills.create_draft import create_draft

def run_agent():
    """
    Main agent controller to orchestrate skills.
    """
    print("\n" + "="*50)
    print("AI Email Assistant checking for UNREAD emails...")
    print("="*50)
    
    # 1. Read unread emails (fetch last 5)
    emails = read_emails(max_results=5)
    
    if not emails:
        print("No new unread emails found.")
        return

    for email in emails:
        print(f"\n[NEW EMAIL] ID: {email['id']}")
        print(f"From: {email['sender']}")
        print(f"Subject: {email['subject']}")
        
        # 2. Classify importance
        category = classify_email(email['body'])
        print(f"Classification: {category.upper()}")
        
        # 3. Summarize if important/urgent
        if category in ["urgent", "important"]:
            summary = summarize_email(email['body'])
            print(f"Summary:\n{summary}")
            
            # 4. Generate draft reply
            draft = generate_reply(email['body'], classification=category)
            print(f"\nProposed Draft Reply:\n{'-'*20}\n{draft}\n{'-'*20}")
            
            # 5. User choice: Send, Draft, or Skip
            print("\nOptions: [s]end now, [d]raft in Gmail, [skip] this email")
            choice = input("Your choice: ").strip().lower()
            
            if choice == 's':
                send_reply(email['sender'], email['subject'], draft)
                print("Action: Reply sent directly.")
                mark_as_read(email['id'])
            elif choice == 'd':
                create_draft(email['sender'], email['subject'], draft)
                print("Action: Draft created in your Gmail account.")
                mark_as_read(email['id'])
            else:
                print("Action: Reply skipped. Email remains unread unless you skip and mark read.")
                mark_skip = input("Mark as read anyway? (y/n): ").strip().lower()
                if mark_skip == 'y':
                    mark_as_read(email['id'])
        
        elif category == "normal":
            print("Action: Normal email. No draft created.")
            mark_normal = input("Mark as read? (y/n): ").strip().lower()
            if mark_normal == 'y':
                mark_as_read(email['id'])
        
        elif category == "spam":
            print("Action: Spam detected. Marking as read.")
            mark_as_read(email['id'])
            
        print("-" * 50)

if __name__ == "__main__":
    while True:
        try:
            run_agent()
            print("\nSleeping for 2 minutes... (Ctrl+C to stop)")
            time.sleep(120) 
        except KeyboardInterrupt:
            print("\nAssistant stopped by user.")
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            time.sleep(60)
