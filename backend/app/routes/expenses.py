from fastapi import APIRouter
from typing import List

from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.services import expense_service

# We create an APIRouter. This is like a "mini" FastAPI app 
# that we will plug into our main app later.
router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

# GET /api/expenses -> Get all expenses
# We tell FastAPI that the response will be a List of ExpenseResponse schemas
@router.get("/", response_model=List[ExpenseResponse])
def get_all_expenses():
    return expense_service.get_all_expenses()

# GET /api/expenses/{id} -> Get ONE expense
@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int):
    return expense_service.get_expense(expense_id)

# POST /api/expenses -> Create a new expense
# Notice we expect `ExpenseCreate` (from the user) 
# but we return `ExpenseResponse` (which includes the new ID and date)
@router.post("/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate):
    return expense_service.create_expense(expense)

# PUT /api/expenses/{id} -> Update an expense
@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense: ExpenseCreate):
    return expense_service.update_expense(expense_id, expense)

# DELETE /api/expenses/{id} -> Delete an expense
@router.delete("/{expense_id}")
def delete_expense(expense_id: int):
    return expense_service.delete_expense(expense_id)
