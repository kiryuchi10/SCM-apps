from db import db
from datetime import datetime
from sqlalchemy import Numeric

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(100), unique=True, nullable=False)
    supplier_name = db.Column(db.String(255), nullable=False)
    supplier_contact = db.Column(db.String(255))
    status = db.Column(db.Enum('pending', 'approved', 'ordered', 'received', 'cancelled', name='order_status'), default='pending')
    total_amount = db.Column(Numeric(12, 2), nullable=False)
    order_date = db.Column(db.Date, nullable=False)
    expected_delivery = db.Column(db.Date)
    actual_delivery = db.Column(db.Date)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref='created_orders')
    order_items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'supplier_name': self.supplier_name,
            'supplier_contact': self.supplier_contact,
            'status': self.status,
            'total_amount': float(self.total_amount),
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'expected_delivery': self.expected_delivery.isoformat() if self.expected_delivery else None,
            'actual_delivery': self.actual_delivery.isoformat() if self.actual_delivery else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.order_items]
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    inventory_item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(Numeric(10, 2), nullable=False)
    total_price = db.Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    inventory_item = db.relationship('Item', backref='order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'inventory_item_id': self.inventory_item_id,
            'item_name': self.inventory_item.name if self.inventory_item else None,
            'item_sku': self.inventory_item.sku if self.inventory_item else None,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'total_price': float(self.total_price)
        }