import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gmail_assistant.db")

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

from sqlalchemy import text

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
    # Safety: Manually add columns if they don't exist (migration fallback)
    with engine.connect() as conn:
        # Check for received_at in emailhistory
        result = conn.execute(text("PRAGMA table_info(emailhistory)"))
        columns = [row[1] for row in result]
        
        if "received_at" not in columns:
            conn.execute(text("ALTER TABLE emailhistory ADD COLUMN received_at DATETIME"))
            conn.commit()
            
        if "sent_at" not in columns:
            conn.execute(text("ALTER TABLE emailhistory ADD COLUMN sent_at DATETIME"))
            conn.commit()
