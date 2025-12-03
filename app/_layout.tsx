import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Main Screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(routes)/login/index" options={{ headerShown: false }} />
        <Stack.Screen name="(routes)/signup/index.tsx" options={{ headerShown: false }} />
        <Stack.Screen name="(routes)/otp/index.tsx" options={{ headerShown: false }} />
        
        {/* Tabs Navigation */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Product Screens - নতুন যোগ করুন */}
        <Stack.Screen 
          name="product/[id]" 
          options={{ 
            headerShown: true,
            title: 'Products',
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: '#2c4341',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }} 
        />
        
        {/* All Categories Screen - নতুন যোগ করুন */}
        <Stack.Screen 
          name="categories/index" 
          options={{ 
            headerShown: true,
            title: 'All Categories',
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: '#2c4341',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }} 
        />
        
        {/* Modal Screen */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}