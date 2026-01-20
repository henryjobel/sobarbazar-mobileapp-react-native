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
}

interface AuthContextType extends AuthState {
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
        const profile = await getUserProfile(tokens.access);

        if (profile) {
          setState({
            user: profile,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
          // Update stored user with fresh data
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile));
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
    ]);
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      console.log('🔐 AuthContext: Attempting login for:', credentials.email);

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

      console.log('✅ AuthContext: Token received, fetching profile...');

      const tokens: AuthTokens = {
        access: tokenResponse.access,
        refresh: tokenResponse.refresh,
      };

      // Fetch user profile
      const profile = await getUserProfile(tokens.access);

      if (!profile) {
        // Even if profile fetch fails, we have valid tokens
        // Create a basic user object from the email
        const basicUser: User = {
          id: 0,
          email: credentials.email,
        };

        await Promise.all([
          SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens)),
          SecureStore.setItemAsync(USER_KEY, JSON.stringify(basicUser)),
        ]);

        setState({
          user: basicUser,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });

        console.log('✅ AuthContext: Login successful (basic profile)');
        return { success: true };
      }

      // Store tokens and user
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens)),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile)),
      ]);

      setState({
        user: profile,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('✅ AuthContext: Login successful with full profile');
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

      console.log('📝 AuthContext: Attempting registration for:', data.email);

      let response;
      try {
        response = await registerUser(data);
      } catch (registerError: any) {
        console.error('Register API error:', registerError);
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: registerError.message || 'Registration failed' };
      }

      console.log('📝 AuthContext: Registration response:', JSON.stringify(response).substring(0, 200));

      if (!response) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Registration failed' };
      }

      // If registration auto-logs in, handle that
      if (response.access) {
        console.log('✅ AuthContext: Auto-login tokens received');
        const tokens: AuthTokens = {
          access: response.access,
          refresh: response.refresh,
        };

        // Try to fetch user profile
        const profile = await getUserProfile(tokens.access);

        if (profile) {
          await Promise.all([
            SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens)),
            SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile)),
          ]);

          setState({
            user: profile,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ AuthContext: Registration successful with full profile');
        } else {
          // Even if profile fetch fails, we have valid tokens
          const basicUser: User = {
            id: 0,
            email: data.email,
            name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          };

          await Promise.all([
            SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens)),
            SecureStore.setItemAsync(USER_KEY, JSON.stringify(basicUser)),
          ]);

          setState({
            user: basicUser,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ AuthContext: Registration successful with basic profile');
        }

        return { success: true };
      }

      // Registration successful but no auto-login (user needs to login manually)
      setState(prev => ({ ...prev, isLoading: false }));
      console.log('✅ AuthContext: Registration successful, manual login required');
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

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!state.tokens?.access) {
        return { success: false, error: 'Not authenticated' };
      }

      const updatedUser = await updateUserProfile(data, state.tokens.access);

      if (!updatedUser) {
        return { success: false, error: 'Failed to update profile' };
      }

      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));

      setState(prev => ({
        ...prev,
        user: updatedUser,
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
      const profile = await getUserProfile(state.tokens.access);
      if (profile) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(profile));
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
    console.warn('useAuth: Context not available, using fallback');
    return {
      user: null,
      tokens: null,
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
