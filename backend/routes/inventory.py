from flask import Blueprint, request, jsonify
from models.item import Item
from db import db
from utils.auth_decorators import jwt_required_with_user

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/', methods=['GET'])
@jwt_required_with_user
def get_inventory(current_user):
    # Get query parameters for filtering and pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    low_stock_only = request.args.get('low_stock_only', False, type=bool)
    
    query = Item.query.filter_by(is_active=True)
    
    # Apply filters
    if search:
        query = query.filter(
            (Item.name.contains(search)) | 
            (Item.sku.contains(search)) |
            (Item.description.contains(search))
        )
    
    if category:
        query = query.filter(Item.category == category)
    
    if low_stock_only:
        query = query.filter(Item.quantity <= Item.minimum_stock)
    
    # Paginate results
    items = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'items': [item.to_dict() for item in items.items],
        'total': items.total,
        'pages': items.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@inventory_bp.route('/', methods=['POST'])
@jwt_required_with_user
def create_item(current_user):
    data = request.get_json()
    
    if not data.get('name') or not data.get('sku'):
        return jsonify({'error': 'Name and SKU are required'}), 400
    
    # Check if SKU already exists
    if Item.query.filter_by(sku=data['sku']).first():
        return jsonify({'error': 'SKU already exists'}), 400
    
    item = Item(
        name=data['name'],
        description=data.get('description'),
        sku=data['sku'],
        quantity=data.get('quantity', 0),
        unit_price=data.get('unit_price', 0.00),
        category=data.get('category'),
        location=data.get('location'),
        minimum_stock=data.get('minimum_stock', 10),
        supplier_id=data.get('supplier_id')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify({'message': 'Item created successfully', 'item': item.to_dict()}), 201

@inventory_bp.route('/<int:item_id>', methods=['GET'])
@jwt_required_with_user
def get_item(current_user, item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify({'item': item.to_dict()}), 200

@inventory_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required_with_user
def update_item(current_user, item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()
    
    # Update fields
    for field in ['name', 'description', 'quantity', 'unit_price', 'category', 'location', 'minimum_stock']:
        if field in data:
            setattr(item, field, data[field])
    
    db.session.commit()
    
    return jsonify({'message': 'Item updated successfully', 'item': item.to_dict()}), 200

@inventory_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required_with_user
def delete_item(current_user, item_id):
    item = Item.query.get_or_404(item_id)
    item.is_active = False  # Soft delete
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'}), 200

@inventory_bp.route('/alerts', methods=['GET'])
@jwt_required_with_user
def get_low_stock_alerts(current_user):
    low_stock_items = Item.query.filter(
        Item.quantity <= Item.minimum_stock,
        Item.is_active == True
    ).all()
    
    alerts = []
    for item in low_stock_items:
        alerts.append({
            'item_id': item.id,
            'name': item.name,
            'sku': item.sku,
            'current_quantity': item.quantity,
            'minimum_stock': item.minimum_stock,
            'shortage': item.minimum_stock - item.quantity,
            'category': item.category
        })
    
    return jsonify({'alerts': alerts, 'count': len(alerts)}), 200

@inventory_bp.route('/categories', methods=['GET'])
@jwt_required_with_user
def get_categories(current_user):
    categories = db.session.query(Item.category).filter(
        Item.category.isnot(None),
        Item.is_active == True
    ).distinct().all()
    
    return jsonify({'categories': [cat[0] for cat in categories]}), 200