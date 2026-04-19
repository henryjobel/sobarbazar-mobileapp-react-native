import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: {
    id: string;
    file_id: string;
    url: string;
  };
}

// Store user data
export const storeUserData = async (user: User): Promise<void> => {
  try {
    const userString = JSON.stringify(user);
    await SecureStore.setItemAsync("user", userString);
    __DEV__ && __DEV__ && console.log("User data stored successfully");
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
};

// Retrieve user data
export const getUserData = async (): Promise<User | null> => {
  try {
    const userString = await SecureStore.getItemAsync("user");
    if (userString) {
      const user = JSON.parse(userString) as User;
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

// Remove user data (logout)
export const removeUserData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync("user");
    __DEV__ && __DEV__ && console.log("User data removed successfully");
  } catch (error) {
    console.error("Error removing user data:", error);
    throw error;
  }
};

// Hook to use user data in components
export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await getUserData();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      await storeUserData(userData);
      setUser(userData);
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await removeUserData();
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    refreshUser: loadUser
  };
};
