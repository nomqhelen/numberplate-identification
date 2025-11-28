# 🇿🇼 Zimbabwe Toll System

## 🚀 Quick Start for Developers

### 1. Clone the Repository

```

### 2. Set Up Virtual Environment
```bash
cd backend/toll
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Firebase Setup (REQUIRED)
You need to create your own Firebase project:

 Create Your Own Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: "zimbabwe-toll-system-yourname"
3. Enable **Realtime Database**
4. Generate **Service Account Key**
5. Download the JSON file
6. Copy values to `.env` file



# Edit with your values
notepad .env  # Windows
nano .env     # Mac/Linux
```

### 6. Initialize Database (Optional)
```bash
# Run the seed script to populate demo data
python seed_data.py
```

### 7. Run the Server
```bash
venv\Scripts\activate
cd backend/toll
python manage.py runserver 127.0.0.1:8001
```

### 8. Test the API
```bash
# Test connection
curl http://127.0.0.1:8001/api/test-firebase/

# Test endpoints
curl http://127.0.0.1:8001/api/admin/vehicles/
```

## 🔧 Environment Variables Required

Create a `.env` file with these variables:
```
SECRET_KEY=your-django-secret-key
DEBUG=True
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
# ... (see .env.example for full list)
```



python manage.py runserver 127.0.0.1:8001
```





