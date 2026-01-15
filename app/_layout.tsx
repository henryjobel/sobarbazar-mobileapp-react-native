import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProviders } from '@/context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Main Screens */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/login/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/signup/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/otp/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/forgot-password/index" options={{ headerShown: false }} />

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
            name="screens/shop/index"
            options={{
              headerShown: true,
              title: 'Shop',
              headerStyle: {
                backgroundColor: '#ffffff',
              },
              headerTintColor: '#2c4341',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />

          {/* All Categories Screen */}
          <Stack.Screen
            name="screens/categories/index"
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

          {/* Checkout Screen */}
          <Stack.Screen
            name="screens/checkout/index"
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
            name="screens/order-success/index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/order-failed/index"
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
          <Stack.Screen name="(routes)/my-orders/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/address/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/payments/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/personal-info/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/security/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/notifications/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/help/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/contact/index" options={{ headerShown: false }} />
          <Stack.Screen name="(routes)/terms/index" options={{ headerShown: false }} />

          {/* Vendor Screens */}
          <Stack.Screen
            name="screens/vendors/index"
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
            name="screens/stores/index"
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
            name="screens/search/index"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />

          {/* Modal Screen */}
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProviders>
  );
}
