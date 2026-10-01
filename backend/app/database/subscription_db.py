
from app.models.all_models import Subscription
from app.database_orm import SessionLocal

def _sub_to_dict(s):
    return {
        "id": s.id,
        "user_id": s.user_id,
        "title": s.title,
        "amount": s.amount,
        "frequency": s.frequency,
        "next_due_date": s.next_due_date,
        "created_at": str(s.created_at) if getattr(s, 'created_at', None) else str(s.id)
    }

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
