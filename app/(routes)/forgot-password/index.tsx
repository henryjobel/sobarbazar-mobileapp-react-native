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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    setError('');

    try {
      // Call API to send reset password email
      const response = await fetch('https://api.hetdcl.com/auth/users/reset_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok || response.status === 204) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  if (isSubmitted) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="mail-open-outline" size={48} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">Check Your Email</Text>
          <Text className="text-gray-600 text-center mb-8 px-4">
            We've sent a password reset link to{'\n'}
            <Text className="font-semibold text-gray-800">{email}</Text>
          </Text>
          <Text className="text-gray-500 text-sm text-center mb-8">
            Didn't receive the email? Check your spam folder or try again with a different email.
          </Text>

          <TouchableOpacity
            className="w-full bg-main-600 rounded-2xl py-4 mb-4"
            onPress={() => {
              setIsSubmitted(false);
              setEmail('');
            }}
          >
            <Text className="text-white text-center text-lg font-semibold">Try Another Email</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBackToLogin}>
            <Text className="text-main-700 font-semibold text-base">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Back Button */}
          <TouchableOpacity
            className="mt-4 ml-4 w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            onPress={handleBackToLogin}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          {/* Header Section */}
          <View className="items-center pt-8 pb-8 px-6">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="lock-open-outline" size={40} color="#22C55E" />
            </View>
            <Text className="text-3xl font-bold text-gray-800 mb-3">Forgot Password?</Text>
            <Text className="text-gray-600 text-center text-base">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View className="px-6 flex-1">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-medium mb-2">Email Address</Text>
              <View
                className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border ${
                  error ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <Ionicons name="mail-outline" size={20} color={error ? '#F87171' : '#6B7280'} />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {error ? <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text> : null}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              className={`rounded-2xl py-4 mb-6 shadow-lg shadow-main-200 ${
                isLoading ? 'bg-main-400' : 'bg-main-600'
              }`}
              onPress={handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white text-lg font-semibold ml-2">Sending...</Text>
                </View>
              ) : (
                <Text className="text-white text-center text-lg font-semibold">Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600">Remember your password? </Text>
              <TouchableOpacity onPress={handleBackToLogin} disabled={isLoading}>
                <Text className="text-main-700 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Text */}
          <View className="pb-8 px-6 mt-auto">
            <View className="bg-blue-50 p-4 rounded-2xl">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
                <Text className="text-blue-800 font-semibold ml-2">Need Help?</Text>
              </View>
              <Text className="text-blue-700 text-sm">
                If you don't receive the email within a few minutes, please check your spam folder or
                contact our support team.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
