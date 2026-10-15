from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Date, Boolean, UniqueConstraint
from sqlalchemy.sql import func
from app.database_orm import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(12, 2, asdecimal=False), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(String(255))
    date = Column(Date, nullable=False, index=True)
    receipt_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    limit_amount = Column(Numeric(12, 2, asdecimal=False), nullable=False)
    month = Column(String(7), nullable=False, index=True) # e.g. "2026-09"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    target_amount = Column(Numeric(12, 2, asdecimal=False), nullable=False)
    current_amount = Column(Numeric(12, 2, asdecimal=False), default=0.0)
    target_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    amount = Column(Numeric(12, 2, asdecimal=False), nullable=False)
    frequency = Column(String(20), nullable=False) # e.g. "Monthly"
    next_due_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Income(Base):
    __tablename__ = "income"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    source = Column(String(100), nullable=False)
    amount = Column(Numeric(12, 2, asdecimal=False), nullable=False)
    date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(50), nullable=False)
    color = Column(String(20), nullable=False, default="#8B5CF6")
    icon = Column(String(50), nullable=True, default="Tag")
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uq_user_category_name'),
    )
