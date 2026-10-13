
from fastapi import HTTPException
from app.database import expense_db
from app.schemas.expense import ExpenseCreate

def create_expense(expense: ExpenseCreate, user_id: int):
    expense_id = expense_db.create_expense(user_id, expense.amount, expense.category, expense.description, str(expense.date))
    created = expense_db.get_expense_by_id(expense_id, user_id)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create expense")
    return created

from typing import Optional

def get_all_expenses(
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "date",
    sort_order: Optional[str] = "desc",
    page: Optional[int] = None,
    page_size: Optional[int] = 20
):
    return expense_db.get_all_expenses(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        category=category,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )

def get_expense(expense_id: int, user_id: int):
    expense = expense_db.get_expense_by_id(expense_id, user_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

def update_expense(expense_id: int, expense: ExpenseCreate, user_id: int):
    updated = expense_db.update_expense(expense_id, user_id, expense.amount, expense.category, expense.description, str(expense.date))
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return expense_db.get_expense_by_id(expense_id, user_id)

def delete_expense(expense_id: int, user_id: int):
    success = expense_db.delete_expense(expense_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

from typing import Optional

def get_expense_stats(user_id: int, month: Optional[str] = None):
    return expense_db.get_expense_stats(user_id, month=month)
