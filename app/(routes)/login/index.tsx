import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    console.log('Login attempted:', formData);
    router.push('/(tabs)');
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset feature coming soon!');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="items-center pt-12 pb-8">
          <View className="w-20 h-20 bg-green-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-green-200">
            <Text className="text-white text-2xl font-bold">SB</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">Sobarbazar</Text>
          <Text className="text-lg text-gray-600">Welcome back! Please sign in</Text>
        </View>

        {/* Login Form */}
        <View className="px-6 flex-1">
          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-3">Email Address</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800 text-base"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-3">Password</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800 text-base"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Forgot Password */}
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center">
              <View className="w-5 h-5 border-2 border-gray-300 rounded mr-2"></View>
              <Text className="text-gray-600 text-sm">Remember me</Text>
            </View>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="text-green-600 font-medium text-sm">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-green-500 rounded-2xl py-4 mb-6 shadow-lg shadow-green-200"
            onPress={handleLogin}
          >
            <Text className="text-white text-center text-lg font-semibold">Sign In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or continue with</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Login */}
          <View className="flex-row justify-between mb-8">
            <TouchableOpacity className="flex-1 bg-blue-50 rounded-2xl py-3 mr-2 border border-blue-100 flex-row items-center justify-center">
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text className="text-blue-600 font-medium ml-2">Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-red-50 rounded-2xl py-3 ml-2 border border-red-100 flex-row items-center justify-center">
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text className="text-red-600 font-medium ml-2">Google</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mb-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text className="text-green-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="pb-8 px-6">
          <Text className="text-center text-gray-400 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}