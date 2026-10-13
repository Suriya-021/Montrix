
from app.models.all_models import Expense
from app.database_orm import SessionLocal
from collections import defaultdict

def _expense_to_dict(e):
    return {
        "id": e.id, 
        "user_id": e.user_id, 
        "amount": float(e.amount), 
        "category": e.category, 
        "description": e.description, 
        "date": str(e.date) if e.date else "", 
        "created_at": str(e.created_at) if getattr(e, 'created_at', None) else str(e.id)
    }

def get_all_expenses(user_id: int):
    db = SessionLocal()
    try:
        expenses = db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.date.desc()).all()
        return [_expense_to_dict(e) for e in expenses]
    finally:
        db.close()

def get_expense_by_id(expense_id: int, user_id: int):
    db = SessionLocal()
    try:
        e = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()
        if e:
            return _expense_to_dict(e)
        return None
    finally:
        db.close()

from app.database.date_utils import parse_date

def create_expense(user_id: int, amount: float, category: str, description: str, date: str):
    db = SessionLocal()
    try:
        new_expense = Expense(
            user_id=user_id, 
            amount=amount, 
            category=category, 
            description=description, 
            date=parse_date(date)
        )
        db.add(new_expense)
        db.commit()
        db.refresh(new_expense)
        return new_expense.id
    finally:
        db.close()

def delete_expense(expense_id: int, user_id: int):
    db = SessionLocal()
    try:
        expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()
        if expense:
            db.delete(expense)
            db.commit()
            return True
        return False
    finally:
        db.close()

def update_expense(expense_id: int, user_id: int, amount: float, category: str, description: str, date: str):
    db = SessionLocal()
    try:
        expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()
        if expense:
            expense.amount = amount
            expense.category = category
            expense.description = description
            expense.date = parse_date(date)
            db.commit()
            return True
        return False
    finally:
        db.close()

from datetime import datetime
from typing import Optional

def get_expense_stats(user_id: int, month: Optional[str] = None):
    db = SessionLocal()
    try:
        all_expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
        total_all_time = sum(e.amount for e in all_expenses)
        
        target_month = month if month else datetime.now().strftime("%Y-%m")
        
        # Filter for the target month (expenses where date starts with 'YYYY-MM')
        month_expenses = [
            e for e in all_expenses 
            if e.date and str(e.date).startswith(target_month)
        ]
        month_spent = sum(e.amount for e in month_expenses)
        
        # Calculate category breakdown for the target month
        cat_totals = defaultdict(float)
        for e in month_expenses:
            cat_totals[e.category] += e.amount
            
        breakdown = [{"name": cat, "value": round(val, 2)} for cat, val in cat_totals.items()]
        
        # If no expenses in target month but all_time exists and month wasn't explicitly requested,
        # fallback to all_time breakdown for dashboard donut chart
        if not breakdown and not month and all_expenses:
            all_cat_totals = defaultdict(float)
            for e in all_expenses:
                all_cat_totals[e.category] += e.amount
            breakdown = [{"name": cat, "value": round(val, 2)} for cat, val in all_cat_totals.items()]
        
        return {
            "total_spent": round(total_all_time, 2),
            "month": target_month,
            "month_spent": round(month_spent, 2),
            "this_month_spent": round(month_spent, 2),
            "category_breakdown": breakdown,
            "total_budget": 0.0,
            "budget_used_percentage": 0.0
        }
    finally:
        db.close()
