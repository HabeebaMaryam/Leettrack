import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
import { tokenStorage } from '@/lib/tokenStorage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User & { token?: string }) => void;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Only check auth if we have a token
      if (!tokenStorage.hasToken()) {
        setIsLoading(false);
        return;
      }

      const token = tokenStorage.getToken();
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid, clear it
        tokenStorage.removeToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenStorage.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User & { token?: string }) => {
    // Extract token if present
    const { token, ...userWithoutToken } = userData;
    
    // Store token if provided
    if (token) {
      tokenStorage.setToken(token);
    }
    
    setUser(userWithoutToken as User);
  };

  const logout = () => {
    tokenStorage.removeToken();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
