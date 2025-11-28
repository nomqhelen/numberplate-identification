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
7. Copy values to the serviceAccountKey.json file



# Edit with your values
notepad .env  # Windows
nano .env     # Mac/Linux
```

### 6. Initialize Database (Optional)
```bash
# Run the seed script to populate demo data
python seed.cjs
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


## 🌐 Frontend Setup

### 1. Install Node.js & npm
Make sure you have [Node.js](https://nodejs.org/) and npm installed.

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Start the Frontend Development Server
```bash
npm run dev
```
The app will be available at [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal).

### 4. Troubleshooting
If you encounter errors, try:
```bash
npm cache clean --force
npm install
```
Or delete `node_modules` and `package-lock.json`, then run `npm install` again.

---




