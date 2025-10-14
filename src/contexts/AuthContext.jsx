
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setUser(null);
        }
      }
      setLoading(false);
    };
    validateUser();
  }, []);

  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
      }
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: error.message };
    }
  };

  const signInWithGoogle = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithGoogle(credentialResponse.credential);
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
      }
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: error.message };
    }
  };

  const signOut = async () => {
    await authService.logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const signUp = async (userData) => {
    setIsLoading(true);
    try {
        const response = await authService.register(userData);
        if (response.success) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            setUser(response.user);
        }
        setIsLoading(false);
        return response;
    } catch (error) {
        setIsLoading(false);
        return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoading, isSignedIn: !!user, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    return useContext(AuthContext);
}
