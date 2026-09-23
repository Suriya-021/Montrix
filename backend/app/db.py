import sqlite3
from .config import DATABASE_URL

# DATABASE_URL looks like "sqlite:///./spendwise.db"
# We just want the path part: "./spendwise.db"
DB_FILE = DATABASE_URL.replace("sqlite:///", "")

def get_db_connection():
    """
    Creates a connection to the SQLite database.
    If the file doesn't exist, SQLite will automatically create it.
    """
    conn = sqlite3.connect(DB_FILE)
    
    # This line is magic: it tells SQLite to return rows that act like Python dictionaries.
    # Instead of getting (1, 250, 'Food'), you get {'id': 1, 'amount': 250, 'category': 'Food'}
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes the database by creating the necessary tables
    if they do not already exist.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # SQL command to create our expenses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        )
    ''')
    
    # Commit saves our changes to the file
    conn.commit()
    # Always close the connection when done!
    conn.close()
