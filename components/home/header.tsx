import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Header() {
  return (
    <View 
      className="flex-row items-center justify-between px-4 py-3"
      style={{ backgroundColor: '#f3faf2' }}
    >
      <Text className="text-lg font-semibold text-[#299e60]">Sobarbazar</Text>
      
      {/* search input field */}
      <View className="flex-1 mx-3">
        <View className="flex-row items-center bg-white rounded-full border border-[#299e60] px-4 shadow-sm" 
          style={{
            shadowColor: '#299e60',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <TextInput 
            placeholder="Search products..."
            placeholderTextColor="#888"
            className="flex-1 mr-2 py-2 text-gray-800 text-sm"
          />
          <Ionicons name='search' size={20} color="#299e60"/>
        </View>
      </View>
      
      <TouchableOpacity 
        className="p-2 bg-white rounded-full border border-[#299e60]"
        style={{
          shadowColor: '#299e60',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name='notifications-outline' size={22} color="#299e60"/>
      </TouchableOpacity>
    </View>
  );
}