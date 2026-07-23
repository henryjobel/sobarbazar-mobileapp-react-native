import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, registerUser, getUserProfile, updateUserProfile } from '@/utils/api';

// Types
interface User {
  id: string | number;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  name?: string;
  avatar?: string;
  is_active?: boolean;
  date_joined?: string;
  is_email_verified?: boolean;
  shipping_address?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    shipping_address?: string;
    profile_image?: string;
    gender?: string;
  };
}

// The backend (/auth/users/me/) nests real profile data under `customer`
// ({name, email, phone, shipping_address}) rather than at the top level -
// the top-level object only has {id, username, employee, role, customer}.
// Flatten it here once so every screen can keep reading user.name/email/phone
// without needing to know about the nested shape.
function normalizeProfile(profile: any): User {
  if (!profile) return profile;
  const customer = profile.customer;
  return {
    ...profile,
    name: profile.name || customer?.name,
    email: profile.email || customer?.email,
    phone: profile.phone || customer?.phone,
    shipping_address: profile.shipping_address || customer?.shipping_address,
    avatar: profile.avatar || customer?.profile_image,
  };
}

interface AuthTokens {
  access: string;
  refresh?: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  re_password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  name?: string;
  shipping_address?: string;
}

interface AuthContextType extends AuthState {
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage Keys
const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';
const LEGACY_ACCESS_TOKEN_KEY = 'access_token';
const LEGACY_USER_KEY = 'user';

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [tokensStr, userStr] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (tokensStr && userStr) {
        const tokens = JSON.parse(tokensStr) as AuthTokens;
        const user = JSON.parse(userStr) as User;

        // Verify token is still valid by fetching user profile
        const rawProfile = await getUserProfile(tokens.access);
        const profile = normalizeProfile(rawProfile);

        if (profile) {
          setState({
            user: profile,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
          // Keep both the new auth keys and legacy keys in sync for older cart/order code.
          await persistAuth(tokens, profile);
        } else {
          // Token invalid, clear storage
          await clearStorage();
          setState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await clearStorage();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const clearStorage = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(LEGACY_ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(LEGACY_USER_KEY),
    ]);
  };

  const persistAuth = async (tokens: AuthTokens, user: User) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens)),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
      SecureStore.setItemAsync(LEGACY_ACCESS_TOKEN_KEY, tokens.access),
      SecureStore.setItemAsync(LEGACY_USER_KEY, JSON.stringify(user)),
    ]);
  };

  const persistUser = async (user: User) => {
    await Promise.all([
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
      SecureStore.setItemAsync(LEGACY_USER_KEY, JSON.stringify(user)),
    ]);
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      __DEV__ && __DEV__ && console.log('🔐 AuthContext: Attempting login for:', credentials.email);

      let tokenResponse;
      try {
        tokenResponse = await loginUser(credentials.email, credentials.password);
      } catch (loginError: any) {
        console.error('Login API error:', loginError);
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: loginError.message || 'Invalid email or password' };
      }

      if (!tokenResponse || !tokenResponse.access) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Invalid email or password' };
      }

      __DEV__ && __DEV__ && console.log('✅ AuthContext: Token received, fetching profile...');

      const tokens: AuthTokens = {
        access: tokenResponse.access,
        refresh: tokenResponse.refresh,
      };

      // Fetch user profile
      const profile = normalizeProfile(await getUserProfile(tokens.access));

      if (!profile) {
        // Even if profile fetch fails, we have valid tokens
        // Create a basic user object from the email
        const basicUser: User = {
          id: 0,
          email: credentials.email,
        };

        await persistAuth(tokens, basicUser);

        setState({
          user: basicUser,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });

        __DEV__ && __DEV__ && console.log('✅ AuthContext: Login successful (basic profile)');
        return { success: true };
      }

      // Store tokens and user
      await persistAuth(tokens, profile);

      setState({
        user: profile,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      __DEV__ && __DEV__ && console.log('✅ AuthContext: Login successful with full profile');
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      __DEV__ && __DEV__ && console.log('📝 AuthContext: Attempting registration for:', data.email);

      let response;
      try {
        response = await registerUser(data);
      } catch (registerError: any) {
        console.error('Register API error:', registerError);
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: registerError.message || 'Registration failed' };
      }

      __DEV__ && __DEV__ && console.log('📝 AuthContext: Registration response:', JSON.stringify(response).substring(0, 200));

      if (!response) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Registration failed' };
      }

      // If registration auto-logs in, handle that
      if (response.access) {
        __DEV__ && __DEV__ && console.log('✅ AuthContext: Auto-login tokens received');
        const tokens: AuthTokens = {
          access: response.access,
          refresh: response.refresh,
        };

        // Try to fetch user profile
        const profile = normalizeProfile(await getUserProfile(tokens.access));

        if (profile) {
          await persistAuth(tokens, profile);

          setState({
            user: profile,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          __DEV__ && __DEV__ && console.log('✅ AuthContext: Registration successful with full profile');
        } else {
          // Even if profile fetch fails, we have valid tokens
          const basicUser: User = {
            id: 0,
            email: data.email,
            name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          };

          await persistAuth(tokens, basicUser);

          setState({
            user: basicUser,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          __DEV__ && __DEV__ && console.log('✅ AuthContext: Registration successful with basic profile');
        }

        return { success: true };
      }

      // Registration successful but no auto-login (user needs to login manually)
      setState(prev => ({ ...prev, isLoading: false }));
      __DEV__ && __DEV__ && console.log('✅ AuthContext: Registration successful, manual login required');
      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await clearStorage();
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = async (data: Partial<User> & { first_name?: string; last_name?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!state.tokens?.access) {
        return { success: false, error: 'Not authenticated' };
      }

      // The backend only accepts profile edits nested under `customer`
      // ({name, email, phone, shipping_address}) - it has no top-level
      // name/phone/shipping_address fields on the user record itself.
      const name = data.name || [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
      const customerPayload: Record<string, any> = {};
      if (name) customerPayload.name = name;
      if (data.phone) customerPayload.phone = data.phone;
      if (data.shipping_address) customerPayload.shipping_address = data.shipping_address;

      const rawUpdated = await updateUserProfile({ customer: customerPayload }, state.tokens.access);
      const updatedUser = normalizeProfile(rawUpdated?.data ?? rawUpdated);

      if (!updatedUser) {
        return { success: false, error: 'Failed to update profile' };
      }

      await persistUser(updatedUser);

      setState(prev => ({
        ...prev,
        user: { ...prev.user, ...updatedUser },
      }));

      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Update failed' };
    }
  };

  const refreshUser = async () => {
    if (!state.tokens?.access) return;

    try {
      const profile = normalizeProfile(await getUserProfile(state.tokens.access));
      if (profile) {
        await persistUser(profile);
        setState(prev => ({ ...prev, user: profile }));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        token: state.tokens?.access ?? null,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);

  // Return a safe fallback if context is not available
  // This prevents errors when component is used outside provider
  if (context === undefined) {
    __DEV__ && console.warn('useAuth: Context not available, using fallback');
    return {
      user: null,
      tokens: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => ({ success: false, error: 'Context not available' }),
      register: async () => ({ success: false, error: 'Context not available' }),
      logout: async () => {},
      updateProfile: async () => ({ success: false, error: 'Context not available' }),
      refreshUser: async () => {},
    };
  }
  return context;
}

export default AuthContext;
