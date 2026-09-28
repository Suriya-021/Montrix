from typing import List, Optional
from ..db import get_db_connection
from ..schemas.subscription import SubscriptionCreate, SubscriptionUpdate

def create_subscription(user_id: int, sub: SubscriptionCreate) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO subscriptions (user_id, title, amount, frequency, next_due_date) VALUES (?, ?, ?, ?, ?)",
        (user_id, sub.title, sub.amount, sub.frequency, sub.next_due_date)
    )
    
    sub_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return sub_id

def get_subscriptions(user_id: int) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Order by next_due_date so the soonest bills appear first!
    cursor.execute("SELECT * FROM subscriptions WHERE user_id = ? ORDER BY next_due_date ASC", (user_id,))
        
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_subscription_by_id(user_id: int, sub_id: int) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM subscriptions WHERE id = ? AND user_id = ?", (sub_id, user_id))
    row = cursor.fetchone()
    
    conn.close()
    
    if row:
        return dict(row)
    return None

def update_subscription(user_id: int, sub_id: int, sub: SubscriptionUpdate) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # We only update the fields that are provided
    update_fields = []
    params = []
    
    if sub.title is not None:
        update_fields.append("title = ?")
        params.append(sub.title)
    if sub.amount is not None:
        update_fields.append("amount = ?")
        params.append(sub.amount)
    if sub.frequency is not None:
        update_fields.append("frequency = ?")
        params.append(sub.frequency)
    if sub.next_due_date is not None:
        update_fields.append("next_due_date = ?")
        params.append(sub.next_due_date)
        
    if not update_fields:
        return False
        
    query = f"UPDATE subscriptions SET {', '.join(update_fields)} WHERE id = ? AND user_id = ?"
    params.extend([sub_id, user_id])
    
    cursor.execute(query, tuple(params))
    
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return rows_affected > 0

def delete_subscription(user_id: int, sub_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM subscriptions WHERE id = ? AND user_id = ?", (sub_id, user_id))
    
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return rows_affected > 0
