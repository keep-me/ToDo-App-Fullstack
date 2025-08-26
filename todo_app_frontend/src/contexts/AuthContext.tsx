import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, AuthContextType } from '../types/Auth';
import { authApi } from '../api/auth';
import { authUtils } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const savedToken = authUtils.getAccessToken();
    const savedUser = authUtils.getUser();
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      const { access, refresh, user: userData } = response;
      
      authUtils.setTokens(access, refresh);
      authUtils.setUser(userData);
      
      setToken(access);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await authApi.register(userData);
      const { access, refresh, user: newUser } = response;
      
      authUtils.setTokens(access, refresh);
      authUtils.setUser(newUser);
      
      setToken(access);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authUtils.removeTokens();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};