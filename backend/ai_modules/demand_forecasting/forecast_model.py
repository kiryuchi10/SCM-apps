import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
from models.item import Item
from models.order import Order
from models.forecast import Forecast
from db import db

def forecast_demand(item_id, days=7):
    """Generate demand forecast for a specific item"""
    
    # Get item
    item = Item.query.get(item_id)
    if not item:
        raise ValueError(f"Item with ID {item_id} not found")
    
    # Get historical order data
    orders = Order.query.filter_by(item_id=item_id).all()
    
    if len(orders) < 10:
        # If not enough data, use simple moving average
        return generate_simple_forecast(item, days)
    
    # Prepare data for Prophet
    df = prepare_prophet_data(orders)
    
    # Train Prophet model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05
    )
    
    model.fit(df)
    
    # Generate forecast
    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    
    # Get only future predictions
    future_forecast = forecast.tail(days)
    
    # Save forecast to database
    save_forecast_to_db(item_id, future_forecast, "prophet")
    
    # Format response
    forecast_data = []
    for _, row in future_forecast.iterrows():
        forecast_data.append({
            'date': row['ds'].strftime('%Y-%m-%d'),
            'predicted_demand': max(0, round(row['yhat'], 2)),
            'lower_bound': max(0, round(row['yhat_lower'], 2)),
            'upper_bound': max(0, round(row['yhat_upper'], 2))
        })
    
    return {
        'item_id': item_id,
        'item_name': item.name,
        'forecast_period': f"{days} days",
        'model_type': 'prophet',
        'forecast': forecast_data,
        'current_stock': item.quantity,
        'recommendations': generate_recommendations(item, forecast_data)
    }

def prepare_prophet_data(orders):
    """Prepare order data for Prophet model"""
    data = []
    for order in orders:
        data.append({
            'ds': order.created_at.date(),
            'y': order.quantity
        })
    
    df = pd.DataFrame(data)
    df = df.groupby('ds')['y'].sum().reset_index()
    
    # Fill missing dates with 0
    date_range = pd.date_range(start=df['ds'].min(), end=df['ds'].max(), freq='D')
    df = df.set_index('ds').reindex(date_range, fill_value=0).reset_index()
    df.columns = ['ds', 'y']
    
    return df

def generate_simple_forecast(item, days):
    """Simple forecast when not enough data for Prophet"""
    # Use average weekly demand or default to current stock level
    avg_demand = max(1, item.quantity / 30)  # Assume 30-day average
    
    forecast_data = []
    for i in range(days):
        future_date = (datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d')
        forecast_data.append({
            'date': future_date,
            'predicted_demand': round(avg_demand + np.random.normal(0, avg_demand * 0.1), 2),
            'lower_bound': round(avg_demand * 0.8, 2),
            'upper_bound': round(avg_demand * 1.2, 2)
        })
    
    return {
        'item_id': item.id,
        'item_name': item.name,
        'forecast_period': f"{days} days",
        'model_type': 'simple_average',
        'forecast': forecast_data,
        'current_stock': item.quantity,
        'recommendations': generate_recommendations(item, forecast_data)
    }

def save_forecast_to_db(item_id, forecast_df, model_type):
    """Save forecast results to database"""
    for _, row in forecast_df.iterrows():
        forecast_record = Forecast(
            item_id=item_id,
            forecast_date=row['ds'].date(),
            predicted_demand=row['yhat'],
            confidence_lower=row['yhat_lower'],
            confidence_upper=row['yhat_upper'],
            model_type=model_type
        )
        db.session.add(forecast_record)
    
    db.session.commit()

def generate_recommendations(item, forecast_data):
    """Generate actionable recommendations based on forecast"""
    total_forecast_demand = sum([f['predicted_demand'] for f in forecast_data])
    current_stock = item.quantity
    
    recommendations = []
    
    if current_stock < total_forecast_demand:
        shortage = total_forecast_demand - current_stock
        recommendations.append({
            'type': 'restock',
            'priority': 'high',
            'message': f"Restock needed: {shortage:.0f} units to meet forecasted demand"
        })
    
    if current_stock > total_forecast_demand * 2:
        recommendations.append({
            'type': 'overstock',
            'priority': 'medium',
            'message': "Consider reducing inventory levels to optimize costs"
        })
    
    # Check for demand spikes
    max_daily_demand = max([f['predicted_demand'] for f in forecast_data])
    if max_daily_demand > current_stock * 0.5:
        recommendations.append({
            'type': 'demand_spike',
            'priority': 'high',
            'message': f"High demand spike expected: {max_daily_demand:.0f} units"
        })
    
    return recommendations