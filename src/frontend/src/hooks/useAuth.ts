import { useState, useCallback } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null,
    };
  });

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/login', {
        username,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({ token, user });
      return user;
    } catch (error) {
      throw new Error('登录失败');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ token: null, user: null });
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    try {
      const response = await axios.put('/api/v1/users/profile', userData, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      return updatedUser;
    } catch (error) {
      throw new Error('更新用户信息失败');
    }
  }, [authState.token]);

  return {
    user: authState.user,
    token: authState.token,
    login,
    logout,
    updateUser,
  };
}; 