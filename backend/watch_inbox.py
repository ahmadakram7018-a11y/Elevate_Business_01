import os.path
import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def main():
    """Shows basic usage of the Gmail API.
    Lists the latest 5 emails from the user's inbox.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists("credentials.json"):
                print("Error: credentials.json not found.")
                return
            
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            # Using port 9090 to avoid potential permission/conflict issues with 8080.
            # Add http://localhost:9090/ to Authorized Redirect URIs in Google Console.
            creds = flow.run_local_server(port=9090)
        
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    try:
        # Call the Gmail API
        service = build("gmail", "v1", credentials=creds)
        
        # Get the latest 5 messages
        results = service.users().messages().list(userId="me", maxResults=5).execute()
        messages = results.get("messages", [])

        if not messages:
            print("No messages found.")
            return

        print("\n--- Latest 5 Emails ---\n")
        for msg in messages:
            # Fetch message details
            txt = service.users().messages().get(userId="me", id=msg["id"]).execute()
            
            payload = txt.get("payload", {})
            headers = payload.get("headers", [])
            
            # Extract Subject and From headers
            subject = next((h["value"] for h in headers if h["name"].lower() == "subject"), "No Subject")
            sender = next((h["value"] for h in headers if h["name"].lower() == "from"), "Unknown Sender")
            
            print(f"From:    {sender}")
            print(f"Subject: {subject}")
            print("-" * 20)

    except HttpError as error:
        print(f"An error occurred: {error}")


if __name__ == "__main__":
    main()
