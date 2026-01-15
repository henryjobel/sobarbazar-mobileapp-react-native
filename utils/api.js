// utils/api.js
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || "https://api.hetdcl.com";
const AUTH_URL = Constants.expoConfig?.extra?.authApiUrl || "https://api.hetdcl.com";

// Helper function for headers
const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper to parse API response
const parseResponse = async (response) => {
  try {
    const text = await response.text();
    
    // Debug log
    console.log("📦 Raw Response:", text.substring(0, 300));
    
    if (!text) {
      return null;
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.log("❌ Parse Error:", error);
    return null;
  }
};

// Debug function to test API
export async function testApiConnection() {
  console.log("🔍 Testing API Connection...");
  console.log("🔗 BASE_URL:", BASE_URL);
  
  const testUrls = [
    `${BASE_URL}/api/v1.0/customers/products/?limit=5`,
    `${BASE_URL}/api/v1.0/stores/categories/`,
    `${BASE_URL}/api/v1.0/base/home-page-data/`
  ];
  
  for (const url of testUrls) {
    console.log("\n📡 Testing URL:", url);
    try {
      const response = await fetch(url);
      console.log("📊 Status:", response.status);
      
      const data = await parseResponse(response);
      if (data) {
        console.log("✅ Response keys:", Object.keys(data));
        console.log("✅ Response structure:", data);
      }
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
}

// ==================== AUTH APIs ====================
export async function loginUser(email, password) {
  const url = `${AUTH_URL}/auth/jwt/create/`;
  
  console.log("🔐 Login URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    console.log("📊 Login Status:", res.status);
    
    if (!res.ok) {
      const errorData = await parseResponse(res);
      console.log("❌ Login Failed:", errorData);
      throw new Error(errorData?.detail || 'Login failed');
    }
    
    const data = await parseResponse(res);
    console.log("✅ Login Success:", data ? 'Token received' : 'No data');
    return data;
  } catch (err) {
    console.log("❌ Login Error:", err.message);
    return null;
  }
}

export async function registerUser(userData) {
  const url = `${BASE_URL}/api/v1.0/customers/register/`;
  
  console.log("📝 Register URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    
    console.log("📊 Register Status:", res.status);
    
    const data = await parseResponse(res);
    console.log("✅ Register Response:", data);
    return data;
  } catch (err) {
    console.log("❌ Register Error:", err.message);
    return null;
  }
}

// ==================== PRODUCT APIs ====================
export async function getProducts(page = 1, limit = 20, category = null, search = null) {
  let url = `${BASE_URL}/api/v1.0/customers/products/`;
  
  // Build query parameters
  const params = new URLSearchParams();
  params.append('pagination', '1');
  params.append('page', page.toString());
  params.append('page_size', limit.toString());
  
  if (category) {
    params.append('category', category);
  }
  
  if (search) {
    params.append('search', search);
  }
  
  url += `?${params.toString()}`;
  
  console.log("🛍️ Products URL:", url);
  
  try {
    const res = await fetch(url);
    
    console.log("📊 Products Status:", res.status);
    
    if (!res.ok) {
      console.log("❌ Products API Failed");
      return [];
    }
    
    const json = await parseResponse(res);
    
    // Check different response structures
    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} products in 'data'`);
      return json.data;
    } else if (json && json.results) {
      console.log(`✅ Found ${json.results.length} products in 'results'`);
      return json.results;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} products in array`);
      return json;
    } else {
      console.log("⚠️ No products found in response");
      console.log("📊 Full response:", json);
      return [];
    }
  } catch (err) {
    console.log("❌ Products Error:", err.message);
    return [];
  }
}

export async function getProductById(id) {
  const url = `${BASE_URL}/api/v1.0/customers/products/${id}/`;

  console.log("🔍 Product Detail URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Product Detail Status:", res.status);

    if (!res.ok) {
      throw new Error('Product not found');
    }

    const json = await parseResponse(res);
    console.log("✅ Product Detail Response:", json ? 'Received' : 'No data');

    // Handle response structure - could be {success, data} or direct object
    if (json && json.success && json.data) {
      return json.data;
    } else if (json && json.data) {
      return json.data;
    }
    return json;
  } catch (err) {
    console.log("❌ Product Detail Error:", err.message);
    return null;
  }
}

// Get products by category
export async function getProductsByCategory(categoryId, page = 1, limit = 20) {
  return getProducts(page, limit, categoryId);
}

// Search products
export async function searchProducts(query, page = 1, limit = 20) {
  return getProducts(page, limit, null, query);
}

// ==================== CATEGORY APIs ====================
export async function getCategories() {
  const url = `${BASE_URL}/api/v1.0/stores/categories/?pagination=0`;
  
  console.log("📂 Categories URL:", url);
  
  try {
    const res = await fetch(url);
    
    console.log("📊 Categories Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const json = await parseResponse(res);
    
    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} categories in 'data'`);
      return json.data;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} categories in array`);
      return json;
    } else {
      console.log("⚠️ No categories found");
      return [];
    }
  } catch (err) {
    console.log("❌ Categories Error:", err.message);
    return [];
  }
}

export async function getSubCategories(categoryId) {
  const url = `${BASE_URL}/api/v1.0/stores/subcategories/${categoryId}/`;
  
  console.log("📂 SubCategories URL:", url);
  
  try {
    const res = await fetch(url);
    
    console.log("📊 SubCategories Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch subcategories');
    }
    
    const json = await parseResponse(res);
    
    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} subcategories in 'data'`);
      return json.data;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} subcategories in array`);
      return json;
    } else {
      console.log("⚠️ No subcategories found");
      return [];
    }
  } catch (err) {
    console.log("❌ SubCategories Error:", err.message);
    return [];
  }
}

// ==================== CART APIs ====================
export async function getCart(token) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/`;
  
  console.log("🛒 Cart URL:", url);
  
  try {
    const res = await fetch(url, {
      headers: getHeaders(token),
    });
    
    console.log("📊 Cart Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch cart');
    }
    
    const data = await parseResponse(res);
    console.log("✅ Cart Response:", data ? 'Received' : 'No data');
    return data;
  } catch (err) {
    console.log("❌ Cart Error:", err.message);
    return null;
  }
}

export async function addToCart(productId, quantity, token) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/`;
  
  console.log("➕ Add to Cart URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        product: productId,
        quantity: quantity,
      }),
    });
    
    console.log("📊 Add to Cart Status:", res.status);
    
    const data = await parseResponse(res);
    console.log("✅ Add to Cart Response:", data);
    return data;
  } catch (err) {
    console.log("❌ Add to Cart Error:", err.message);
    return null;
  }
}

export async function updateCartItem(cartItemId, quantity, token) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/items/${cartItemId}/`;
  
  console.log("✏️ Update Cart URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ quantity }),
    });
    
    console.log("📊 Update Cart Status:", res.status);
    
    const data = await parseResponse(res);
    console.log("✅ Update Cart Response:", data);
    return data;
  } catch (err) {
    console.log("❌ Update Cart Error:", err.message);
    return null;
  }
}

export async function removeFromCart(cartItemId, token) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/items/${cartItemId}/`;
  
  console.log("🗑️ Remove from Cart URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    
    console.log("📊 Remove from Cart Status:", res.status);
    
    return res.ok;
  } catch (err) {
    console.log("❌ Remove from Cart Error:", err.message);
    return false;
  }
}

// ==================== ORDER APIs ====================
export async function createOrder(orderData, token) {
  const url = `${BASE_URL}/api/v1.0/customers/orders/`;
  
  console.log("📦 Create Order URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(orderData),
    });
    
    console.log("📊 Create Order Status:", res.status);
    
    const data = await parseResponse(res);
    console.log("✅ Create Order Response:", data);
    return data;
  } catch (err) {
    console.log("❌ Create Order Error:", err.message);
    return null;
  }
}

export async function getOrders(token) {
  const url = `${BASE_URL}/api/v1.0/customers/orders/`;
  
  console.log("📋 Orders URL:", url);
  
  try {
    const res = await fetch(url, {
      headers: getHeaders(token),
    });
    
    console.log("📊 Orders Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const json = await parseResponse(res);
    
    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} orders in 'data'`);
      return json.data;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} orders in array`);
      return json;
    } else {
      console.log("⚠️ No orders found");
      return [];
    }
  } catch (err) {
    console.log("❌ Orders Error:", err.message);
    return [];
  }
}

export async function getOrderById(orderId, token) {
  const url = `${BASE_URL}/api/v1.0/customers/orders/${orderId}/`;
  
  console.log("🔍 Order Detail URL:", url);
  
  try {
    const res = await fetch(url, {
      headers: getHeaders(token),
    });
    
    console.log("📊 Order Detail Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Order not found');
    }
    
    const data = await parseResponse(res);
    console.log("✅ Order Detail Response:", data ? 'Received' : 'No data');
    return data;
  } catch (err) {
    console.log("❌ Order Detail Error:", err.message);
    return null;
  }
}

// ==================== FAVORITE APIs ====================
export async function getFavorites(token) {
  const url = `${BASE_URL}/api/v1.0/customers/favorite-products/`;
  
  console.log("❤️ Favorites URL:", url);
  
  try {
    const res = await fetch(url, {
      headers: getHeaders(token),
    });
    
    console.log("📊 Favorites Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch favorites');
    }
    
    const json = await parseResponse(res);
    
    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} favorites in 'data'`);
      return json.data;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} favorites in array`);
      return json;
    } else {
      console.log("⚠️ No favorites found");
      return [];
    }
  } catch (err) {
    console.log("❌ Favorites Error:", err.message);
    return [];
  }
}

export async function addToFavorites(productId, token) {
  const url = `${BASE_URL}/api/v1.0/customers/favorite-products/`;
  
  console.log("➕ Add Favorite URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ product: productId }),
    });
    
    console.log("📊 Add Favorite Status:", res.status);
    
    const data = await parseResponse(res);
    console.log("✅ Add Favorite Response:", data);
    return data;
  } catch (err) {
    console.log("❌ Add Favorite Error:", err.message);
    return null;
  }
}

export async function removeFromFavorites(favoriteId, token) {
  const url = `${BASE_URL}/api/v1.0/customers/favorite-products/${favoriteId}/`;
  
  console.log("🗑️ Remove Favorite URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    
    console.log("📊 Remove Favorite Status:", res.status);
    
    return res.ok;
  } catch (err) {
    console.log("❌ Remove Favorite Error:", err.message);
    return false;
  }
}

// ==================== HOME & BASE APIs ====================
export async function getHomePageData() {
  const url = `${BASE_URL}/api/v1.0/base/home-page-data/`;

  console.log("🏠 Home Page URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Home Page Status:", res.status);

    if (!res.ok) {
      throw new Error('Failed to fetch home page data');
    }

    const data = await parseResponse(res);
    console.log("✅ Home Page Response:", data ? 'Received' : 'No data');
    return data;
  } catch (err) {
    console.log("❌ Home Page Error:", err.message);
    return null;
  }
}

export async function getNavbarData() {
  const url = `${BASE_URL}/api/v1.0/base/navbar-data/`;

  console.log("📋 Navbar URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Navbar Status:", res.status);

    if (!res.ok) {
      throw new Error('Failed to fetch navbar data');
    }

    const data = await parseResponse(res);
    console.log("✅ Navbar Response:", data ? 'Received' : 'No data');
    return data;
  } catch (err) {
    console.log("❌ Navbar Error:", err.message);
    return null;
  }
}

// ==================== PRODUCT REVIEWS APIs ====================
export async function getProductReviews(productId) {
  const url = `${BASE_URL}/api/v1.0/customers/products/${productId}/reviews/`;

  console.log("⭐ Product Reviews URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Reviews Status:", res.status);

    if (!res.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const json = await parseResponse(res);

    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} reviews in 'data'`);
      return json.data;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} reviews in array`);
      return json;
    } else {
      console.log("⚠️ No reviews found");
      return [];
    }
  } catch (err) {
    console.log("❌ Reviews Error:", err.message);
    return [];
  }
}

export async function createProductReview(productId, reviewData, token) {
  const url = `${BASE_URL}/api/v1.0/customers/products/${productId}/reviews/`;

  console.log("✍️ Create Review URL:", url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(reviewData),
    });

    console.log("📊 Create Review Status:", res.status);

    const data = await parseResponse(res);
    console.log("✅ Create Review Response:", data);
    return data;
  } catch (err) {
    console.log("❌ Create Review Error:", err.message);
    return null;
  }
}

// ==================== FLASH DEALS / DISCOUNTED PRODUCTS ====================
export async function getFlashDeals() {
  // Products with discounts - we can filter for products that have discount
  const url = `${BASE_URL}/api/v1.0/customers/products/?pagination=1&page=1&page_size=20`;

  console.log("⚡ Flash Deals URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Flash Deals Status:", res.status);

    if (!res.ok) {
      throw new Error('Failed to fetch flash deals');
    }

    const json = await parseResponse(res);

    let products = [];
    if (json && json.data && json.data.results) {
      products = json.data.results;
    } else if (json && json.data) {
      products = json.data;
    } else if (json && json.results) {
      products = json.results;
    } else if (Array.isArray(json)) {
      products = json;
    }

    // Filter products with discounts
    const flashDeals = products.filter(product => {
      const variant = product.default_variant;
      if (variant && variant.discount) {
        return true;
      }
      // Check if sale price is less than original price
      if (variant && variant.final_price && variant.price && variant.final_price < variant.price) {
        return true;
      }
      return false;
    });

    console.log(`✅ Found ${flashDeals.length} flash deals`);
    return flashDeals;
  } catch (err) {
    console.log("❌ Flash Deals Error:", err.message);
    return [];
  }
}

// ==================== DELIVERY CHARGES ====================
export async function getDeliveryCharges() {
  // This would typically come from an API endpoint
  // Based on backend, delivery charges are stored in DeliveryCharge model
  // For now, return static values that match the backend
  return {
    inside_dhaka: 60,
    outside_dhaka: 120,
  };
}

export async function getDashboardData() {
  const url = `${BASE_URL}/api/v1.0/base/dashboard-data/`;
  
  console.log("📊 Dashboard URL:", url);
  
  try {
    const res = await fetch(url);
    
    console.log("📊 Dashboard Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    const data = await parseResponse(res);
    console.log("✅ Dashboard Response:", data ? 'Received' : 'No data');
    return data;
  } catch (err) {
    console.log("❌ Dashboard Error:", err.message);
    return null;
  }
}

// ==================== STORE APIs ====================
export async function getStores() {
  const url = `${BASE_URL}/api/v1.0/customers/products/stores_list/`;

  console.log("🏪 Stores URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Stores Status:", res.status);

    if (!res.ok) {
      throw new Error('Failed to fetch stores');
    }

    const json = await parseResponse(res);

    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} stores in 'data'`);
      return json.data;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} stores in array`);
      return json;
    } else {
      console.log("⚠️ No stores found");
      return [];
    }
  } catch (err) {
    console.log("❌ Stores Error:", err.message);
    return [];
  }
}

export async function getStoreById(storeId) {
  const url = `${BASE_URL}/api/v1.0/customers/products/stores_list/${storeId}/`;

  console.log("🏪 Store Detail URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Store Detail Status:", res.status);

    if (!res.ok) {
      throw new Error('Store not found');
    }

    const json = await parseResponse(res);
    console.log("✅ Store Detail Response:", json ? 'Received' : 'No data');

    // Handle response structure
    if (json && json.success && json.data) {
      return json.data;
    } else if (json && json.data) {
      return json.data;
    }
    return json;
  } catch (err) {
    console.log("❌ Store Detail Error:", err.message);
    return null;
  }
}

export async function getStoreProducts(storeId, page = 1, limit = 20) {
  const url = `${BASE_URL}/api/v1.0/customers/products/?store=${storeId}&pagination=1&page=${page}&page_size=${limit}`;

  console.log("🛍️ Store Products URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Store Products Status:", res.status);

    if (!res.ok) {
      throw new Error('Failed to fetch store products');
    }

    const json = await parseResponse(res);

    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} store products in 'data'`);
      return json.data;
    } else if (json && json.results) {
      console.log(`✅ Found ${json.results.length} store products in 'results'`);
      return json.results;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} store products in array`);
      return json;
    } else {
      console.log("⚠️ No store products found");
      return [];
    }
  } catch (err) {
    console.log("❌ Store Products Error:", err.message);
    return [];
  }
}

export async function getBrands() {
  const url = `${BASE_URL}/api/v1.0/stores/brands/?pagination=0`;
  
  console.log("🏷️ Brands URL:", url);
  
  try {
    const res = await fetch(url);
    
    console.log("📊 Brands Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch brands');
    }
    
    const json = await parseResponse(res);
    
    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} brands in 'data'`);
      return json.data;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} brands in array`);
      return json;
    } else {
      console.log("⚠️ No brands found");
      return [];
    }
  } catch (err) {
    console.log("❌ Brands Error:", err.message);
    return [];
  }
}

// ==================== PAYMENT APIs ====================
export async function getPaymentMethods() {
  const url = `${BASE_URL}/api/v1.0/customers/payment-methods/`;
  
  console.log("💳 Payment Methods URL:", url);
  
  try {
    const res = await fetch(url);
    
    console.log("📊 Payment Methods Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch payment methods');
    }
    
    const json = await parseResponse(res);
    
    if (json && json.data) {
      console.log(`✅ Found ${json.data.length} payment methods in 'data'`);
      return json.data;
    } else if (Array.isArray(json)) {
      console.log(`✅ Found ${json.length} payment methods in array`);
      return json;
    } else {
      console.log("⚠️ No payment methods found");
      return [];
    }
  } catch (err) {
    console.log("❌ Payment Methods Error:", err.message);
    return [];
  }
}

// ==================== USER PROFILE APIs ====================
export async function getUserProfile(token) {
  const url = `${AUTH_URL}/auth/users/me/`;
  
  console.log("👤 User Profile URL:", url);
  
  try {
    const res = await fetch(url, {
      headers: getHeaders(token),
    });
    
    console.log("📊 User Profile Status:", res.status);
    
    if (!res.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const data = await parseResponse(res);
    console.log("✅ User Profile Response:", data ? 'Received' : 'No data');
    return data;
  } catch (err) {
    console.log("❌ User Profile Error:", err.message);
    return null;
  }
}

export async function updateUserProfile(userData, token) {
  const url = `${AUTH_URL}/auth/users/me/`;
  
  console.log("✏️ Update Profile URL:", url);
  
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(userData),
    });
    
    console.log("📊 Update Profile Status:", res.status);
    
    const data = await parseResponse(res);
    console.log("✅ Update Profile Response:", data);
    return data;
  } catch (err) {
    console.log("❌ Update Profile Error:", err.message);
    return null;
  }
}

// Export all functions
export default {
  // Test
  testApiConnection,
  
  // Auth
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  
  // Products
  getProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  
  // Categories
  getCategories,
  getSubCategories,
  
  // Cart
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  
  // Orders
  createOrder,
  getOrders,
  getOrderById,
  
  // Favorites
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  
  // Home & Base
  getHomePageData,
  getNavbarData,
  getDashboardData,

  // Store
  getStores,
  getStoreById,
  getStoreProducts,
  getBrands,

  // Reviews
  getProductReviews,
  createProductReview,

  // Flash Deals
  getFlashDeals,

  // Delivery
  getDeliveryCharges,

  // Payment
  getPaymentMethods,
};