import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  documents: any[];
}

interface AdminData {
  status: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    user: User;
  };
}

interface AuthContextType {
  admin: AdminData | null;
  isAuthenticated: boolean;
  login: (adminData: AdminData) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminData | null>(null);

  const checkTokenValidity = (token: string): boolean => {
    if (!token) return false;
    
    // For Laravel Sanctum tokens, we can't decode them like JWT
    // Just check if token exists and is not empty
    return token.length > 0;
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        if (adminData.data?.access_token && checkTokenValidity(adminData.data.access_token)) {
          setAdmin(adminData);
        } else {
          localStorage.removeItem('admin');
        }
      } catch (error) {
        localStorage.removeItem('admin');
      }
    }
  }, []);

  useEffect(() => {
    if (admin?.data?.access_token) {
      const checkInterval = setInterval(() => {
        if (!checkTokenValidity(admin.data.access_token)) {
          logout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkInterval);
    }
  }, [admin?.data?.access_token]);

  const login = (adminData: AdminData) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  const getToken = () => {
    return admin?.data?.access_token || null;
  };

  const value: AuthContextType = {
    admin,
    isAuthenticated: !!admin,
    login,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};