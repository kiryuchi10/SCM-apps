# backend/routes/orders.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models.order import Order
from models.user import User
from utils.auth_decorators import jwt_required_with_user
import uuid

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
@jwt_required_with_user
def get_orders(current_user):
    orders = Order.query.filter_by(requested_by=current_user.id).all()
    return jsonify([order.to_dict() for order in orders]), 200

@orders_bp.route('/', methods=['POST'])
@jwt_required_with_user
def create_order(current_user):
    data = request.get_json()

    if not data.get('item_id') or not data.get('quantity'):
        return jsonify({'error': 'Item ID and quantity are required'}), 400

    order = Order(
        order_number=str(uuid.uuid4()),
        item_id=data['item_id'],
        quantity=data['quantity'],
        requested_by=current_user.id
    )
    db.session.add(order)
    db.session.commit()

    return jsonify({'message': 'Order created', 'order': order.to_dict()}), 201


@orders_bp.route('/<int:order_id>', methods=['PUT'])
@jwt_required_with_user
def update_order(current_user, order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()

    for field in ['quantity', 'status']:
        if field in data:
            setattr(order, field, data[field])

    order.updated_at = db.func.now()
    db.session.commit()
    return jsonify({'message': 'Order updated', 'order': order.to_dict()}), 200


@orders_bp.route('/<int:order_id>', methods=['DELETE'])
@jwt_required_with_user
def delete_order(current_user, order_id):
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({'message': 'Order deleted'}), 200
