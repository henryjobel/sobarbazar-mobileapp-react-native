import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
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

  // Get display values from cart item
  const getItemImage = (item: any): string => {
    if (item.variant?.image) return item.variant.image;
    if (item.product_image) return item.product_image;
    return "https://via.placeholder.com/100";
  };

  const getItemName = (item: any): string => {
    return item.variant?.name || item.product_name || "Product";
  };

  const getItemPrice = (item: any): number => {
    return item.variant?.final_price || item.variant?.price || item.discounted_price || 0;
  };

  const getItemTotalPrice = (item: any): number => {
    return item.total_price || item.discounted_price || (getItemPrice(item) * item.quantity);
  };

  const renderCartItem = (item: any, index: number) => (
    <View key={item.id} className="flex-row bg-white p-4 mx-4 mt-4 rounded-2xl shadow-sm">
      {/* Product Image */}
      <Image
        source={{ uri: getItemImage(item) }}
        className="w-24 h-24 rounded-xl bg-gray-100"
        contentFit="cover"
      />

      {/* Product Details */}
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-800" numberOfLines={2}>
          {getItemName(item)}
        </Text>

        {item.variant?.attributes && (
          <Text className="text-sm text-gray-500 mt-1">{item.variant.attributes}</Text>
        )}

        <Text className="text-lg font-bold text-green-600 mt-2">
          {formatPrice(getItemPrice(item))}
        </Text>

        {/* Quantity Controls */}
        <View className="flex-row items-center mt-3">
          <TouchableOpacity
            className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
            onPress={() => handleDecrement(item.id)}
            disabled={item.quantity <= 1 || isLoading}
          >
            <Ionicons
              name="remove"
              size={18}
              color={item.quantity <= 1 ? "#ccc" : "#333"}
            />
          </TouchableOpacity>

          <Text className="mx-4 text-base font-semibold text-gray-800">
            {item.quantity}
          </Text>

          <TouchableOpacity
            className="w-8 h-8 bg-green-500 rounded-lg items-center justify-center"
            onPress={() => handleIncrement(item.id)}
            disabled={isLoading}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>

          <Text className="ml-auto text-base font-bold text-gray-800">
            {formatPrice(getItemTotalPrice(item))}
          </Text>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        className="absolute top-3 right-3 w-8 h-8 bg-red-50 rounded-full items-center justify-center"
        onPress={() => handleRemove(item.id)}
        disabled={isLoading}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

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
        className="bg-green-500 px-8 py-4 rounded-2xl shadow-lg"
        onPress={handleContinueShopping}
      >
        <Text className="text-white font-semibold text-lg">Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
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
                colors={["#22C55E"]}
                tintColor="#22C55E"
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
                    shippingArea === "IN" ? "bg-green-500" : "bg-gray-100"
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
                    shippingArea === "OUT" ? "bg-green-500" : "bg-gray-100"
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
                  <Text className="text-green-600 font-medium">
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
                <Text className="text-xl font-bold text-green-600">
                  {formatPrice(total)}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              className={`py-4 rounded-2xl shadow-lg flex-row items-center justify-center ${
                isLoading ? "bg-green-400" : "bg-green-500"
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
              <Text className="text-green-600 text-center font-medium">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
