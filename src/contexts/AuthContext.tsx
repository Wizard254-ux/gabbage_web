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
  message: string;
  user: User;
  token: string;
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
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        if (adminData.token && checkTokenValidity(adminData.token)) {
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
    if (admin?.token) {
      const checkInterval = setInterval(() => {
        if (!checkTokenValidity(admin.token)) {
          logout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkInterval);
    }
  }, [admin?.token]);

  const login = (adminData: AdminData) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  const getToken = () => {
    return admin?.token || null;
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