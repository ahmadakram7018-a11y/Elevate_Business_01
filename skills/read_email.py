import os.path
import base64
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid"
]

def get_gmail_service(credentials_json=None):
    """Authenticates and returns the Gmail API service using provided credentials JSON string."""
    creds = None
    
    if credentials_json:
        try:
            token_data = json.loads(credentials_json)
            creds = Credentials.from_authorized_user_info(token_data, SCOPES)
        except Exception as e:
            print(f"Error loading credentials from provided JSON: {e}")

    # Fallback to local files for backward compatibility/testing if no creds provided
    if not creds:
        if os.path.exists("token.json"):
            creds = Credentials.from_authorized_user_file("token.json", SCOPES)
        elif os.getenv("GMAIL_TOKEN_JSON"):
            try:
                token_data = json.loads(os.getenv("GMAIL_TOKEN_JSON"))
                creds = Credentials.from_authorized_user_info(token_data, SCOPES)
            except Exception as e:
                print(f"Error loading token from environment: {e}")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"Error refreshing token: {e}")
                creds = None
        
        if not creds:
            raise Exception("No valid Gmail credentials provided.")
                
    return build("gmail", "v1", credentials=creds)

def read_emails(max_results=5, q="is:unread", credentials_json=None):
    """
    Skill 1: Fetch emails from Gmail inbox.
    Returns a list of dictionaries containing sender, subject, and body.
    """
    try:
        service = get_gmail_service(credentials_json)
        results = service.users().messages().list(userId="me", q=q, maxResults=max_results).execute()
        messages = results.get("messages", [])

        email_data = []
        for msg in messages:
            try:
                msg_detail = service.users().messages().get(userId="me", id=msg["id"]).execute()
                payload = msg_detail.get("payload", {})
                headers = payload.get("headers", [])
                
                subject = next((h["value"] for h in headers if h["name"].lower() == "subject"), "No Subject")
                sender = next((h["value"] for h in headers if h["name"].lower() == "from"), "Unknown Sender")
                
                # Extract body
                body = ""
                snippet = msg_detail.get("snippet", "")
                if 'parts' in payload:
                    for part in payload['parts']:
                        if part['mimeType'] == 'text/plain':
                            data = part['body'].get('data')
                            if data:
                                body = base64.urlsafe_b64decode(data).decode('utf-8')
                                break
                else:
                    data = payload.get('body', {}).get('data')
                    if data:
                        body = base64.urlsafe_b64decode(data).decode('utf-8')

                email_data.append({
                    "id": msg["id"],
                    "sender": sender,
                    "subject": subject,
                    "body": body.strip() or snippet,
                    "snippet": snippet,
                    "internalDate": msg_detail.get("internalDate")
                })
            except Exception as e:
                print(f"Error fetching detail for message {msg.get('id')}: {e}")
                continue
        return email_data

    except HttpError as error:
        print(f"An error occurred: {error}")
        return []

def mark_as_read(message_id, credentials_json=None):
    """Marks an email as read by removing the UNREAD label."""
    try:
        service = get_gmail_service(credentials_json)
        service.users().messages().modify(
            userId="me",
            id=message_id,
            body={"removeLabelIds": ["UNREAD"]}
        ).execute()
        return True
    except Exception as e:
        print(f"Error marking email as read: {e}")
        return False
