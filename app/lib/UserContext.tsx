'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type UserContextType = {
  token: string;
  setToken: (token: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  token: '',
  setToken: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState('');

  useEffect(() => {
    setTokenState(localStorage.getItem('token') ?? '');
  }, []);

  const setToken = (token: string) => {
    localStorage.setItem('token', token);
    setTokenState(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setTokenState('');
  };

  return (
    <UserContext.Provider value={{ token, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
