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

export default function SignupScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Bangladesh phone number';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const result = await register({
      email: formData.email,
      password: formData.password,
      re_password: formData.confirmPassword,
      first_name: firstName,
      last_name: lastName,
      phone: formData.phone,
      name: formData.fullName,
    });

    if (result.success) {
      // Navigate to OTP verification or directly to tabs if auto-logged in
      router.push({
        pathname: '/(routes)/otp',
        params: {
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName,
        },
      });
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again.');
    }
  };

  const handleLogin = () => {
    router.push('/(routes)/login');
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
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
          <View className="items-center pt-10 pb-4">
            <View className="w-16 h-16 bg-green-500 rounded-2xl items-center justify-center mb-3 shadow-lg shadow-green-200">
              <Text className="text-white text-xl font-bold">SB</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-1">Create Account</Text>
            <Text className="text-base text-gray-600">Join Sobarbazar today</Text>
          </View>

          {/* Signup Form */}
          <View className="px-6 flex-1">
            {/* Full Name Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-medium mb-2">Full Name</Text>
              <View
                className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5 border ${
                  errors.fullName ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.fullName ? '#F87171' : '#6B7280'}
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.fullName}
                  onChangeText={(text) => {
                    setFormData({ ...formData, fullName: text });
                    clearError('fullName');
                  }}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              {errors.fullName ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-medium mb-2">Email Address</Text>
              <View
                className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5 border ${
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
                    clearError('email');
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

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-medium mb-2">Phone Number</Text>
              <View
                className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5 border ${
                  errors.phone ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <Ionicons name="call-outline" size={20} color={errors.phone ? '#F87171' : '#6B7280'} />
                <Text className="text-gray-500 ml-2">+880</Text>
                <TextInput
                  className="flex-1 ml-2 text-gray-800 text-base"
                  placeholder="1XXXXXXXXX"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phone}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').slice(0, 11);
                    setFormData({ ...formData, phone: cleaned });
                    clearError('phone');
                  }}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
              {errors.phone ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
              <View
                className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5 border ${
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
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    clearError('password');
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

            {/* Confirm Password Input */}
            <View className="mb-5">
              <Text className="text-gray-700 text-sm font-medium mb-2">Confirm Password</Text>
              <View
                className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5 border ${
                  errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.confirmPassword ? '#F87171' : '#6B7280'}
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    clearError('confirmPassword');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Terms and Conditions */}
            <View className="mb-5">
              <TouchableOpacity
                className="flex-row items-start"
                onPress={() => {
                  setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms });
                  clearError('agreeToTerms');
                }}
                disabled={isLoading}
              >
                <View
                  className={`w-5 h-5 border-2 rounded mr-3 mt-0.5 items-center justify-center ${
                    formData.agreeToTerms ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {formData.agreeToTerms && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text className="text-gray-600 text-sm flex-1">
                  I agree to the{' '}
                  <Text className="text-green-600 font-medium">Terms of Service</Text> and{' '}
                  <Text className="text-green-600 font-medium">Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.agreeToTerms ? (
                <Text className="text-red-500 text-xs mt-1 ml-8">{errors.agreeToTerms}</Text>
              ) : null}
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              className={`rounded-2xl py-4 mb-5 shadow-lg shadow-green-200 ${
                isLoading ? 'bg-green-400' : 'bg-green-500'
              }`}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white text-lg font-semibold ml-2">Creating Account...</Text>
                </View>
              ) : (
                <Text className="text-white text-center text-lg font-semibold">Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-5">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">Or sign up with</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Social Signup */}
            <View className="flex-row justify-between mb-6">
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

            {/* Login Link */}
            <View className="flex-row justify-center mb-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
                <Text className="text-green-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View className="pb-6 px-6">
            <Text className="text-center text-gray-400 text-xs">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
