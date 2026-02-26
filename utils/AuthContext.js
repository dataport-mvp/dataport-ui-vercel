// utils/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const api = process.env.NEXT_PUBLIC_API_URL_PROD;
    
    try {
      const res = await fetch(`${api}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await res.json();
      
      // Store token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.access_token);
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password, name, phone, role = 'employee') => {
    const api = process.env.NEXT_PUBLIC_API_URL_PROD;
    
    try {
      const res = await fetch(`${api}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, role })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Signup failed');
      }

      const data = await res.json();
      
      // After signup, automatically login
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const apiCall = async (endpoint, method = 'GET', body = null) => {
    const api = process.env.NEXT_PUBLIC_API_URL_PROD;
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${api}${endpoint}`, options);
      
      // Handle 401 - redirect to login
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || `API error: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      logout,
      apiCall,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
