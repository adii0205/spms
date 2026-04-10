# Panel Management System - Complete Setup Walkthrough

## 📋 Overview

This guide walks you through setting up the entire **Panel Management System** for your SPMS project.

**What you'll have at the end:**
- ✅ Backend API with 15 panel management endpoints
- ✅ MongoDB database with sample data
- ✅ Frontend React components (Admin & Faculty)
- ✅ Ready for manual testing

**Total Time:** ~15-20 minutes (excluding MongoDB setup)

---

## 🚀 Quick Commands (TL;DR)

```bash
# Backend
cd backend
cp ../.env.example ../.env.development.local  # Configure MongoDB URI
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Seed database (when MongoDB is ready)
cd backend
npm run seed
```

---

## 📝 Step-by-Step Setup

### Step 1: Configure MongoDB (5 minutes)

**Option A: MongoDB Atlas (Cloud)**

1. Create account: https://cloud.mongodb.com
2. Create/Select Cluster
3. Click "Connect" → "Connect Your Application"
4. Copy connection string
5. Note down:
   - Username: `adityajaiswal33008_db_user`
   - Password: `pg6SgeC YBwiV2ool` (URLencode space as %20)
   - Cluster: `cluster2.sgwhqq.mongodb.net`

**Option B: Local MongoDB**

1. Install from: https://www.mongodb.com/try/download/community
2. Start the service (`mongod`)
3. Keep it running

---

### Step 2: Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create environment file
# Windows PowerShell:
New-Item -Path ".env" -ItemType File
# Or manually create .env file

# Add this content to .env:
MONGODB_URI=mongodb+srv://adityajaiswal33008_db_user:pg6SgeC%20YBwiV2ool@cluster2.sgwhqq.mongodb.net/spms?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**Important:** Replace spaces in password with `%20`

```bash
# Install dependencies (already done, but verify)
npm install

# Test connection before starting
npm test
# Should show connection test results

# Start the backend server
npm start
```

**Expected output:**
```
[dotenv] injecting environment variables from .env
📦 Connected to MongoDB
🚀 Server running on port 5000
```

**✅ Backend is ready when you see no errors**

---

### Step 3: Frontend Setup (5 minutes)

Open **new terminal window** (keep backend running in first window)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**✅ Frontend is ready when you see the local URL**

---

### Step 4: Seed Sample Data (2 minutes)

Once MongoDB is connected and both servers are running:

Open **third terminal window**

```bash
cd backend

# Seed database with sample data
npm run seed
```

**Expected output:**
```
✅ Database Seeding Complete!

📊 SUMMARY:
  👨‍🏫 Faculty: 27 (9 CSE + 9 ECE + 9 ASH)
  📋 Projects: 30
  👥 Groups: 30 (3 students each)
```

**✅ Database is seeded when you see the summary**

---

## 🔌 Testing the Setup

### Test 1: Backend API Connection

Open a new terminal:

```bash
# Test simple endpoint
curl -X GET http://localhost:5000/api/admin/panel-config/2025-26

# You should get a response (might be 404 if not created yet, that's OK)
# Status code 200 or 404 means backend is working
```

### Test 2: Frontend Components Load

Open browser and visit:

1. **Admin Panel Config:** http://localhost:5173/admin/panel-config
   - Should see form with panel configuration fields
   - No errors in browser console (F12)

2. **Faculty Panels:** http://localhost:5173/faculty/panels
   - Should show "No panels assigned yet" (until data is created)

3. **Evaluation Form:** http://localhost:5173/faculty/evaluation
   - Should show "No evaluations assigned yet"

### Test 3: Manual API Testing

```bash
cd backend

# Run test suite (once MongoDB is connected)
npm run test

# Or test specific endpoint with curl/Postman
```

---

## ✨ Using the System

### As Admin:

1. Navigate to: http://localhost:5173/admin/panel-config
2. **Configure Panels:**
   - Set panel size: 3
   - Set total professors: 27
   - Configure marks distribution
   - Click "Save Configuration"
3. **Generate Panels:**
   - Click "Generate Panels"
   - System creates balanced panels (1/3 from each department)

### As Faculty:

1. Navigate to: http://localhost:5173/faculty/panels
   - View assigned panels
   - See group assignments
   - Check evaluation status

2. Navigate to: http://localhost:5173/faculty/evaluation
   - Submit marks for groups
   - System calculates weighted contribution

---

## 📊 Project Structure Review

```
spms/
├── backend/
│   ├── models/
│   │   ├── Panel.js ✨ NEW
│   │   ├── PanelConfiguration.js ✨ NEW
│   │   ├── EvaluationMarks.js ✨ NEW
│   │   └── ...existing models
│   │
│   ├── controllers/
│   │   └── adminController.js (15 new functions)
│   │
│   ├── services/
│   │   ├── panelAllocationService.js ✨ NEW
│   │   └── adminPanelService.js ✨ NEW
│   │
│   ├── routes/
│   │   └── panelRoutes.js (refactored)
│   │
│   ├── seeds/
│   │   └── seed-database.js ✨ NEW
│   │
│   ├── .env ✨ NEW (MongoDB connection)
│   └── package.json (updated scripts)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── PanelConfiguration.jsx ✨ NEW
│   │   │   └── faculty/
│   │   │       ├── PanelView.jsx ✨ NEW
│   │   │       └── EvaluationSubmission.jsx ✨ NEW
│   │   │
│   │   ├── utils/
│   │   │   └── api.js (16 new methods)
│   │   │
│   │   └── App.jsx (routes added)
│   │
│   └── package.json
│
├── .env.example ✨ NEW (template)
├── MANUAL_TESTING_GUIDE.md ✨ NEW
├── FRONTEND_INTEGRATION_CHECKLIST.md ✨ NEW
├── QUICK_START.md ✨ NEW
└── Panel_Management_API.postman_collection.json ✨ NEW
```

---

## 🧪 Verification Checklist

Check off each item as you complete:

**Backend:**
- [ ] .env file created with MongoDB URI
- [ ] `npm install` completed successfully
- [ ] Backend starts without errors: `npm start`
- [ ] Server shows "Connected to MongoDB"
- [ ] API endpoint responds: `curl http://localhost:5000/api/admin/panel-config/2025-26`

**Frontend:**
- [ ] `npm install` completed successfully
- [ ] Frontend starts: `npm run dev`
- [ ] Shows "Local: http://localhost:5173/"
- [ ] No console errors in browser (F12)

**Database:**
- [ ] `npm run seed` completes successfully
- [ ] Shows "Database Seeding Complete!"
- [ ] Shows "Faculty: 27", "Projects: 30", "Groups: 30"

**Components:**
- [ ] Admin panel config page loads: http://localhost:5173/admin/panel-config
- [ ] Faculty panels page loads: http://localhost:5173/faculty/panels
- [ ] Evaluation form page loads: http://localhost:5173/faculty/evaluation

---

## 🐛 Troubleshooting

### Problem: Backend won't start

**Error:** "Cannot find module 'dotenv'"

**Solution:**
```bash
cd backend
npm install
npm start
```

---

### Problem: MongoDB connection refused

**Error:** "querySrv ECONNREFUSED _mongodb._tcp.cluster2.sgwhqq.mongodb.net"

**Solution:**
1. Check your internet connection
2. Verify MongoDB cluster is running (in Atlas dashboard)
3. Verify IP is whitelisted (Network Access in Atlas)
4. Try with local MongoDB instead:
   ```bash
   # Install MongoDB locally
   # Then change .env to:
   MONGODB_URI=mongodb://localhost:27017/spms
   ```
5. Wait a few minutes if you just added your IP

---

### Problem: Frontend won't load components

**Error:** "PanelConfiguration is not defined"

**Solution:**
1. Restart frontend: Ctrl+C, then `npm run dev`
2. Clear browser cache: Ctrl+Shift+Delete
3. Check imports in App.jsx are correct
4. Verify files exist:
   - `frontend/src/pages/admin/PanelConfiguration.jsx`
   - `frontend/src/pages/faculty/PanelView.jsx`
   - `frontend/src/pages/faculty/EvaluationSubmission.jsx`

---

### Problem: Seeding fails

**Error:** "Cannot connect to MongoDB"

**Solution:**
1. Start backend first: `npm start` (from backend folder)
2. Verify MongoDB connection works
3. Then seed in new terminal: `npm run seed`
4. Check MongoDB URI in .env is correct

---

## 📚 Next Steps

**After Setup is Complete:**

1. **Manual Testing:**
   - Follow: [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md)
   - Test all 15 API endpoints
   - Test all 3 frontend components

2. **Integration Testing:**
   - Follow: [FRONTEND_INTEGRATION_CHECKLIST.md](./FRONTEND_INTEGRATION_CHECKLIST.md)
   - Complete 100+ test cases
   - Verify all functionality

3. **API Testing:**
   - Import Postman collection: [Panel_Management_API.postman_collection.json](./Panel_Management_API.postman_collection.json)
   - Test endpoints interactively

---

## 📞 Quick Reference

**Ports:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

**Key Commands:**

| Command | Purpose |
|---------|---------|
| `npm start` (backend) | Start API server |
| `npm run dev` (backend) | Start with auto-reload |
| `npm run test` (backend) | Run test suite |
| `npm run seed` (backend) | Populate database |
| `npm run dev` (frontend) | Start dev server |
| `npm run build` (frontend) | Build for production |

**Component URLs:**

| Component | URL |
|-----------|-----|
| Panel Config | http://localhost:5173/admin/panel-config |
| Panel View | http://localhost:5173/faculty/panels |
| Evaluation | http://localhost:5173/faculty/evaluation |

---

## ✅ You're Done!

Your panel management system is now set up and ready for testing! 🎉

- Backend API is running with 15 endpoints
- Frontend has 3 interactive components
- Database is populated with sample data
- Everything is integrated and ready to use

**Next:** Start with [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md) to test all functionality!

