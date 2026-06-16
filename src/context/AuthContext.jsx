import { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUser, setToken, setUser, removeToken, removeUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser());
  const [token, setTokenState] = useState(getToken());

  const login = (userData, accessToken) => {
    setToken(accessToken);
    setUser(userData);
    setTokenState(accessToken);
    setUserState(userData);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);