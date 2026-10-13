
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
