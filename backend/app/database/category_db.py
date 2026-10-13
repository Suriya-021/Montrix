from sqlalchemy import or_, func
from fastapi import HTTPException, status
from app.models.all_models import Category
from app.database_orm import SessionLocal

SYSTEM_DEFAULT_CATEGORIES = [
    {"name": "Food", "color": "#06D6A0", "icon": "Utensils", "is_default": True},
    {"name": "Transport", "color": "#3B82F6", "icon": "Car", "is_default": True},
    {"name": "Entertainment", "color": "#8B5CF6", "icon": "Film", "is_default": True},
    {"name": "Shopping", "color": "#EC4899", "icon": "ShoppingBag", "is_default": True},
    {"name": "Bills", "color": "#F59E0B", "icon": "Receipt", "is_default": True},
    {"name": "Health", "color": "#EF4444", "icon": "HeartPulse", "is_default": True},
    {"name": "Education", "color": "#6366F1", "icon": "GraduationCap", "is_default": True},
    {"name": "Games", "color": "#22D3EE", "icon": "Gamepad2", "is_default": True},
    {"name": "Investment", "color": "#10B981", "icon": "TrendingUp", "is_default": True},
    {"name": "Other", "color": "#64748B", "icon": "MoreHorizontal", "is_default": True},
]

def _category_to_dict(c):
    return {
        "id": c.id,
        "user_id": c.user_id,
        "name": c.name,
        "color": c.color,
        "icon": c.icon,
        "is_default": bool(c.is_default),
        "created_at": str(c.created_at) if getattr(c, 'created_at', None) else None
    }

def ensure_default_categories(db):
    """Ensures standard system categories exist in the database."""
    count = db.query(Category).filter(Category.is_default == True).count()
    if count == 0:
        for item in SYSTEM_DEFAULT_CATEGORIES:
            db.add(Category(
                user_id=None,
                name=item["name"],
                color=item["color"],
                icon=item["icon"],
                is_default=True
            ))
        db.commit()

def get_categories(user_id: int):
    """Retrieves all categories available to the user (defaults + user custom)."""
    db = SessionLocal()
    try:
        ensure_default_categories(db)
        categories = db.query(Category).filter(
            or_(Category.is_default == True, Category.user_id == user_id)
        ).order_by(Category.is_default.desc(), Category.name.asc()).all()
        return [_category_to_dict(c) for c in categories]
    finally:
        db.close()

def get_category_by_id(user_id: int, category_id: int):
    db = SessionLocal()
    try:
        c = db.query(Category).filter(
            Category.id == category_id,
            or_(Category.is_default == True, Category.user_id == user_id)
        ).first()
        if c:
            return _category_to_dict(c)
        return None
    finally:
        db.close()

def create_category(user_id: int, category_obj):
    db = SessionLocal()
    try:
        ensure_default_categories(db)
        clean_name = category_obj.name.strip()
        
        # Check duplicate (case-insensitive) across defaults or user's custom categories
        existing = db.query(Category).filter(
            func.lower(Category.name) == func.lower(clean_name),
            or_(Category.is_default == True, Category.user_id == user_id)
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{clean_name}' already exists"
            )

        new_cat = Category(
            user_id=user_id,
            name=clean_name,
            color=category_obj.color or "#8B5CF6",
            icon=category_obj.icon or "Tag",
            is_default=False
        )
        db.add(new_cat)
        db.commit()
        db.refresh(new_cat)
        return _category_to_dict(new_cat)
    finally:
        db.close()

def delete_category(user_id: int, category_id: int):
    db = SessionLocal()
    try:
        cat = db.query(Category).filter(Category.id == category_id).first()
        if not cat:
            return False
        if cat.is_default:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System default categories cannot be deleted"
            )
        if cat.user_id != user_id:
            return False
        db.delete(cat)
        db.commit()
        return True
    finally:
        db.close()
