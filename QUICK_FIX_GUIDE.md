# 🔧 Quick Fix Guide - Mobile App Not Loading Data

## Problem
All features returning 404 errors:
- Product details not loading
- Products not adding to cart
- Shop page empty
- Store list empty

## Root Cause
**Django backend is not running or not accessible.**

## Solution

### Step 1: Start Django Backend

```bash
cd "d:\Sobarbazar main file\Backend"
python manage.py runserver 0.0.0.0:8000
```

**Expected Output:**
```
System check identified no issues (0 silenced).
January 21, 2026 - 10:30:00
Django version 5.1.2, using settings 'config.settings'
Starting development server at http://0.0.0.0:8000/
Quit the server with CTRL-BREAK.
```

### Step 2: Verify Backend is Working

Open these URLs in your browser:

✅ **Products API:**
```
http://https://api.hetdcl.com/api/customer/products/
```

✅ **Categories API:**
```
http://https://api.hetdcl.com/api/store/categories/?pagination=0
```

✅ **Stores API:**
```
http://https://api.hetdcl.com/api/store/public/
```

✅ **Cart API:**
```
http://https://api.hetdcl.com/api/customer/carts/
```

**Expected:** JSON responses with data
**Problem:** HTML 404 error page → Backend routes not configured

### Step 3: Configure Mobile App URL

Edit `mobileapp-react-native/utils/api.js` line 7:

**For Android Emulator (Default):**
```javascript
const BASE_URL = "http://10.0.2.2:8000";
```

**For iOS Simulator:**
```javascript
const BASE_URL = "http://https://api.hetdcl.com";
```

**For Physical Device:**
```javascript
const BASE_URL = "http://YOUR_COMPUTER_IP:8000";
```

To find your computer's IP:
```bash
# Windows
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)

# Mac
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 4: Restart Mobile App

```bash
# Kill and restart Expo
# Press Ctrl+C in terminal running expo
expo start --clear
```

## Troubleshooting

### Backend Returns "Page not found"

**Symptom:** HTML 404 page instead of JSON

**Fix:** Check Django URL configuration in `Backend/config/urls.py`

Expected routes:
```python
urlpatterns = [
    path('api/customer/', include('customers.urls')),
    path('api/store/', include('stores.urls')),
]
```

### "Network request failed"

**Causes:**
1. Backend not running
2. Wrong IP address
3. Firewall blocking port 8000
4. Device not on same network (physical device only)

**Fix for Firewall (Windows):**
```bash
# Allow Python through firewall
netsh advfirewall firewall add rule name="Django Dev Server" dir=in action=allow protocol=TCP localport=8000
```

### Database Not Migrated

**Symptom:** Backend starts but API returns errors about missing tables

**Fix:**
```bash
cd "d:\Sobarbazar main file\Backend"
python manage.py migrate
```

### Port Already in Use

**Symptom:** `Error: That port is already in use.`

**Fix:**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port
python manage.py runserver 0.0.0.0:8001
# Then update BASE_URL in mobile app to :8001
```

## Prevention

### Always Start Backend Before Testing Mobile App

Create a batch file `start-backend.bat`:
```batch
@echo off
cd "d:\Sobarbazar main file\Backend"
echo Starting Django backend...
python manage.py runserver 0.0.0.0:8000
pause
```

### Use Environment Variables

Create `mobileapp-react-native/.env`:
```env
API_URL=http://10.0.2.2:8000
```

Then in `app.config.js`:
```javascript
export default {
  // ...
  extra: {
    apiUrl: process.env.API_URL || "http://10.0.2.2:8000",
  },
};
```

## Verification Checklist

Before testing mobile app, verify:

- [ ] Django backend running (`http://https://api.hetdcl.com`)
- [ ] Products API returns JSON (`/api/customer/products/`)
- [ ] Stores API returns JSON (`/api/store/public/`)
- [ ] Categories API returns JSON (`/api/store/categories/`)
- [ ] Correct BASE_URL in `utils/api.js`
- [ ] Mobile app restarted after changes

## Quick Test

Run this in mobile app to test connectivity:

```javascript
// Add to home screen temporarily
import { testApiConnection } from '@/utils/api';

useEffect(() => {
  testApiConnection();
}, []);
```

Check console for results showing 200 status codes.
