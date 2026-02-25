import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi, register as registerApi } from '../api/auth';

const AuthContext = createContext();

// Helper: Parse JWT payload
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const userData = parseJwt(token);
      if (userData) {
        setUser({
          userId: userData.sub,
          email: userData.email
        });
      } else {
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const token = res.data.accessToken;
    localStorage.setItem('accessToken', token);
    
    const userData = parseJwt(token);
    setUser({
      userId: userData.sub,
      email: userData.email
    });
    return userData;
  };

  const register = async (email, password) => {
    await registerApi(email, password);
    // Redirect to login after registration
    window.location.href = '/login';
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);