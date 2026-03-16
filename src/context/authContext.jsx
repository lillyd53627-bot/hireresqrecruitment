import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, subscription: 'free' | 'paid' }

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);
  const isAuthenticated = !!user;
  const isPaid = user?.subscription === 'paid';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isPaid }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);