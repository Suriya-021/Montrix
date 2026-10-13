from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from ..schemas.category import CategoryCreate, CategoryResponse
from ..database import category_db
from ..services.auth_service import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(current_user: dict = Depends(get_current_user)):
    """Fetch all available categories (standard system defaults + user custom)."""
    return category_db.get_categories(current_user["id"])

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, current_user: dict = Depends(get_current_user)):
    """Create a new custom category for the user."""
    return category_db.create_category(current_user["id"], category)

@router.delete("/{category_id}")
def delete_category(category_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a custom category. System default categories cannot be deleted."""
    success = category_db.delete_category(current_user["id"], category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted successfully"}
