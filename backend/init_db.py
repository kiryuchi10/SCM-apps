#!/usr/bin/env python3
"""
Database initialization script for SCM Application
Run this script to create the database and tables
"""

import os
import sys
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv()

def create_database():
    """Create the MySQL database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', 3306)),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Create database
        db_name = os.getenv('MYSQL_DB', 'scm_core')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"✅ Database '{db_name}' created successfully!")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error creating database: {str(e)}")
        return False
    
    return True

def create_tables():
    """Create application tables using Flask-SQLAlchemy"""
    try:
        # Import Flask app and database
        from app import app, db
        
        with app.app_context():
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully!")
            
            # Print table information
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📋 Created tables: {', '.join(tables)}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        return False
    
    return True

def create_sample_data():
    """Create sample data for testing"""
    try:
        from app import app, db
        from models.user import User
        from models.item import Item
        from models.order import Order, OrderItem
        from datetime import datetime, date
        
        with app.app_context():
            # Check if data already exists
            if User.query.first():
                print("📋 Sample data already exists, skipping...")
                return True
            
            # Create sample users
            admin_user = User(
                username='admin',
                email='admin@scm.com',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            admin_user.set_password('admin123')
            
            manager_user = User(
                username='manager',
                email='manager@scm.com',
                first_name='Supply Chain',
                last_name='Manager',
                role='manager'
            )
            manager_user.set_password('manager123')
            
            db.session.add(admin_user)
            db.session.add(manager_user)
            db.session.flush()  # Get user IDs
            
            # Create sample inventory items
            sample_items = [
                {
                    'name': 'Laptop Computer',
                    'description': 'Business laptop for office use',
                    'sku': 'LAP-001',
                    'quantity': 25,
                    'unit_price': 899.99,
                    'category': 'Electronics',
                    'location': 'Warehouse A',
                    'minimum_stock': 10
                },
                {
                    'name': 'Office Chair',
                    'description': 'Ergonomic office chair',
                    'sku': 'CHR-001',
                    'quantity': 5,
                    'unit_price': 299.99,
                    'category': 'Furniture',
                    'location': 'Warehouse B',
                    'minimum_stock': 15
                },
                {
                    'name': 'Printer Paper',
                    'description': 'A4 white printer paper, 500 sheets',
                    'sku': 'PPR-001',
                    'quantity': 100,
                    'unit_price': 12.99,
                    'category': 'Office Supplies',
                    'location': 'Storage Room',
                    'minimum_stock': 50
                },
                {
                    'name': 'USB Cable',
                    'description': 'USB-C to USB-A cable, 6ft',
                    'sku': 'USB-001',
                    'quantity': 3,
                    'unit_price': 15.99,
                    'category': 'Electronics',
                    'location': 'Warehouse A',
                    'minimum_stock': 20
                },
                {
                    'name': 'Desk Lamp',
                    'description': 'LED desk lamp with adjustable brightness',
                    'sku': 'LMP-001',
                    'quantity': 8,
                    'unit_price': 45.99,
                    'category': 'Office Supplies',
                    'location': 'Warehouse B',
                    'minimum_stock': 12
                }
            ]
            
            created_items = []
            for item_data in sample_items:
                item = Item(**item_data)
                db.session.add(item)
                created_items.append(item)
            
            db.session.flush()  # Get item IDs
            
            # Create sample order
            sample_order = Order(
                order_number='ORD-20250116-001',
                supplier_name='Tech Supplies Inc.',
                supplier_contact='orders@techsupplies.com',
                status='pending',
                total_amount=1799.98,
                order_date=date.today(),
                created_by=manager_user.id
            )
            
            db.session.add(sample_order)
            db.session.flush()  # Get order ID
            
            # Create order items
            order_item1 = OrderItem(
                order_id=sample_order.id,
                inventory_item_id=created_items[0].id,  # Laptop
                quantity=2,
                unit_price=899.99,
                total_price=1799.98
            )
            
            db.session.add(order_item1)
            
            # Commit all changes
            db.session.commit()
            
            print("✅ Sample data created successfully!")
            print("👤 Sample users created:")
            print("   - admin@scm.com / admin123 (Admin)")
            print("   - manager@scm.com / manager123 (Manager)")
            print(f"📦 Created {len(sample_items)} sample inventory items")
            print("📋 Created 1 sample order")
            
    except Exception as e:
        print(f"❌ Error creating sample data: {str(e)}")
        db.session.rollback()
        return False
    
    return True

def main():
    """Main initialization function"""
    print("🚀 Initializing SCM Application Database...")
    print("=" * 50)
    
    # Check environment variables
    required_vars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DB']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file")
        sys.exit(1)
    
    # Step 1: Create database
    print("1️⃣ Creating database...")
    if not create_database():
        sys.exit(1)
    
    # Step 2: Create tables
    print("\n2️⃣ Creating tables...")
    if not create_tables():
        sys.exit(1)
    
    # Step 3: Create sample data
    print("\n3️⃣ Creating sample data...")
    if not create_sample_data():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Database initialization completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the Flask backend: python app.py")
    print("2. Start the React frontend: npm start")
    print("3. Open http://localhost:3000 in your browser")
    print("4. Login with admin@scm.com / admin123")

if __name__ == '__main__':
    main()