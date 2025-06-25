import openai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

def handle_chat(query):
    """Handle SCM-focused chatbot queries using OpenAI"""
    
    # Enhanced prompt for SCM context
    scm_prompt = f"""
    You are an expert Supply Chain Management assistant. Help with:
    - Inventory optimization
    - Demand forecasting
    - Supplier management
    - Order processing
    - Logistics planning
    - Risk analysis
    
    User question: {query}
    
    Provide practical, actionable advice for SCM professionals.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a specialized Supply Chain Management expert."},
                {"role": "user", "content": scm_prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        return {
            'response': response.choices[0].message.content,
            'model': 'gpt-3.5-turbo',
            'tokens_used': response.usage.total_tokens
        }
    
    except Exception as e:
        return {
            'error': f'OpenAI API error: {str(e)}',
            'fallback_response': 'I apologize, but I cannot process your request right now. Please try again later.'
        }