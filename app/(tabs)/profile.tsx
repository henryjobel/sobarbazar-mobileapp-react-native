import { Ionicons } from '@expo/vector-icons'
import { router, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Menu Items Array
const menuItems = [
  // Quick Actions
  {
    id: "orders",
    title: "My Orders",
    subtitle: "Track your orders and view history",
    icon: "bag-handle",
    iconColor: "#3B82F6",
    iconBg: "#DBEAFE",
    section: "quick",
    onPress: () => router.push("/(routes)/my-oders")
  },
  {
    id: "wishlist",
    title: "Wishlist",
    subtitle: "Your saved items",
    icon: "heart",
    iconColor: "#EF4444",
    iconBg: "#FEE2E2",
    section: "quick",
    onPress: () => router.push('/wishlist')
  },
  {
    id: "addresses",
    title: "Addresses",
    subtitle: "Manage your addresses",
    icon: "location",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    section: "quick",
    onPress: () => router.push("/(routes)/address")
  },
  {
    id: "payments",
    title: "Payment Methods",
    subtitle: "Cards & wallets",
    icon: "card",
    iconColor: "#8B5CF6",
    iconBg: "#EDE9FE",
    section: "quick",
    onPress: () => router.push('/(routes)/payments')
  },

  // Account Settings
  {
    id: "personal-info",
    title: "Personal Info",
    subtitle: "Update your details",
    icon: "person",
    iconColor: "#8B5CF6",
    iconBg: "#EDE9FE",
    section: "account",
    onPress: () => router.push('/(routes)/personal-info')
  },
  {
    id: "security",
    title: "Security",
    subtitle: "Password & privacy",
    icon: "shield-checkmark",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    section: "account",
    onPress: () => router.push('/(routes)/security')
  },
  {
    id: "notifications",
    title: "Notifications",
    subtitle: "Manage alerts",
    icon: "notifications",
    iconColor: "#6366F1",
    iconBg: "#E0E7FF",
    section: "account",
    onPress: () => router.push('/(routes)/notifications')
  },
 

  // Support
  {
    id: "help",
    title: "Help Center",
    subtitle: "Get help & support",
    icon: "help-circle",
    iconColor: "#3B82F6",
    iconBg: "#DBEAFE",
    section: "support",
    onPress: () => router.push('/(routes)/help')
  },
  {
    id: "contact",
    title: "Contact Us",
    subtitle: "24/7 customer care",
    icon: "chatbubble-ellipses",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    section: "support",
    onPress: () => router.push('/(routes)/contact')
  },
  {
    id: "terms",
    title: "Terms & Privacy",
    subtitle: "Legal information",
    icon: "document-text",
    iconColor: "#F97316",
    iconBg: "#FFEDD5",
    section: "support",
    onPress: () => router.push('/(routes)/terms')
  }
];

export default function ProfileScreen() {
  const router = useRouter();

  // Filter items by section
  const quickActions = menuItems.filter(item => item.section === "quick");
  const accountSettings = menuItems.filter(item => item.section === "account");
  const supportItems = menuItems.filter(item => item.section === "support");

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>
      
      {/* Header */}
      <View className='bg-white px-6 py-4 border-b border-gray-100 shadow-sm'>
        <Text className='text-3xl font-bold text-gray-800'>Profile</Text>
        <Text className='text-base text-gray-600 mt-1'>Welcome back, John! 👋</Text>
      </View>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="p-6">
          <View className='bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 p-6 mb-6'>
            {/* Profile Header */}
            <View className='flex-row items-center mb-6'>
              <View className='relative'>
                <Image 
                  source={{ 
                    uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' 
                  }}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  resizeMode='cover'
                />
                <TouchableOpacity className='absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full items-center justify-center border-2 border-white shadow-lg'>
                  <Ionicons name='camera' size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View className='ml-5 flex-1'>
                <Text className='text-2xl font-bold text-gray-800'>John Doe</Text>
                <Text className='text-gray-500 text-base mt-1'>john.doe@example.com</Text>
                <View className='flex-row items-center mt-2'>
                  <View className='bg-yellow-100 px-3 py-1 rounded-full'>
                    <Text className='text-yellow-800 text-sm font-medium'>⭐ Premium Member</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View className='flex-row justify-between border-t border-gray-100 pt-4'>
              <View className='items-center'>
                <Text className='text-2xl font-bold text-gray-800'>12</Text>
                <Text className='text-gray-500 text-sm'>Orders</Text>
              </View>
              <View className='items-center'>
                <Text className='text-2xl font-bold text-gray-800'>8</Text>
                <Text className='text-gray-500 text-sm'>Wishlist</Text>
              </View>
              <View className='items-center'>
                <Text className='text-2xl font-bold text-gray-800'>4.8</Text>
                <Text className='text-gray-500 text-sm'>Rating</Text>
              </View>
              <View className='items-center'>
                <Text className='text-2xl font-bold text-gray-800'>2</Text>
                <Text className='text-gray-500 text-sm'>Coupons</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className='bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 p-6 mb-6'>
            <Text className='text-xl font-bold text-gray-800 mb-4'>Quick Actions</Text>
            
            <View className='space-y-3'>
              {quickActions.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'
                  onPress={item.onPress}
                >
                  <View 
                    className='w-10 h-10 rounded-xl items-center justify-center mr-4'
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-gray-800 font-semibold'>{item.title}</Text>
                    <Text className='text-gray-500 text-sm'>{item.subtitle}</Text>
                  </View>
                  <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Account Settings */}
          <View className='bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 p-6 mb-6'>
            <Text className='text-xl font-bold text-gray-800 mb-4'>Account Settings</Text>
            
            <View className='space-y-3'>
              {accountSettings.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'
                  onPress={item.onPress}
                >
                  <View 
                    className='w-10 h-10 rounded-xl items-center justify-center mr-4'
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-gray-800 font-semibold'>{item.title}</Text>
                    <Text className='text-gray-500 text-sm'>{item.subtitle}</Text>
                  </View>
                  <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Support Section */}
          <View className='bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 p-6 mb-6'>
            <Text className='text-xl font-bold text-gray-800 mb-4'>Support</Text>
            
            <View className='space-y-3'>
              {supportItems.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'
                  onPress={item.onPress}
                >
                  <View 
                    className='w-10 h-10 rounded-xl items-center justify-center mr-4'
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-gray-800 font-semibold'>{item.title}</Text>
                    <Text className='text-gray-500 text-sm'>{item.subtitle}</Text>
                  </View>
                  <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* App Info */}
          <View className='bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 p-6 mb-6'>
            <Text className='text-xl font-bold text-gray-800 mb-4'>App Information</Text>
            
            <View className='space-y-4'>
              <View className='flex-row justify-between items-center'>
                <Text className='text-gray-600'>App Version</Text>
                <Text className='text-gray-800 font-medium'>1.0.0</Text>
              </View>
              <View className='flex-row justify-between items-center'>
                <Text className='text-gray-600'>Last Updated</Text>
                <Text className='text-gray-800 font-medium'>Dec 2024</Text>
              </View>
              <View className='flex-row justify-between items-center'>
                <Text className='text-gray-600'>Build Number</Text>
                <Text className='text-gray-800 font-medium'>245</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity className='mt-4 mb-10 bg-red-500 rounded-2xl py-4 shadow-lg shadow-red-200 active:bg-red-600'>
            <Text className='text-white text-center text-lg font-semibold'>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}