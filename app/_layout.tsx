import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';

import { AppProviders } from '@/context';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Main Screens */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/signup" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/otp" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/forgot-password" options={{ headerShown: false }} />

          {/* Tabs Navigation */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Product Screens */}
          <Stack.Screen
            name="screens/product/[id]"
            options={{
              headerShown: true,
              title: 'Product Details',
              headerStyle: {
                backgroundColor: '#ffffff',
              },
              headerTintColor: '#2c4341',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />

          {/* Shop/Browse Screen */}
          <Stack.Screen
            name="screens/shop"
            options={{
              headerShown: false,
            }}
          />

          {/* All Categories Screen */}
          <Stack.Screen
            name="screens/categories"
            options={{
              headerShown: false,
            }}
          />

          {/* Checkout Screen */}
          <Stack.Screen
            name="screens/checkout"
            options={{
              headerShown: true,
              title: 'Checkout',
              headerStyle: {
                backgroundColor: '#ffffff',
              },
              headerTintColor: '#2c4341',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />

          {/* Order Screens */}
          <Stack.Screen
            name="screens/order-success"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/order-failed"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/order-detail/[id]"
            options={{
              headerShown: true,
              title: 'Order Details',
              headerStyle: {
                backgroundColor: '#ffffff',
              },
              headerTintColor: '#2c4341',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />

          {/* Account Routes */}
          <Stack.Screen name="(routes)/my-orders" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/address" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/payments" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/personal-info" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/security" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/help" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/contact" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/terms" options={{ headerShown: false }} />

          {/* Vendor Screens */}
          <Stack.Screen
            name="screens/vendors"
            options={{
              headerShown: true,
              title: 'Vendors',
              headerStyle: {
                backgroundColor: '#ffffff',
              },
              headerTintColor: '#2c4341',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <Stack.Screen
            name="screens/vendor-detail/[id]"
            options={{
              headerShown: true,
              title: 'Store Details',
              headerStyle: {
                backgroundColor: '#ffffff',
              },
              headerTintColor: '#2c4341',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />

          {/* Stores Screens */}
          <Stack.Screen
            name="screens/stores"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/store/[id]"
            options={{
              headerShown: false,
            }}
          />

          {/* Search Screen */}
          <Stack.Screen
            name="screens/search"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />

          {/* Modal Screen */}
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </AppProviders>
    </ErrorBoundary>
  );
}
