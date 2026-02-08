import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    isLoading,
    itemCount,
    subtotal,
    total,
    deliveryCharge,
    shippingArea,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    setShippingArea,
  } = useCart();

  // Refresh cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Refresh cart every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🛒 Cart Page: Screen focused, refreshing cart...');
      refreshCart();
    }, [refreshCart])
  );

  const cartItems = cart?.items || [];

  const handleIncrement = async (itemId: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      await updateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecrement = async (itemId: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item && item.quantity > 1) {
      await updateQuantity(itemId, item.quantity - 1);
    }
  };

  const handleRemove = async (itemId: number) => {
    await removeItem(itemId);
  };

  const handleCheckout = () => {
    router.push("/screens/checkout");
  };

  const handleContinueShopping = () => {
    router.push("/(tabs)");
  };

  const formatPrice = (price: number) => `৳${(price || 0).toLocaleString()}`;

  // ✅ FIXED: Get product image with multiple fallbacks
  const getItemImage = (item: any): string => {
    const imageUrl =
      item.variant?.image ||
      item.product_image ||
      item.variant?.product_image ||
      item.variant?.product?.image ||
      item.image ||
      null;

    return imageUrl || "https://via.placeholder.com/120/299e60/FFFFFF?text=Product";
  };

  // ✅ FIXED: Get product name with fallbacks
  const getItemName = (item: any): string => {
    return (
      item.variant?.name ||
      item.product_name ||
      item.name ||
      "Product"
    );
  };

  // ✅ Get product price
  const getItemPrice = (item: any): number => {
    return item.variant?.final_price || item.variant?.price || item.discounted_price || 0;
  };

  const getItemTotalPrice = (item: any): number => {
    return item.total_price || item.discounted_price || (getItemPrice(item) * item.quantity);
  };

  // ✅ FIXED: Format variant attributes (handles Python dict format with single quotes)
  const formatVariantAttributes = (attributes: any): string => {
    if (!attributes) return '';

    let result = '';

    // If it's a string
    if (typeof attributes === 'string') {
      // Check if it looks like a Python dict or JSON
      if (attributes.includes('{') && attributes.includes(':')) {
        try {
          // ✅ FIX: Convert Python dict format to JSON format
          // Replace single quotes with double quotes
          const jsonString = attributes
            .replace(/'/g, '"')  // Replace single quotes with double quotes
            .replace(/None/g, 'null')  // Replace Python None with null
            .replace(/True/g, 'true')  // Replace Python True with true
            .replace(/False/g, 'false');  // Replace Python False with false

          const parsed = JSON.parse(jsonString);

          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            // Convert to "Size: 41mm, Color: Midnight" format
            result = Object.entries(parsed)
              .filter(([_, value]) => value !== null && value !== undefined && value !== '')
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
          } else {
            result = jsonString.replace(/[{}"\[\]]/g, '');
          }
        } catch (error) {
          console.log('⚠️ Cart - Parse error, cleaning string:', error);
          // Failed to parse, clean it manually
          result = attributes
            .replace(/[{}'"\[\]]/g, '')  // Remove braces and quotes
            .replace(/:/g, ': ')  // Add space after colons
            .trim();
        }
      } else {
        // Already a clean string
        result = attributes;
      }
    }
    // If it's already an object
    else if (typeof attributes === 'object' && attributes !== null && !Array.isArray(attributes)) {
      result = Object.entries(attributes)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    // Fallback
    else {
      result = String(attributes).replace(/[{}'"\[\]]/g, '');
    }

    return result;
  };

  // ✅ FIXED: Modern cart item UI
  const renderCartItem = (item: any, index: number) => {
    const variantText = formatVariantAttributes(item.variant?.attributes);

    return (
      <View key={item.id} className="bg-white p-4 mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100">
        <View className="flex-row">
          {/* ✅ Product Image - Left Side */}
          <View className="shadow-md rounded-xl">
            <Image
              source={{ uri: getItemImage(item) }}
              className="w-24 h-24 rounded-xl bg-gray-100"
              contentFit="cover"
              placeholder={require('@/assets/images/icon.png')}
            />
          </View>

          {/* ✅ Product Details - Right Side */}
          <View className="flex-1 ml-4 justify-between">
            <View>
              {/* Product Name */}
              <Text className="text-base font-semibold text-gray-800 leading-5" numberOfLines={2}>
                {getItemName(item)}
              </Text>

              {/* ✅ Variant - Clean Text (NO raw JSON) */}
              {variantText && (
                <View className="mt-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200 self-start">
                  <Text className="text-xs text-green-700 font-medium">
                    {variantText}
                  </Text>
                </View>
              )}
            </View>

            {/* Price */}
            <View>
              <Text className="text-lg font-bold text-main-700 mt-2">
                {formatPrice(getItemPrice(item))}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">per unit</Text>
            </View>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            className="absolute top-0 right-0 w-8 h-8 bg-red-50 rounded-full items-center justify-center"
            onPress={() => handleRemove(item.id)}
            disabled={isLoading}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* ✅ Quantity Controls & Total - Bottom Row */}
        <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="w-9 h-9 bg-gray-100 rounded-lg items-center justify-center"
              onPress={() => handleDecrement(item.id)}
              disabled={item.quantity <= 1 || isLoading}
            >
              <Ionicons
                name="remove"
                size={18}
                color={item.quantity <= 1 ? "#ccc" : "#333"}
              />
            </TouchableOpacity>

            <Text className="mx-5 text-base font-semibold text-gray-800 min-w-[24px] text-center">
              {item.quantity}
            </Text>

            <TouchableOpacity
              className="w-9 h-9 bg-main-600 rounded-lg items-center justify-center"
              onPress={() => handleIncrement(item.id)}
              disabled={isLoading}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Total Price Badge */}
          <View className="bg-main-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-bold text-base">
              {formatPrice(getItemTotalPrice(item))}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        Your cart is empty
      </Text>
      <Text className="text-gray-500 text-center mb-8">
        Looks like you haven't added any items to your cart yet
      </Text>
      <TouchableOpacity
        className="bg-main-600 px-8 py-4 rounded-2xl shadow-lg"
        onPress={handleContinueShopping}
      >
        <Text className="text-white font-semibold text-lg">Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#299e60" />
        <Text className="text-gray-600 mt-4">Loading cart...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
        <View>
          <Text className="text-2xl font-bold text-gray-800">My Cart</Text>
          <Text className="text-gray-500 mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Text>
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity
            className="bg-red-50 px-4 py-2 rounded-xl"
            onPress={clearCart}
            disabled={isLoading}
          >
            <Text className="text-red-500 font-medium">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {/* Cart Items List */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 280 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshCart}
                colors={["#299e60"]}
                tintColor="#299e60"
              />
            }
          >
            {cartItems.map((item, index) => renderCartItem(item, index))}

            {/* Delivery Area Selection */}
            <View className="mx-4 mt-4 bg-white p-4 rounded-2xl">
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Delivery Area
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl mr-2 items-center ${
                    shippingArea === "IN" ? "bg-main-600" : "bg-gray-100"
                  }`}
                  onPress={() => setShippingArea("IN")}
                >
                  <Text
                    className={`font-semibold ${
                      shippingArea === "IN" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    Inside Dhaka
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      shippingArea === "IN" ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    ৳{cart?.delivery_charge_inside_dhaka || 60}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl ml-2 items-center ${
                    shippingArea === "OUT" ? "bg-main-600" : "bg-gray-100"
                  }`}
                  onPress={() => setShippingArea("OUT")}
                >
                  <Text
                    className={`font-semibold ${
                      shippingArea === "OUT" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    Outside Dhaka
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      shippingArea === "OUT" ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    ৳{cart?.delivery_charge_outside_dhaka || 120}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Summary Panel */}
          <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-5 pb-8 rounded-t-3xl shadow-2xl border-t border-gray-100">
            {/* Price Breakdown */}
            <View className="space-y-3 mb-5">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Subtotal</Text>
                <Text className="text-gray-800 font-medium">
                  {formatPrice(subtotal)}
                </Text>
              </View>

              {(cart?.coupon_discount || 0) > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Coupon Discount</Text>
                  <Text className="text-main-700 font-medium">
                    -{formatPrice(cart?.coupon_discount || 0)}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Delivery ({shippingArea === "IN" ? "Inside Dhaka" : "Outside Dhaka"})</Text>
                <Text className="text-gray-800 font-medium">
                  {formatPrice(deliveryCharge)}
                </Text>
              </View>

              <View className="h-px bg-gray-200 my-2" />

              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-xl font-bold text-main-700">
                  {formatPrice(total)}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              className={`py-4 rounded-2xl shadow-lg flex-row items-center justify-center ${
                isLoading ? "bg-main-400" : "bg-main-600"
              }`}
              onPress={handleCheckout}
              disabled={isLoading || cartItems.length === 0}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color="#fff" />
                  <Text className="text-white text-lg font-semibold ml-2">
                    Proceed to Checkout
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Continue Shopping */}
            <TouchableOpacity
              className="mt-3 py-3"
              onPress={handleContinueShopping}
            >
              <Text className="text-main-700 text-center font-medium">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
