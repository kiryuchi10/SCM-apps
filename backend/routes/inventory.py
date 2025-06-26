from flask import Blueprint, request, jsonify
from models.item import Item
from db import db
from utils.auth_decorators import jwt_required_with_user

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/', methods=['GET'])
@jwt_required_with_user
def get_inventory(current_user):
    items = Item.query.all()
    return jsonify([Item.to_dict() for Item in items]), 200

@inventory_bp.route('/', methods=['POST'])
@jwt_required_with_user
def create_item(current_user):
    data = request.get_json()
    
    if not data.get('name') or not data.get('sku'):
        return jsonify({'error': 'Name and SKU are required'}), 400
    
    # Check if SKU already exists
    if Item.query.filter_by(sku=data['sku']).first():
        return jsonify({'error': 'SKU already exists'}), 400
    
    Item = Item(
        name=data['name'],
        description=data.get('description'),
        sku=data['sku'],
        quantity=data.get('quantity', 0),
        unit_price=data.get('unit_price', 0.00),
        category=data.get('category'),
        location=data.get('location'),
        supplier_id=data.get('supplier_id')
    )
    
    db.session.add(Item)
    db.session.commit()
    
    return jsonify({'message': 'Item created successfully', 'Item': Item.to_dict()}), 201

@inventory_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required_with_user
def update_item(current_user, item_id):
    Item = Item.query.get_or_404(item_id)
    data = request.get_json()
    
    # Update fields
    for field in ['name', 'description', 'quantity', 'unit_price', 'category', 'location']:
        if field in data:
            setattr(Item, field, data[field])
    
    db.session.commit()
    
    return jsonify({'message': 'Item updated successfully', 'Item': Item.to_dict()}), 200

@inventory_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required_with_user
def delete_item(current_user, item_id):
    Item = Item.query.get_or_404(item_id)
    db.session.delete(Item)
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'}), 200