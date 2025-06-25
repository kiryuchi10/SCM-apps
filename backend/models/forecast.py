from db import db
from datetime import datetime

class Forecast(db.Model):
    __tablename__ = 'forecasts'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    forecast_date = db.Column(db.Date, nullable=False)
    predicted_demand = db.Column(db.Float, nullable=False)
    confidence_lower = db.Column(db.Float)
    confidence_upper = db.Column(db.Float)
    model_type = db.Column(db.String(50), nullable=False)  # prophet, lstm, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    item = db.relationship('Item', backref='forecasts')
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'forecast_date': self.forecast_date.isoformat(),
            'predicted_demand': self.predicted_demand,
            'confidence_lower': self.confidence_lower,
            'confidence_upper': self.confidence_upper,
            'model_type': self.model_type,
            'created_at': self.created_at.isoformat()
        }