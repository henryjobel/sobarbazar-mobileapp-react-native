# Mobile App Complete Implementation Plan
## SobarBazar E-Commerce App - Align with Frontend & Backend

---

## EXECUTIVE SUMMARY

**Goal:** Fix the mobile app to work exactly like the Frontend (Next.js) with complete API integration matching the Backend (Django) endpoints.

**Scope:**
1. Fix all API endpoint mismatches
2. Complete purchase flow (Browse → Cart → Checkout → Order → Track)
3. Remove unused/unnecessary code
4. Fix authentication flow
5. Implement missing features (Orders, Address, Reviews, etc.)
6. Ensure all pages work correctly

---

## PART 1: API ENDPOINT CORRECTIONS

### 1.1 Current Issues Found

| Issue | Current | Should Be | Priority |
|-------|---------|-----------|----------|
| Base URL typo | `http://https://api.hetdcl.com` | `https://api.hetdcl.com` | 🔴 Critical |
| Product endpoint | `/api/customer/products/` | `/api/v1.0/customers/products/` | 🔴 Critical |
| Cart endpoint | `/api/customer/carts/` | `/api/v1.0/customers/carts/` | 🔴 Critical |
| Order endpoint | `/api/customer/orders/` | `/api/v1.0/customers/orders/` | 🔴 Critical |
| Favorites endpoint | `/api/customer/favorite-products/` | `/api/v1.0/customers/favorite-products/` | 🔴 Critical |
| Register endpoint | `/api/customer/register/` | `/api/v1.0/customers/register/` | 🔴 Critical |
| Categories endpoint | `/api/store/categories/` | `/api/v1.0/stores/categories/` | 🔴 Critical |
| Store endpoint | `/api/store/public/` | `/api/v1.0/stores/public/` | 🔴 Critical |
| Store detail | `/api/store/{id}/detail/` | `/api/v1.0/stores/{id}/detail/` | 🔴 Critical |
| Product reviews | `/api/customer/products/{id}/reviews/` | `/api/v1.0/customers/products/{id}/reviews/` | 🟡 Medium |

### 1.2 Authorization Header Fix

**Current Issue:** Mixed usage of `Bearer` and `JWT`
**Backend Expects:**
- `/auth/*` endpoints: `Authorization: JWT {token}`
- All other endpoints: `Authorization: Bearer {token}`

**Fix Required in:** `utils/api.js` - `getHeaders()` function

---

## PART 2: CONTEXT FIXES

### 2.1 AuthContext Updates

**File:** `context/AuthContext.tsx`

**Issues:**
1. API endpoint paths incorrect
2. Response parsing inconsistent with backend
3. Missing customer profile data handling

**Fixes:**
- Update login endpoint to `/auth/jwt/create/`
- Update register endpoint to `/api/v1.0/customers/register/`
- Update profile endpoint to `/auth/users/me/` with `JWT` token
- Parse `{data: {access, refresh}}` or `{access, refresh}` response structures
- Store customer profile data from response

### 2.2 CartContext Updates

**File:** `context/CartContext.tsx`

**Critical Issues:**
1. Hard-coded `is_guest: true` in checkout (Line 384)
2. Cart endpoint path incorrect
3. Delivery charge calculation may not match backend

**Fixes:**
- Fix `is_guest` to be conditional: `!isAuthenticated`
- Update all cart endpoints to `/api/v1.0/customers/carts/`
- Use backend delivery charges from DeliveryCharge model
- Ensure `area` parameter is "IN" or "OUT" (uppercase)
- Fix cart item structure to match backend serializer

**Required Changes:**
```typescript
// Old (WRONG):
const checkoutPayload = {
  ...orderData,
  is_guest: true,  // ❌ Always true
};

// New (CORRECT):
const checkoutPayload = {
  cart_id: cartId,
  payment_method: orderData.payment_method || 'COD',
  area: orderData.area || 'IN',
};

// For guest users only:
if (!user) {
  checkoutPayload.name = orderData.name;
  checkoutPayload.email = orderData.email;
  checkoutPayload.phone = orderData.phone;
  checkoutPayload.shipping_address = orderData.shipping_address;
}
// For authenticated users:
else {
  // shipping_address optional if in profile
  if (orderData.shipping_address) {
    checkoutPayload.shipping_address = orderData.shipping_address;
  }
}
```

### 2.3 WishlistContext Updates

**File:** `context/WishlistContext.tsx`

**Issues:**
1. Endpoint path incorrect
2. Request payload may not match backend

**Fixes:**
- Update endpoint to `/api/v1.0/customers/favorite-products/`
- Ensure payload is `{product: productId, is_favorite: true}`

---

## PART 3: SCREEN IMPLEMENTATIONS

### 3.1 Fix Route Typo

**File:** `app/(tabs)/profile.tsx`
**Issue:** `/my-oders` instead of `/my-orders` (Line 20)
**Fix:** Change to `/my-orders`

### 3.2 Implement My Orders Screen

**File:** `app/(routes)/my-orders/index.tsx`

**Current:** Empty/Incomplete
**Required:**
- Fetch orders from `/api/v1.0/customers/orders/` with JWT token
- Display order list with:
  - Order number
  - Order date
  - Status (Placed, Paid, Confirmed, Processing, Shipped, Delivered, Cancelled)
  - Total amount
  - Items count
- Tap to navigate to order detail
- Pull to refresh
- Empty state when no orders
- Error handling

**Response Structure:**
```json
[
  {
    "id": 123,
    "order_number": "ORD-20240112-123456",
    "order_date": "2024-01-12T10:30:00Z",
    "status": "Placed",
    "total_amount": 1250.00,
    "items": [...],
    "shipping_address": "123 Main St",
    "payment_method": "COD"
  }
]
```

### 3.3 Implement Order Detail Screen

**File:** `app/screens/order-detail/[id].tsx`

**Required:**
- Fetch order detail from `/api/v1.0/customers/orders/{id}/`
- Display:
  - Order info (number, date, status)
  - Shipping address
  - Payment method
  - Order items with images, names, quantities, prices
  - Subtotal, discount, delivery charge, total
  - Order tracking status
- Status badge colors
- Error handling for not found

### 3.4 Implement Address Management

**File:** `app/(routes)/address/index.tsx`

**Note:** Backend doesn't have separate address endpoints. Addresses are stored in Customer model's `shipping_address` field as TEXT.

**Implementation:**
- Local storage for multiple addresses (AsyncStorage)
- CRUD operations locally
- On order: use selected address
- Update customer profile `shipping_address` with default/selected address

### 3.5 Implement Personal Info Edit

**File:** `app/(routes)/personal-info/index.tsx`

**Required:**
- Fetch current user data from `/auth/users/me/` with `JWT` token
- Display form with fields:
  - Name
  - Email
  - Phone
  - Shipping Address
  - Gender (Male/Female/Other)
- Update via `PATCH /auth/users/me/` with `JWT` token
- Show success/error messages

### 3.6 Implement Security (Password Change)

**File:** `app/(routes)/security/index.tsx`

**Required:**
- Form fields:
  - Current password
  - New password
  - Confirm new password
- Endpoint: `POST /auth/users/set_password/`
- Headers: `Authorization: JWT {token}`
- Payload: `{current_password, new_password, re_new_password}`

### 3.7 Implement Product Reviews

**Add Review Button in Order Detail:**
- Show "Write Review" button for delivered items
- Navigate to review form
- Endpoint: `POST /api/v1.0/customers/products/{product_id}/reviews/`
- Payload: `{comment, rating, image (optional)}`

**Display Reviews in Product Detail:**
- Fetch from `/api/v1.0/customers/products/{id}/reviews/`
- Show rating, comment, customer name, date
- Image support

### 3.8 Fix Product Detail Page

**File:** `app/screens/product/[id].tsx`

**Issues:**
1. Variant selection default fallback
2. Stock display
3. Add to cart with correct variant_id

**Fixes:**
- Use `product.default_variant` if marked as `is_default: true`
- Display `available_stock` (stock - reserved_stock)
- Check stock before adding to cart
- Show discount badge if `final_price < price`
- Display variant attributes properly

### 3.9 Fix Cart Page

**File:** `app/(tabs)/cart.tsx`

**Issues:**
1. Item display may not match backend structure
2. Delivery charge calculation
3. Total calculation

**Fixes:**
- Ensure cart items display:
  - Variant name (not just product name)
  - Variant image if available
  - Original price and discounted price
  - Attributes (size, color, etc.)
- Delivery charge selection (Inside/Outside Dhaka)
- Total = Subtotal - Discount + Delivery Charge - Coupon Discount
- Update quantity validation (check available_stock)

### 3.10 Fix Checkout Page

**File:** `app/screens/checkout/index.tsx`

**Issues:**
1. Guest checkout fields
2. Authenticated user pre-fill
3. Area selection
4. Payment method

**Fixes:**
- For Guest users:
  - Show fields: Name, Email, Phone, Shipping Address
  - All required
- For Authenticated users:
  - Pre-fill from user profile
  - Allow editing
  - Shipping address required if not in profile
- Area selection: Radio buttons "Inside Dhaka (60 TK)" / "Outside Dhaka (120 TK)"
- Payment method: Radio buttons "Cash on Delivery" / "Online Payment"
- Call `/api/v1.0/customers/orders/` with correct payload
- Handle online payment redirect to `GatewayPageURL`

### 3.11 Fix Shop/Store Pages

**Files:**
- `app/screens/shop/index.tsx`
- `app/screens/store/[id].tsx`
- `app/screens/stores/index.tsx`

**Fixes:**
- Update all product fetch calls to `/api/v1.0/customers/products/`
- Update store list to `/api/v1.0/stores/public/`
- Update store detail to `/api/v1.0/stores/{id}/detail/`
- Update store products to filter by `supplier_product__store={id}`
- Implement pagination (page, page_size)
- Add loading states
- Add empty states

### 3.12 Fix Search Page

**File:** `app/screens/search/index.tsx`

**Fixes:**
- Search endpoint: `/api/v1.0/customers/products/?search={query}`
- Debounce search input
- Show search results
- Show "No results" state
- Clear search functionality

### 3.13 Implement Notifications

**File:** `app/(routes)/notifications/index.tsx`

**Note:** Backend may not have notification endpoint yet.

**Implementation:**
- Mock UI for now
- List view with notification items
- Mark as read functionality
- Empty state

### 3.14 Implement Help & Contact

**Files:**
- `app/(routes)/help/index.tsx`
- `app/(routes)/contact/index.tsx`

**Implementation:**
- FAQ list (static content)
- Contact form (may need backend endpoint)
- Support info display

---

## PART 4: REMOVE UNUSED CODE

### 4.1 Remove Duplicate User Storage

**File:** `hooks/useUser.tsx`

**Issue:** Duplicate user storage mechanism alongside AuthContext

**Action:**
- Remove `useUser` hook entirely
- Update all imports to use `useAuth` from AuthContext
- Remove example components (Lines 104-176)

### 4.2 Remove Unused Components

Search for unused imports and components in:
- `components/` directory
- Incomplete route screens

**Candidates for Removal:**
- Any component not imported anywhere
- Test/example components

### 4.3 Clean Up API Utils

**File:** `utils/api.js`

**Actions:**
- Remove `tryMultipleURLs` pattern - use correct URL from start
- Remove console logs (optional - keep for debugging during dev)
- Remove commented code
- Consolidate response parsing

---

## PART 5: COMPLETE PURCHASE FLOW

### End-to-End Flow Steps:

1. **Browse Products** ✅ (Mostly working)
   - Home screen with products
   - Category browsing
   - Search
   - Product detail

2. **Add to Cart** ⚠️ (Needs fixes)
   - Select variant
   - Check stock
   - Add with correct variant_id
   - Show cart notification

3. **View Cart** ⚠️ (Needs fixes)
   - Display all items
   - Update quantities
   - Remove items
   - Show delivery charge options
   - Calculate totals correctly

4. **Checkout** ⚠️ (Needs major fixes)
   - Guest: Show all fields
   - Authenticated: Pre-fill and allow edit
   - Select delivery area (IN/OUT)
   - Select payment method (COD/OP)
   - Validate required fields

5. **Place Order** ❌ (Broken - wrong payload)
   - Call `/api/v1.0/customers/orders/` with correct structure
   - Handle COD: Navigate to success screen
   - Handle Online Payment: Open payment gateway URL
   - Clear cart on success

6. **Order Success** ✅ (Mostly working)
   - Display order confirmation
   - Show order number
   - Navigate to order detail

7. **Track Orders** ❌ (Not implemented)
   - View order list
   - View order details
   - Track delivery status

8. **Review Products** ❌ (Not implemented)
   - Write review for delivered items
   - View reviews on product page

---

## PART 6: IMPLEMENTATION ORDER

### Phase 1: Critical API Fixes (Day 1)
1. Fix API base URLs (remove `http://https://`)
2. Update all endpoint paths to `/api/v1.0/*`
3. Fix authorization headers (JWT vs Bearer)
4. Fix CartContext `is_guest` logic
5. Update response parsing

### Phase 2: Core Features (Day 2-3)
1. Fix product browsing and detail pages
2. Fix cart operations
3. Fix checkout flow
4. Fix order creation
5. Test complete purchase flow (COD)

### Phase 3: Order Management (Day 4)
1. Implement My Orders list
2. Implement Order Detail screen
3. Add order status tracking
4. Test order history

### Phase 4: User Profile (Day 5)
1. Implement Personal Info edit
2. Implement Password change
3. Implement Address management (local)
4. Fix profile display

### Phase 5: Additional Features (Day 6)
1. Implement Product Reviews
2. Fix Search functionality
3. Implement Help & Contact
4. Clean up unused code

### Phase 6: Testing & Polish (Day 7)
1. End-to-end testing
2. Error handling improvements
3. Loading states
4. Empty states
5. UI polish

---

## PART 7: FILE CHANGES SUMMARY

### Files to Modify:

1. **utils/api.js** - Fix all endpoint paths and headers
2. **context/AuthContext.tsx** - Fix auth flow
3. **context/CartContext.tsx** - Fix checkout payload
4. **context/WishlistContext.tsx** - Fix endpoints
5. **app/(tabs)/profile.tsx** - Fix route typo
6. **app/(tabs)/cart.tsx** - Fix cart display
7. **app/screens/checkout/index.tsx** - Complete rewrite
8. **app/screens/product/[id].tsx** - Fix variant handling
9. **app/(routes)/my-orders/index.tsx** - Implement
10. **app/screens/order-detail/[id].tsx** - Implement
11. **app/(routes)/personal-info/index.tsx** - Implement
12. **app/(routes)/security/index.tsx** - Implement
13. **app/(routes)/address/index.tsx** - Implement
14. **app/screens/shop/index.tsx** - Fix endpoints
15. **app/screens/store/[id].tsx** - Fix endpoints
16. **app/screens/stores/index.tsx** - Fix endpoints
17. **app/screens/search/index.tsx** - Fix search
18. **app/(routes)/notifications/index.tsx** - Implement
19. **app/(routes)/help/index.tsx** - Implement
20. **app/(routes)/contact/index.tsx** - Implement

### Files to Delete:

1. **hooks/useUser.tsx** - Remove duplicate user storage

---

## PART 8: TESTING CHECKLIST

### User Authentication:
- [ ] Register new user
- [ ] Login with email/username
- [ ] Auto-login after registration
- [ ] View profile
- [ ] Update profile
- [ ] Change password
- [ ] Logout

### Product Browsing:
- [ ] View home page
- [ ] View categories
- [ ] View products by category
- [ ] Search products
- [ ] View product detail
- [ ] Select variant
- [ ] View product images
- [ ] View product reviews

### Shopping Cart:
- [ ] Add product to cart (guest)
- [ ] Add product to cart (authenticated)
- [ ] Update quantity
- [ ] Remove item
- [ ] View cart total
- [ ] Select delivery area
- [ ] Calculate delivery charge

### Checkout & Orders:
- [ ] Checkout as guest
- [ ] Checkout as authenticated user
- [ ] Select COD payment
- [ ] Select Online Payment
- [ ] Place order (COD)
- [ ] Place order (Online Payment)
- [ ] View order success
- [ ] View order list
- [ ] View order details
- [ ] Track order status

### Wishlist:
- [ ] Add to wishlist
- [ ] Remove from wishlist
- [ ] View wishlist
- [ ] Add from wishlist to cart

### User Account:
- [ ] View orders
- [ ] View order details
- [ ] Write product review
- [ ] Edit personal info
- [ ] Change password
- [ ] Manage addresses

### Store Features:
- [ ] View stores list
- [ ] View store detail
- [ ] View products by store

---

## PART 9: KNOWN ISSUES TO ADDRESS

1. **Payment Gateway:** Online payment redirects to SSLCommerz - ensure WebView or browser opening works
2. **Image Uploads:** Profile pictures and review images - ensure FormData works
3. **Token Refresh:** Implement refresh token rotation
4. **Network Errors:** Add retry logic and offline handling
5. **Cart Sync:** Multi-device cart sync for authenticated users
6. **Stock Updates:** Real-time stock updates when viewing product
7. **Delivery Tracking:** Integration with SteadFast API for real-time tracking
8. **Push Notifications:** Order status updates via push notifications

---

## PART 10: API REFERENCE (Quick Guide)

### Authentication:
- **Login:** `POST /auth/jwt/create/` - Body: `{username, password}`
- **Register:** `POST /api/v1.0/customers/register/` - Body: `{username, password, name, email, phone}`
- **Profile:** `GET /auth/users/me/` - Header: `Authorization: JWT {token}`

### Products:
- **List:** `GET /api/v1.0/customers/products/` - Query: `page, page_size, search, supplier_product__subcategories, supplier_product__store`
- **Detail:** `GET /api/v1.0/customers/products/{id}/`

### Cart:
- **Create:** `POST /api/v1.0/customers/carts/`
- **Items:** `GET /api/v1.0/customers/carts/{cart_id}/items/`
- **Add Item:** `POST /api/v1.0/customers/carts/{cart_id}/items/` - Body: `{variant_id, quantity}`
- **Update:** `PATCH /api/v1.0/customers/carts/{cart_id}/items/{item_id}/` - Body: `{quantity}`
- **Remove:** `DELETE /api/v1.0/customers/carts/{cart_id}/items/{item_id}/`

### Orders:
- **Create:** `POST /api/v1.0/customers/orders/` - Body: `{cart_id, payment_method, area, name, email, phone, shipping_address}` (guest fields required if not authenticated)
- **List:** `GET /api/v1.0/customers/orders/` - Header: `Authorization: Bearer {token}`
- **Detail:** `GET /api/v1.0/customers/orders/{id}/` - Header: `Authorization: Bearer {token}`

### Wishlist:
- **List:** `GET /api/v1.0/customers/favorite-products/` - Header: `Authorization: Bearer {token}`
- **Add:** `POST /api/v1.0/customers/favorite-products/` - Body: `{product, is_favorite}` - Header: `Authorization: Bearer {token}`
- **Remove:** `DELETE /api/v1.0/customers/favorite-products/{id}/` - Header: `Authorization: Bearer {token}`

### Stores:
- **List:** `GET /api/v1.0/stores/public/`
- **Detail:** `GET /api/v1.0/stores/{id}/detail/`

### Categories:
- **List:** `GET /api/v1.0/stores/categories/?pagination=0`

---

## CONCLUSION

This plan provides a comprehensive roadmap to align the mobile app with the Frontend and Backend. All API endpoints, data structures, and flows are documented based on actual Backend code and Frontend implementation.

**Estimated Time:** 7 days with focused development
**Priority:** Fix API endpoints first (Phase 1), then complete purchase flow (Phase 2-3)
