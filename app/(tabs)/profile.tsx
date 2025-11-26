import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
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
              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='bag-handle' size={20} color="#3B82F6" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>My Orders</Text>
                  <Text className='text-gray-500 text-sm'>Track your orders</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='heart' size={20} color="#EF4444" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Wishlist</Text>
                  <Text className='text-gray-500 text-sm'>Your saved items</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-green-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='location' size={20} color="#10B981" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Addresses</Text>
                  <Text className='text-gray-500 text-sm'>Manage addresses</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='card' size={20} color="#8B5CF6" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Payment Methods</Text>
                  <Text className='text-gray-500 text-sm'>Cards & wallets</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Settings */}
          <View className='bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 p-6 mb-6'>
            <Text className='text-xl font-bold text-gray-800 mb-4'>Account Settings</Text>
            
            <View className='space-y-3'>
              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='person' size={20} color="#8B5CF6" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Personal Info</Text>
                  <Text className='text-gray-500 text-sm'>Update your details</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-yellow-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='shield-checkmark' size={20} color="#F59E0B" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Security</Text>
                  <Text className='text-gray-500 text-sm'>Password & privacy</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='notifications' size={20} color="#6366F1" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Notifications</Text>
                  <Text className='text-gray-500 text-sm'>Manage alerts</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-pink-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='language' size={20} color="#EC4899" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Language</Text>
                  <Text className='text-gray-500 text-sm'>App language</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Support Section */}
          <View className='bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 p-6 mb-6'>
            <Text className='text-xl font-bold text-gray-800 mb-4'>Support</Text>
            
            <View className='space-y-3'>
              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='help-circle' size={20} color="#3B82F6" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Help Center</Text>
                  <Text className='text-gray-500 text-sm'>Get help & support</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-green-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='chatbubble-ellipses' size={20} color="#10B981" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Contact Us</Text>
                  <Text className='text-gray-500 text-sm'>24/7 customer care</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity className='flex-row items-center p-4 bg-gray-50 rounded-2xl active:bg-gray-100'>
                <View className='w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-4'>
                  <Ionicons name='document-text' size={20} color="#F97316" />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-800 font-semibold'>Terms & Privacy</Text>
                  <Text className='text-gray-500 text-sm'>Legal information</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color="#9CA3AF" />
              </TouchableOpacity>
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