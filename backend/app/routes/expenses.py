from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional, Union
import io
import csv

from app.schemas.expense import ExpenseCreate, ExpenseResponse, PaginatedExpensesResponse
from app.services import expense_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("/", response_model=Union[PaginatedExpensesResponse, List[ExpenseResponse]])
def get_all_expenses(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search description"),
    sort_by: Optional[str] = Query("date", description="Sort field ('date' or 'amount')"),
    sort_order: Optional[str] = Query("desc", description="Sort order ('asc' or 'desc')"),
    page: Optional[int] = Query(None, ge=1, description="Page number (1-indexed)"),
    page_size: Optional[int] = Query(20, ge=1, le=100, description="Page size"),
    current_user: dict = Depends(get_current_user)
):
    return expense_service.get_all_expenses(
        user_id=current_user['id'],
        start_date=start_date,
        end_date=end_date,
        category=category,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )

from typing import Optional

@router.get("/stats")
def get_stats(month: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    return expense_service.get_expense_stats(current_user['id'], month=month)

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
