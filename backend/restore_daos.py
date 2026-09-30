import os

DB_DIR = r"c:\Users\TICKMARKS\OneDrive - tickmarks.net\Desktop\Projects\SpendWise\backend\app\database"

EXPENSE_DB = """
from app.models.all_models import Expense
from app.database_orm import SessionLocal

def get_all_expenses(user_id: int):
    db = SessionLocal()
    try:
        expenses = db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.date.desc()).all()
        return [{"id": e.id, "user_id": e.user_id, "amount": e.amount, "category": e.category, "description": e.description, "date": e.date, "created_at": e.created_at} for e in expenses]
    finally:
        db.close()

def get_expense_by_id(expense_id: int, user_id: int):
    db = SessionLocal()
    try:
        e = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()
        if e:
            return {"id": e.id, "user_id": e.user_id, "amount": e.amount, "category": e.category, "description": e.description, "date": e.date, "created_at": e.created_at}
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
        return {
            "total_expenses": total_expenses,
            "total_budget": 0.0,
            "budget_used_percentage": 0.0
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
        return [{"id": i.id, "user_id": i.user_id, "source": i.source, "amount": i.amount, "date": i.date, "created_at": str(i.created_at)} for i in incomes]
    finally:
        db.close()

def get_income_by_id(user_id: int, income_id: int):
    db = SessionLocal()
    try:
        i = db.query(Income).filter(Income.id == income_id, Income.user_id == user_id).first()
        if i:
            return {"id": i.id, "user_id": i.user_id, "source": i.source, "amount": i.amount, "date": i.date, "created_at": str(i.created_at)}
        return None
    finally:
        db.close()

def create_income(user_id: int, income_obj):
    db = SessionLocal()
    try:
        new_income = Income(user_id=user_id, source=income_obj.source, amount=income_obj.amount, date=income_obj.date)
        db.add(new_income)
        db.commit()
        db.refresh(new_income)
        return new_income.id
    finally:
        db.close()

def update_income(user_id: int, income_id: int, income_obj):
    db = SessionLocal()
    try:
        income = db.query(Income).filter(Income.id == income_id, Income.user_id == user_id).first()
        if income:
            if income_obj.source is not None:
                income.source = income_obj.source
            if income_obj.amount is not None:
                income.amount = income_obj.amount
            if income_obj.date is not None:
                income.date = income_obj.date
            db.commit()
            return True
        return False
    finally:
        db.close()

def delete_income(user_id: int, income_id: int):
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

SUBSCRIPTION_DB = """
from app.models.all_models import Subscription
from app.database_orm import SessionLocal

def get_subscriptions(user_id: int):
    db = SessionLocal()
    try:
        subs = db.query(Subscription).filter(Subscription.user_id == user_id).order_by(Subscription.next_due_date.asc()).all()
        return [{"id": s.id, "user_id": s.user_id, "title": s.title, "amount": s.amount, "frequency": s.frequency, "next_due_date": s.next_due_date, "created_at": str(s.id)} for s in subs]
    finally:
        db.close()

def get_subscription_by_id(user_id: int, sub_id: int):
    db = SessionLocal()
    try:
        s = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == user_id).first()
        if s:
            return {"id": s.id, "user_id": s.user_id, "title": s.title, "amount": s.amount, "frequency": s.frequency, "next_due_date": s.next_due_date, "created_at": str(s.id)}
        return None
    finally:
        db.close()

def create_subscription(user_id: int, sub_obj):
    db = SessionLocal()
    try:
        new_sub = Subscription(user_id=user_id, title=sub_obj.title, amount=sub_obj.amount, frequency=sub_obj.frequency, next_due_date=sub_obj.next_due_date)
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return new_sub.id
    finally:
        db.close()

def update_subscription(user_id: int, sub_id: int, sub_obj):
    db = SessionLocal()
    try:
        sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == user_id).first()
        if sub:
            if sub_obj.title is not None:
                sub.title = sub_obj.title
            if sub_obj.amount is not None:
                sub.amount = sub_obj.amount
            if sub_obj.frequency is not None:
                sub.frequency = sub_obj.frequency
            if sub_obj.next_due_date is not None:
                sub.next_due_date = sub_obj.next_due_date
            db.commit()
            return True
        return False
    finally:
        db.close()

def delete_subscription(user_id: int, sub_id: int):
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

GOAL_DB = """
from app.models.all_models import Goal
from app.database_orm import SessionLocal

def get_goals(user_id: int):
    db = SessionLocal()
    try:
        goals = db.query(Goal).filter(Goal.user_id == user_id).all()
        return [{"id": g.id, "user_id": g.user_id, "title": g.title, "target_amount": g.target_amount, "current_amount": g.current_amount, "target_date": g.target_date, "created_at": str(g.id)} for g in goals]
    finally:
        db.close()

def get_goal_by_id(user_id: int, goal_id: int):
    db = SessionLocal()
    try:
        g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if g:
             return {"id": g.id, "user_id": g.user_id, "title": g.title, "target_amount": g.target_amount, "current_amount": g.current_amount, "target_date": g.target_date, "created_at": str(g.id)}
        return None
    finally:
        db.close()

def create_goal(user_id: int, goal_obj):
    db = SessionLocal()
    try:
        new_goal = Goal(user_id=user_id, title=goal_obj.title, target_amount=goal_obj.target_amount, target_date=goal_obj.target_date, current_amount=0.0)
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)
        return new_goal.id
    finally:
        db.close()

def update_goal(user_id: int, goal_id: int, goal_obj):
    db = SessionLocal()
    try:
        goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if goal:
            if getattr(goal_obj, 'title', None) is not None: goal.title = goal_obj.title
            if getattr(goal_obj, 'target_amount', None) is not None: goal.target_amount = goal_obj.target_amount
            if getattr(goal_obj, 'target_date', None) is not None: goal.target_date = goal_obj.target_date
            if getattr(goal_obj, 'current_amount', None) is not None: goal.current_amount = goal_obj.current_amount
            db.commit()
            return True
        return False
    finally:
        db.close()

def delete_goal(user_id: int, goal_id: int):
    db = SessionLocal()
    try:
        goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if goal:
            db.delete(goal)
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
        return [{"id": b.id, "user_id": b.user_id, "category": b.category, "limit_amount": b.limit_amount, "month": b.month, "created_at": str(b.id)} for b in budgets]
    finally:
        db.close()

def get_budget_by_id(user_id: int, budget_id: int):
    db = SessionLocal()
    try:
        b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
        if b:
            return {"id": b.id, "user_id": b.user_id, "category": b.category, "limit_amount": b.limit_amount, "month": b.month, "created_at": str(b.id)}
        return None
    finally:
        db.close()

def create_budget(user_id: int, budget_obj):
    db = SessionLocal()
    try:
        new_budget = Budget(user_id=user_id, category=budget_obj.category, limit_amount=budget_obj.limit_amount, month=budget_obj.month)
        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)
        return new_budget.id
    finally:
        db.close()

def update_budget(user_id: int, budget_id: int, budget_obj):
    db = SessionLocal()
    try:
        budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
        if budget:
            if budget_obj.category is not None: budget.category = budget_obj.category
            if budget_obj.limit_amount is not None: budget.limit_amount = budget_obj.limit_amount
            if budget_obj.month is not None: budget.month = budget_obj.month
            db.commit()
            return True
        return False
    finally:
        db.close()

def delete_budget(user_id: int, budget_id: int):
    db = SessionLocal()
    try:
        budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
        if budget:
            db.delete(budget)
            db.commit()
            return True
        return False
    finally:
        db.close()
"""

with open(os.path.join(DB_DIR, "expense_db.py"), "w") as f: f.write(EXPENSE_DB)
with open(os.path.join(DB_DIR, "income_db.py"), "w") as f: f.write(INCOME_DB)
with open(os.path.join(DB_DIR, "subscription_db.py"), "w") as f: f.write(SUBSCRIPTION_DB)
with open(os.path.join(DB_DIR, "goal_db.py"), "w") as f: f.write(GOAL_DB)
with open(os.path.join(DB_DIR, "budget_db.py"), "w") as f: f.write(BUDGET_DB)

print("RESTORED MISSING DAO METHODS WITH CREATED_AT!")
