import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  register: async () => {
    throw new Error('register not implemented');
  },
  login: async () => {
    throw new Error('login not implemented');
  },
  logout: async () => {
    throw new Error('logout not implemented');
  }
});
