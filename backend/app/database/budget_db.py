
from app.models.all_models import Budget
from app.database_orm import SessionLocal

def _budget_to_dict(b):
    return {
        "id": b.id,
        "user_id": b.user_id,
        "category": b.category,
        "limit_amount": b.limit_amount,
        "month": b.month,
        "created_at": str(b.created_at) if b.created_at else str(b.id)
    }

def get_budgets(user_id: int, month: str = None):
    db = SessionLocal()
    try:
        query = db.query(Budget).filter(Budget.user_id == user_id)
        if month:
            query = query.filter(Budget.month == month)
        budgets = query.all()
        return [_budget_to_dict(b) for b in budgets]
    finally:
        db.close()

def get_budget_by_id(user_id: int, budget_id: int):
    db = SessionLocal()
    try:
        b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
        if b:
            return _budget_to_dict(b)
        return None
    finally:
        db.close()

def create_budget(user_id: int, budget_obj):
    db = SessionLocal()
    try:
        existing = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.category == budget_obj.category,
            Budget.month == budget_obj.month
        ).first()
        if existing:
            existing.limit_amount = budget_obj.limit_amount
            db.commit()
            db.refresh(existing)
            return existing.id

        new_budget = Budget(
            user_id=user_id, 
            category=budget_obj.category, 
            limit_amount=budget_obj.limit_amount, 
            month=budget_obj.month
        )
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
            if getattr(budget_obj, 'category', None) is not None: budget.category = budget_obj.category
            if getattr(budget_obj, 'limit_amount', None) is not None: budget.limit_amount = budget_obj.limit_amount
            if getattr(budget_obj, 'month', None) is not None: budget.month = budget_obj.month
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

from collections import defaultdict
from datetime import date as dt_date, datetime
import calendar
from app.models.all_models import Expense

def get_budget_status(user_id: int, month: str = None):
    db = SessionLocal()
    try:
        target_month = month if month else datetime.now().strftime("%Y-%m")
        try:
            year, m = map(int, target_month.split("-"))
            _, last_day = calendar.monthrange(year, m)
            start_date = dt_date(year, m, 1)
            end_date = dt_date(year, m, last_day)
        except Exception:
            year = datetime.now().year
            m = datetime.now().month
            _, last_day = calendar.monthrange(year, m)
            start_date = dt_date(year, m, 1)
            end_date = dt_date(year, m, last_day)
            target_month = f"{year:04d}-{m:02d}"

        # Fetch budgets for this user and month
        budgets = db.query(Budget).filter(Budget.user_id == user_id, Budget.month == target_month).all()

        # Fetch expenses in that date range using indexed Date column
        month_expenses = db.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date <= end_date
        ).all()

        # Tally spent by category
        spent_by_category = defaultdict(float)
        for exp in month_expenses:
            spent_by_category[exp.category] += float(exp.amount)

        category_statuses = []
        alerts = []
        total_budget = 0.0
        total_spent_in_budgeted = 0.0

        for b in budgets:
            limit = float(b.limit_amount)
            spent = spent_by_category[b.category]
            total_budget += limit
            total_spent_in_budgeted += spent
            remaining = limit - spent
            pct = round((spent / limit) * 100, 1) if limit > 0 else 0.0

            if pct > 100.0:
                cat_status = "danger"
                alerts.append({
                    "category": b.category,
                    "type": "danger",
                    "percentage": pct,
                    "limit_amount": limit,
                    "spent_amount": round(spent, 2),
                    "over_amount": round(spent - limit, 2),
                    "message": f"Exceeded {b.category} budget by {round(spent - limit, 2)} ({pct}%)"
                })
            elif pct >= 80.0:
                cat_status = "warning"
                alerts.append({
                    "category": b.category,
                    "type": "warning",
                    "percentage": pct,
                    "limit_amount": limit,
                    "spent_amount": round(spent, 2),
                    "over_amount": 0.0,
                    "message": f"{b.category} is near limit ({pct}% used, {round(remaining, 2)} remaining)"
                })
            else:
                cat_status = "normal"

            category_statuses.append({
                "budget_id": b.id,
                "category": b.category,
                "limit_amount": limit,
                "spent_amount": round(spent, 2),
                "remaining_amount": round(remaining, 2),
                "percentage_used": pct,
                "status": cat_status
            })

        overall_pct = round((total_spent_in_budgeted / total_budget) * 100, 1) if total_budget > 0 else 0.0
        overall_status = "danger" if any(c["status"] == "danger" for c in category_statuses) else ("warning" if any(c["status"] == "warning" for c in category_statuses) else "normal")

        return {
            "month": target_month,
            "total_budget": round(total_budget, 2),
            "total_spent": round(total_spent_in_budgeted, 2),
            "total_remaining": round(total_budget - total_spent_in_budgeted, 2),
            "overall_percentage": overall_pct,
            "overall_status": overall_status,
            "categories": category_statuses,
            "alerts": alerts
        }
    finally:
        db.close()
