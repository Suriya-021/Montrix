import sqlite3
from app.db import get_db_connection

def get_all_expenses(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def create_expense(user_id: int, amount: float, category: str, description: str, date: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)",
        (user_id, amount, category, description, date)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return get_expense_by_id(new_id, user_id)

def get_expense_by_id(expense_id: int, user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM expenses WHERE id = ? AND user_id = ?", (expense_id, user_id))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_expense(expense_id: int, user_id: int, amount: float, category: str, description: str, date: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ? AND user_id = ?",
        (amount, category, description, date, expense_id, user_id)
    )
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    if rows_affected > 0:
        return get_expense_by_id(expense_id, user_id)
    return None

def delete_expense(expense_id: int, user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = ? AND user_id = ?", (expense_id, user_id))
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    return rows_affected > 0

def get_expense_stats(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Total expenses
    cursor.execute("SELECT SUM(amount) as total FROM expenses WHERE user_id = ?", (user_id,))
    total_spent = cursor.fetchone()['total'] or 0
    
    # 2. This month expenses
    cursor.execute("SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')", (user_id,))
    this_month_spent = cursor.fetchone()['total'] or 0
    
    # 3. Transaction count
    cursor.execute("SELECT COUNT(*) as cnt FROM expenses WHERE user_id = ?", (user_id,))
    transactions_count = cursor.fetchone()['cnt'] or 0
    
    # 4. Expenses grouped by category (Dashboard expects 'name' and 'value')
    cursor.execute("SELECT category as name, SUM(amount) as value FROM expenses WHERE user_id = ? GROUP BY category", (user_id,))
    category_breakdown = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "total_spent": total_spent,
        "this_month_spent": this_month_spent,
        "transactions_count": transactions_count,
        "category_breakdown": category_breakdown
    }
