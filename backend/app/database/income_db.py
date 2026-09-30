
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
