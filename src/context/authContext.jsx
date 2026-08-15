import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  const isPaid =
    user?.subscription === 'paid' ||
    user?.subscription_status === 'paid';

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'administrator';

  const isDeveloper =
    user?.role === 'developer';

  const isStaff = isAdmin || isDeveloper;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAuthenticated,
        isPaid,
        isAdmin,
        isDeveloper,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
}

export default AuthContext;