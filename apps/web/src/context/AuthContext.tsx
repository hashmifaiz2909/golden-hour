import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, phone: string, pass: string, role: 'rider' | 'responder') => Promise<void>;
  logout: () => void;
  setDemoUser: (role: 'rider' | 'responder') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gh_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && (parsed.name.includes('Aarav') || parsed.name.includes('Mehta'))) {
          localStorage.removeItem('gh_user');
          localStorage.removeItem('gh_token');
          return null;
        }
        return parsed;
      }
    } catch {
      localStorage.removeItem('gh_user');
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const savedUser = localStorage.getItem('gh_user');
    if (!savedUser) {
      localStorage.removeItem('gh_token');
      return null;
    }
    return localStorage.getItem('gh_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (token && !user) {
      api.getMe(token)
        .then(res => setUser(res.user))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('gh_user', JSON.stringify(res.user));
      localStorage.setItem('gh_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, pass: string, role: 'rider' | 'responder') => {
    setIsLoading(true);
    try {
      const res = await api.register(name, email, phone, pass, role);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('gh_user', JSON.stringify(res.user));
      localStorage.setItem('gh_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = async (role: 'rider' | 'responder') => {
    const email = role === 'rider' ? 'rider@goldenhour.org' : 'responder@goldenhour.org';
    await login(email, 'demo123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('gh_user');
      localStorage.removeItem('gh_token');
      localStorage.removeItem('gh_custom_profile');
      localStorage.removeItem('gh_emergency_contacts');
      localStorage.clear();
    } catch {
      // LocalStorage access safe handling
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
