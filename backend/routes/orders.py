from db import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(100), unique=True, nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # pending, approved, shipped, delivered
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    item = db.relationship('Item', backref='orders')
    requester = db.relationship('User', foreign_keys=[requested_by], backref='requested_orders')
    approver = db.relationship('User', foreign_keys=[approved_by], backref='approved_orders')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'item_id': self.item_id,
            'quantity': self.quantity,
            'status': self.status,
            'requested_by': self.requested_by,
            'approved_by': self.approved_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }