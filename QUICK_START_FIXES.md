# 🚀 QUICK START - Immediate Fixes & Testing

This guide helps you apply the most critical fixes and test them immediately.

---

## ✅ ALREADY COMPLETED (By AI)

1. ✅ **Error Boundary Added** - App now catches all React errors gracefully
2. ✅ **Theme System Created** - `src/theme/` with colors, typography, spacing
3. ✅ **API Client Built** - Production-ready client with timeout & retry in `src/api/client.ts`
4. ✅ **API Services Created** - Example services for auth and products
5. ✅ **Environment Validation** - Config validation in `src/config/env.ts`

---

## 🎯 DO THIS NOW (5 Minutes)

### Step 1: Test Error Boundary
```typescript
// Create a test component that throws an error
// Add to app/index.tsx temporarily

const TestError = () => {
  throw new Error('Test error - Error Boundary works!');
  return null;
};

// Then navigate to home - you should see the error UI
// Remove after testing
```

### Step 2: Use New Theme in One Screen
```typescript
// Open app/(tabs)/index.tsx
// Add at top:
import { colors } from '@/src/theme';

// Replace hardcoded colors:
// FIND: '#299e60'
// REPLACE: colors.primary.main

// FIND: '#22C55E'
// REPLACE: colors.success.main
```

### Step 3: Test New API Client
```typescript
// Open any component that fetches data
// Replace old API call with new client:

// BEFORE
import { getProducts } from '@/utils/api';
const data = await getProducts();

// AFTER
import { getProducts } from '@/src/api/products';
const result = await getProducts({ page: 1, page_size: 20 });
const data = result.results;
```

---

## 🔧 AUTOMATED COLOR MIGRATION (1 Minute)

Run the migration script to replace all hardcoded colors automatically:

```bash
cd "d:\Sobarbazar main file\mobileapp-react-native"

# Make script executable (if on Unix-like system)
chmod +x scripts/migrate-colors.js

# Run migration
node scripts/migrate-colors.js

# Review changes
git diff

# If looks good, commit
git add .
git commit -m "feat: migrate hardcoded colors to theme system"
```

**What it does:**
- Scans all `.tsx`, `.ts`, `.jsx`, `.js` files
- Replaces 21+ hardcoded color values with theme imports
- Adds `import { colors } from '@/src/theme'` where needed
- Shows summary of changes

**Example output:**
```
🎨 Starting color migration...

📁 Processing app/...
✅ app/(tabs)/index.tsx - 12 replacements
✅ app/(tabs)/shop.tsx - 8 replacements
...

✨ Migration complete!
📊 Stats:
   - Total files scanned: 89
   - Files modified: 21
   - Total replacements: 156
```

---

## 🧪 TESTING CHECKLIST

### Visual Testing (10 Minutes)
- [ ] Open app on iOS simulator/device
- [ ] Open app on Android emulator/device
- [ ] Navigate through all main screens
- [ ] Check colors match web theme
- [ ] Test dark mode (if enabled)
- [ ] Verify no visual regressions

### Functional Testing (15 Minutes)
- [ ] **Home Screen** - Products load correctly
- [ ] **Shop Screen** - Filtering and pagination work
- [ ] **Product Details** - Images and info display
- [ ] **Add to Cart** - Items add successfully
- [ ] **Cart** - Update quantities, remove items
- [ ] **Checkout** - Guest and authenticated checkout
- [ ] **Login/Register** - Auth flows work
- [ ] **Profile** - User data loads

### Performance Testing (5 Minutes)
- [ ] Scroll through product list - should be smooth (60 FPS)
- [ ] Open app - startup time should be fast (<2s)
- [ ] Switch tabs - should be instant
- [ ] Load images - should cache and load quickly

### Error Handling Testing (5 Minutes)
- [ ] Turn off WiFi - should show network error
- [ ] Invalid login - should show error message
- [ ] Empty cart checkout - should prevent with message
- [ ] Break a component (throw error) - Error Boundary should catch

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "Cannot find module '@/src/theme'"
**Fix:** Clear Metro cache and restart
```bash
npx expo start --clear
```

### Issue: TypeScript errors after adding imports
**Fix:** Restart TypeScript server in VS Code
- Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Type "TypeScript: Restart TS Server"
- Press Enter

### Issue: Colors not showing correctly
**Fix:** Check if NativeWind is configured properly
```bash
# Verify tailwind.config.js has the color extensions
# Verify app has ./globals.css imported
```

### Issue: API calls timeout
**Fix:** Check internet connection and API URL
```typescript
// In src/config/env.ts
console.log('API URL:', env.apiUrl);
// Should be: https://api.hetdcl.com
```

---

## 📊 BEFORE/AFTER COMPARISON

### Before Fixes
```typescript
// Hardcoded colors everywhere
<View style={{ backgroundColor: '#299e60' }}>

// No error handling
function MyScreen() {
  return <MyComponent />; // Crashes if error
}

// No API timeout
const res = await fetch(url); // Hangs forever if network issue

// No retry logic
if (!res.ok) throw new Error(); // Fails immediately
```

### After Fixes
```typescript
// Centralized theme
import { colors } from '@/src/theme';
<View style={{ backgroundColor: colors.primary.main }}>

// Error Boundary catches errors
<ErrorBoundary>
  <MyComponent /> // Shows error UI if crash
</ErrorBoundary>

// API client with timeout
const response = await apiClient.get(endpoint, { timeout: 30000 });

// Automatic retry with backoff
// Retries 2 times with 2s, 4s delays
// Returns error after retries exhausted
```

---

## 🎨 USING THE NEW THEME SYSTEM

### Colors
```typescript
import { colors } from '@/src/theme';

// Primary brand color
colors.primary.main     // #299e60
colors.primary.light    // Lighter shade
colors.primary.dark     // Darker shade

// Semantic colors
colors.success.main     // Green
colors.danger.main      // Red
colors.warning.main     // Yellow
colors.info.main        // Blue

// Backgrounds
colors.background.one   // #F3FAF2
colors.background.two   // #FFFBF4
colors.background.white // #FFFFFF
```

### Typography
```typescript
import { typography } from '@/src/theme';

typography.fontSizes.base    // 14
typography.fontSizes.lg      // 16
typography.fontSizes.xl      // 18

typography.fontWeights.normal   // '400'
typography.fontWeights.bold     // '700'
```

### Spacing
```typescript
import { spacing, borderRadius } from '@/src/theme';

spacing.sm           // 8
spacing.base         // 16
spacing.lg           // 20

borderRadius.md      // 8
borderRadius.lg      // 12
borderRadius.full    // 9999
```

### Using Theme Hook (with Dark Mode)
```typescript
import { useTheme } from '@/src/theme';

function MyComponent() {
  const { colors, isDark, spacing } = useTheme();

  return (
    <View style={{
      backgroundColor: colors.background, // Auto light/dark
      padding: spacing.base,
    }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

---

## 🚀 USING THE NEW API CLIENT

### Basic Usage
```typescript
import { apiClient } from '@/src/api';

// GET request
const response = await apiClient.get('/api/endpoint');
if (response.success) {
  console.log('Data:', response.data);
} else {
  console.error('Error:', response.error);
}

// POST request
const result = await apiClient.post('/api/endpoint', {
  name: 'Product',
  price: 100
});

// With custom timeout
const data = await apiClient.get('/api/slow-endpoint', {
  timeout: 60000 // 60 seconds
});

// With authentication
const config = apiClient.withAuth(token);
const profile = await apiClient.get('/api/profile', config);
```

### Using API Services
```typescript
// Products API
import { getProducts, getProductById } from '@/src/api/products';

// Get products with filters
const result = await getProducts({
  page: 1,
  page_size: 20,
  category: 'electronics',
  search: 'laptop',
});

console.log('Products:', result.results);
console.log('Total:', result.count);
console.log('Pages:', result.pages);

// Get single product
const product = await getProductById(123);

// Auth API
import { login, register, getUserProfile } from '@/src/api/auth';

const tokens = await login({ email: 'user@example.com', password: '***' });
const user = await getUserProfile(tokens.access);
```

---

## 📈 PERFORMANCE OPTIMIZATION EXAMPLE

See `examples/OptimizedProductList.tsx` for a complete example of:
- ✅ React.memo with custom comparison
- ✅ getItemLayout for fixed-height items
- ✅ Memoized callbacks and render functions
- ✅ expo-image with caching
- ✅ All FlatList performance props

**Copy this pattern to your product lists:**
```bash
# View the example
code "d:\Sobarbazar main file\mobileapp-react-native\examples\OptimizedProductList.tsx"

# Apply the pattern to your shop screen
code "d:\Sobarbazar main file\mobileapp-react-native\app\(tabs)\shop.tsx"
```

---

## 📝 NEXT STEPS

### Immediate (Today)
1. Run color migration script
2. Test app thoroughly
3. Fix any issues found

### This Week
1. Migrate all API calls to new client
2. Add React.memo to SingleProduct component
3. Optimize FlatLists in shop and cart screens
4. Add token refresh to AuthContext

### Next Week
1. Replace all console.log with logger
2. Split CartContext into multiple files
3. Performance profiling and optimization
4. Error reporting integration (Sentry/Bugsnag)

---

## 🆘 NEED HELP?

- **Full Audit Report:** See `AUDIT_AND_FIXES_REPORT.md`
- **Example Code:** See `examples/` directory
- **API Client Docs:** See `src/api/client.ts` comments
- **Theme Docs:** See `src/theme/` files

---

**Quick Start Complete!** 🎉

Your app now has:
- ✅ Error Boundary protection
- ✅ Centralized theme system
- ✅ Production-ready API client
- ✅ Type-safe environment config

Test thoroughly and enjoy the improvements!
