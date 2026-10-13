from datetime import date
from dateutil.relativedelta import relativedelta
from app.models.all_models import Subscription, Expense
from app.database_orm import SessionLocal
from app.database.date_utils import parse_date

def _sub_to_dict(s):
    return {
        "id": s.id,
        "user_id": s.user_id,
        "title": s.title,
        "amount": float(s.amount),
        "frequency": s.frequency,
        "next_due_date": str(s.next_due_date) if s.next_due_date else "",
        "created_at": str(s.created_at) if getattr(s, 'created_at', None) else str(s.id)
    }

def compute_next_due_date(current_date, frequency: str) -> date:
    freq = (frequency or "Monthly").strip().lower()
    if freq == "weekly":
        return current_date + relativedelta(weeks=1)
    elif freq == "quarterly":
        return current_date + relativedelta(months=3)
    elif freq == "yearly":
        return current_date + relativedelta(years=1)
    else: # Default Monthly
        return current_date + relativedelta(months=1)

def get_subscriptions(user_id: int):
    db = SessionLocal()
    try:
        subs = db.query(Subscription).filter(Subscription.user_id == user_id).order_by(Subscription.next_due_date.asc()).all()
        return [_sub_to_dict(s) for s in subs]
    finally:
        db.close()

def get_subscription_by_id(user_id: int, sub_id: int):
    db = SessionLocal()
    try:
        s = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == user_id).first()
        if s:
            return _sub_to_dict(s)
        return None
    finally:
        db.close()

def create_subscription(user_id: int, sub_obj):
    db = SessionLocal()
    try:
        new_sub = Subscription(
            user_id=user_id, 
            title=sub_obj.title, 
            amount=sub_obj.amount, 
            frequency=sub_obj.frequency, 
            next_due_date=parse_date(sub_obj.next_due_date)
        )
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
                sub.next_due_date = parse_date(sub_obj.next_due_date)
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

def pay_and_advance_subscription(user_id: int, sub_id: int):
    """
    Logs an expense for the subscription and advances the next_due_date 
    according to its frequency in an atomic database transaction.
    """
    db = SessionLocal()
    try:
        sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == user_id).first()
        if not sub:
            return None

        # 1. Log as an expense
        expense_date = sub.next_due_date or date.today()
        new_expense = Expense(
            user_id=user_id,
            amount=sub.amount,
            category="Bills",
            description=f"{sub.title} ({sub.frequency} Bill)",
            date=expense_date
        )
        db.add(new_expense)

        # 2. Advance the next_due_date
        new_due_date = compute_next_due_date(expense_date, sub.frequency)
        sub.next_due_date = new_due_date
        
        db.commit()
        db.refresh(new_expense)
        db.refresh(sub)

        return {
            "message": f"Logged '{sub.title}' expense of ₹{float(sub.amount):.2f} and advanced due date to {new_due_date}",
            "expense_id": new_expense.id,
            "new_due_date": str(new_due_date),
            "subscription": _sub_to_dict(sub)
        }
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def get_due_subscriptions(user_id: int):
    """
    Retrieves all subscriptions that are due on or before today.
    """
    db = SessionLocal()
    try:
        today = date.today()
        subs = db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.next_due_date <= today
        ).order_by(Subscription.next_due_date.asc()).all()
        
        result = []
        for s in subs:
            item = _sub_to_dict(s)
            item["days_overdue"] = max(0, (today - s.next_due_date).days) if s.next_due_date else 0
            result.append(item)
        return result
    finally:
        db.close()

def process_all_due_subscriptions(user_id: int):
    """
    Automatically processes and logs all due/overdue subscriptions into expenses.
    """
    db = SessionLocal()
    try:
        today = date.today()
        due_subs = db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.next_due_date <= today
        ).all()

        logged = []
        total_amount = 0.0

        for sub in due_subs:
            expense_date = sub.next_due_date or today
            new_expense = Expense(
                user_id=user_id,
                amount=sub.amount,
                category="Bills",
                description=f"{sub.title} ({sub.frequency} Bill)",
                date=expense_date
            )
            db.add(new_expense)

            # Advance date
            new_due_date = compute_next_due_date(expense_date, sub.frequency)
            sub.next_due_date = new_due_date
            
            total_amount += float(sub.amount)
            logged.append(sub)

        db.commit()
        for sub in logged:
            db.refresh(sub)

        return {
            "processed_count": len(logged),
            "total_amount": round(total_amount, 2),
            "logged_subscriptions": [_sub_to_dict(s) for s in logged]
        }
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
