
# SCM App: Frontend-Backend Integration & Troubleshooting Guide

## 🧩 Architecture Overview

```
[ React Frontend (port 3000) ]
        ↓ axios/fetch (CORS-enabled)
[ Flask Backend API (port 5000) ]
        ↓ SQLAlchemy (ORM)
[ MySQL Database ]
```

## 🔄 Communication Flow

1. **Frontend Request**:
   - User fills a form (e.g., SignUp)
   - React sends POST request via `fetch` or `axios` to `/auth/register`

2. **Backend Routing (Flask)**:
   - Request handled by Blueprint: `@auth_bp.route('/register')`
   - Data passed to logic → models (`User`, `Item`, `Supplier`)
   - DB session adds/queries/commits changes

3. **Database Access**:
   - SQLAlchemy generates SQL from model
   - MySQL receives query

4. **Response**:
   - Flask returns `jsonify()` result
   - React receives JSON → updates UI

---

## 🔧 Troubleshooting Flow

### 🧪 A. Backend Not Responding

- ❌ `No response from server`
  - ✅ Check Flask is running (`python app.py`)
  - ✅ Visit `http://localhost:5000/health` for health check

- ❌ `CORS error`
  - ✅ Use `CORS(app, origins=["http://localhost:3000"], supports_credentials=True)`

---

### 🛑 B. Module Errors

- ❌ `ModuleNotFoundError: No module named 'SQLAlchemy'`
  - ✅ Run `pip install flask flask_sqlalchemy flask_cors flask_jwt_extended python-dotenv`

---

### 💾 C. Database Errors

- ❌ `NoForeignKeysError`
  - ✅ Ensure FK in `models/item.py`:
    ```python
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    ```

- ❌ `Can't drop table 'user' referenced by FK`
  - ✅ Drop in order: `order` → `item` → `user`
  - ✅ Use: `SET FOREIGN_KEY_CHECKS = 0; DROP TABLE item; SET FOREIGN_KEY_CHECKS = 1;`

---

## 🔗 Frontend Integration Summary

### ✅ Setup

- Axios base URL: `http://localhost:5000`
- Example Request:
  ```js
  axios.post('http://localhost:5000/auth/register', {
    username, email, password
  })
  ```

- Add credentials:
  ```js
  axios.defaults.withCredentials = true;
  ```

### 🔐 JWT Auth

- Login → receive token
- Store in localStorage or Cookie
- Send in `Authorization: Bearer <token>` for protected routes

---

## 🧱 Model Setup: Example

### models/supplier.py

```python
from db import db

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(100))

    items = db.relationship('Item', backref='supplier', lazy=True)
```

### models/item.py

```python
class Item(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    ...
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
```

---

## 🏁 Final Checklist

- [ ] Frontend `axios` requests set up
- [ ] Backend CORS + JWT enabled
- [ ] All models defined with relationships
- [ ] Routes return `jsonify()` response
- [ ] MySQL tables created or updated via `db.create_all()`
