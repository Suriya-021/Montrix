from fastapi import HTTPException
from app.database import expense_db
from app.schemas.expense import ExpenseCreate

def create_expense(expense: ExpenseCreate):
    return expense_db.create_expense_in_db(expense)

def get_all_expenses():
    return expense_db.get_all_expenses_from_db()

def get_expense(expense_id: int):
    # Fetch from database
    expense = expense_db.get_expense_by_id(expense_id)
    
    # Business logic: If it doesn't exist, raise a 404 error
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return expense

def update_expense(expense_id: int, expense: ExpenseCreate):
    updated = expense_db.update_expense_in_db(expense_id, expense)
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated

def delete_expense(expense_id: int):
    success = expense_db.delete_expense_from_db(expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}
