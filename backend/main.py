import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta, datetime, timezone
import json

from .database import create_db_and_tables, get_session
from .models import (
    User, UserCreate, UserRead, 
    EmailHistory, EmailHistoryRead,
    GmailAccount, GmailAccountRead
)
from .auth import (
    get_password_hash, verify_password, 
    create_access_token, create_refresh_token, 
    get_current_user, decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from fastapi.middleware.cors import CORSMiddleware

# Google OAuth
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials

# Import skills
from skills.read_email import read_emails, SCOPES
from skills.classify_email import classify_email
from skills.summarize_email import summarize_email
from skills.generate_reply import generate_reply
from skills.send_reply import send_reply
from skills.create_draft import create_draft
from skills.chatbot import get_chatbot_response, improve_email_body

from pydantic import BaseModel

class ChatbotRequest(BaseModel):
    originalEmail: Optional[dict] = None
    userInstruction: str
    tone: str = "formal"
    conversationHistory: List[dict] = []

class ImproveEmailRequest(BaseModel):
    body: str
    instruction: str

class SendEmailRequest(BaseModel):
    to: str
    cc: Optional[str] = None
    bcc: Optional[str] = None
    subject: str
    body: str

app = FastAPI(title="Elevate Business API")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set insecure transport for local development
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def read_root():
    return {"message": "Welcome to Elevate Business API"}

# --- Auth Endpoints ---

@app.post("/auth/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password)
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@app.post("/auth/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/auth/refresh")
def refresh_access_token(refresh_token: str):
    payload = decode_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    email: str = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Gmail OAuth Endpoints ---

@app.get("/auth/gmail/url")
def get_gmail_auth_url():
    if not os.path.exists("credentials.json"):
        raise HTTPException(status_code=500, detail="Gmail credentials.json not configured on server.")
    
    flow = Flow.from_client_secrets_file(
        "credentials.json",
        scopes=SCOPES,
        redirect_uri="http://localhost:3000/auth/gmail/callback"
    )
    
    # Use a constant verifier to keep the flow stateless for local development
    flow.code_verifier = "static_verifier_for_local_development_purposes_only_at_least_43_chars"
    
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )
    
    return {"url": auth_url}

@app.post("/auth/gmail/callback")
def gmail_oauth_callback(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return {"message": "Endpoint ready for code exchange"}

@app.post("/auth/gmail/exchange")
async def gmail_token_exchange(
    request: Request,
    session: Session = Depends(get_session)
):
    body = await request.json()
    code = body.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    
    flow = Flow.from_client_secrets_file(
        "credentials.json",
        scopes=SCOPES,
        redirect_uri="http://localhost:3000/auth/gmail/callback"
    )
    
    # Must match the verifier used in get_gmail_auth_url
    flow.code_verifier = "static_verifier_for_local_development_purposes_only_at_least_43_chars"
    
    try:
        flow.fetch_token(code=code)
        creds = flow.credentials
        
        # Get user info from Gmail API
        from googleapiclient.discovery import build
        service = build("gmail", "v1", credentials=creds)
        profile = service.users().getProfile(userId="me").execute()
        gmail_email = profile.get("emailAddress")
        
        # Check if a user with this email already exists
        user = session.exec(select(User).where(User.email == gmail_email)).first()
        
        if not user:
            # Create new user if they don't exist
            user = User(
                email=gmail_email,
                full_name=gmail_email.split('@')[0], # Default name
                hashed_password="OAUTH_USER" # Mark as OAuth user
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        
        # Save or update GmailAccount for this user
        existing_acc = session.exec(
            select(GmailAccount).where(GmailAccount.user_id == user.id, GmailAccount.email == gmail_email)
        ).first()
        
        if existing_acc:
            existing_acc.credentials = creds.to_json()
            existing_acc.is_active = True
            session.add(existing_acc)
        else:
            # Deactivate other accounts for this user
            others = session.exec(select(GmailAccount).where(GmailAccount.user_id == user.id)).all()
            for other in others:
                other.is_active = False
                session.add(other)
            
            new_acc = GmailAccount(
                user_id=user.id,
                email=gmail_email,
                credentials=creds.to_json(),
                is_active=True
            )
            session.add(new_acc)
        
        session.commit()
        
        # Issue JWT for our app
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": user.email})
        
        return {
            "message": "Authenticated with Google", 
            "email": gmail_email,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        print(f"Error in gmail_token_exchange: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/auth/gmail/accounts", response_model=List[GmailAccountRead])
def get_gmail_accounts(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    accounts = session.exec(
        select(GmailAccount).where(GmailAccount.user_id == current_user.id)
    ).all()
    return accounts

@app.post("/auth/gmail/select/{account_id}")
def select_gmail_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    accounts = session.exec(
        select(GmailAccount).where(GmailAccount.user_id == current_user.id)
    ).all()
    
    found = False
    for acc in accounts:
        if acc.id == account_id:
            acc.is_active = True
            found = True
        else:
            acc.is_active = False
        session.add(acc)
    
    if not found:
        raise HTTPException(status_code=404, detail="Gmail account not found")
    
    session.commit()
    return {"message": "Account selected"}

# Helper to get active Gmail credentials with automatic refresh
def get_active_gmail_creds(user_id: int, session: Session):
    acc = session.exec(
        select(GmailAccount).where(GmailAccount.user_id == user_id, GmailAccount.is_active == True)
    ).first()
    if not acc:
        return None
    
    try:
        creds_data = json.loads(acc.credentials)
        creds = Credentials.from_authorized_user_info(creds_data, SCOPES)
        
        # Check if expired and refresh if possible
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(GoogleRequest())
            # Save the refreshed credentials back to the database
            acc.credentials = creds.to_json()
            session.add(acc)
            session.commit()
            session.refresh(acc)
            return acc.credentials
            
        return acc.credentials
    except Exception as e:
        print(f"Error refreshing/loading credentials: {e}")
        return acc.credentials

# --- Chatbot & Compose AI Endpoints ---

@app.post("/api/chatbot/reply")
def chatbot_reply(request: ChatbotRequest, current_user: User = Depends(get_current_user)):
    reply, is_on_topic = get_chatbot_response(
        user_instruction=request.userInstruction,
        original_email=request.originalEmail,
        tone=request.tone,
        history=request.conversationHistory
    )
    return {"reply": reply, "isOnTopic": is_on_topic}

@app.post("/api/email/improve")
def improve_email(request: ImproveEmailRequest, current_user: User = Depends(get_current_user)):
    improved_body = improve_email_body(request.body, request.instruction)
    return {"improvedBody": improved_body}

@app.post("/api/email/send")
def send_new_email(
    request: SendEmailRequest, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    creds_json = get_active_gmail_creds(current_user.id, session)
    if not creds_json:
        raise HTTPException(status_code=400, detail="No active Gmail account.")
    
    result = send_reply(
        recipient=request.to,
        subject=request.subject,
        message_body=request.body,
        credentials_json=creds_json
    )
    return {"message": result}

@app.post("/api/email/draft")
def save_new_draft(
    request: SendEmailRequest, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    creds_json = get_active_gmail_creds(current_user.id, session)
    if not creds_json:
        raise HTTPException(status_code=400, detail="No active Gmail account.")
    
    result = create_draft(
        recipient=request.to,
        subject=request.subject,
        message_body=request.body,
        credentials_json=creds_json
    )
    return {"message": result}

# --- User Endpoints ---

@app.get("/users/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

from pydantic import BaseModel

class EmailActionRequest(BaseModel):
    action: str # "draft" or "send"
    reply_body: str

# --- Email Endpoints ---

@app.post("/emails/action/{id}")
def perform_email_action(
    id: int,
    request: EmailActionRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    db_record = session.get(EmailHistory, id)
    if not db_record or db_record.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Record not found")
    
    creds_json = get_active_gmail_creds(current_user.id, session)
    if not creds_json:
        raise HTTPException(status_code=400, detail="No active Gmail account. Please link one.")

    if request.action == "draft":
        result = create_draft(
            recipient=db_record.sender, 
            subject=db_record.subject, 
            message_body=request.reply_body,
            credentials_json=creds_json
        )
        db_record.status = "drafted"
    elif request.action == "send":
        result = send_reply(
            recipient=db_record.sender, 
            subject=db_record.subject, 
            message_body=request.reply_body,
            credentials_json=creds_json
        )
        db_record.status = "sent"
        db_record.sent_at = datetime.now(timezone.utc)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    db_record.generated_reply = request.reply_body
    db_record.action_taken = request.action
    
    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    
    return {"message": result, "record": db_record}

@app.get("/emails/fetch")
def fetch_emails(
    mode: str = Query("top10", enum=["top10", "today"]),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    creds_json = get_active_gmail_creds(current_user.id, session)
    if not creds_json:
        return {"message": "No active Gmail account", "processed": 0, "spam": 0, "no_creds": True}

    if mode == "top10":
        query = "is:unread"
        max_res = 10
    else:
        yesterday = datetime.now() - timedelta(days=1)
        query = f"after:{yesterday.strftime('%Y/%m/%d')}"
        max_res = 50 

    emails = read_emails(max_results=max_res, q=query, credentials_json=creds_json)
    
    processed_count = 0
    spam_count = 0
    
    for email_data in emails:
        gmail_id = email_data.get("id")
        if not gmail_id:
            print("Warning: Email missing ID, skipping.")
            continue
            
        try:
            existing = session.exec(
                select(EmailHistory).where(EmailHistory.gmail_id == gmail_id, EmailHistory.user_id == current_user.id)
            ).first()
            
            if existing:
                if existing.classification == "spam":
                    spam_count += 1
                else:
                    processed_count += 1
                continue

            # Check if we already processed this ID in this current batch to avoid flush-time duplicates
            # (Though existing check above usually handles it if we flush/commit)
            
            category = classify_email(email_data.get("body") or email_data.get("snippet") or "")
            
            if category == "spam":
                spam_count += 1
                
                received_dt = None
                internal_date = email_data.get("internalDate")
                if internal_date:
                    received_dt = datetime.fromtimestamp(int(internal_date) / 1000.0, tz=timezone.utc)

                new_record = EmailHistory(
                    user_id=current_user.id,
                    gmail_id=gmail_id,
                    sender=email_data.get("sender", "Unknown"),
                    subject=email_data.get("subject", "No Subject"),
                    body_snippet=email_data.get("snippet", ""),
                    classification="spam",
                    status="pending",
                    received_at=received_dt
                )
                session.add(new_record)
            else:
                processed_count += 1
                summary = summarize_email(email_data.get("body") or "")
                reply = generate_reply(email_data.get("body") or "", classification=category)
                
                received_dt = None
                internal_date = email_data.get("internalDate")
                if internal_date:
                    received_dt = datetime.fromtimestamp(int(internal_date) / 1000.0, tz=timezone.utc)

                new_record = EmailHistory(
                    user_id=current_user.id,
                    gmail_id=gmail_id,
                    sender=email_data.get("sender", "Unknown"),
                    subject=email_data.get("subject", "No Subject"),
                    body_snippet=email_data.get("snippet", ""),
                    classification=category,
                    summary=summary,
                    generated_reply=reply,
                    status="pending",
                    received_at=received_dt
                )
                session.add(new_record)
            
            # Flush or commit inside the loop to catch errors early
            session.flush()
            
        except Exception as e:
            print(f"Error processing email {gmail_id}: {str(e)}")
            import traceback
            traceback.print_exc()
            session.rollback() # Rollback the current transaction for this email
            # Re-get session or continue carefully
            continue

    session.commit()
    
    return {
        "message": f"Fetched and processed emails.",
        "processed": processed_count,
        "spam": spam_count
    }

@app.get("/emails/stats")
def get_email_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    base_query = select(EmailHistory).where(EmailHistory.user_id == current_user.id)
    results = session.exec(base_query).all()
    
    pending_results = [r for r in results if r.status == "pending"]
    
    # Handle naive vs aware comparison safely
    def is_from_today(ts):
        if ts.tzinfo is None:
            # Assume naive timestamps in DB are UTC
            ts = ts.replace(tzinfo=timezone.utc)
        return ts >= today_start

    today_count = [r for r in pending_results if is_from_today(r.timestamp)]
    urgent = [r for r in pending_results if r.classification == "urgent"]
    important = [r for r in pending_results if r.classification == "important"]
    normal = [r for r in pending_results if r.classification == "normal"]
    spam = [r for r in results if r.classification == "spam"]
    
    replied = [r for r in results if r.status == "sent"]
    non_replied = [r for r in results if r.status == "pending" and r.classification != "spam"]
    
    return {
        "today": len(today_count),
        "urgent": len(urgent),
        "important": len(important),
        "normal": len(normal),
        "spam": len(spam),
        "replied": len(replied),
        "non_replied": len(non_replied)
    }

@app.get("/emails/history", response_model=List[EmailHistoryRead])
def get_email_history(
    category: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    query = select(EmailHistory).where(EmailHistory.user_id == current_user.id)
    
    if status:
        query = query.where(EmailHistory.status == status)
    
    if category:
        query = query.where(EmailHistory.classification == category)
    
    if not category and not status:
        query = query.where(EmailHistory.classification != "spam")
        query = query.where(EmailHistory.status == "pending")
    
    history = session.exec(query.order_by(EmailHistory.timestamp.desc())).all()
    return history

@app.patch("/emails/history/{id}", response_model=EmailHistoryRead)
def update_email_history(
    id: int,
    updates: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    db_record = session.get(EmailHistory, id)
    if not db_record or db_record.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Record not found")
    
    for key, value in updates.items():
        if hasattr(db_record, key):
            setattr(db_record, key, value)
    
    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    return db_record
