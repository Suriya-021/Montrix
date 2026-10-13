from typing import Optional
from sqlalchemy.orm import Session
from app.models.all_models import User, Expense, Budget, Goal, Subscription, Income, Category
from app.database_orm import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _user_to_dict(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "password_hash": user.password_hash,
        "created_at": str(user.created_at)
    }

def get_user_by_email(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            return _user_to_dict(user)
        return None
    finally:
        db.close()

def get_user_by_id(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return _user_to_dict(user)
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
        return _user_to_dict(new_user)
    finally:
        db.close()

def update_user_profile(user_id: int, name: Optional[str] = None, email: Optional[str] = None):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        if name is not None and name.strip():
            user.name = name.strip()
        if email is not None and email.strip():
            user.email = email.strip()
        db.commit()
        db.refresh(user)
        return _user_to_dict(user)
    finally:
        db.close()

def update_user_password(user_id: int, new_password_hash: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        user.password_hash = new_password_hash
        db.commit()
        return True
    finally:
        db.close()

def delete_user_and_all_data(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        # Cascade delete across all tables
        db.query(Expense).filter(Expense.user_id == user_id).delete(synchronize_session=False)
        db.query(Budget).filter(Budget.user_id == user_id).delete(synchronize_session=False)
        db.query(Goal).filter(Goal.user_id == user_id).delete(synchronize_session=False)
        db.query(Subscription).filter(Subscription.user_id == user_id).delete(synchronize_session=False)
        db.query(Income).filter(Income.user_id == user_id).delete(synchronize_session=False)
        db.query(Category).filter(Category.user_id == user_id).delete(synchronize_session=False)
        db.delete(user)
        db.commit()
        return True
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
