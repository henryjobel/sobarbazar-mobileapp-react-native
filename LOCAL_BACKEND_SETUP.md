# Local Backend Setup Guide

## Quick Start

### 1. Start the Django Backend

```bash
cd "d:\Sobarbazar main file\Backend"
python manage.py runserver
```

The backend will start at `http://127.0.0.1:8000`

### 2. Configure Mobile App API URL

The API URL is configured in `utils/api.js`. Use the correct URL based on your testing environment:

#### For Android Emulator:
```javascript
const BASE_URL = "http://10.0.2.2:8000";
```
- `10.0.2.2` is a special IP that Android emulator uses to access `localhost` on your computer

#### For iOS Simulator:
```javascript
const BASE_URL = "http://https://api.hetdcl.com";
```

#### For Physical Device (same network):
```javascript
const BASE_URL = "http://YOUR_COMPUTER_IP:8000";
```
- Replace `YOUR_COMPUTER_IP` with your actual local IP (e.g., `192.168.1.100`)
- Find your IP:
  - Windows: `ipconfig` in Command Prompt
  - Mac/Linux: `ifconfig` in Terminal

#### For Production:
```javascript
const BASE_URL = "https://api.hetdcl.com";
```

### 3. Current Configuration

The app is currently configured to use:
- **Android Emulator**: `http://10.0.2.2:8000`

Change this in `utils/api.js` lines 7-8 based on your needs.

## Backend API Endpoints

Once the backend is running, the following endpoints should work:

- Products: `http://https://api.hetdcl.com/api/customer/products/`
- Categories: `http://https://api.hetdcl.com/api/store/categories/`
- Cart: `http://https://api.hetdcl.com/api/customer/carts/`
- Auth: `http://https://api.hetdcl.com/api/customer/login/`
- Register: `http://https://api.hetdcl.com/api/customer/register/`

## Troubleshooting

### Backend returns 404
- Make sure you're running the Django backend: `python manage.py runserver`
- Check that migrations are applied: `python manage.py migrate`

### Can't connect from mobile app
- **Android Emulator**: Use `http://10.0.2.2:8000`
- **iOS Simulator**: Use `http://https://api.hetdcl.com`
- **Physical Device**: Make sure your phone and computer are on the same WiFi network, then use your computer's local IP

### CORS errors
If you see CORS errors, make sure the Django backend has CORS configured properly in settings.

## Database Setup (if needed)

```bash
cd "d:\Sobarbazar main file\Backend"
python manage.py migrate
python manage.py createsuperuser  # Create admin user if needed
```

## Running Backend in Production

When deploying to production, update the `BASE_URL` back to:
```javascript
const BASE_URL = "https://api.hetdcl.com";
```
