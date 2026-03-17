import base64
from email.message import EmailMessage
from googleapiclient.errors import HttpError
from skills.read_email import get_gmail_service

def create_draft(recipient, subject, message_body, credentials_json=None):
    """
    Optional Skill: Create a draft in Gmail.
    """
    try:
        service = get_gmail_service(credentials_json)
        
        # Create message
        message = EmailMessage()
        message.set_content(message_body)
        message["To"] = recipient
        message["From"] = "me"
        message["Subject"] = f"Re: {subject}" if not subject.startswith("Re:") else subject
        
        # Encode message
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {"message": {"raw": encoded_message}}
        
        # Create Draft
        draft = (
            service.users()
            .drafts()
            .create(userId="me", body=create_message)
            .execute()
        )
        print(f'Draft created successfully. Draft Id: {draft["id"]}')
        return f"Draft created successfully. ID: {draft['id']}"

    except HttpError as error:
        print(f"An error occurred: {error}")
        return "Failed to create draft."
