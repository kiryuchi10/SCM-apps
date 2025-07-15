#!/usr/bin/env python3
"""
Database migration script to update existing tables to match new models
"""

import os
import sys
from dotenv import load_dotenv
import pymysql
from datetime import datetime

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection"""
    return pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        port=int(os.getenv('MYSQL_PORT', 3306)),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DB', 'scm_core'),
        charset='utf8mb4'
    )

def migrate_users_table():
    """Migrate users table to match new model"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        print("🔄 Migrating users table...")
        
        # Check current table structure
        cursor.execute("DESCRIBE users")
        columns = [row[0] for row in cursor.fetchall()]
        
        # Add missing columns
        migrations = []
        
        if 'first_name' not in columns:
            migrations.append("ADD COLUMN first_name VARCHAR(100)")
        
        if 'last_name' not in columns:
            migrations.append("ADD COLUMN last_name VARCHAR(100)")
            
        if 'created_at' not in columns:
            migrations.append("ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            
        if 'updated_at' not in columns:
            migrations.append("ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
        
        # Modify existing columns if needed
        cursor.execute("SHOW COLUMNS FROM users LIKE 'email'")
        email_info = cursor.fetchone()
        if email_info and 'varchar(120)' in email_info[1].lower():
            migrations.append("MODIFY COLUMN email VARCHAR(255) NOT NULL")
            
        cursor.execute("SHOW COLUMNS FROM users LIKE 'password_hash'")
        password_info = cursor.fetchone()
        if password_info and 'varchar(200)' in password_info[1].lower():
            migrations.append("MODIFY COLUMN password_hash VARCHAR(255) NOT NULL")
        
        # Check if role column needs to be updated to ENUM
        cursor.execute("SHOW COLUMNS FROM users LIKE 'role'")
        role_info = cursor.fetchone()
        if role_info and 'enum' not in role_info[1].lower():
            migrations.append("MODIFY COLUMN role ENUM('admin', 'manager', 'analyst', 'user') DEFAULT 'user'")
        
        # Execute migrations
        if migrations:
            migration_sql = f"ALTER TABLE users {', '.join(migrations)}"
            print(f"Executing: {migration_sql}")
            cursor.execute(migration_sql)
            print("✅ Users table migrated successfully!")
        else:
            print("✅ Users table is already up to date!")
            
    except Exception as e:
        print(f"❌ Error migrating users table: {str(e)}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()
    
    return True

def create_missing_tables():
    """Create any missing tables"""
    try:
        from app import app, db
        
        with app.app_context():
            # Create all tables (this will only create missing ones)
            db.create_all()
            print("✅ All missing tables created successfully!")
            
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        return False
    
    return True

def update_existing_data():
    """Update existing data to match new structure"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        print("🔄 Updating existing data...")
        
        # Update users with NULL first_name/last_name
        cursor.execute("""
            UPDATE users 
            SET first_name = COALESCE(first_name, SUBSTRING_INDEX(username, '.', 1)),
                last_name = COALESCE(last_name, SUBSTRING_INDEX(username, '.', -1))
            WHERE first_name IS NULL OR last_name IS NULL
        """)
        
        # Update created_at for existing records if NULL
        cursor.execute("""
            UPDATE users 
            SET created_at = NOW()
            WHERE created_at IS NULL
        """)
        
        connection.commit()
        print("✅ Existing data updated successfully!")
        
    except Exception as e:
        print(f"❌ Error updating data: {str(e)}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()
    
    return True

def main():
    """Main migration function"""
    print("🚀 Starting database migration...")
    print("=" * 50)
    
    # Step 1: Migrate users table
    if not migrate_users_table():
        print("❌ Migration failed at users table step")
        sys.exit(1)
    
    # Step 2: Create missing tables
    if not create_missing_tables():
        print("❌ Migration failed at table creation step")
        sys.exit(1)
    
    # Step 3: Update existing data
    if not update_existing_data():
        print("❌ Migration failed at data update step")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Database migration completed successfully!")
    print("\n📋 Next steps:")
    print("1. Restart your Flask backend: python app.py")
    print("2. Test the application functionality")

if __name__ == '__main__':
    main()