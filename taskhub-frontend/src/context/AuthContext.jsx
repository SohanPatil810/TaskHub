import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const authApi = axios.create({
  baseURL: `${BASE_URL}/auth`,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  // Fetch real user profile when we have a token
  const fetchUser = useCallback(async (jwt) => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUser(res.data);
    } catch {
      // Token may be invalid/expired — clear it
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser(token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await authApi.post('/login', { email, password });
      setToken(res.data.accessToken);
      toast.success('Logged in successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      await authApi.post('/register', { name, email, password });
      toast.success('Registration successful! Please login.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    toast.success('Logged out!');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
