import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

// 面包屑映射配置
const breadcrumbNameMap: Record<string, string> = {
  '/': '首页',
  '/projects': '项目管理',
  '/data': '数据管理',
  '/matching': '数据匹配',
  '/analysis': '数据分析',
  '/marketplace': '数据市场',
  '/ai': 'AI助手',
  '/profile': '个人中心',
  '/settings': '系统设置',
};

const AppBreadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  
  // 构建面包屑项
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      key: url,
      title: <Link to={url}>{breadcrumbNameMap[url] || url.split('/').pop()}</Link>,
    };
  });
  
  // 首页面包屑
  const breadcrumbItems = [
    {
      key: '/',
      title: (
        <Link to="/">
          <HomeOutlined /> {breadcrumbNameMap['/']}
        </Link>
      ),
    },
  ].concat(extraBreadcrumbItems);
  
  return <Breadcrumb items={breadcrumbItems} />;
};

export default AppBreadcrumb; 