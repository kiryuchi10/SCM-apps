# AI-Integrated Supply Chain Management (SCM) Application

A modern, full-stack supply chain management system with AI-powered features including intelligent chatbot assistance and demand forecasting.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure JWT-based authentication with role-based access
- **Inventory Management** - Complete CRUD operations with search, filtering, and pagination
- **Order Management** - Multi-item purchase orders with supplier management
- **Dashboard Analytics** - Real-time metrics and performance insights
- **Stock Alerts** - Automated low-stock notifications and recommendations

### AI-Powered Features
- **Intelligent Chatbot** - OpenAI-powered assistant for SCM guidance and support
- **Demand Forecasting** - Prophet/LSTM models for predicting future demand
- **AI Insights** - Automated analysis and recommendations for supply chain optimization

### Technical Features
- **Responsive Design** - Mobile-friendly interface that works on all devices
- **Real-time Updates** - Live data synchronization and notifications
- **Data Export/Import** - CSV/Excel support for bulk operations
- **Performance Optimization** - Caching, pagination, and efficient queries

## 🛠️ Technology Stack

### Backend
- **Flask 3.1+** - Python web framework
- **SQLAlchemy** - Database ORM
- **MySQL 8.0+** - Primary database
- **JWT Authentication** - Secure token-based auth
- **OpenAI API** - AI chatbot integration
- **Prophet/LSTM** - Time series forecasting

### Frontend
- **React 18+** - Modern JavaScript framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **CSS3** - Custom responsive styling
- **Context API** - State management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **MySQL 8.0+** - [Download MySQL](https://dev.mysql.com/downloads/)
- **Git** - [Download Git](https://git-scm.com/downloads)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SCM-apps
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory:
```env
# Flask Configuration
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-here-change-in-production

# OpenAI Configuration (Optional - for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-mysql-password
MYSQL_DB=scm_core
```

#### Initialize Database
```bash
# Make sure MySQL is running, then:
python init_db.py
```

This script will:
- Create the MySQL database
- Create all required tables
- Insert sample data for testing
- Create demo user accounts

#### Start Backend Server
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd ../frontend
npm install
```

#### Start Frontend Development Server
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 👤 Demo Accounts

After running the database initialization, you can use these demo accounts:

- **Admin User**
  - Email: `admin@scm.com`
  - Password: `admin123`
  - Role: Administrator

- **Manager User**
  - Email: `manager@scm.com`
  - Password: `manager123`
  - Role: Manager

## 📖 Usage Guide

### Getting Started
1. Open `http://localhost:3000` in your browser
2. Sign in with one of the demo accounts
3. Explore the dashboard to see system overview
4. Navigate through different sections using the sidebar

### Key Features

#### Inventory Management
- **Add Items**: Click "Add New Item" to create inventory items
- **Search & Filter**: Use the search bar and filters to find specific items
- **Stock Alerts**: Monitor low-stock items in the alerts section
- **Bulk Operations**: Import/export inventory data via CSV

#### Order Management
- **Create Orders**: Add multi-item purchase orders with supplier details
- **Track Status**: Monitor order progress from pending to received
- **Supplier Management**: Maintain supplier relationships and contacts

#### AI Tools
- **Chatbot Assistant**: Ask questions about supply chain best practices
- **Demand Forecasting**: Generate AI-powered demand predictions
- **AI Insights**: Get automated recommendations for optimization

### API Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

#### Inventory
- `GET /inventory` - List inventory items (with pagination/filtering)
- `POST /inventory` - Create new item
- `PUT /inventory/{id}` - Update item
- `DELETE /inventory/{id}` - Delete item
- `GET /inventory/alerts` - Get low-stock alerts

#### Orders
- `GET /orders` - List orders
- `POST /orders` - Create new order
- `PUT /orders/{id}` - Update order
- `GET /orders/stats` - Get order statistics

#### AI Features
- `POST /ai/chat` - Chat with AI assistant
- `POST /ai/forecast` - Generate demand forecast

## 🔧 Configuration

### Database Configuration
The application uses MySQL by default. To use a different database:

1. Update the `SQLALCHEMY_DATABASE_URI` in `app.py`
2. Install the appropriate database driver
3. Update the connection string in `.env`

### AI Configuration
To enable AI features:

1. Sign up for an OpenAI API account
2. Get your API key from the OpenAI dashboard
3. Add the key to your `.env` file as `OPENAI_API_KEY`

### Production Deployment

#### Backend (Flask)
```bash
# Install production WSGI server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Frontend (React)
```bash
# Build for production
npm run build

# Serve with a static file server
npm install -g serve
serve -s build -l 3000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

#### "No response from server" Error
- Ensure the backend server is running on port 5000
- Check that MySQL is running and accessible
- Verify environment variables in `.env` file

#### Database Connection Issues
- Confirm MySQL credentials in `.env`
- Ensure the database `scm_core` exists
- Check MySQL service is running

#### OpenAI API Errors
- Verify your OpenAI API key is valid
- Check your OpenAI account has sufficient credits
- Ensure the API key has proper permissions

#### Port Already in Use
```bash
# Kill process using port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process using port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Debug Mode
Enable debug logging by setting `DEBUG=True` in your environment or `.env` file.

## 📚 Project Structure

```
SCM-apps/
├── backend/                 # Flask backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── ai_modules/         # AI/ML components
│   ├── utils/              # Utility functions
│   ├── app.py              # Main Flask application
│   ├── init_db.py          # Database initialization
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   └── context/        # React context providers
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Contact the development team

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Integration with external ERP systems
- [ ] Advanced AI models for optimization
- [ ] Multi-tenant support
- [ ] Real-time notifications
- [ ] Barcode scanning support

---

**Happy Supply Chain Managing! 🚚📦**