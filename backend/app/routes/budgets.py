from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional

from ..schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from ..database import budget_db
from ..services.auth_service import get_current_user

router = APIRouter()

@router.post("/", response_model=BudgetResponse, status_code=201)
def create_budget(budget: BudgetCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    budget_id = budget_db.create_budget(user_id, budget)
    
    # Retrieve the created/updated budget to return it
    # We query by month and category to get the exact one since we used INSERT OR REPLACE
    budgets = budget_db.get_budgets(user_id, budget.month)
    for b in budgets:
        if b["category"] == budget.category:
            return b
            
    raise HTTPException(status_code=500, detail="Failed to retrieve created budget")

@router.get("/", response_model=List[BudgetResponse])
def get_budgets(month: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return budget_db.get_budgets(user_id, month)

@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(budget_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    budget = budget_db.get_budget_by_id(user_id, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget: BudgetUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # Check if budget exists first
    existing = budget_db.get_budget_by_id(user_id, budget_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    success = budget_db.update_budget(user_id, budget_id, budget)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update budget")
        
    return budget_db.get_budget_by_id(user_id, budget_id)

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    success = budget_db.delete_budget(user_id, budget_id)
    if not success:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    return {"detail": "Budget deleted successfully"}
