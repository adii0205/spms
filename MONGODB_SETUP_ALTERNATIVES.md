# MongoDB Setup - Connection Alternatives

**Current Issue:** MongoDB Atlas connection is being blocked (DNS querySrv ECONNREFUSED)

Your ISP is blocking connections to MongoDB Atlas domain names. Here are your options:

---

## ✅ OPTION 1: Local MongoDB Server (Recommended - EASIEST)

### Windows Installation

#### Step 1: Download MongoDB Community Edition
1. Go to https://www.mongodb.com/try/download/community
2. Select **Version: Latest (8.0 or newer)**
3. Select **Platform: Windows x86_64** (or ARM64 for newer Macs)
4. Select **Package: MSI**
5. Download the installer

#### Step 2: Run the Installer
1. Double-click the downloaded `.msi` file
2. Click **Next** until you reach "Service Configuration"
3. **Important choices:**
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Run the MongoDB service"
   - Keep the service name as `MongoDB`
4. Complete the installation

#### Step 3: Verify Installation
```powershell
# Open PowerShell and run:
mongod --version
```
You should see the MongoDB version number.

#### Step 4: Update `.env` File

Replace the MongoDB URI with local connection:

**Current (NOT working on your network):**
```
MONGODB_URI=mongodb+srv://adityajaiswal33008_db_user:pg6SgeCYBwiV2ool@cluster2.sgwhqq.mongodb.net/spms?retryWrites=true&w=majority
```

**Change to local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/spms
```

#### Step 5: Start the Server

MongoDB should be running as a Windows service automatically. Verify:

```powershell
# Check service status
Get-Service MongoDB
```

Should show: `Status : Running`

#### Step 6: Test Connection

```bash
cd backend
npm start
```

**Expected Output:**
```
✅ Connected to MongoDB at mongodb://localhost:27017/spms
Server running on port 5000
```

---

## ✅ OPTION 2: MongoDB Atlas via Different Network

If you want to keep using MongoDB Atlas:

### Using Mobile Hotspot
1. **Disconnect** from your current WiFi/network
2. **Enable hotspot** on your phone (5G/LTE data)
3. **Connect** your laptop to the phone's hotspot
4. **Try starting the backend again:**
   ```bash
   cd backend
   npm start
   ```

**Why it works:** ISPs only block at their network level. Mobile data bypasses this.

### Or: Tethering via Another Device
- Try using a different internet connection entirely
- Coffee shop WiFi, library, mobile network, different ISP

---

## ✅ OPTION 3: MongoDB Atlas via VPN

If you only have access to your ISP network:

### Using Free VPN
1. Download a free VPN (ExpressVPN, ProtonVPN, or similar)
2. Connect to the VPN
3. Keep the MongoDB URI as-is in `.env`
4. Start the backend:
   ```bash
   npm start
   ```

**⚠️ NOTE:** VPN may be slower; local MongoDB (Option 1) is faster for development.

---

## 🔄 OPTION 4: MongoDB Atlas with Connection String Workaround

This is a **less reliable** option but might work:

### Using Direct IP Connection
1. Get the IP address of the MongoDB Atlas server
2. Modify the connection string

However, this requires technical expertise and MongoDB may block it. **Not recommended.**

---

## 📊 Comparison Table

| Option | Setup Time | Speed | Reliability | Best For |
|--------|-----------|-------|------------|----------|
| **Local MongoDB** | 5 min | ⚡ Fastest | ✅ Excellent | Development & Testing |
| **Mobile Hotspot** | 1 min | ⚡ Fast | ✅ Good | Quick testing |
| **Different Network** | Varies | ⚡ Fast | ✅ Good | If available |
| **VPN** | 5 min | 🐢 Slower | ⚠️ Fair | Last resort |

---

## 🎯 Recommended Path for You

**Step 1:** Try **Option 1 (Local MongoDB)** first
- It's the quickest permanent solution
- No network/VPN issues
- Faster for development
- Can use in production later

**Step 2:** If that doesn't work, try **Option 2 (Mobile Hotspot)**
- Quickest immediate test
- Confirms the DNS block is the issue

**Step 3:** If neither works, use **Option 3 (VPN)**

---

## Testing After Setup

### Verify Connection Works

```bash
# Navigate to backend directory
cd backend

# Start the server
npm start
```

### Expected Success Output:
```
✅ Connected to MongoDB at mongodb://localhost:27017/spms
✨ Created chat uploads directory: C:\Users\jadit\Downloads\spms\backend\uploads\chat
🚀 Server running on port 5000
```

### If Connection Still Fails:
```
❌ MongoDB connection error: ...
```

Then review the error message and try a different option.

---

## 📝 MongoDB CLI Tools (Optional)

After local MongoDB is installed, you can use these commands:

```powershell
# Connect to MongoDB shell
mongosh

# List all databases
show dbs

# Use the spms database
use spms

# List collections
show collections

# View first few documents in a collection
db.users.find().limit(3)

# Exit MongoDB shell
exit
```

---

## 🗄️ Comparing Databases

### Local MongoDB (Current Plan)
- **Location:** Your computer's disk drive
- **Persistence:** Data survives server restarts ✅
- **Access:** From this computer only
- **Production:** ❌ Not suitable (but fine for development)

### MongoDB Atlas (Original Plan)
- **Location:** Hosted servers (cloud)
- **Persistence:** Data survives everything ✅
- **Access:** From anywhere with credentials ✅
- **Production:** ✅ Perfect for production
- **Issue:** 🚫 DNS blocked on your network

---

## ✅ QUICK START CHECKLIST

### For Local MongoDB:
- [ ] Download MongoDB Community Edition
- [ ] Run the installer with "Run as Service" ✅
- [ ] Verify `mongod --version` works
- [ ] Update `.env`: `MONGODB_URI=mongodb://localhost:27017/spms`
- [ ] Run `npm start` in backend directory
- [ ] See "✅ Connected to MongoDB" message ✅

### For Atlas (Mobile Hotspot):
- [ ] Connect to phone hotspot
- [ ] Keep `.env` as-is (with Atlas URI)
- [ ] Run `npm start` in backend directory

---

## 🆘 Troubleshooting

### MongoDB Service Won't Start
```powershell
# Fix service permissions (Run as Administrator)
Set-Service MongoDB -StartupType Automatic
Start-Service MongoDB
```

### Port 27017 Already in Use
```powershell
# Find what's using port 27017
netstat -ano | findstr :27017

# If needed, restart MongoDB service
Restart-Service MongoDB
```

### Still Getting Connection Error
1. Verify MongoDB is running: `Get-Service MongoDB` (should show "Running")
2. Verify `.env` URI is correct: `mongodb://localhost:27017/spms`
3. Try connecting with mongosh: `mongosh`
4. If mongosh works but npm start fails, there's an app issue (not MongoDB)

---

## 📞 Additional Resources

- **MongoDB Installation Guide:** https://docs.mongodb.com/manual/installation/
- **MongoDB Windows Guide:** https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
- **Connection String Docs:** https://docs.mongodb.com/manual/reference/connection-string/

---

## ✨ Next Steps After Connecting

Once MongoDB is connected and server starts successfully:

1. **Seed the database** (populate with sample data):
   ```bash
   npm run seed
   ```

2. **Test the API** (in another terminal):
   ```bash
   npm run test:manual
   ```

3. **Start the frontend** (in a third terminal):
   ```bash
   cd ../frontend
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

---

**Choose Option 1 (Local MongoDB) for the smoothest experience!** 🚀

