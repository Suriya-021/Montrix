from typing import List, Optional
from ..db import get_db_connection
from ..schemas.goal import GoalCreate, GoalUpdate

def create_goal(user_id: int, goal: GoalCreate) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO goals (user_id, title, target_amount, current_amount, target_date) VALUES (?, ?, ?, ?, ?)",
        (user_id, goal.title, goal.target_amount, goal.current_amount, goal.target_date)
    )
    
    goal_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return goal_id

def get_goals(user_id: int) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # We can order by created_at descending so newest goals are first
    cursor.execute("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_goal_by_id(user_id: int, goal_id: int) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id))
    row = cursor.fetchone()
    
    conn.close()
    
    if row:
        return dict(row)
    return None

def update_goal(user_id: int, goal_id: int, goal: GoalUpdate) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    update_fields = []
    params = []
    
    if goal.title is not None:
        update_fields.append("title = ?")
        params.append(goal.title)
    if goal.target_amount is not None:
        update_fields.append("target_amount = ?")
        params.append(goal.target_amount)
    if goal.current_amount is not None:
        update_fields.append("current_amount = ?")
        params.append(goal.current_amount)
    if goal.target_date is not None:
        # User can clear the date by passing empty string
        val = None if goal.target_date == "" else goal.target_date
        update_fields.append("target_date = ?")
        params.append(val)
        
    if not update_fields:
        return False
        
    query = f"UPDATE goals SET {', '.join(update_fields)} WHERE id = ? AND user_id = ?"
    params.extend([goal_id, user_id])
    
    cursor.execute(query, tuple(params))
    
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return rows_affected > 0

def delete_goal(user_id: int, goal_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id))
    
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    return rows_affected > 0
