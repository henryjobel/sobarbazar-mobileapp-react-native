import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Generate a fixed OTP for demo (123456)
  const fixedOTP = '123456';

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all fields are filled
      if (newOtp.every(digit => digit !== '') && index === 5) {
        verifyOtp(newOtp.join(''));
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (enteredOtp: string) => {
    Keyboard.dismiss();
    
    if (enteredOtp === fixedOTP) {
      Alert.alert(
        'Success!', 
        'Your account has been created successfully!',
        [
          {
            text: 'Continue Shopping',
            onPress: () => router.push('/(tabs)')
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
      // Clear OTP fields
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const resendOtp = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    Alert.alert('OTP Sent', `New OTP ${fixedOTP} has been sent to your phone/email.`);
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }
    verifyOtp(enteredOtp);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="items-center pt-12 pb-8">
          <View className="w-16 h-16 bg-main-600 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="lock-closed" size={24} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</Text>
          <Text className="text-gray-600 text-center">
            We've sent a 6-digit code to
          </Text>
          <Text className="text-main-700 font-semibold mt-1">
            {params.phone || params.email}
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View className="mb-8">
          <Text className="text-gray-700 text-sm font-medium mb-4 text-center">
            Enter the verification code
          </Text>
          <View className="flex-row justify-between">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                className="w-12 h-12 border-2 border-gray-300 rounded-xl text-center text-lg font-bold text-gray-800 bg-gray-50"
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* Demo OTP Hint */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <Text className="text-yellow-800 text-center text-sm">
            💡 Demo OTP: <Text className="font-bold">{fixedOTP}</Text>
          </Text>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          className="bg-main-600 rounded-2xl py-4 mb-6 shadow-lg shadow-main-200"
          onPress={handleVerify}
        >
          <Text className="text-white text-center text-lg font-semibold">Verify & Create Account</Text>
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="items-center">
          {canResend ? (
            <TouchableOpacity onPress={resendOtp}>
              <Text className="text-main-700 font-semibold">Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-gray-500">
              Resend OTP in {timer} seconds
            </Text>
          )}
        </View>

        {/* Back to Signup */}
        <TouchableOpacity 
          className="absolute bottom-8 left-6 right-6"
          onPress={() => router.back()}
        >
          <Text className="text-main-700 text-center font-semibold">
            ← Back to Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}