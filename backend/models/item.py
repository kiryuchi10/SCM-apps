# models/item.py

from db import db
from sqlalchemy import Numeric
from datetime import datetime

class Item(db.Model):
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    sku = db.Column(db.String(100), unique=True, nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    unit_price = db.Column(Numeric(10, 2), nullable=False, default=0.00)
    category = db.Column(db.String(100))
    location = db.Column(db.String(200))
    minimum_stock = db.Column(db.Integer, default=10)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    supplier = db.relationship('User', backref='supplied_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'sku': self.sku,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'category': self.category,
            'location': self.location,
            'minimum_stock': self.minimum_stock,
            'supplier_id': self.supplier_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active,
            'low_stock_alert': self.quantity <= self.minimum_stock
        }
