
from app.models.all_models import Expense
from app.database_orm import SessionLocal
from collections import defaultdict

def _expense_to_dict(e):
    return {
        "id": e.id, 
        "user_id": e.user_id, 
        "amount": e.amount, 
        "category": e.category, 
        "description": e.description, 
        "date": e.date, 
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

def create_expense(user_id: int, amount: float, category: str, description: str, date: str):
    db = SessionLocal()
    try:
        new_expense = Expense(user_id=user_id, amount=amount, category=category, description=description, date=date)
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
            expense.date = date
            db.commit()
            return True
        return False
    finally:
        db.close()

def get_expense_stats(user_id: int):
    db = SessionLocal()
    try:
        expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
        total_expenses = sum(e.amount for e in expenses)
        
        # Calculate category breakdown
        cat_totals = defaultdict(float)
        for e in expenses:
            cat_totals[e.category] += e.amount
            
        breakdown = [{"name": cat, "value": val} for cat, val in cat_totals.items()]
        
        return {
            "total_spent": total_expenses,
            "category_breakdown": breakdown,
            "total_budget": 0.0,
            "budget_used_percentage": 0.0
        }
    finally:
        db.close()
