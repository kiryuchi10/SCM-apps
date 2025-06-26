#auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from db import db
from utils.auth_decorators import jwt_required_with_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print("Received signup data:", data)  # log input
    if not data.get('username') or not data.get('email') or not data.get('password'):
        print("Missing fields")
        return jsonify({'error': 'Username, email, and password are required'}), 400

    if User.query.filter_by(username=data['username']).first():
        print("Username exists:", data['username'])
        return jsonify({'error': 'Username already exists'}), 400

    if User.query.filter_by(email=data['email']).first():
        print("Email exists:", data['email'])
        return jsonify({'error': 'Email already exists'}), 400

    try:
        user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'user')
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        print("Database error:", str(e))
        return jsonify({'error': 'Database error: ' + str(e)}), 500

    print("Signup success for:", data['username'])
    return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required_with_user
def get_profile(current_user):
    return jsonify({'user': current_user.to_dict()}), 200
