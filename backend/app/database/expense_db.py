from app.db import get_db_connection
from app.schemas.expense import ExpenseCreate

def create_expense_in_db(expense_data: ExpenseCreate):
    """Inserts a new expense into the database and returns the new row."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Notice the '?' placeholders. This prevents SQL injection!
    cursor.execute('''
        INSERT INTO expenses (amount, category, description, date)
        VALUES (?, ?, ?, ?)
    ''', (expense_data.amount, expense_data.category, expense_data.description, expense_data.date))
    
    # After inserting, the database generated an 'id' and 'created_at'.
    # We grab the newly generated 'id' so we can fetch the full row.
    new_id = cursor.lastrowid
    conn.commit()
    
    # Fetch the newly created row to send back to the user
    cursor.execute('SELECT * FROM expenses WHERE id = ?', (new_id,))
    new_expense = cursor.fetchone()
    
    conn.close()
    
    return dict(new_expense)

def get_all_expenses_from_db():
    """Fetches all expenses, sorted by date (newest first)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM expenses ORDER BY date DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_expense_by_id(expense_id: int):
    """Fetches a single expense by its ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM expenses WHERE id = ?', (expense_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def update_expense_in_db(expense_id: int, expense_data: ExpenseCreate):
    """Updates an existing expense."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE expenses
        SET amount = ?, category = ?, description = ?, date = ?
        WHERE id = ?
    ''', (expense_data.amount, expense_data.category, expense_data.description, expense_data.date, expense_id))
    
    conn.commit()
    
    # Fetch the updated row to return it
    cursor.execute('SELECT * FROM expenses WHERE id = ?', (expense_id,))
    updated_row = cursor.fetchone()
    conn.close()
    
    return dict(updated_row) if updated_row else None

def delete_expense_from_db(expense_id: int):
    """Deletes an expense. Returns True if successful, False if it didn't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
    
    # .rowcount tells us how many rows were actually deleted
    rows_deleted = cursor.rowcount 
    conn.commit()
    conn.close()
    
    return rows_deleted > 0

def get_stats_from_db():
    """Calculates summary statistics from the database using SQL."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Total spent and transaction count
    cursor.execute('SELECT SUM(amount), COUNT(id) FROM expenses')
    total_spent, count = cursor.fetchone()
    total_spent = total_spent or 0
    
    # 2. This month spent
    import datetime
    now = datetime.datetime.now()
    # Format as YYYY-MM-DD
    start_of_month = now.replace(day=1).strftime('%Y-%m-%d')
    
    cursor.execute('SELECT SUM(amount) FROM expenses WHERE date >= ?', (start_of_month,))
    this_month = cursor.fetchone()[0] or 0
    
    # 3. Category breakdown
    cursor.execute('SELECT category, SUM(amount) FROM expenses GROUP BY category')
    categories = [{"name": row[0], "value": row[1]} for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "total_spent": total_spent,
        "this_month_spent": this_month,
        "transactions_count": count,
        "category_breakdown": categories
    }
