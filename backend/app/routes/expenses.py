from fastapi import APIRouter, Depends
from typing import List

from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.services import expense_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("/", response_model=List[ExpenseResponse])
def get_all_expenses(current_user: dict = Depends(get_current_user)):
    return expense_service.get_all_expenses(current_user['id'])

@router.get("/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    return expense_service.get_expense_stats(current_user['id'])

@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, current_user: dict = Depends(get_current_user)):
    return expense_service.get_expense(expense_id, current_user['id'])

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    return expense_service.create_expense(expense, current_user['id'])

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    return expense_service.update_expense(expense_id, expense, current_user['id'])

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, current_user: dict = Depends(get_current_user)):
    return expense_service.delete_expense(expense_id, current_user['id'])
