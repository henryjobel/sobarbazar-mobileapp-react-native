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

      const tokenResponse = await loginUser(credentials.email, credentials.password);

      if (!tokenResponse || !tokenResponse.access) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Invalid email or password' };
      }

      const tokens: AuthTokens = {
        access: tokenResponse.access,
        refresh: tokenResponse.refresh,
      };

      // Fetch user profile
      const profile = await getUserProfile(tokens.access);

      if (!profile) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Failed to fetch user profile' };
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

      const response = await registerUser(data);

      if (!response) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Registration failed' };
      }

      // If registration auto-logs in, handle that
      if (response.access) {
        const tokens: AuthTokens = {
          access: response.access,
          refresh: response.refresh,
        };

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
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }

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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
