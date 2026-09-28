from fastapi import APIRouter, HTTPException, Depends
from typing import List

from ..schemas.income import IncomeCreate, IncomeUpdate, IncomeResponse
from ..database import income_db
from ..services.auth_service import get_current_user

router = APIRouter()

@router.post("/", response_model=IncomeResponse, status_code=201)
def create_income(income: IncomeCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    income_id = income_db.create_income(user_id, income)
    
    created_income = income_db.get_income_by_id(user_id, income_id)
    if not created_income:
        raise HTTPException(status_code=500, detail="Failed to retrieve created income")
    return created_income

@router.get("/", response_model=List[IncomeResponse])
def get_incomes(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return income_db.get_incomes(user_id)

@router.get("/{income_id}", response_model=IncomeResponse)
def get_income(income_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    income = income_db.get_income_by_id(user_id, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return income

@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(income_id: int, income: IncomeUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    existing = income_db.get_income_by_id(user_id, income_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Income not found")
        
    income_db.update_income(user_id, income_id, income)
        
    return income_db.get_income_by_id(user_id, income_id)

@router.delete("/{income_id}")
def delete_income(income_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    success = income_db.delete_income(user_id, income_id)
    if not success:
        raise HTTPException(status_code=404, detail="Income not found")
        
    return {"detail": "Income deleted successfully"}
