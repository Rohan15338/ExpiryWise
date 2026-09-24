import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser, getRegisteredUsers, saveRegisteredUsers, DEMO_USER } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const active = getCurrentUser();
    if (active) {
      setUser(active);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate brief network delay
    await new Promise(r => setTimeout(r, 400));

    const users = getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      setIsLoading(false);
      return { success: false, error: 'No account found with this email. Please sign up.' };
    }

    if (password && existing.password && existing.password !== password) {
      setIsLoading(false);
      return { success: false, error: 'Incorrect password. Please try again or reset password.' };
    }

    setUser(existing);
    setCurrentUser(existing);
    setIsLoading(false);
    return { success: true };
  };

  const loginAsDemo = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setUser(DEMO_USER);
    setCurrentUser(DEMO_USER);
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 450));

    const cleanEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim() || 'Food Hero',
      email: cleanEmail,
      password: password || 'password123',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      reminderDaysDefault: 2,
      soundEnabled: true,
      currency: '$',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    setUser(newUser);
    setCurrentUser(newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(r => setTimeout(r, 500));
    const users = getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!existing) {
      return { success: false, message: 'No registered user with that email was found.' };
    }
    return {
      success: true,
      message: `Password reset link & recovery pin sent to ${email}. You may now enter a new password.`
    };
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(r => setTimeout(r, 400));
    const users = getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const index = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (index === -1) {
      return { success: false, message: 'Account not found.' };
    }

    users[index].password = newPassword;
    saveRegisteredUsers(users);

    if (user && user.email.toLowerCase() === cleanEmail) {
      const updated = { ...user, password: newPassword };
      setUser(updated);
      setCurrentUser(updated);
    }

    return { success: true, message: 'Your password has been successfully updated!' };
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setCurrentUser(updated);

    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = updated;
      saveRegisteredUsers(users);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        signup,
        logout,
        requestPasswordReset,
        resetPassword,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
