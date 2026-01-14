import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', result.error || 'Please check your credentials and try again.');
    }
  };

  const handleForgotPassword = () => {
    router.push('/(routes)/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/(routes)/signup');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <View className="mb-5">
              <Text className="text-gray-700 text-sm font-medium mb-2">Email Address</Text>
              <View
                className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <Ionicons name="mail-outline" size={20} color={errors.email ? '#F87171' : '#6B7280'} />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.email ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
              <View
                className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border ${
                  errors.password ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? '#F87171' : '#6B7280'}
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>
              ) : null}
            </View>

            {/* Remember Me & Forgot Password */}
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
                disabled={isLoading}
              >
                <View
                  className={`w-5 h-5 border-2 rounded mr-2 items-center justify-center ${
                    rememberMe ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text className="text-gray-600 text-sm">Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                <Text className="text-green-600 font-medium text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`rounded-2xl py-4 mb-6 shadow-lg shadow-green-200 ${
                isLoading ? 'bg-green-400' : 'bg-green-500'
              }`}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white text-lg font-semibold ml-2">Signing In...</Text>
                </View>
              ) : (
                <Text className="text-white text-center text-lg font-semibold">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">Or continue with</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Social Login */}
            <View className="flex-row justify-between mb-8">
              <TouchableOpacity
                className="flex-1 bg-blue-50 rounded-2xl py-3 mr-2 border border-blue-100 flex-row items-center justify-center"
                disabled={isLoading}
              >
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                <Text className="text-blue-600 font-medium ml-2">Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-50 rounded-2xl py-3 ml-2 border border-red-100 flex-row items-center justify-center"
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text className="text-red-600 font-medium ml-2">Google</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mb-8">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
