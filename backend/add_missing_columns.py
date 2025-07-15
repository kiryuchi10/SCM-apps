#!/usr/bin/env python3
"""
Quick script to add missing columns to existing database
"""

import os
import sys
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv()

def add_missing_columns():
    """Add missing columns to users table"""
    try:
        connection = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', 3306)),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DB', 'scm_core'),
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        print("🔄 Checking and adding missing columns...")
        
        # Check current table structure
        cursor.execute("DESCRIBE users")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Current columns: {columns}")
        
        # Add missing columns if they don't exist
        if 'first_name' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN first_name VARCHAR(100)")
            print("✅ Added first_name column")
        
        if 'last_name' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN last_name VARCHAR(100)")
            print("✅ Added last_name column")
        
        connection.commit()
        print("✅ Database updated successfully!")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

if __name__ == '__main__':
    print("🚀 Adding missing columns to database...")
    if add_missing_columns():
        print("🎉 Done! You can now restart your Flask app.")
    else:
        print("❌ Failed to update database.")
        sys.exit(1)