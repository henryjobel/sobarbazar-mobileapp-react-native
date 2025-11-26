import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleSignup = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms and Conditions');
      return;
    }

    console.log('Signup attempted:', formData);
    
    // Navigate to OTP verification
    router.push({
      pathname: '/(routes)/otp/index',
      params: { 
        email: formData.email,
        phone: formData.phone,
        fullName: formData.fullName
      }
    });
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="items-center pt-12 pb-6">
          <View className="w-20 h-20 bg-green-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-green-200">
            <Text className="text-white text-2xl font-bold">SB</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">Sobarbazar</Text>
          <Text className="text-lg text-gray-600">Create your account</Text>
        </View>

        {/* Signup Form */}
        <View className="px-6 flex-1">
          {/* Full Name Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-3">Full Name</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800 text-base"
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={formData.fullName}
                onChangeText={(text) => setFormData({...formData, fullName: text})}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-4">
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

          {/* Phone Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-3">Phone Number</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800 text-base"
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-3">Password</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800 text-base"
                placeholder="Create a password"
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

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-3">Confirm Password</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800 text-base"
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Conditions */}
          <View className="flex-row items-start mb-6">
            <TouchableOpacity 
              className={`w-5 h-5 border-2 rounded mr-3 mt-1 items-center justify-center ${
                formData.agreeToTerms ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}
              onPress={() => setFormData({...formData, agreeToTerms: !formData.agreeToTerms})}
            >
              {formData.agreeToTerms && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </TouchableOpacity>
            <Text className="text-gray-600 text-sm flex-1">
              I agree to the{' '}
              <Text className="text-green-600 font-medium">Terms of Service</Text>
              {' '}and{' '}
              <Text className="text-green-600 font-medium">Privacy Policy</Text>
            </Text>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            className="bg-green-500 rounded-2xl py-4 mb-6 shadow-lg shadow-green-200"
            onPress={handleSignup}
          >
            <Text className="text-white text-center text-lg font-semibold">Create Account</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or sign up with</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Signup */}
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

          {/* Login Link */}
          <View className="flex-row justify-center mb-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text className="text-green-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="pb-8 px-6">
          <Text className="text-center text-gray-400 text-xs">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}