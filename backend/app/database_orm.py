import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# We start by using SQLite via SQLAlchemy for safety during the refactor.
# Once it's tested, we just change this URL to: postgresql://user:pass@localhost/dbname
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spendwise.db")

# For SQLite, check_same_thread=False is needed. Postgres doesn't need this.
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to yield DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
