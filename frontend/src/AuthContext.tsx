import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('arbitragex_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setUser(data.user);
        localStorage.setItem('arbitragex_user', JSON.stringify(data.user));
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
    setIsLoading(false);
    return false;
  };

  const demoLogin = async () => {
    // Just try the default credentials
    await login('shaurya@arbitragex.io', 'admin123');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arbitragex_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, demoLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
