import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, signup as apiSignup } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch {}
    }
    setLoading(false);
  }, []);

  const saveAuth = (next) => {
    localStorage.setItem('auth', JSON.stringify(next));
    if (next?.token) localStorage.setItem('token', next.token);
    else localStorage.removeItem('token');
  };

  const handleLogin = async (email, password) => {
    const res = await apiLogin({ email, password });
    setUser(res.user);
    setToken(res.token);
    saveAuth(res);
    return res.user;
  };

  const handleSignup = async (payload) => {
    const res = await apiSignup(payload);
    setUser(res.user);
    setToken(res.token);
    saveAuth(res);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
  };

  const value = useMemo(() => ({ user, token, loading, login: handleLogin, signup: handleSignup, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
