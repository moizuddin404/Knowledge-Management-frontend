import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const getCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
            userId: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({
      user_id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/sign-in";
  };

  useEffect(() => {
    (async() => {

      getCurrentUser();
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
