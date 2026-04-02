'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type UserContextType = {
  token: string;
  setToken: (token: string) => void;
  logout: () => void;
  isInitialized: boolean;
};

const UserContext = createContext<UserContextType>({
  token: '',
  setToken: () => {},
  logout: () => {},
  isInitialized: false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const retrieveAndStoreToken = () => {
      setTokenState(localStorage.getItem('token') ?? '');
      setIsInitialized(true);
    };

    retrieveAndStoreToken();
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
    <UserContext.Provider value={{ isInitialized, token, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
