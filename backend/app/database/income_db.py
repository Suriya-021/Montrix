from typing import List, Optional
from ..db import get_db_connection
from ..schemas.income import IncomeCreate, IncomeUpdate

def create_income(user_id: int, income: IncomeCreate) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO income (user_id, source, amount, date) VALUES (?, ?, ?, ?)",
        (user_id, income.source, income.amount, income.date)
    )
    
    income_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return income_id

def get_incomes(user_id: int) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Order by date descending (newest income first)
    cursor.execute("SELECT * FROM income WHERE user_id = ? ORDER BY date DESC", (user_id,))
        
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_income_by_id(user_id: int, income_id: int) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM income WHERE id = ? AND user_id = ?", (income_id, user_id))
    row = cursor.fetchone()
    
    conn.close()
    
    if row:
        return dict(row)
    return None

def update_income(user_id: int, income_id: int, income: IncomeUpdate) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    update_fields = []
    params = []
    
    if income.source is not None:
        update_fields.append("source = ?")
        params.append(income.source)
    if income.amount is not None:
        update_fields.append("amount = ?")
        params.append(income.amount)
    if income.date is not None:
        update_fields.append("date = ?")
        params.append(income.date)
        
    if not update_fields:
        return False
        
    query = f"UPDATE income SET {', '.join(update_fields)} WHERE id = ? AND user_id = ?"
    params.extend([income_id, user_id])
    
    cursor.execute(query, tuple(params))
    
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return rows_affected > 0

def delete_income(user_id: int, income_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM income WHERE id = ? AND user_id = ?", (income_id, user_id))
    
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return rows_affected > 0
