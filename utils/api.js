// utils/api.js
import Constants from "expo-constants";

// IMPORTANT: Change this to your local backend URL when testing locally
// For local development: "http://10.0.2.2:8000" (Android emulator) or "https://api.hetdcl.com" (iOS simulator)
// For production: "https://api.hetdcl.com"
const BASE_URL = Constants.expoConfig?.extra?.apiUrl || "https://api.hetdcl.com";
const AUTH_URL = Constants.expoConfig?.extra?.authApiUrl || "https://api.hetdcl.com";

// Helper function for headers
const getHeaders = (token = null, useJWT = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    // Use JWT for auth endpoints, Bearer for all others
    headers['Authorization'] = useJWT ? `JWT ${token}` : `Bearer ${token}`;
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
    `${BASE_URL}/api/customer/products/?page_size=5`,
    `${BASE_URL}/api/store/categories/`,
    `${BASE_URL}/api/store/public/`
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
  console.log("🔐 Login Email:", email);

  try {
    // Try with username field first (Django default)
    let res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username: email, password }),
    });

    console.log("📊 Login Status (username):", res.status);

    // If username login fails, try with email field
    if (!res.ok) {
      console.log("🔄 Trying with email field...");
      res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      console.log("📊 Login Status (email):", res.status);
    }

    if (!res.ok) {
      const errorData = await parseResponse(res);
      console.log("❌ Login Failed:", errorData);

      // Parse error messages
      let errorMessage = 'Invalid email or password';
      if (errorData) {
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        } else if (errorData.email) {
          errorMessage = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.password) {
          errorMessage = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
        } else if (errorData.username) {
          errorMessage = Array.isArray(errorData.username) ? errorData.username[0] : errorData.username;
        }
      }
      throw new Error(errorMessage);
    }

    const data = await parseResponse(res);
    console.log("✅ Login Raw Response:", JSON.stringify(data).substring(0, 200));

    // Extract tokens from various response structures
    let accessToken = null;
    let refreshToken = null;

    // Structure 1: {success: true, data: {access, refresh}}
    if (data && data.success && data.data && data.data.access) {
      console.log("✅ Tokens from data.data");
      accessToken = data.data.access;
      refreshToken = data.data.refresh;
    }
    // Structure 2: {data: {access, refresh}}
    else if (data && data.data && data.data.access) {
      console.log("✅ Tokens from data.data (no success flag)");
      accessToken = data.data.access;
      refreshToken = data.data.refresh;
    }
    // Structure 3: {access, refresh} directly
    else if (data && data.access) {
      console.log("✅ Tokens directly in response");
      accessToken = data.access;
      refreshToken = data.refresh;
    }

    if (accessToken) {
      console.log("✅ Login Success - Access token obtained");
      return {
        access: accessToken,
        refresh: refreshToken,
      };
    }

    console.log("⚠️ Unexpected response structure:", JSON.stringify(data));
    throw new Error('Invalid response from server');
  } catch (err) {
    console.log("❌ Login Error:", err.message);
    throw err; // Re-throw to let caller handle
  }
}

export async function registerUser(userData) {
  const url = `${BASE_URL}/api/v1.0/customers/register/`;

  console.log("📝 Register URL:", url);

  try {
    // Transform frontend data to match backend expectations
    // Backend expects: username, password, name, email, phone, shipping_address, gender
    const registerData = {
      username: userData.email, // Use email as username
      password: userData.password,
      name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      email: userData.email,
      phone: userData.phone,
      shipping_address: userData.shipping_address || '',
      gender: userData.gender || null,
    };

    console.log("📝 Register Data:", { ...registerData, password: '***' });

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(registerData),
    });

    console.log("📊 Register Status:", res.status);

    const data = await parseResponse(res);
    console.log("📝 Register Raw Response:", JSON.stringify(data).substring(0, 300));

    if (!res.ok) {
      console.log("❌ Register Failed:", data);

      // Parse error messages from various formats
      let errorMessage = 'Registration failed';
      if (data) {
        if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.username) {
          errorMessage = Array.isArray(data.username) ? data.username[0] : data.username;
        } else if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.phone) {
          errorMessage = Array.isArray(data.phone) ? data.phone[0] : data.phone;
        } else if (data.password) {
          errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        }
      }
      throw new Error(errorMessage);
    }

    console.log("✅ Register Success");

    // After successful registration, auto-login the user
    try {
      console.log("🔄 Auto-login after registration...");
      const loginResponse = await loginUser(registerData.username, registerData.password);
      if (loginResponse && loginResponse.access) {
        console.log("✅ Auto-login successful");
        return {
          user: data.data || data,
          access: loginResponse.access,
          refresh: loginResponse.refresh,
        };
      }
    } catch (loginErr) {
      console.log("⚠️ Auto-login failed, returning registration data:", loginErr.message);
    }

    // Return registration data if auto-login fails
    if (data && data.success && data.data) {
      return data.data;
    }
    return data;
  } catch (err) {
    console.log("❌ Register Error:", err.message);
    throw err; // Re-throw to let the caller handle it
  }
}

// ==================== PRODUCT APIs ====================
export async function getProducts(page = 1, limit = 20, category = null, search = null, brand = null, store = null) {
  let url = `${BASE_URL}/api/v1.0/customers/products/`;

  // Build query parameters
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', limit.toString());

  if (category) {
    params.append('supplier_product__subcategories__category', category);
  }

  if (search) {
    params.append('search', search);
  }

  if (brand) {
    params.append('supplier_product__brand_or_company', brand);
  }

  if (store) {
    params.append('supplier_product__store', store);
  }

  url += `?${params.toString()}`;

  console.log("🛍️ Products URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Products Status:", res.status);

    if (!res.ok) {
      console.log("❌ Products API Failed with status:", res.status);
      return { results: [], count: 0, pages: 0 };
    }

    const json = await parseResponse(res);
    console.log("🛍️ Products Raw:", JSON.stringify(json).substring(0, 400));

    let products = [];
    let totalCount = 0;

    // Check various response structures and extract count
    // Structure 1: {success: true, data: {results: [...], count: N}}
    if (json && json.success && json.data && json.data.results && Array.isArray(json.data.results)) {
      products = json.data.results;
      totalCount = json.data.count || json.count || products.length;
      console.log(`✅ Found ${products.length} products in 'data.results'`);
    }
    // Structure 2: {success: true, data: [...]}
    else if (json && json.success && json.data && Array.isArray(json.data)) {
      products = json.data;
      totalCount = json.count || products.length;
      console.log(`✅ Found ${products.length} products in 'data' (array)`);
    }
    // Structure 3: {data: {results: [...], count: N}}
    else if (json && json.data && json.data.results && Array.isArray(json.data.results)) {
      products = json.data.results;
      totalCount = json.data.count || json.count || products.length;
      console.log(`✅ Found ${products.length} products in 'data.results' (no success)`);
    }
    // Structure 4: {data: [...]}
    else if (json && json.data && Array.isArray(json.data)) {
      products = json.data;
      totalCount = json.count || products.length;
      console.log(`✅ Found ${products.length} products in 'data'`);
    }
    // Structure 5: {results: [...], count: N} - Django REST Framework pagination
    else if (json && json.results && Array.isArray(json.results)) {
      products = json.results;
      totalCount = json.count || products.length;
      console.log(`✅ Found ${products.length} products in 'results'`);
    }
    // Structure 6: Direct array
    else if (Array.isArray(json)) {
      products = json;
      totalCount = products.length;
      console.log(`✅ Found ${products.length} products in direct array`);
    }

    if (products.length === 0) {
      console.log("⚠️ No products found in response");
    }

    // ALWAYS return normalized structure
    const totalPages = Math.ceil(totalCount / limit);
    console.log(`📦 Returning ${products.length} products, total: ${totalCount}, pages: ${totalPages}`);

    return {
      results: products,
      count: totalCount,
      pages: totalPages
    };
  } catch (err) {
    console.log("❌ Products Error:", err.message);
    return { results: [], count: 0, pages: 0 };
  }
}

export async function getProductById(id) {
  const url = `${BASE_URL}/api/v1.0/customers/products/${id}/`;

  console.log("🔍 Product Detail URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Product Detail Status:", res.status);

    if (!res.ok) {
      console.log("❌ Product Detail API failed with status:", res.status);
      return null;
    }

    const json = await parseResponse(res);
    console.log("🔍 Product Detail Raw:", JSON.stringify(json).substring(0, 400));

    let product = null;

    // Check various response structures
    // Structure 1: {success: true, data: {...}}
    if (json && json.success && json.data && json.data.id) {
      product = json.data;
      console.log("✅ Product from data (success)");
    }
    // Structure 2: {data: {...}}
    else if (json && json.data && json.data.id) {
      product = json.data;
      console.log("✅ Product from data");
    }
    // Structure 3: Direct product object
    else if (json && json.id) {
      product = json;
      console.log("✅ Product directly in response");
    }

    if (product) {
      return product;
    }

    console.log("⚠️ Product not found in response");
    return null;
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
  // Try multiple URL patterns
  const urls = [
    `${BASE_URL}/api/v1.0/stores/categories/?pagination=0`,
    `${BASE_URL}/api/v1.0/base/categories/`,
  ];

  for (const url of urls) {
    console.log("📂 Trying Categories URL:", url);

    try {
      const res = await fetch(url);

      console.log("📊 Categories Status:", res.status);

      if (!res.ok) {
        console.log("❌ URL failed, trying next...");
        continue;
      }

      const json = await parseResponse(res);
      console.log("📂 Categories Raw:", JSON.stringify(json).substring(0, 300));

      let categories = [];

      // Check various response structures
      // Structure 1: {success: true, data: [...]}
      if (json && json.success && json.data && Array.isArray(json.data)) {
        categories = json.data;
      }
      // Structure 2: {data: [...]}
      else if (json && json.data && Array.isArray(json.data)) {
        categories = json.data;
      }
      // Structure 3: {data: {results: [...]}}
      else if (json && json.data && json.data.results && Array.isArray(json.data.results)) {
        categories = json.data.results;
      }
      // Structure 4: {results: [...]}
      else if (json && json.results && Array.isArray(json.results)) {
        categories = json.results;
      }
      // Structure 5: Direct array
      else if (Array.isArray(json)) {
        categories = json;
      }

      if (categories.length > 0) {
        console.log(`✅ Found ${categories.length} categories`);
        return categories;
      }
    } catch (err) {
      console.log("❌ Categories Error:", err.message);
    }
  }

  console.log("⚠️ No categories found from any URL");
  return [];
}

export async function getSubCategories(categoryId) {
  // Try multiple URL patterns
  const urls = [
    `${BASE_URL}/api/v1.0/stores/subcategories/?category=${categoryId}`,
  ];

  for (const url of urls) {
    console.log("📂 Trying SubCategories URL:", url);

    try {
      const res = await fetch(url);

      console.log("📊 SubCategories Status:", res.status);

      if (!res.ok) {
        console.log("❌ URL failed, trying next...");
        continue;
      }

      const json = await parseResponse(res);
      console.log("📂 SubCategories Raw:", JSON.stringify(json).substring(0, 300));

      let subcategories = [];

      // Check various response structures
      if (json && json.success && json.data && Array.isArray(json.data)) {
        subcategories = json.data;
      } else if (json && json.data && Array.isArray(json.data)) {
        subcategories = json.data;
      } else if (json && json.results && Array.isArray(json.results)) {
        subcategories = json.results;
      } else if (Array.isArray(json)) {
        subcategories = json;
      }

      if (subcategories.length > 0) {
        console.log(`✅ Found ${subcategories.length} subcategories`);
        return subcategories;
      }
    } catch (err) {
      console.log("❌ SubCategories Error:", err.message);
    }
  }

  console.log("⚠️ No subcategories found from any URL");
  return [];
}

export async function getBrands() {
  // Try multiple URL patterns
  const urls = [
    `${BASE_URL}/api/v1.0/stores/brands/`,
    `${BASE_URL}/api/v1.0/stores/brands/?pagination=0`,
  ];

  for (const url of urls) {
    console.log("🏷️ Trying Brands URL:", url);

    try {
      const res = await fetch(url);

      console.log("📊 Brands Status:", res.status);

      if (!res.ok) {
        console.log("❌ URL failed, trying next...");
        continue;
      }

      const json = await parseResponse(res);
      console.log("🏷️ Brands Raw:", JSON.stringify(json).substring(0, 300));

      let brands = [];

      // Check various response structures
      if (json && json.success && json.data && Array.isArray(json.data)) {
        brands = json.data;
      } else if (json && json.data && Array.isArray(json.data)) {
        brands = json.data;
      } else if (json && json.data && json.data.results && Array.isArray(json.data.results)) {
        brands = json.data.results;
      } else if (json && json.results && Array.isArray(json.results)) {
        brands = json.results;
      } else if (Array.isArray(json)) {
        brands = json;
      }

      if (brands.length > 0) {
        console.log(`✅ Found ${brands.length} brands`);
        return brands;
      }
    } catch (err) {
      console.log("❌ Brands Error:", err.message);
    }
  }

  console.log("⚠️ No brands found from any URL");
  return [];
}

// ==================== CART APIs ====================
// Backend cart system uses UUID-based cart_id
// Cart items require variant_id (not product_id)

// Create a new cart
export async function createCart() {
  const url = `${BASE_URL}/api/v1.0/customers/carts/`;

  console.log("🛒 Create Cart URL:", url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
    });

    console.log("📊 Create Cart Status:", res.status);

    if (!res.ok) {
      const errorData = await parseResponse(res);
      console.log("❌ Create Cart Failed:", errorData);
      throw new Error('Failed to create cart');
    }

    const json = await parseResponse(res);
    console.log("✅ Create Cart Raw Response:", JSON.stringify(json).substring(0, 300));

    // Normalize response
    let cart = null;
    if (json && json.success && json.data && json.data.id) {
      cart = json.data;
    } else if (json && json.data && json.data.id) {
      cart = json.data;
    } else if (json && json.id) {
      cart = json;
    }

    if (cart) {
      cart.items = cart.items || [];
      console.log(`✅ Created Cart: id=${cart.id}`);
    }

    return cart;
  } catch (err) {
    console.log("❌ Create Cart Error:", err.message);
    return null;
  }
}

// Get all carts (to find existing cart)
export async function getCarts() {
  const url = `${BASE_URL}/api/v1.0/customers/carts/`;

  console.log("🛒 Get Carts URL:", url);

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
    });

    console.log("📊 Get Carts Status:", res.status);

    if (!res.ok) {
      console.log("❌ Get Carts Failed with status:", res.status);
      return [];
    }

    const json = await parseResponse(res);
    console.log("✅ Get Carts Raw Response:", JSON.stringify(json).substring(0, 300));

    // Normalize response - extract carts array from various structures
    let carts = [];

    // Structure 1: {success: true, data: [...]}
    if (json && json.success && json.data && Array.isArray(json.data)) {
      carts = json.data;
    }
    // Structure 2: {data: [...]}
    else if (json && json.data && Array.isArray(json.data)) {
      carts = json.data;
    }
    // Structure 3: {results: [...]} (paginated)
    else if (json && json.results && Array.isArray(json.results)) {
      carts = json.results;
    }
    // Structure 4: Direct array [...]
    else if (Array.isArray(json)) {
      carts = json;
    }

    // Normalize each cart
    carts = carts.map(cart => ({
      ...cart,
      items: cart.items || []
    }));

    console.log(`✅ Found ${carts.length} carts`);
    return carts;
  } catch (err) {
    console.log("❌ Get Carts Error:", err.message);
    return [];
  }
}

// Get cart by ID
export async function getCart(cartId) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/${cartId}/`;

  console.log("🛒 Get Cart URL:", url);

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
    });

    console.log("📊 Get Cart Status:", res.status);

    if (!res.ok) {
      console.log("❌ Get Cart Failed with status:", res.status);
      return null;
    }

    const json = await parseResponse(res);
    console.log("✅ Get Cart Raw Response:", JSON.stringify(json).substring(0, 500));

    // Normalize response - extract cart data from various response structures
    let cart = null;

    // Structure 1: {success: true, data: {id: ..., items: [...]}}
    if (json && json.success && json.data && json.data.id) {
      cart = json.data;
    }
    // Structure 2: {data: {id: ..., items: [...]}}
    else if (json && json.data && json.data.id) {
      cart = json.data;
    }
    // Structure 3: Direct object {id: ..., items: [...]}
    else if (json && json.id) {
      cart = json;
    }

    if (cart) {
      // Ensure items array exists
      cart.items = cart.items || [];
      console.log(`✅ Normalized Cart: id=${cart.id}, items=${cart.items.length}`);
    } else {
      console.log("⚠️ Could not extract cart from response");
    }

    return cart;
  } catch (err) {
    console.log("❌ Get Cart Error:", err.message);
    return null;
  }
}

// Get or create cart - helper function
export async function getOrCreateCart() {
  console.log("🛒 Getting or creating cart...");

  try {
    // First try to get existing carts
    const carts = await getCarts();

    if (carts && carts.length > 0) {
      // Return the most recent cart (first one)
      console.log("✅ Found existing cart:", carts[0].id);
      return carts[0];
    }

    // No existing cart, create a new one
    console.log("🛒 No existing cart, creating new one...");
    const newCart = await createCart();
    return newCart;
  } catch (err) {
    console.log("❌ Get or Create Cart Error:", err.message);
    return null;
  }
}

// Add item to cart - requires variant_id
export async function addToCart(cartId, variantId, quantity = 1) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/${cartId}/items/`;

  console.log("➕ Add to Cart URL:", url);
  console.log("➕ Add to Cart Data:", { variant_id: variantId, quantity });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        variant_id: variantId,
        quantity: quantity,
      }),
    });

    console.log("📊 Add to Cart Status:", res.status);

    const data = await parseResponse(res);
    console.log("✅ Add to Cart Response:", JSON.stringify(data).substring(0, 300));

    if (!res.ok) {
      console.log("❌ Add to Cart Failed:", data);
      return { success: false, error: data?.error || 'Failed to add item' };
    }

    return { success: true, data };
  } catch (err) {
    console.log("❌ Add to Cart Error:", err.message);
    return { success: false, error: err.message };
  }
}

// Get cart items
export async function getCartItems(cartId) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/${cartId}/items/`;

  console.log("🛒 Get Cart Items URL:", url);

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
    });

    console.log("📊 Get Cart Items Status:", res.status);

    if (!res.ok) {
      throw new Error('Failed to fetch cart items');
    }

    const json = await parseResponse(res);
    console.log("✅ Get Cart Items Response:", JSON.stringify(json).substring(0, 300));

    let items = [];
    if (json && json.data && Array.isArray(json.data)) {
      items = json.data;
    } else if (Array.isArray(json)) {
      items = json;
    }

    return items;
  } catch (err) {
    console.log("❌ Get Cart Items Error:", err.message);
    return [];
  }
}

// Update cart item quantity
export async function updateCartItem(cartId, itemId, quantity) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/${cartId}/items/${itemId}/`;

  console.log("✏️ Update Cart Item URL:", url);
  console.log("✏️ Update Cart Item Data:", { quantity });

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });

    console.log("📊 Update Cart Item Status:", res.status);

    const data = await parseResponse(res);
    console.log("✅ Update Cart Item Response:", JSON.stringify(data).substring(0, 300));

    if (!res.ok) {
      return { success: false, error: data?.error || 'Failed to update item' };
    }

    return { success: true, data };
  } catch (err) {
    console.log("❌ Update Cart Item Error:", err.message);
    return { success: false, error: err.message };
  }
}

// Remove item from cart
export async function removeFromCart(cartId, itemId) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/${cartId}/items/${itemId}/`;

  console.log("🗑️ Remove from Cart URL:", url);

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    console.log("📊 Remove from Cart Status:", res.status);

    if (res.status === 204 || res.ok) {
      return { success: true };
    }

    const data = await parseResponse(res);
    return { success: false, error: data?.error || 'Failed to remove item' };
  } catch (err) {
    console.log("❌ Remove from Cart Error:", err.message);
    return { success: false, error: err.message };
  }
}

// Clear all items from cart
export async function clearCart(cartId) {
  console.log("🗑️ Clearing cart:", cartId);

  try {
    const items = await getCartItems(cartId);

    for (const item of items) {
      await removeFromCart(cartId, item.id);
    }

    return { success: true };
  } catch (err) {
    console.log("❌ Clear Cart Error:", err.message);
    return { success: false, error: err.message };
  }
}

// ==================== ORDER APIs ====================
// Backend requires: cart_id, payment_method (COD/OP), area (IN/OUT)
// For guests: also requires name, email, phone, shipping_address

export async function createOrder(orderData, token = null) {
  const url = `${BASE_URL}/api/v1.0/customers/orders/`;

  console.log("📦 Create Order URL:", url);
  console.log("📦 Create Order Data:", JSON.stringify(orderData).substring(0, 500));

  try {
    // Build the order payload based on backend requirements
    const payload = {
      cart_id: orderData.cart_id,
      payment_method: orderData.payment_method || 'COD', // COD or OP
      area: orderData.area || 'IN', // IN (Inside Dhaka) or OUT (Outside Dhaka)
    };

    // For guest orders, add guest fields
    if (!token || orderData.is_guest) {
      payload.name = orderData.name || orderData.guest_name;
      payload.email = orderData.email || orderData.guest_email;
      payload.phone = orderData.phone || orderData.guest_phone;
      payload.shipping_address = orderData.shipping_address;
    }

    console.log("📦 Order Payload:", JSON.stringify(payload));

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });

    console.log("📊 Create Order Status:", res.status);

    const data = await parseResponse(res);
    console.log("✅ Create Order Response:", JSON.stringify(data).substring(0, 500));

    if (!res.ok) {
      console.log("❌ Create Order Failed:", data);
      return {
        success: false,
        error: data?.error || data?.detail || 'Failed to create order',
      };
    }

    // If online payment, response contains GatewayPageURL
    if (data && data.GatewayPageURL) {
      return {
        success: true,
        payment_url: data.GatewayPageURL,
        data,
      };
    }

    // COD order - return order data
    return {
      success: true,
      order: data,
      order_id: data?.id,
    };
  } catch (err) {
    console.log("❌ Create Order Error:", err.message);
    return { success: false, error: err.message };
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
      body: JSON.stringify({
        product: productId,
        is_favorite: true,
      }),
    });

    console.log("📊 Add Favorite Status:", res.status);

    const data = await parseResponse(res);
    console.log("✅ Add Favorite Response:", data);

    if (!res.ok) {
      return { success: false, error: data?.error || 'Failed to add to favorites' };
    }

    return { success: true, data };
  } catch (err) {
    console.log("❌ Add Favorite Error:", err.message);
    return { success: false, error: err.message };
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
      console.log("❌ Home Page API failed with status:", res.status);
      return null;
    }

    const data = await parseResponse(res);
    console.log("🏠 Home Page Raw:", JSON.stringify(data).substring(0, 400));

    // Return full response with success flag for caller to parse
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
  const url = `${BASE_URL}/api/v1.0/customers/delivery-charges/`;

  console.log("🚚 Delivery Charges URL:", url);

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
    });

    console.log("📊 Delivery Charges Status:", res.status);

    if (!res.ok) {
      console.log("⚠️ Delivery charges API failed, using defaults");
      // Fallback to default values if API fails
      return {
        inside_dhaka: 60,
        outside_dhaka: 120,
      };
    }

    const json = await parseResponse(res);
    console.log("🚚 Delivery Charges Raw:", JSON.stringify(json).substring(0, 200));

    // Handle various response structures
    if (json && json.data) {
      return {
        inside_dhaka: json.data.inside_dhaka || 60,
        outside_dhaka: json.data.outside_dhaka || 120,
      };
    } else if (json && json.inside_dhaka) {
      return {
        inside_dhaka: json.inside_dhaka,
        outside_dhaka: json.outside_dhaka || 120,
      };
    }

    // Fallback if structure doesn't match
    return {
      inside_dhaka: 60,
      outside_dhaka: 120,
    };
  } catch (err) {
    console.log("❌ Delivery Charges Error:", err.message);
    // Return defaults on error
    return {
      inside_dhaka: 60,
      outside_dhaka: 120,
    };
  }
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

// ==================== EXCLUSIVE / RAKAMARI (DROPLOO) APIs ====================

/**
 * Normalizes a raw Droploo product from the backend to a consistent shape
 * expected by all mobile components.
 * Backend field  →  Mobile expected field
 *  image_url     →  image
 *  display_price →  unit_price
 *  regular_price →  (used to calculate discount_amount)
 *  is_variable   →  product_type ('variable'|'simple')
 *  qty           →  stock_quantity
 */
function normalizeExclusiveProduct(p) {
  const displayPrice = parseFloat(p.display_price || p.selling_price || p.regular_price || 0);
  const regularPrice = parseFloat(p.regular_price || 0);
  const discountAmount = Math.max(0, regularPrice - displayPrice);
  return {
    ...p,
    image: p.image_url || p.image || null,
    unit_price: displayPrice,
    discount_amount: discountAmount,
    product_type: p.is_variable ? 'variable' : 'simple',
    stock_quantity: p.qty ?? p.stock_quantity ?? 0,
  };
}

export async function getExclusiveProducts(page = 1, limit = 20, category = null, search = null, minPrice = null, maxPrice = null, ordering = null) {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', limit.toString());
  if (category) params.append('category_name', category);   // filter by category_name string
  if (search) params.append('search', search);
  if (minPrice) params.append('min_price', minPrice.toString());
  if (maxPrice) params.append('max_price', maxPrice.toString());
  if (ordering) params.append('ordering', ordering);

  const url = `${BASE_URL}/api/v1.0/customers/exclusive/?${params.toString()}`;
  console.log("🌟 Exclusive Products URL:", url);

  try {
    const res = await fetch(url);
    console.log("📊 Exclusive Products Status:", res.status);

    if (!res.ok) {
      console.log("❌ Exclusive Products API Failed:", res.status);
      return { results: [], count: 0, pages: 0 };
    }

    const json = await parseResponse(res);
    let products = [];
    let totalCount = 0;

    // Backend wraps in { success: true, data: { count, results: [...] } }
    if (json && json.data && json.data.results && Array.isArray(json.data.results)) {
      products = json.data.results;
      totalCount = json.data.count || products.length;
    } else if (json && json.results && Array.isArray(json.results)) {
      products = json.results;
      totalCount = json.count || products.length;
    } else if (json && json.data && Array.isArray(json.data)) {
      products = json.data;
      totalCount = json.count || products.length;
    } else if (Array.isArray(json)) {
      products = json;
      totalCount = products.length;
    }

    const normalized = products.map(normalizeExclusiveProduct);
    const totalPages = Math.ceil(totalCount / limit);
    console.log(`✅ Exclusive: ${normalized.length} products, total: ${totalCount}`);
    return { results: normalized, count: totalCount, pages: totalPages };
  } catch (err) {
    console.log("❌ Exclusive Products Error:", err.message);
    return { results: [], count: 0, pages: 0 };
  }
}

export async function getExclusiveProductById(id) {
  const url = `${BASE_URL}/api/v1.0/customers/exclusive/${id}/`;
  console.log("🌟 Exclusive Product Detail URL:", url);

  try {
    const res = await fetch(url);
    console.log("📊 Exclusive Product Detail Status:", res.status);

    if (!res.ok) return null;

    const json = await parseResponse(res);
    let product = null;
    if (json && json.id) product = json;
    else if (json && json.data && json.data.id) product = json.data;
    return product ? normalizeExclusiveProduct(product) : null;
  } catch (err) {
    console.log("❌ Exclusive Product Detail Error:", err.message);
    return null;
  }
}

export async function getExclusiveCategories() {
  const url = `${BASE_URL}/api/v1.0/customers/exclusive/categories/`;
  console.log("🌟 Exclusive Categories URL:", url);

  try {
    const res = await fetch(url);
    console.log("📊 Exclusive Categories Status:", res.status);

    if (!res.ok) return [];

    const json = await parseResponse(res);
    if (Array.isArray(json)) return json;
    if (json && json.results && Array.isArray(json.results)) return json.results;
    if (json && json.data && Array.isArray(json.data)) return json.data;
    return [];
  } catch (err) {
    console.log("❌ Exclusive Categories Error:", err.message);
    return [];
  }
}

export async function addDropshippingToCart(cartId, token, { productId, droplooImageId, size, color, unitPrice, quantity = 1 }) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/${cartId}/add-dropshipping/`;
  console.log("🌟 Add Dropshipping to Cart URL:", url);

  try {
    const headers = getHeaders(token, true);
    const body = {
      product_id: productId,
      droploo_image_id: droplooImageId,
      size: size || '',
      color: color || '',
      unit_price: unitPrice,
      quantity,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log("📊 Add Dropshipping Status:", res.status);

    if (!res.ok) {
      const errorData = await parseResponse(res);
      console.log("❌ Add Dropshipping Failed:", errorData);
      return { success: false, error: 'Failed to add item' };
    }

    const json = await parseResponse(res);
    console.log("✅ Add Dropshipping Success:", JSON.stringify(json).substring(0, 200));
    return { success: true, data: json };
  } catch (err) {
    console.log("❌ Add Dropshipping Error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function removeDropshippingFromCart(cartId, token, itemId) {
  const url = `${BASE_URL}/api/v1.0/customers/carts/${cartId}/remove-dropshipping/${itemId}/`;
  console.log("🌟 Remove Dropshipping URL:", url);

  try {
    const headers = getHeaders(token, true);
    const res = await fetch(url, { method: 'DELETE', headers });

    console.log("📊 Remove Dropshipping Status:", res.status);

    if (!res.ok) {
      const errorData = await parseResponse(res);
      console.log("❌ Remove Dropshipping Failed:", errorData);
      return { success: false, error: 'Failed to remove item' };
    }

    console.log("✅ Dropshipping item removed");
    return { success: true };
  } catch (err) {
    console.log("❌ Remove Dropshipping Error:", err.message);
    return { success: false, error: err.message };
  }
}

// ==================== STORE APIs ====================
export async function getStores() {
  const url = `${BASE_URL}/api/v1.0/stores/public/`;

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
  const url = `${BASE_URL}/api/v1.0/stores/${storeId}/detail/`;

  console.log("🏪 Store Detail URL:", url);

  try {
    const res = await fetch(url);

    console.log("📊 Store Detail Status:", res.status);

    if (!res.ok) {
      throw new Error('Store not found');
    }

    const json = await parseResponse(res);
    console.log("✅ Store Detail Raw Response:", JSON.stringify(json).substring(0, 500));

    // Handle response structure
    if (json && json.success && json.data) {
      console.log("✅ Store data from json.data:", json.data);
      return json.data;
    } else if (json && json.data) {
      console.log("✅ Store data from json.data (no success):", json.data);
      return json.data;
    }
    // If json is the store object directly
    if (json && (json.id || json.name || json.slug)) {
      console.log("✅ Store data is direct object:", json);
      return json;
    }
    console.log("⚠️ Store data structure unknown:", json);
    return json;
  } catch (err) {
    console.log("❌ Store Detail Error:", err.message);
    return null;
  }
}

export async function getStoreProducts(storeId, page = 1, limit = 20) {
  // Backend uses supplier_product__store parameter
  const url = `${BASE_URL}/api/v1.0/customers/products/?supplier_product__store=${storeId}&page=${page}&page_size=${limit}`;

  console.log("🛍️ Store Products URL:", url);

  const urls = [url];

  for (const url of urls) {
    console.log("🛍️ Trying Store Products URL:", url);

    try {
      const res = await fetch(url);

      console.log("📊 Store Products Status:", res.status);

      if (!res.ok) {
        console.log("❌ URL failed, trying next...");
        continue;
      }

      const json = await parseResponse(res);
      console.log("📦 Store Products Raw:", JSON.stringify(json).substring(0, 300));

      let products = [];

      // Check different response structures
      if (json && json.success && json.data) {
        if (json.data.results && Array.isArray(json.data.results)) {
          products = json.data.results;
        } else if (Array.isArray(json.data)) {
          products = json.data;
        }
      } else if (json && json.data && Array.isArray(json.data)) {
        products = json.data;
      } else if (json && json.results && Array.isArray(json.results)) {
        products = json.results;
      } else if (Array.isArray(json)) {
        products = json;
      }

      if (products.length > 0) {
        console.log(`✅ Found ${products.length} store products`);
        return products;
      }
    } catch (err) {
      console.log("❌ Store Products Error:", err.message);
    }
  }

  console.log("⚠️ No store products found from any URL");
  return [];
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
  // Try multiple endpoints
  const urls = [
    `${AUTH_URL}/auth/users/me/`,
    `${BASE_URL}/api/customer/profile/`,
    `${BASE_URL}/api/customer/me/`,
  ];

  for (const url of urls) {
    console.log("👤 Trying User Profile URL:", url);

    try {
      // Use JWT auth for /auth/users/me/, Bearer for others
      const useJWT = url.includes('/auth/users/me/');
      const res = await fetch(url, {
        headers: getHeaders(token, useJWT),
      });

      console.log("📊 User Profile Status:", res.status);

      if (!res.ok) {
        console.log("❌ Profile URL failed, trying next...");
        continue;
      }

      const data = await parseResponse(res);
      console.log("👤 User Profile Raw:", JSON.stringify(data).substring(0, 300));

      let profile = null;

      // Check various response structures
      // Structure 1: {success: true, data: {...}}
      if (data && data.success && data.data && (data.data.id || data.data.email)) {
        profile = data.data;
        console.log("✅ Profile from data.data (success)");
      }
      // Structure 2: {data: {...}}
      else if (data && data.data && (data.data.id || data.data.email)) {
        profile = data.data;
        console.log("✅ Profile from data.data");
      }
      // Structure 3: Direct user object
      else if (data && (data.id || data.email || data.username)) {
        profile = data;
        console.log("✅ Profile directly in response");
      }

      if (profile) {
        return profile;
      }
    } catch (err) {
      console.log("❌ User Profile Error:", err.message);
    }
  }

  console.log("⚠️ Could not fetch profile from any URL");
  return null;
}

export async function updateUserProfile(userData, token) {
  const url = `${AUTH_URL}/auth/users/me/`;

  console.log("✏️ Update Profile URL:", url);

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(token, true), // Use JWT for auth endpoints
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

  // Cart (Updated for backend compatibility)
  createCart,
  getCarts,
  getCart,
  getOrCreateCart,
  addToCart,
  getCartItems,
  updateCartItem,
  removeFromCart,
  clearCart,

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