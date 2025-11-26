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
    console.log("User data stored successfully");
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
    console.log("User data removed successfully");
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

// Example usage in a component
export const UserProfile: React.FC = () => {
  const { user, loading, logout } = useUser();

  if (loading) {
    return (
      <div className="p-4">
        <Text className="text-gray-600">Loading user data...</Text>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <Text className="text-gray-600">No user logged in</Text>
      </div>
    );
  }

  return (
    <View className="p-4">
      <Text className="text-xl font-bold text-gray-800">{user.name}</Text>
      <Text className="text-gray-600">{user.email}</Text>
      {user.avatar && (
        <Image 
          source={{ uri: user.avatar.url }} 
          className="w-20 h-20 rounded-full mt-2"
        />
      )}
      <TouchableOpacity 
        className="bg-red-500 rounded-lg py-2 px-4 mt-4"
        onPress={logout}
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example usage in login
export const LoginComponent: React.FC = () => {
  const { login } = useUser();

  const handleLogin = async () => {
    try {
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        avatar: {
          id: "avatar1",
          file_id: "file123",
          url: "https://example.com/avatar.jpg"
        }
      };
      
      await login(mockUser);
      console.log("Login successful");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <View className="p-4">
      <TouchableOpacity 
        className="bg-green-500 rounded-lg py-3 px-6"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-semibold">Login</Text>
      </TouchableOpacity>
    </View>
  );
};