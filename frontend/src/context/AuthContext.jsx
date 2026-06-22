import { createContext, useContext, useEffect, useState } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gamers_hub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gamers_hub_token'));
  const [loading, setLoading] = useState(false);

  const saveAuth = (authData) => {
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem('gamers_hub_user', JSON.stringify(authData.user));
    localStorage.setItem('gamers_hub_token', authData.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gamers_hub_user');
    localStorage.removeItem('gamers_hub_token');
  };

  const refreshMe = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      setUser(res.data.data.user);
      localStorage.setItem('gamers_hub_user', JSON.stringify(res.data.data.user));
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, saveAuth, logout, refreshMe, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
