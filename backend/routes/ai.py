from flask import Blueprint, request, jsonify
from utils.auth_decorators import jwt_required_with_user
from ai_modules.chatbot.chatbot_handler import handle_chat
from ai_modules.demand_forecasting.forecast_model import forecast_demand

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/chat', methods=['POST'])
@jwt_required_with_user
def ai_chat(current_user):
    data = request.get_json()
    query = data.get('query')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    try:
        response = handle_chat(query)
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': f'AI chat failed: {str(e)}'}), 500

@ai_bp.route('/forecast', methods=['POST'])
@jwt_required_with_user
def demand_forecast(current_user):
    data = request.get_json()
    item_id = data.get('item_id')
    days = data.get('days', 7)
    
    if not item_id:
        return jsonify({'error': 'Item ID is required'}), 400
    
    try:
        forecast_result = forecast_demand(item_id, days)
        return jsonify(forecast_result), 200
    except Exception as e:
        return jsonify({'error': f'Forecasting failed: {str(e)}'}), 500

@ai_bp.route('/modes', methods=['GET'])
@jwt_required_with_user
def get_ai_modes(current_user):
    """Get available AI/ML modes"""
    modes = {
        'chatbot': {
            'name': 'Supply Chain Chatbot',
            'description': 'AI assistant for SCM questions and guidance',
            'endpoint': '/ai/chat'
        },
        'forecast': {
            'name': 'Demand Forecasting',
            'description': 'Predict future demand using ML models',
            'endpoint': '/ai/forecast'
        }
    }
    return jsonify(modes), 200