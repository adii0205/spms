# Local MongoDB Installation - Step by Step

**Fastest way to get your backend working!** ⚡

---

## 📥 Step 1: Download MongoDB

**Time: 1 minute**

1. Open browser: https://www.mongodb.com/try/download/community
2. Select:
   - **Version:** Latest (8.0 or newer)
   - **Platform:** Windows x86_64 (or ARM64 for Apple Silicon)
   - **Package:** MSI
3. Click **Download**
4. Your file will be: `mongodb-windows-x86_64-8.0.x.msi` (or similar)

---

## 💾 Step 2: Install MongoDB

**Time: 3-5 minutes**

1. **Double-click** the downloaded `.msi` file
2. **Click "Yes"** when asked for admin permission
3. **Read the License** → Click **"I Agree"**
4. **Choose Setup Type:**
   - Select: **"Complete"** (recommended)
   - Click **"Next"**

5. **Service Configuration** (IMPORTANT SCREEN):
   - ✅ **CHECK THIS:** "Install MongoDB as a Service"
   - ✅ **CHECK THIS:** "Run the MongoDB service"
   - Service Name: `MongoDB` (keep default)
   - Click **"Next"**

6. **MongoDB Compass** (optional):
   - ✅ Check "Install MongoDB Compass" (nice GUI tool)
   - Click **"Next"**

7. **Path Configuration:**
   - Keep default path: `C:\Program Files\MongoDB\Server\8.0\`
   - Click **"Next"**

8. **Install:**
   - Click **"Install"**
   - Wait 1-2 minutes...
   - Click **"Finish"**

---

## ✅ Step 3: Verify Installation

**Time: 30 seconds**

### Check MongoDB Version

```powershell
mongod --version
```

**Expected output:**
```
db version v8.0.x
Build Info: {...}
```

If you see a version number = ✅ Installation successful!

### Verify Service is Running

```powershell
Get-Service MongoDB
```

**Expected output:**
```
Status   Name           DisplayName
------   ----           -----------
Running  MongoDB        MongoDB
```

If Status = "Running" = ✅ Service is active!

---

## 🔄 Step 4: Update Your `.env` File

**Time: 1 minute**

1. Open: `C:\Users\jadit\Downloads\spms\backend\.env`

2. **Find this line:**
   ```
   MONGODB_URI=mongodb+srv://adityajaiswal33008_db_user:pg6SgeCYBwiV2ool@cluster2.sgwhqq.mongodb.net/spms?retryWrites=true&w=majority
   ```

3. **Replace with:**
   ```
   MONGODB_URI=mongodb://localhost:27017/spms
   ```

4. **Save the file** (Ctrl+S)

---

## 🚀 Step 5: Start Your Backend Server

**Time: 30 seconds**

```powershell
# Navigate to backend
cd C:\Users\jadit\Downloads\spms\backend

# Start the server
npm start
```

**Wait for... (you should see this):**

```
✅ Connected to MongoDB at mongodb://localhost:27017/spms
✨ Created chat uploads directory: C:\Users\jadit\Downloads\spms\backend\uploads\chat
🚀 Server running on port 5000
```

✅ **If you see above = SUCCESS!** Your backend is now connected to MongoDB!

---

## ❌ If Something Goes Wrong

### "mongod: command not found"
**Solution:** Restart PowerShell or add MongoDB to PATH:
```powershell
# Add to your system PATH:
# C:\Program Files\MongoDB\Server\8.0\bin
```

Then restart PowerShell and try again.

### "MongoDB service not running"
**Solution:** Start it manually:
```powershell
# Run as Administrator:
Start-Service MongoDB
```

Or check Services app (Win+R → services.msc → find MongoDB → right-click → Start)

### "Cannot connect to port 27017"
**Solution:** MongoDB might not be installed or running:
```powershell
# Check if running
Get-Service MongoDB

# If not running, start it:
Start-Service MongoDB
```

### Still errors after `.env` change?
1. Make sure `.env` has: `mongodb://localhost:27017/spms`
2. Make sure MongoDB service is running: `Get-Service MongoDB`
3. Restart the server: `npm start`
4. If still failing, MongoDB probably isn't fully installed

---

## 📊 What's Installed?

| Component | Location | Purpose |
|-----------|----------|---------|
| **mongod** | `C:\Program Files\MongoDB\Server\8.0\bin\` | Database server |
| **mongosh** | `C:\Program Files\MongoDB\Server\8.0\bin\` | CLI tool |
| **Service** | Windows Services | Runs in background |
| **Data** | `C:\Program Files\MongoDB\Server\8.0\data\` | Your databases |

---

## 🎉 You're Done!

Now open another terminal and continue:

```powershell
# Terminal 1 (Backend - already running):
cd backend && npm start

# Terminal 2 (Seed database with sample data):
cd backend
npm run seed

# Terminal 3 (Start frontend):
cd frontend
npm run dev
```

Then open: `http://localhost:5173`

Enjoy! 🚀

---

## 📌 Useful Commands

```powershell
# Check MongoDB status
Get-Service MongoDB

# Start MongoDB
Start-Service MongoDB

# Stop MongoDB
Stop-Service MongoDB

# Restart MongoDB
Restart-Service MongoDB

# Connect with CLI tool
mongosh

# Inside mongosh:
show dbs                    # List databases
use spms                    # Use spms database
show collections            # List all collections
db.users.find()             # View users
db.panels.find().limit(1)   # View first panel
exit                        # Exit mongosh
```

---

**Need help?** Check: `MONGODB_SETUP_ALTERNATIVES.md` 📖

