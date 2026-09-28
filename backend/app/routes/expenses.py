from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from typing import List
import io
import csv

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

from datetime import datetime

@router.get("/export")
def export_expenses_csv(current_user: dict = Depends(get_current_user)):
    expenses = expense_service.get_all_expenses(current_user['id'])
    
    # Create an in-memory string buffer
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write the header row
    writer.writerow(['Date (Transaction)', 'Description', 'Category', 'Amount (INR)', 'Logged At'])
    
    # Write data rows
    for exp in expenses:
        writer.writerow([
            exp['date'], 
            exp.get('description', exp.get('title', '')), 
            exp['category'],
            exp['amount'],
            exp.get('created_at', '')
        ])
        
    # Reset the buffer's cursor to the beginning
    output.seek(0)
    
    # Generate a dynamic filename with today's date
    today_str = datetime.now().strftime('%Y-%m-%d')
    filename = f"expenses_export_{today_str}.csv"
    
    # Stream the file back to the client
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

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
