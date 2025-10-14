import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authAPI } from '../config/api';
import { AuthContextType, Employer, JobSeeker, RegisterRequest, UserRole } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    role: UserRole;
    profile: JobSeeker | Employer;
  } | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedRole && storedUser) {
        setToken(storedToken);
        setUserRole(storedRole as UserRole);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: authToken, user: userData } = response.data.data;

      // Store auth data
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('userRole', userData.role);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setToken(authToken);
      setUserRole(userData.role);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (
    userData: RegisterRequest
  ): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
      const response = await authAPI.register(userData);
      const { token: authToken, user: registeredUser } = response.data.data;

      // Store auth data
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('userRole', registeredUser.role);
      await AsyncStorage.setItem('userData', JSON.stringify(registeredUser));

      setToken(authToken);
      setUserRole(registeredUser.role);
      setUser(registeredUser);

      return { success: true, user: registeredUser };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userData');

      // Clear state
      setToken(null);
      setUserRole(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: any): Promise<void> => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userRole,
    token,
    isLoading,
    isAuthenticated: !!token,
    isJobSeeker: userRole === UserRole.JOB_SEEKER,
    isEmployer: userRole === UserRole.EMPLOYER,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;