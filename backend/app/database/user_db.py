import sqlite3
from app.db import get_db_connection
from fastapi import HTTPException

def create_user(name: str, email: str, password_hash: str):
    """Inserts a new user into the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return get_user_by_id(user_id)
    except sqlite3.IntegrityError:
        # IntegrityError occurs if the UNIQUE constraint on email is violated
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        conn.close()

def get_user_by_email(email: str):
    """Finds a user by their email address."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_id(user_id: int):
    """Finds a user by their ID, excluding the password hash for safety."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None
