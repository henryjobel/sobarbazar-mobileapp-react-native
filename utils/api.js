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
      console.log("❌ Products API Failed with status:", res.status);
      return [];
    }

    const json = await parseResponse(res);
    console.log("🛍️ Products Raw:", JSON.stringify(json).substring(0, 400));

    let products = [];

    // Check various response structures
    // Structure 1: {success: true, data: {results: [...]}}
    if (json && json.success && json.data && json.data.results && Array.isArray(json.data.results)) {
      products = json.data.results;
      console.log(`✅ Found ${products.length} products in 'data.results'`);
    }
    // Structure 2: {success: true, data: [...]}
    else if (json && json.success && json.data && Array.isArray(json.data)) {
      products = json.data;
      console.log(`✅ Found ${products.length} products in 'data' (array)`);
    }
    // Structure 3: {data: {results: [...]}}
    else if (json && json.data && json.data.results && Array.isArray(json.data.results)) {
      products = json.data.results;
      console.log(`✅ Found ${products.length} products in 'data.results' (no success)`);
    }
    // Structure 4: {data: [...]}
    else if (json && json.data && Array.isArray(json.data)) {
      products = json.data;
      console.log(`✅ Found ${products.length} products in 'data'`);
    }
    // Structure 5: {results: [...]}
    else if (json && json.results && Array.isArray(json.results)) {
      products = json.results;
      console.log(`✅ Found ${products.length} products in 'results'`);
    }
    // Structure 6: Direct array
    else if (Array.isArray(json)) {
      products = json;
      console.log(`✅ Found ${products.length} products in direct array`);
    }

    if (products.length === 0) {
      console.log("⚠️ No products found in response");
    }

    return products;
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
    `${BASE_URL}/api/v1.0/customers/categories/`,
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
    `${BASE_URL}/api/v1.0/stores/subcategories/${categoryId}/`,
    `${BASE_URL}/api/v1.0/customers/subcategories/?category=${categoryId}`,
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
  // Try multiple URL patterns - some backends use 'store', others use 'vendor'
  const urls = [
    `${BASE_URL}/api/v1.0/customers/products/?store=${storeId}&pagination=1&page=${page}&page_size=${limit}`,
    `${BASE_URL}/api/v1.0/customers/products/?vendor=${storeId}&pagination=1&page=${page}&page_size=${limit}`,
    `${BASE_URL}/api/v1.0/customers/products/stores_list/${storeId}/products/`,
  ];

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
  // Try multiple endpoints
  const urls = [
    `${AUTH_URL}/auth/users/me/`,
    `${BASE_URL}/api/v1.0/customers/profile/`,
    `${BASE_URL}/api/v1.0/customers/me/`,
  ];

  for (const url of urls) {
    console.log("👤 Trying User Profile URL:", url);

    try {
      const res = await fetch(url, {
        headers: getHeaders(token),
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