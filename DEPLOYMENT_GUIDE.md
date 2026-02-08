# 🚀 DEPLOYMENT GUIDE - Sobarbazar Mobile App
## Step-by-Step Production Deployment & Testing

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Apply All Fixes
```bash
cd "d:\Sobarbazar main file\mobileapp-react-native"

# Remove unused dependencies
npm uninstall @react-navigation/bottom-tabs @react-navigation/native @react-navigation/elements

# Install remaining dependencies
npm install

# Clear cache
npx expo start -c
```

### 2. Verify File Changes
- ✅ `app/screens/vendor-detail/[id].tsx` - Created
- ✅ `utils/logger.js` - Created
- ✅ `utils/helper.js` - Deleted
- ✅ `utils/api.js` - Updated (delivery charges)
- ✅ All other fixes applied

---

## 🧪 TESTING PROTOCOL

### Phase 1: Development Testing

#### Start Development Server
```bash
npx expo start
```

#### Test Navigation Flows
1. **Home Screen**
   - [ ] App loads without errors
   - [ ] Banner slides working
   - [ ] Categories display
   - [ ] Products load
   - [ ] Flash deals show

2. **Shop Navigation**
   - [ ] Tap "All Products" → Shop opens
   - [ ] Tap category card → Shop filters by category
   - [ ] Back button works
   - [ ] No "NavigationContainer" errors

3. **Product Flow**
   - [ ] Tap product card → Details open
   - [ ] Image gallery works
   - [ ] Variant selection works
   - [ ] Add to cart button works
   - [ ] Cart notification appears

4. **Cart Flow**
   - [ ] Navigate to cart tab
   - [ ] Items display correctly
   - [ ] Quantity +/- works
   - [ ] Remove item works
   - [ ] Cart refreshes automatically

5. **Checkout Flow**
   - [ ] Tap "Checkout" button
   - [ ] Address selection works
   - [ ] Payment method selection
   - [ ] Order summary correct
   - [ ] Place order button works

6. **Vendor/Store Flow**
   - [ ] Tap "All Stores"
   - [ ] Store list displays
   - [ ] Tap store card → Store detail opens
   - [ ] Vendor products load
   - [ ] **NO CRASH** ✅ (was crashing before fix)

7. **Profile Flow**
   - [ ] Stats display (not hardcoded 12, 5, 3)
   - [ ] Settings navigation works
   - [ ] Logout works
   - [ ] Login again works

#### Test Authentication
1. **Guest Mode**
   - [ ] Browse products as guest
   - [ ] Add to cart as guest
   - [ ] Guest checkout modal appears
   - [ ] Can proceed as guest or login

2. **Registration**
   - [ ] Fill registration form
   - [ ] Submit registration
   - [ ] Auto-login after registration
   - [ ] Redirect to home

3. **Login**
   - [ ] Login with email
   - [ ] Login with username
   - [ ] Token stored securely
   - [ ] Profile loaded

4. **Orders**
   - [ ] Order list displays
   - [ ] Order details open
   - [ ] Status colors correct
   - [ ] Order tracking works

#### Test API Integration
```javascript
// Open React Native Debugger
// Check network tab for:

// ✅ All requests use HTTPS
// ✅ Auth tokens sent correctly
// ✅ No 401 errors (unless intentional)
// ✅ Response times reasonable
// ✅ Error responses handled gracefully
```

### Phase 2: Device Testing

#### iOS Testing
```bash
# Physical Device
npx expo start
# Scan QR code with Camera app

# iOS Simulator
npx expo start --ios

# Test on:
- iPhone 14 Pro Max (latest iOS)
- iPhone 11 (older iOS)
```

#### Android Testing
```bash
# Physical Device
npx expo start
# Scan QR code with Expo Go app

# Android Emulator
npx expo start --android

# Test on:
- Samsung Galaxy S21+ (Android 13)
- Google Pixel 6 (Android 12)
- Older device (Android 9/10)
```

#### Device-Specific Tests
- [ ] Notch/Dynamic Island handling
- [ ] Back button (Android)
- [ ] Gesture navigation
- [ ] Keyboard behavior
- [ ] Camera access (if using image picker)
- [ ] Storage permissions
- [ ] Network handling (WiFi/4G)
- [ ] Offline behavior

### Phase 3: Performance Testing

#### Load Testing
```javascript
// Test these scenarios:

1. Large product lists (100+ products)
   - [ ] Smooth scrolling
   - [ ] Images load progressively
   - [ ] No lag or jank

2. Image-heavy screens
   - [ ] Product detail with gallery
   - [ ] Category browse
   - [ ] Home banner

3. Multiple cart operations
   - [ ] Add 20+ items quickly
   - [ ] Update quantities rapidly
   - [ ] Remove multiple items

4. Network conditions
   - [ ] Slow 3G simulation
   - [ ] Network drop during API call
   - [ ] Recovery when back online
```

#### Memory Testing
```javascript
// Use React Native Debugger

// Monitor for:
- Memory leaks (increasing RAM usage)
- Image cache growing too large
- Context re-renders excessive

// Expected:
- RAM usage stable under 150MB
- No continuous memory growth
```

---

## 🏗️ BUILD PROCESS

### Prerequisites
1. Install EAS CLI
```bash
npm install -g eas-cli
```

2. Login to Expo
```bash
eas login
```

3. Configure project
```bash
eas build:configure
```

### Development Build

#### Android Development Build
```bash
# Build development APK
eas build --profile development --platform android

# Install on device
adb install path/to/app.apk
```

#### iOS Development Build
```bash
# Build development IPA
eas build --profile development --platform ios

# Install via TestFlight or Xcode
```

### Production Build

#### Android Production Build
```bash
# Build production AAB
eas build --profile production --platform android

# This creates:
# - app-release.aab for Google Play
# - Signed and optimized
```

#### iOS Production Build
```bash
# Build production IPA
eas build --profile production --platform ios

# This creates:
# - app-release.ipa for App Store
# - Signed with distribution certificate
```

### Build Configuration

#### app.json Configuration
```json
{
  "expo": {
    "name": "Sobarbazar",
    "slug": "sobarbazar",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.sobarbazar.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.sobarbazar.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "extra": {
      "apiUrl": "https://api.hetdcl.com",
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## 🔐 ENVIRONMENT CONFIGURATION

### Development Environment
```bash
# .env.development
API_URL=https://api.hetdcl.com
AUTH_URL=https://api.hetdcl.com
ENVIRONMENT=development
```

### Production Environment
```bash
# .env.production
API_URL=https://api.hetdcl.com
AUTH_URL=https://api.hetdcl.com
ENVIRONMENT=production
```

### Access in Code
```javascript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;
```

---

## 📱 APP STORE SUBMISSION

### Google Play Store

#### Preparation
1. **Create Store Listing**
   - App name: Sobarbazar
   - Short description: Your online shopping complex
   - Full description: [Write compelling description]
   - Screenshots: 2-8 required
   - Feature graphic: 1024x500
   - Icon: 512x512

2. **Privacy Policy**
   - Host privacy policy online
   - Add URL in app.json and Play Console

3. **Content Rating**
   - Complete questionnaire
   - Get IARC rating certificate

#### Submit
```bash
# Build production AAB
eas build --profile production --platform android

# Upload to Play Console
# Internal testing → Closed testing → Production
```

### Apple App Store

#### Preparation
1. **Create App in App Store Connect**
   - Bundle ID: com.sobarbazar.app
   - App name: Sobarbazar
   - Primary language: English
   - SKU: unique identifier

2. **App Information**
   - Privacy Policy URL
   - Category: Shopping
   - Content rights information
   - Age rating: 4+

3. **Screenshots & Assets**
   - iPhone 6.7" (required)
   - iPhone 6.5" (required)
   - iPhone 5.5" (required)
   - iPad Pro 12.9" (optional)
   - App Preview videos (optional)

#### Submit
```bash
# Build production IPA
eas build --profile production --platform ios

# Upload via EAS or Transporter app
# Submit for review
```

---

## 🔍 POST-DEPLOYMENT MONITORING

### Crash Reporting
```bash
# Install Sentry
npm install @sentry/react-native

# Initialize in app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-dsn-here',
  environment: __DEV__ ? 'development' : 'production',
});
```

### Analytics
```bash
# Install Firebase Analytics
npm install @react-native-firebase/app @react-native-firebase/analytics

# Track events
analytics().logEvent('product_view', { product_id: '123' });
analytics().logEvent('add_to_cart', { value: 299, currency: 'BDT' });
```

### Performance Monitoring
```javascript
// Monitor API response times
// Monitor screen load times
// Monitor app startup time
// Track user sessions
```

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue: "NavigationContainer" Error
**Solution**: Already fixed! ThemeProvider removed from _layout.tsx

### Issue: Build Fails on iOS
```bash
# Clear build cache
expo prebuild --clean

# Try again
eas build --platform ios
```

### Issue: Android Signing Error
```bash
# Reset credentials
eas credentials

# Rebuild
eas build --platform android
```

### Issue: App Crashes on Launch
```bash
# Check:
1. API URL is correct
2. All dependencies installed
3. Native modules linked
4. Clear cache and rebuild
```

### Issue: API Not Working in Production
```bash
# Verify:
1. HTTPS URLs (not HTTP)
2. CORS configured on backend
3. API endpoints accessible
4. Auth tokens being sent
```

---

## 📊 RELEASE CHECKLIST

### Before First Release
- [ ] All tests passing
- [ ] No console errors
- [ ] API endpoints validated
- [ ] Payment integration tested
- [ ] Push notifications configured
- [ ] Analytics installed
- [ ] Crash reporting setup
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] App icons finalized
- [ ] Splash screen finalized
- [ ] Store listings prepared
- [ ] Screenshots captured
- [ ] App descriptions written
- [ ] Support email configured
- [ ] Beta testing completed

### Version Update Checklist
- [ ] Update version in app.json
- [ ] Update buildNumber (iOS) / versionCode (Android)
- [ ] Write release notes
- [ ] Test on both platforms
- [ ] Create git tag
- [ ] Build new version
- [ ] Submit to stores
- [ ] Monitor crash reports
- [ ] Monitor user reviews

---

## 🎯 SUCCESS METRICS

### Day 1 Targets
- ✅ 0 crashes
- ✅ < 1% error rate
- ✅ App Store rating > 4.0
- ✅ User engagement > 60%

### Week 1 Targets
- ✅ 100+ downloads
- ✅ 10+ reviews
- ✅ < 5% uninstall rate
- ✅ Daily active users growing

### Month 1 Targets
- ✅ 1000+ downloads
- ✅ 4.5+ rating
- ✅ Active user base established
- ✅ Revenue targets met

---

## 📞 SUPPORT & MAINTENANCE

### User Support
- Email: support@sobarbazar.com
- In-app support chat
- FAQ section
- Tutorial videos

### Maintenance Schedule
- **Daily**: Monitor crashes and errors
- **Weekly**: Review user feedback
- **Monthly**: Performance optimization
- **Quarterly**: Major feature releases

### Update Cycle
1. Gather user feedback
2. Plan improvements
3. Develop and test
4. Deploy to beta testers
5. Release to production
6. Monitor and iterate

---

## ✅ DEPLOYMENT COMPLETE

Once you've completed all steps:

1. ✅ App tested thoroughly
2. ✅ Builds created successfully
3. ✅ Submitted to app stores
4. ✅ Monitoring configured
5. ✅ Support channels ready

**Your app is ready for production!** 🎉

---

## 📝 QUICK COMMAND REFERENCE

```bash
# Development
npx expo start                 # Start dev server
npx expo start -c              # Clear cache
npx expo start --ios           # iOS simulator
npx expo start --android       # Android emulator

# Building
eas build --profile development --platform android
eas build --profile production --platform ios

# Testing
npm run test                   # Run tests
npm run lint                   # Check code quality

# Deployment
eas submit --platform android  # Submit to Play Store
eas submit --platform ios      # Submit to App Store

# Maintenance
npm audit fix                  # Fix security issues
npm update                     # Update dependencies
expo upgrade                   # Upgrade Expo SDK
```

**Happy deploying!** 🚀
