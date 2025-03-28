/**
 * 环境配置文件
 */

// 开发环境标识
const isDevelopment = process.env.NODE_ENV === 'development';

// API基础路径 - 根据环境变量或默认值
const apiBaseUrl = process.env.VITE_API_BASE_URL || 
                   (isDevelopment ? 'http://localhost' : 'http://1.14.193.108');

// 本地存储Keys
const storageKeys = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LOCALE: 'locale',
};

// 配置项
const config = {
  apiBaseUrl,
  storageKeys,
  // 请求超时时间 (毫秒)
  requestTimeout: 10000,
  // token在多久后过期 (毫秒)
  tokenExpiresIn: 3600 * 1000,
  // 产品名称
  appName: 'EcoHub经济数据平台',
  // 版权信息
  copyright: '© 2025 EcoHub Inc. 保留所有权利',
  // 默认分页
  defaultPageSize: 10,
  // 表格默认分页选项
  pageSizeOptions: ['10', '20', '50', '100'],
  // 文件上传限制 (MB)
  maxUploadSize: 10,
  // 允许上传的文件类型
  allowedUploadTypes: ['.xlsx', '.xls', '.csv', '.json', '.xml'],
  // 开启认证缓存
  enableAuthCache: true,
  // 日志级别: 'debug' | 'info' | 'warn' | 'error' | 'none'
  logLevel: isDevelopment ? 'debug' : 'error',
};

export default config; 