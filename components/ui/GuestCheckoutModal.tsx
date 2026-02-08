import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface GuestCheckoutModalProps {
  visible: boolean;
  onContinueAsGuest: () => void;
  onLogin: () => void;
  onClose: () => void;
}

export default function GuestCheckoutModal({
  visible,
  onContinueAsGuest,
  onLogin,
  onClose,
}: GuestCheckoutModalProps) {
  const handleLogin = () => {
    onClose();
    onLogin();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="w-16 h-16 bg-main-100 rounded-full items-center justify-center mx-auto mb-4">
            <Ionicons name="cart-outline" size={32} color="#299e60" />
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-800 text-center mb-2">
            Add to Cart
          </Text>

          {/* Description */}
          <Text className="text-gray-600 text-center mb-6">
            You can continue shopping as a guest, or go to the Profile tab to login first
          </Text>

          {/* Continue as Guest Button - Primary */}
          <TouchableOpacity
            className="bg-main-600 py-4 rounded-2xl mb-3 shadow-lg"
            onPress={onContinueAsGuest}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-base font-semibold">
              Continue as Guest
            </Text>
          </TouchableOpacity>

          {/* Login Hint Button */}
          <TouchableOpacity
            className="bg-blue-50 py-4 rounded-2xl mb-3 border border-blue-200"
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text className="text-blue-700 text-center text-base font-semibold">
              I'll Login from Profile Tab
            </Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            className="py-2"
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text className="text-gray-500 text-center text-sm">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
