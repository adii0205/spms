# Panel Management System - Quick Start & Deployment Guide

## Project Overview

This guide helps you set up and test the complete panel management system with:
- ✅ Backend: Express + MongoDB with unified admin controller
- ✅ Frontend: React components for admin and faculty
- ✅ 16 API endpoints for panel management
- ✅ 3 React UI components ready to use

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v14+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

### 1. Environment Setup

**Backend Configuration:**
```bash
cd backend
```

Create `.env` file with:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spms?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**Frontend Configuration:**
```bash
cd frontend
```

Vite automatically detects `http://localhost:5000` for API calls.

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open browser: `http://localhost:5173`

---

## Component URLs

Once running, access components directly:

| Component | URL | Role |
|-----------|-----|------|
| Panel Configuration | `http://localhost:5173/admin/panel-config` | Admin |
| Panel View | `http://localhost:5173/faculty/panels` | Faculty |
| Evaluation Submission | `http://localhost:5173/faculty/evaluation` | Faculty |

---

## Manual API Testing

### Option 1: Using cURL

Test a simple endpoint:
```bash
curl -X GET http://localhost:5000/api/admin/panel-config/2025-26
```

See `MANUAL_TESTING_GUIDE.md` for all 15 endpoints with examples.

### Option 2: Using Postman

1. Import collection: `Panel_Management_API.postman_collection.json`
2. Set `baseUrl` variable: `http://localhost:5000`
3. Run requests in order:
   - Set Configuration
   - Generate Panels
   - Fetch Panels
   - Submit Evaluations

### Option 3: Using Node Script

Run full automated test:
```bash
cd backend
node manual-api-test.js
```

---

## Database Seeding (Optional)

If you need sample data, create a seed script:

```javascript
// backend/seeds/seed-faculty.js
const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');
require('dotenv').config();

async function seedFaculty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const faculty = [
      { name: 'Dr. Amit Kumar', department: 'CSE', email: 'amit@example.com' },
      { name: 'Dr. Priya Singh', department: 'ECE', email: 'priya@example.com' },
      { name: 'Dr. Rajesh Patel', department: 'ASH', email: 'rajesh@example.com' },
      // ... more faculty
    ];
    
    await Faculty.insertMany(faculty);
    console.log('✅ Faculty seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedFaculty();
```

Run:
```bash
node seeds/seed-faculty.js
```

---

## Testing Workflow

### 1. Admin - Configure Panels
```
1. Open: http://localhost:5173/admin/panel-config
2. Set: Panel size = 3, Total professors = 27
3. Configure marks: Conveyer 40%, Member 30%
4. Click: "Save Configuration"
5. Click: "Generate Panels"
```

**Expected Result:** 
- Success message with panel count (9 panels)
- Each panel has 3 members (1 CSE, 1 ECE, 1 ASH)

### 2. Faculty - View Panels
```
1. Open: http://localhost:5173/faculty/panels
2. See list of assigned panels
3. Click panel to view details
4. View assigned groups
```

**Expected Result:**
- Panel list shows all assignments
- Details show members and groups
- Status shows "Pending" for unevaluated groups

### 3. Faculty - Submit Evaluation
```
1. Open: http://localhost:5173/faculty/evaluation
2. Select a group
3. Enter marks (85)
4. Add comments
5. Click "Submit Evaluation"
```

**Expected Result:**
- Success message displayed
- Marks saved (85)
- Status changes to "Submitted"
- For conveyer: 85 × 40% = 34 points
- For member: 85 × 30% = 25.5 points

---

## File Structure

```
spms/
├── backend/
│   ├── models/
│   │   ├── Panel.js
│   │   ├── PanelConfiguration.js
│   │   ├── EvaluationMarks.js
│   │   └── ...existing models
│   ├── controllers/
│   │   └── adminController.js (15 new functions added)
│   ├── services/
│   │   ├── panelAllocationService.js
│   │   └── adminPanelService.js
│   ├── routes/
│   │   ├── panelRoutes.js (refactored)
│   │   └── index.js
│   ├── tests/
│   │   └── test-panel-management.js
│   ├── .env
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── PanelConfiguration.jsx ✨ NEW
│   │   │   └── faculty/
│   │   │       ├── PanelView.jsx ✨ NEW
│   │   │       └── EvaluationSubmission.jsx ✨ NEW
│   │   ├── utils/
│   │   │   └── api.js (16 methods added)
│   │   └── App.jsx
│   └── vite.config.js
│
├── MANUAL_TESTING_GUIDE.md
├── Panel_Management_API.postman_collection.json
└── FRONTEND_INTEGRATION_CHECKLIST.md
```

---

## API Endpoints Summary

### Configuration (2 endpoints)
- `GET /api/admin/panel-config/:academicYear` - Get config
- `POST /api/admin/panel-config/:academicYear` - Set config

### Generation & Management (6 endpoints)
- `POST /api/admin/generate-panels` - Generate panels
- `GET /api/admin/panels` - List panels
- `GET /api/admin/panels/:id` - Get details
- `PUT /api/admin/panels/:id/members` - Update members
- `POST /api/admin/rotate-conveyers` - Rotate roles
- `DELETE /api/admin/panels/:id` - Delete panel

### Analytics (1 endpoint)
- `GET /api/admin/panel-load` - Load distribution

### Faculty Views (2 endpoints)
- `GET /api/admin/faculty/panels` - My panels
- `GET /api/admin/faculty/evaluations` - My evaluations

### Evaluation Management (4 endpoints)
- `POST /api/admin/evaluations/submit` - Submit marks
- `GET /api/admin/evaluations/status/:groupId` - Check status
- `GET /api/admin/evaluations` - Get all
- `GET /api/admin/group-marks/:groupId` - Group marks

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module 'axios'" | Run `npm install axios` in both frontend and backend |
| API returns 404 | Check endpoint URL matches route definitions |
| CORS error | Verify backend CORS middleware is enabled |
| MongoDB connection error | Check `.env` has correct credentials and IP whitelisted |
| Component doesn't show | Verify route is added to main router (check App.jsx) |
| Marks validation fails | Ensure conveyer% + (member% × count) = 100% |
| "No panels assigned" | Admin must first generate panels |

---

## Production Deployment

### Prepare for Production

1. **Backend:**
   ```bash
   npm install
   npm run build  # if applicable
   ```

2. **Frontend:**
   ```bash
   npm run build
   # Creates dist/ folder
   ```

3. **Environment:**
   - Create `.env.production` with production MongoDB URI
   - Set `NODE_ENV=production`

### Deploy to Cloud

**Option 1: Deploy on Heroku**
```bash
# Backend
heroku create panel-management-api
git push heroku main

# Frontend
npm run build
# Deploy dist/ folder separately
```

**Option 2: Deploy on AWS/Azure**
- Backend: EC2/App Service
- Frontend: S3/Blob Storage + CloudFront/CDN
- Database: MongoDB Atlas (already cloud-hosted)

**Option 3: Docker Deployment**
```dockerfile
# Dockerfile for backend
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## Testing Checklist

Before going to production:

- [ ] All API endpoints return correct responses
- [ ] Frontend components load without errors
- [ ] Form validation works correctly
- [ ] Marks calculation accurate
- [ ] Conveyer rotation functioning
- [ ] Load distribution balanced
- [ ] Error messages display properly
- [ ] Loading states visible
- [ ] Responsive on mobile/tablet/desktop
- [ ] Security: No hardcoded credentials
- [ ] Performance: API responses < 1 second
- [ ] Database: Indexes created for performance

See `FRONTEND_INTEGRATION_CHECKLIST.md` for complete testing procedures.

---

## Support & Documentation

- **API Docs:** See `MANUAL_TESTING_GUIDE.md`
- **Frontend Components:** Each .jsx has inline comments
- **Backend Models:** Schemas documented in model files
- **Backend Services:** Algorithms explained in service files
- **Tests:** Run `node tests/test-panel-management.js`

---

## System Requirements

- **Backend:** Node.js 4GB RAM, 2 CPU cores
- **Database:** MongoDB Atlas free tier (up to 512MB)
- **Frontend:** Modern browser (Chrome, Firefox, Safari, Edge)
- **Network:** HTTPS recommended for production

---

## Next Steps

1. ✅ Run `npm install` in both folders
2. ✅ Configure `.env` with MongoDB URI
3. ✅ Start backend: `npm start`
4. ✅ Start frontend: `npm run dev`
5. ✅ Test components using provided checklist
6. ✅ Deploy using preferred platform

**Happy coding!** 🚀

