// Authentication service for DeGeNz Lounge
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define interfaces for User and AuthContext
interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise'; // Define possible plan values
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | undefined>;
  register: (name: string, email: string, password: string) => Promise<User | undefined>;
  logout: () => void;
  updatePlan: (plan: 'free' | 'pro' | 'enterprise') => void;
  hasAccess: (feature: string) => boolean;
}

// Create authentication context with a default value that matches the type
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// Authentication provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('degenz_user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e: any) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('degenz_user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would make an API call to your backend
      // For demo purposes, we'll simulate a successful login
      if (email && password) {
        const user: User = {
          id: 'user-' + Date.now(),
          email,
          name: email.split('@')[0],
          plan: 'free', // Default plan
          createdAt: new Date().toISOString()
        };
        
        // Store user in localStorage
        localStorage.setItem('degenz_user', JSON.stringify(user));
        setCurrentUser(user);
        return user;
      } else {
        throw new Error('Email and password are required');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would make an API call to your backend
      // For demo purposes, we'll simulate a successful registration
      if (name && email && password) {
        const user: User = {
          id: 'user-' + Date.now(),
          email,
          name,
          plan: 'free', // Default plan
          createdAt: new Date().toISOString()
        };
        
        // Store user in localStorage
        localStorage.setItem('degenz_user', JSON.stringify(user));
        setCurrentUser(user);
        return user;
      } else {
        throw new Error('All fields are required');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('degenz_user');
    setCurrentUser(null);
  };

  // Update user plan
  const updatePlan = (plan: 'free' | 'pro' | 'enterprise') => {
    if (!currentUser) return;
    
    const updatedUser: User = {
      ...currentUser,
      plan
    };
    
    localStorage.setItem('degenz_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  // Check if user has access to a feature based on their plan
  const hasAccess = (feature: string): boolean => {
    if (!currentUser) return false;
    
    const planFeatures: Record<'free' | 'pro' | 'enterprise', string[]> = {
      free: ['basic_agents', 'single_sandbox', 'limited_messages'],
      pro: ['unlimited_agents', 'multiple_sandboxes', 'more_messages', 'manager_agent', 'agent_export'],
      enterprise: ['unlimited_agents', 'unlimited_sandboxes', 'unlimited_messages', 'advanced_manager', 'priority_support']
    };
    
    return planFeatures[currentUser.plan]?.includes(feature) || false;
  };

  // Context value
  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updatePlan,
    hasAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

