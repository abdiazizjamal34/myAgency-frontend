import { useState, useEffect, createContext, useContext } from "react";
import { AuthAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 🔑 Login
  const login = async (email, password) => {
    const { data } = await AuthAPI.login(email, password);

    // Save token for axios interceptor
    localStorage.setItem("token", data.token);

    // Save user object for reloading session
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
  };

  // 🚪 Logout
  // const logout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   setUser(null);
  // };

  const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);
  window.location.href = "/login"; // ✅ always works
};


  // 🔄 Restore session on reload
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
