import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import config from '../utils/config';

// 创建axios实例
const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem(config.storageKeys.TOKEN);
    if (token) {
      // 添加token到请求头
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 处理401错误（未授权/token过期）
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 尝试使用刷新token获取新token
        const refreshToken = localStorage.getItem(config.storageKeys.REFRESH_TOKEN);
        
        if (refreshToken) {
          const response = await axios.post(`${config.apiBaseUrl}/api/v1/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          // 如果成功获取新token
          if (response.data && response.data.status === 'success') {
            // 保存新token
            localStorage.setItem(config.storageKeys.TOKEN, response.data.data.access_token);
            
            // 更新原请求的Authorization头
            originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;
            
            // 重试原请求
            return axios(originalRequest);
          }
        }
        
        // 如果刷新失败，清除本地存储的登录信息
        localStorage.removeItem(config.storageKeys.TOKEN);
        localStorage.removeItem(config.storageKeys.REFRESH_TOKEN);
        localStorage.removeItem(config.storageKeys.USER);
        
        // 重定向到登录页
        window.location.href = '/login';
        
      } catch (refreshError) {
        console.error('Token刷新失败:', refreshError);
        
        // 清除登录信息
        localStorage.removeItem(config.storageKeys.TOKEN);
        localStorage.removeItem(config.storageKeys.REFRESH_TOKEN);
        localStorage.removeItem(config.storageKeys.USER);
        
        // 重定向到登录页
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// 封装GET请求
export const get = <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.get(url, { params, ...config }).then(response => response.data);
};

// 封装POST请求
export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.post(url, data, config).then(response => response.data);
};

// 封装PUT请求
export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.put(url, data, config).then(response => response.data);
};

// 封装DELETE请求
export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.delete(url, config).then(response => response.data);
};

export default api; 