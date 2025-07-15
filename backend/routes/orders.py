# backend/routes/orders.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models.order import Order, OrderItem
from models.item import Item
from models.user import User
from utils.auth_decorators import jwt_required_with_user
from datetime import datetime, date
import uuid

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
@jwt_required_with_user
def get_orders(current_user):
    # Get query parameters for filtering and pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '')
    supplier = request.args.get('supplier', '')
    
    query = Order.query
    
    # Apply filters
    if status:
        query = query.filter(Order.status == status)
    
    if supplier:
        query = query.filter(Order.supplier_name.contains(supplier))
    
    # Order by most recent first
    query = query.order_by(Order.created_at.desc())
    
    # Paginate results
    orders = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'orders': [order.to_dict() for order in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@orders_bp.route('/', methods=['POST'])
@jwt_required_with_user
def create_order(current_user):
    data = request.get_json()

    if not data.get('supplier_name') or not data.get('items'):
        return jsonify({'error': 'Supplier name and items are required'}), 400

    if not isinstance(data['items'], list) or len(data['items']) == 0:
        return jsonify({'error': 'At least one item is required'}), 400

    try:
        # Calculate total amount
        total_amount = 0
        order_items_data = []
        
        for item_data in data['items']:
            if not all(k in item_data for k in ['inventory_item_id', 'quantity', 'unit_price']):
                return jsonify({'error': 'Each item must have inventory_item_id, quantity, and unit_price'}), 400
            
            # Verify item exists
            item = Item.query.get(item_data['inventory_item_id'])
            if not item:
                return jsonify({'error': f'Item with ID {item_data["inventory_item_id"]} not found'}), 400
            
            item_total = float(item_data['quantity']) * float(item_data['unit_price'])
            total_amount += item_total
            
            order_items_data.append({
                'inventory_item_id': item_data['inventory_item_id'],
                'quantity': item_data['quantity'],
                'unit_price': item_data['unit_price'],
                'total_price': item_total
            })

        # Create order
        order = Order(
            order_number=f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
            supplier_name=data['supplier_name'],
            supplier_contact=data.get('supplier_contact'),
            total_amount=total_amount,
            order_date=datetime.strptime(data.get('order_date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date(),
            expected_delivery=datetime.strptime(data['expected_delivery'], '%Y-%m-%d').date() if data.get('expected_delivery') else None,
            created_by=current_user.id
        )
        
        db.session.add(order)
        db.session.flush()  # Get the order ID
        
        # Create order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                **item_data
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        return jsonify({'message': 'Order created successfully', 'order': order.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create order: {str(e)}'}), 500

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required_with_user
def get_order(current_user, order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify({'order': order.to_dict()}), 200

@orders_bp.route('/<int:order_id>', methods=['PUT'])
@jwt_required_with_user
def update_order(current_user, order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()

    # Update allowed fields
    for field in ['status', 'supplier_contact', 'expected_delivery', 'actual_delivery']:
        if field in data:
            if field in ['expected_delivery', 'actual_delivery'] and data[field]:
                setattr(order, field, datetime.strptime(data[field], '%Y-%m-%d').date())
            else:
                setattr(order, field, data[field])

    # If status is changed to 'received', update inventory
    if data.get('status') == 'received' and order.status != 'received':
        for order_item in order.order_items:
            item = order_item.inventory_item
            if item:
                item.quantity += order_item.quantity

    db.session.commit()
    return jsonify({'message': 'Order updated successfully', 'order': order.to_dict()}), 200

@orders_bp.route('/<int:order_id>', methods=['DELETE'])
@jwt_required_with_user
def cancel_order(current_user, order_id):
    order = Order.query.get_or_404(order_id)
    
    if order.status in ['received', 'cancelled']:
        return jsonify({'error': 'Cannot cancel order with current status'}), 400
    
    order.status = 'cancelled'
    db.session.commit()
    
    return jsonify({'message': 'Order cancelled successfully'}), 200

@orders_bp.route('/suppliers', methods=['GET'])
@jwt_required_with_user
def get_suppliers(current_user):
    suppliers = db.session.query(Order.supplier_name).distinct().all()
    return jsonify({'suppliers': [supplier[0] for supplier in suppliers]}), 200

@orders_bp.route('/stats', methods=['GET'])
@jwt_required_with_user
def get_order_stats(current_user):
    total_orders = Order.query.count()
    pending_orders = Order.query.filter_by(status='pending').count()
    completed_orders = Order.query.filter_by(status='received').count()
    
    # Calculate total value of orders this month
    current_month = datetime.now().replace(day=1)
    monthly_value = db.session.query(db.func.sum(Order.total_amount)).filter(
        Order.created_at >= current_month
    ).scalar() or 0
    
    return jsonify({
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'completed_orders': completed_orders,
        'monthly_value': float(monthly_value)
    }), 200
