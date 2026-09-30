
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
