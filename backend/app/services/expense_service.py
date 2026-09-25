from fastapi import HTTPException
from app.database import expense_db
from app.schemas.expense import ExpenseCreate

def create_expense(expense: ExpenseCreate, user_id: int):
    return expense_db.create_expense(user_id, expense.amount, expense.category, expense.description, str(expense.date))

def get_all_expenses(user_id: int):
    return expense_db.get_all_expenses(user_id)

def get_expense(expense_id: int, user_id: int):
    expense = expense_db.get_expense_by_id(expense_id, user_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

def update_expense(expense_id: int, expense: ExpenseCreate, user_id: int):
    updated = expense_db.update_expense(expense_id, user_id, expense.amount, expense.category, expense.description, str(expense.date))
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated

def delete_expense(expense_id: int, user_id: int):
    success = expense_db.delete_expense(expense_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

def get_expense_stats(user_id: int):
    return expense_db.get_expense_stats(user_id)
