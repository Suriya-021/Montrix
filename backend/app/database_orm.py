import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# We start by using SQLite via SQLAlchemy for safety during the refactor.
# Once it's tested, we just change this URL to: postgresql://user:pass@localhost/dbname
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spendwise.db")

is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine_kwargs = {
        "connect_args": {"check_same_thread": False},
        "pool_pre_ping": True
    }
else:
    engine_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20
    }

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to yield DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
