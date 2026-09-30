import os

DB_DIR = r"c:\Users\TICKMARKS\OneDrive - tickmarks.net\Desktop\Projects\SpendWise\backend\app\database"

USER_DB = """
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
            return {"id": user.id, "name": user.name, "email": user.email, "password_hash": user.password_hash}
        return None
    finally:
        db.close()

def get_user_by_id(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return {"id": user.id, "name": user.name, "email": user.email, "password_hash": user.password_hash}
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
        return {"id": new_user.id, "name": new_user.name, "email": new_user.email, "password_hash": new_user.password_hash}
    finally:
        db.close()
"""

EXPENSE_DB = """
from app.models.all_models import Expense
from app.database_orm import SessionLocal

def get_all_expenses(user_id: int):
    db = SessionLocal()
    try:
        expenses = db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.date.desc()).all()
        return [{"id": e.id, "user_id": e.user_id, "amount": e.amount, "category": e.category, "description": e.description, "date": e.date} for e in expenses]
    finally:
        db.close()

def add_expense(user_id: int, amount: float, category: str, description: str, date: str):
    db = SessionLocal()
    try:
        new_expense = Expense(user_id=user_id, amount=amount, category=category, description=description, date=date)
        db.add(new_expense)
        db.commit()
        db.refresh(new_expense)
        return {"id": new_expense.id, "user_id": new_expense.user_id, "amount": new_expense.amount, "category": new_expense.category, "description": new_expense.description, "date": new_expense.date}
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
            db.refresh(expense)
            return {"id": expense.id, "user_id": expense.user_id, "amount": expense.amount, "category": expense.category, "description": expense.description, "date": expense.date}
        return None
    finally:
        db.close()

def get_stats(user_id: int):
    db = SessionLocal()
    try:
        expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
        total_expenses = sum(e.amount for e in expenses)
        total_budget = 0.0 # Will implement budget join if needed, keeping 0 for now as in old code
        budget_used_percentage = 0.0
        return {
            "total_expenses": total_expenses,
            "total_budget": total_budget,
            "budget_used_percentage": budget_used_percentage
        }
    finally:
        db.close()
"""

INCOME_DB = """
from app.models.all_models import Income
from app.database_orm import SessionLocal

def get_incomes(user_id: int):
    db = SessionLocal()
    try:
        incomes = db.query(Income).filter(Income.user_id == user_id).order_by(Income.date.desc()).all()
        return [{"id": i.id, "user_id": i.user_id, "source": i.source, "amount": i.amount, "date": i.date} for i in incomes]
    finally:
        db.close()

def add_income(user_id: int, source: str, amount: float, date: str):
    db = SessionLocal()
    try:
        new_income = Income(user_id=user_id, source=source, amount=amount, date=date)
        db.add(new_income)
        db.commit()
        db.refresh(new_income)
        return {"id": new_income.id, "user_id": new_income.user_id, "source": new_income.source, "amount": new_income.amount, "date": new_income.date}
    finally:
        db.close()

def delete_income(income_id: int, user_id: int):
    db = SessionLocal()
    try:
        income = db.query(Income).filter(Income.id == income_id, Income.user_id == user_id).first()
        if income:
            db.delete(income)
            db.commit()
            return True
        return False
    finally:
        db.close()
"""

BUDGET_DB = """
from app.models.all_models import Budget
from app.database_orm import SessionLocal

def get_budgets(user_id: int):
    db = SessionLocal()
    try:
        budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
        return [{"id": b.id, "user_id": b.user_id, "category": b.category, "limit_amount": b.limit_amount, "month": b.month} for b in budgets]
    finally:
        db.close()

def set_budget(user_id: int, category: str, limit_amount: float, month: str):
    db = SessionLocal()
    try:
        budget = db.query(Budget).filter(Budget.user_id == user_id, Budget.category == category, Budget.month == month).first()
        if budget:
            budget.limit_amount = limit_amount
            db.commit()
            db.refresh(budget)
            return {"id": budget.id, "user_id": budget.user_id, "category": budget.category, "limit_amount": budget.limit_amount, "month": budget.month}
        else:
            new_budget = Budget(user_id=user_id, category=category, limit_amount=limit_amount, month=month)
            db.add(new_budget)
            db.commit()
            db.refresh(new_budget)
            return {"id": new_budget.id, "user_id": new_budget.user_id, "category": new_budget.category, "limit_amount": new_budget.limit_amount, "month": new_budget.month}
    finally:
        db.close()
"""

GOAL_DB = """
from app.models.all_models import Goal
from app.database_orm import SessionLocal

def get_goals(user_id: int):
    db = SessionLocal()
    try:
        goals = db.query(Goal).filter(Goal.user_id == user_id).all()
        return [{"id": g.id, "user_id": g.user_id, "title": g.title, "target_amount": g.target_amount, "current_amount": g.current_amount, "target_date": g.target_date} for g in goals]
    finally:
        db.close()

def add_goal(user_id: int, title: str, target_amount: float, target_date: str):
    db = SessionLocal()
    try:
        new_goal = Goal(user_id=user_id, title=title, target_amount=target_amount, target_date=target_date, current_amount=0.0)
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)
        return {"id": new_goal.id, "user_id": new_goal.user_id, "title": new_goal.title, "target_amount": new_goal.target_amount, "current_amount": new_goal.current_amount, "target_date": new_goal.target_date}
    finally:
        db.close()

def update_goal_progress(goal_id: int, user_id: int, amount_to_add: float):
    db = SessionLocal()
    try:
        goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if goal:
            goal.current_amount += amount_to_add
            db.commit()
            db.refresh(goal)
            return {"id": goal.id, "user_id": goal.user_id, "title": goal.title, "target_amount": goal.target_amount, "current_amount": goal.current_amount, "target_date": goal.target_date}
        return None
    finally:
        db.close()
"""

SUBSCRIPTION_DB = """
from app.models.all_models import Subscription
from app.database_orm import SessionLocal

def get_subscriptions(user_id: int):
    db = SessionLocal()
    try:
        subs = db.query(Subscription).filter(Subscription.user_id == user_id).all()
        return [{"id": s.id, "user_id": s.user_id, "title": s.title, "amount": s.amount, "frequency": s.frequency, "next_due_date": s.next_due_date} for s in subs]
    finally:
        db.close()

def add_subscription(user_id: int, title: str, amount: float, frequency: str, next_due_date: str):
    db = SessionLocal()
    try:
        new_sub = Subscription(user_id=user_id, title=title, amount=amount, frequency=frequency, next_due_date=next_due_date)
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return {"id": new_sub.id, "user_id": new_sub.user_id, "title": new_sub.title, "amount": new_sub.amount, "frequency": new_sub.frequency, "next_due_date": new_sub.next_due_date}
    finally:
        db.close()

def delete_subscription(sub_id: int, user_id: int):
    db = SessionLocal()
    try:
        sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == user_id).first()
        if sub:
            db.delete(sub)
            db.commit()
            return True
        return False
    finally:
        db.close()
"""

with open(os.path.join(DB_DIR, "user_db.py"), "w") as f: f.write(USER_DB)
with open(os.path.join(DB_DIR, "expense_db.py"), "w") as f: f.write(EXPENSE_DB)
with open(os.path.join(DB_DIR, "income_db.py"), "w") as f: f.write(INCOME_DB)
with open(os.path.join(DB_DIR, "budget_db.py"), "w") as f: f.write(BUDGET_DB)
with open(os.path.join(DB_DIR, "goal_db.py"), "w") as f: f.write(GOAL_DB)
with open(os.path.join(DB_DIR, "subscription_db.py"), "w") as f: f.write(SUBSCRIPTION_DB)

print("REFACTORED DB LAYER!")
