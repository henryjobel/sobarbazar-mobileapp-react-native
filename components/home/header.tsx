import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    const query = searchText.trim();
    if (!query) return;
    router.push({
      pathname: '/screens/search',
      params: { q: query },
    });
  };

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3"
      style={{ backgroundColor: '#f3faf2' }}
    >
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: 120, height: 40 }}
        contentFit="contain"
      />

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
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} hitSlop={8}>
            <Ionicons name='search' size={20} color="#299e60"/>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(routes)/notifications')}
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

      {/* Cart icon with badge */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/cart')}
        className="p-2 bg-white rounded-full border border-[#299e60] ml-2"
        style={{
          shadowColor: '#299e60',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name='cart-outline' size={22} color="#299e60" />
        {itemCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#EF4444',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
            borderWidth: 1.5,
            borderColor: '#fff',
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
              {itemCount > 99 ? '99+' : itemCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
