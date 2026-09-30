
from sqlalchemy.orm import Session
from app.models.all_models import User
from app.database_orm import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_by_email(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            return {"id": user.id, "name": user.name, "email": user.email, "password_hash": user.password_hash, "created_at": str(user.created_at)}
        return None
    finally:
        db.close()

def get_user_by_id(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return {"id": user.id, "name": user.name, "email": user.email, "password_hash": user.password_hash, "created_at": str(user.created_at)}
        return None
    finally:
        db.close()

def create_user(name: str, email: str, password_hash: str):
    db = SessionLocal()
    try:
        new_user = User(name=name, email=email, password_hash=password_hash)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"id": new_user.id, "name": new_user.name, "email": new_user.email, "password_hash": new_user.password_hash, "created_at": str(new_user.created_at)}
    finally:
        db.close()
