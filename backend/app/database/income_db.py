
from app.models.all_models import Income
from app.database_orm import SessionLocal

def _income_to_dict(i):
    return {
        "id": i.id,
        "user_id": i.user_id,
        "source": i.source,
        "amount": float(i.amount),
        "date": str(i.date) if i.date else "",
        "created_at": str(i.created_at) if getattr(i, 'created_at', None) else str(i.id)
    }

def get_incomes(user_id: int):
    db = SessionLocal()
    try:
        incomes = db.query(Income).filter(Income.user_id == user_id).order_by(Income.date.desc()).all()
        return [_income_to_dict(i) for i in incomes]
    finally:
        db.close()

def get_income_by_id(user_id: int, income_id: int):
    db = SessionLocal()
    try:
        i = db.query(Income).filter(Income.id == income_id, Income.user_id == user_id).first()
        if i:
            return _income_to_dict(i)
        return None
    finally:
        db.close()

from app.database.date_utils import parse_date

def create_income(user_id: int, income_obj):
    db = SessionLocal()
    try:
        new_income = Income(
            user_id=user_id, 
            source=income_obj.source, 
            amount=income_obj.amount, 
            date=parse_date(income_obj.date)
        )
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
                income.date = parse_date(income_obj.date)
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
