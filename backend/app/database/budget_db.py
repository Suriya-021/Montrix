from typing import List, Optional
from ..db import get_db_connection
from ..schemas.budget import BudgetCreate, BudgetUpdate

def create_budget(user_id: int, budget: BudgetCreate) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # We use INSERT OR REPLACE so if a budget for this category & month already exists, it updates it!
    cursor.execute(
        "INSERT OR REPLACE INTO budgets (user_id, category, limit_amount, month) VALUES (?, ?, ?, ?)",
        (user_id, budget.category, budget.limit_amount, budget.month)
    )
    
    budget_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return budget_id

def get_budgets(user_id: int, month: Optional[str] = None) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if month:
        cursor.execute("SELECT * FROM budgets WHERE user_id = ? AND month = ?", (user_id, month))
    else:
        cursor.execute("SELECT * FROM budgets WHERE user_id = ?", (user_id,))
        
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_budget_by_id(user_id: int, budget_id: int) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM budgets WHERE id = ? AND user_id = ?", (budget_id, user_id))
    row = cursor.fetchone()
    
    conn.close()
    
    if row:
        return dict(row)
    return None

def update_budget(user_id: int, budget_id: int, budget: BudgetUpdate) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "UPDATE budgets SET limit_amount = ? WHERE id = ? AND user_id = ?",
        (budget.limit_amount, budget_id, user_id)
    )
    
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return rows_affected > 0

def delete_budget(user_id: int, budget_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM budgets WHERE id = ? AND user_id = ?", (budget_id, user_id))
    
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return rows_affected > 0
