from openai import OpenAI
import os
from dotenv import load_dotenv
from models.item import Item
from models.order import Order
from db import db

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def handle_chat(query, user_id=None):
    """Handle SCM-focused chatbot queries using OpenAI"""
    
    # Get context from database if query seems to be about inventory or orders
    context_data = get_scm_context(query)
    
    # Enhanced prompt for SCM context
    system_prompt = """You are an expert Supply Chain Management assistant. You help with:
    - Inventory optimization and management
    - Demand forecasting and planning
    - Supplier relationship management
    - Order processing and tracking
    - Logistics and distribution planning
    - Risk analysis and mitigation
    - Cost optimization strategies
    - Performance metrics and KPIs
    
    Provide practical, actionable advice for SCM professionals. Use the provided context data when relevant."""
    
    user_prompt = f"""
    User question: {query}
    
    {context_data}
    
    Provide a helpful, specific response based on the question and any relevant context data.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        return {
            'response': response.choices[0].message.content,
            'model': 'gpt-3.5-turbo',
            'tokens_used': response.usage.total_tokens,
            'context_used': bool(context_data)
        }
    
    except Exception as e:
        return {
            'error': f'OpenAI API error: {str(e)}',
            'fallback_response': get_fallback_response(query)
        }

def get_scm_context(query):
    """Get relevant SCM data based on the query"""
    context = ""
    query_lower = query.lower()
    
    try:
        # Check if query is about inventory
        if any(word in query_lower for word in ['inventory', 'stock', 'item', 'product', 'sku']):
            # Get low stock items
            low_stock_items = Item.query.filter(
                Item.quantity <= Item.minimum_stock,
                Item.is_active == True
            ).limit(5).all()
            
            if low_stock_items:
                context += "\nCurrent Low Stock Items:\n"
                for item in low_stock_items:
                    context += f"- {item.name} (SKU: {item.sku}): {item.quantity} units (min: {item.minimum_stock})\n"
            
            # Get total inventory count
            total_items = Item.query.filter_by(is_active=True).count()
            context += f"\nTotal Active Items: {total_items}\n"
        
        # Check if query is about orders
        if any(word in query_lower for word in ['order', 'purchase', 'supplier', 'delivery']):
            recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
            
            if recent_orders:
                context += "\nRecent Orders:\n"
                for order in recent_orders:
                    context += f"- Order #{order.order_number}: {order.quantity} units, Status: {order.status}\n"
        
    except Exception as e:
        print(f"Error getting SCM context: {str(e)}")
    
    return context

def get_fallback_response(query):
    """Provide fallback responses for common SCM queries"""
    query_lower = query.lower()
    
    if 'inventory' in query_lower:
        return "For inventory management, consider implementing ABC analysis, setting appropriate reorder points, and using demand forecasting to optimize stock levels."
    
    elif 'supplier' in query_lower:
        return "Effective supplier management involves diversifying your supplier base, establishing clear SLAs, regular performance reviews, and maintaining good communication."
    
    elif 'forecast' in query_lower:
        return "Demand forecasting can be improved by analyzing historical data, considering seasonal patterns, market trends, and using statistical models like moving averages or exponential smoothing."
    
    elif 'cost' in query_lower:
        return "Cost optimization in SCM can be achieved through bulk purchasing, supplier negotiations, inventory optimization, and reducing transportation costs."
    
    else:
        return "I'm here to help with supply chain management questions. You can ask about inventory management, supplier relationships, demand forecasting, order processing, or logistics planning."