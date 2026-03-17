import base64
from email.message import EmailMessage
from googleapiclient.errors import HttpError
from skills.read_email import get_gmail_service

def send_reply(recipient, subject, message_body, credentials_json=None):
    """
    Skill 5: Send a reply through Gmail.
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
        create_message = {"raw": encoded_message}
        
        # Send
        send_message = (
            service.users()
            .messages()
            .send(userId="me", body=create_message)
            .execute()
        )
        print(f'Reply sent successfully. Message Id: {send_message["id"]}')
        return f"Email sent successfully. ID: {send_message['id']}"

    except HttpError as error:
        print(f"An error occurred: {error}")
        return "Failed to send email."
