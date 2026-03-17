'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { emailApi } from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface GmailAccount {
  id: number;
  email: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeGmailAccount: GmailAccount | null;
  gmailAccounts: GmailAccount[];
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  fetchGmailAccounts: () => Promise<void>;
  selectGmailAccount: (accountId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([]);
  const [activeGmailAccount, setActiveGmailAccount] = useState<GmailAccount | null>(null);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
      await fetchGmailAccounts();
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const fetchGmailAccounts = async () => {
    try {
      const response = await emailApi.getGmailAccounts();
      const accounts = response.data;
      setGmailAccounts(accounts);
      const active = accounts.find((acc: GmailAccount) => acc.is_active);
      setActiveGmailAccount(active || null);
    } catch (error) {
      console.error("Failed to fetch Gmail accounts", error);
    }
  };

  const selectGmailAccount = async (accountId: number) => {
    try {
      await emailApi.selectGmailAccount(accountId);
      await fetchGmailAccounts();
    } catch (error) {
      console.error("Failed to select Gmail account", error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        fetchUser();
      } else {
        setLoading(false);
      }
    }
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setGmailAccounts([]);
    setActiveGmailAccount(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      activeGmailAccount, 
      gmailAccounts, 
      login, 
      logout,
      fetchGmailAccounts,
      selectGmailAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
