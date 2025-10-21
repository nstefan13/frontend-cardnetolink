'use client';
import { createContext, useState, useEffect, PropsWithChildren, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/userTypes';
import { login, register, deleteUser, me, logout } from '@/api/authApi';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext({
  user: null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  deleteAccount: () => Promise.resolve()
} as AuthContextValue);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      window.location.pathname !== '/auth/register' &&
      window.location.pathname !== '/auth/login'
    ) {
      me()
        .then((response) => {
          if (response.data) {
            setUser(response.data);
          } else {
            router.push('/auth/register');
          }
        })
        .catch(() => {
          router.push('/auth/register');
        })
        .finally(() => setLoading(false));
    }

    setLoading(false);
  }, []);

  const handleLogin = (email: string, password: string) => {
    return login(email, password).then((response) => setUser(response.data));
  };

  const handleRegister = (email: string, password: string) => {
    return register(email, password).then((response) => setUser(response.data));
  };

  const handleLogout = () => {
    return logout().then(() => {
      setUser(null);
      router.push('/auth/login');
    });
  };

  const handleDeleteAccount = (email: string, password: string) => {
    return deleteUser(email, password).then(() => setUser(null));
  };

  if (loading) {
    return null;
  }

  const value = {
    user: user as User,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    deleteAccount: handleDeleteAccount
  } as unknown as AuthContextValue;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
