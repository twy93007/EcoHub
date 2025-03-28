import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme, message } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import config from '../utils/config';

// 主题类型
type ThemeMode = 'light' | 'dark';

// 用户信息接口
interface UserInfo {
  id: string;
  username: string;
  role: string;
  avatar?: string;
}

// 应用上下文接口
interface AppContextType {
  // 主题相关
  theme: ThemeMode;
  toggleTheme: () => void;
  
  // 用户相关
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  isLoggedIn: boolean;
  
  // 登录/登出
  login: (token: string, refreshToken: string, userInfo: UserInfo) => void;
  logout: () => void;
}

// 创建上下文
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Props接口
interface AppProviderProps {
  children: ReactNode;
}

// 应用上下文提供者
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // 主题状态
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem(config.storageKeys.THEME);
    return (savedTheme as ThemeMode) || 'light';
  });
  
  // 用户状态
  const [user, setUser] = useState<UserInfo | null>(() => {
    const savedUser = localStorage.getItem(config.storageKeys.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // 判断用户是否已登录
  const isLoggedIn = Boolean(
    localStorage.getItem(config.storageKeys.TOKEN) && user
  );
  
  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(config.storageKeys.THEME, newTheme);
  };
  
  // 登录函数
  const login = (token: string, refreshToken: string, userInfo: UserInfo) => {
    localStorage.setItem(config.storageKeys.TOKEN, token);
    localStorage.setItem(config.storageKeys.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(config.storageKeys.USER, JSON.stringify(userInfo));
    setUser(userInfo);
    message.success('登录成功');
  };
  
  // 登出函数
  const logout = () => {
    localStorage.removeItem(config.storageKeys.TOKEN);
    localStorage.removeItem(config.storageKeys.REFRESH_TOKEN);
    localStorage.removeItem(config.storageKeys.USER);
    setUser(null);
    message.success('已安全退出');
  };
  
  // 设置Ant Design主题
  const antTheme = {
    algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#00b96b',
      borderRadius: 4,
    },
  };
  
  // 提供上下文值
  const contextValue: AppContextType = {
    theme,
    toggleTheme,
    user,
    setUser,
    isLoggedIn,
    login,
    logout,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      <ConfigProvider locale={zhCN} theme={antTheme}>
        {children}
      </ConfigProvider>
    </AppContext.Provider>
  );
};

// 自定义钩子，用于访问上下文
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext必须在AppProvider内部使用');
  }
  return context;
};

export default AppContext; 