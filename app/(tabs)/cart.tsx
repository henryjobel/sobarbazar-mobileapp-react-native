import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
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
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const handleIncrement = async (itemId: number) => {
    const item = cart.items.find((i) => i.id === itemId);
    if (item) {
      await updateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecrement = async (itemId: number) => {
    const item = cart.items.find((i) => i.id === itemId);
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

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

  const renderCartItem = ({ item }: { item: any }) => (
    <View className="flex-row bg-white p-4 mx-4 mt-4 rounded-2xl shadow-sm">
      {/* Product Image */}
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/100" }}
        className="w-24 h-24 rounded-xl bg-gray-100"
        contentFit="cover"
      />

      {/* Product Details */}
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-800" numberOfLines={2}>
          {item.name}
        </Text>

        {item.variant?.name && (
          <Text className="text-sm text-gray-500 mt-1">{item.variant.name}</Text>
        )}

        <Text className="text-lg font-bold text-green-600 mt-2">
          {formatPrice(item.price)}
        </Text>

        {/* Quantity Controls */}
        <View className="flex-row items-center mt-3">
          <TouchableOpacity
            className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
            onPress={() => handleDecrement(item.id)}
            disabled={item.quantity <= 1}
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
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>

          <Text className="ml-auto text-base font-bold text-gray-800">
            {formatPrice(item.price * item.quantity)}
          </Text>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        className="absolute top-3 right-3 w-8 h-8 bg-red-50 rounded-full items-center justify-center"
        onPress={() => handleRemove(item.id)}
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

  if (isLoading && cart.items.length === 0) {
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
        {cart.items.length > 0 && (
          <TouchableOpacity
            className="bg-red-50 px-4 py-2 rounded-xl"
            onPress={clearCart}
          >
            <Text className="text-red-500 font-medium">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {/* Cart Items List */}
          <FlatList
            data={cart.items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 220 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Summary Panel */}
          <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-5 pb-8 rounded-t-3xl shadow-2xl border-t border-gray-100">
            {/* Price Breakdown */}
            <View className="space-y-3 mb-5">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Subtotal</Text>
                <Text className="text-gray-800 font-medium">
                  {formatPrice(cart.subtotal)}
                </Text>
              </View>

              {cart.discount > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Discount</Text>
                  <Text className="text-green-600 font-medium">
                    -{formatPrice(cart.discount)}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Shipping</Text>
                <Text className="text-gray-800 font-medium">
                  {cart.shipping > 0 ? formatPrice(cart.shipping) : "Free"}
                </Text>
              </View>

              <View className="h-px bg-gray-200 my-2" />

              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-xl font-bold text-green-600">
                  {formatPrice(cart.total)}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              className="bg-green-500 py-4 rounded-2xl shadow-lg flex-row items-center justify-center"
              onPress={handleCheckout}
            >
              <Ionicons name="card-outline" size={20} color="#fff" />
              <Text className="text-white text-lg font-semibold ml-2">
                Proceed to Checkout
              </Text>
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
