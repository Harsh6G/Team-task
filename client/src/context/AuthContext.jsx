import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(credentials) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function signup(payload) {
    const data = await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
