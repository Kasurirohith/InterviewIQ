import sqlite3
import os

# Define the path to the database file in the exact same directory as this script
DB_PATH = os.path.join(os.path.dirname(__file__), "auth.db")

# Establish connection with multithreading checks disabled for FastAPI compatibility
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()

# ----------------------------
# INITIALIZE DATABASE TABLES
# ----------------------------

# 1. Create Users Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)
""")

# 2. Create Interview History Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS interview_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    ats_score INTEGER,
    interview_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# Keep detailed interview insights for the progress dashboard. Migrate existing
# SQLite databases in place so previously saved score history remains intact.
for column_name, column_type in (
    ("company", "TEXT NOT NULL DEFAULT ''"),
    ("track", "TEXT NOT NULL DEFAULT ''"),
    ("answers_json", "TEXT NOT NULL DEFAULT '[]'"),
):
    cursor.execute("PRAGMA table_info(interview_history)")
    existing_columns = {row[1] for row in cursor.fetchall()}
    if column_name not in existing_columns:
        cursor.execute(f"ALTER TABLE interview_history ADD COLUMN {column_name} {column_type}")

# Demo subscription records. Payment information stored here is limited to the
# simulated payment method and a non-sensitive demo reference.
cursor.execute("""
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    plan_code TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    category TEXT NOT NULL,
    list_price REAL NOT NULL,
    discount_percent INTEGER NOT NULL,
    demo_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_reference TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'demo_paid',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# Save the table structures immediately
conn.commit()

