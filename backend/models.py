from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = None

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    email_history: List["EmailHistory"] = Relationship(back_populates="user")
    gmail_accounts: List["GmailAccount"] = Relationship(back_populates="user")

class GmailAccount(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    email: str
    credentials: str # JSON string of tokens
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship(back_populates="gmail_accounts")

class GmailAccountRead(SQLModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime

class EmailHistoryBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    gmail_id: str
    sender: str
    subject: str
    body_snippet: Optional[str] = None
    classification: Optional[str] = None # urgent, important, normal, spam
    summary: Optional[str] = None
    generated_reply: Optional[str] = None
    status: str = Field(default="pending") # pending, drafted, sent
    action_taken: Optional[str] = None
    received_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None

class EmailHistory(EmailHistoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship(back_populates="email_history")

class EmailHistoryCreate(EmailHistoryBase):
    pass

class EmailHistoryRead(EmailHistoryBase):
    id: int
    timestamp: datetime
