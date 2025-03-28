import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import config from '../utils/config';

// 布局组件
import AppLayout from '../components/layout/AppLayout';

// 页面组件
import HomePage from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';

// 懒加载页面组件
const DataManagementPage = React.lazy(() => import('../pages/data/DataManagementPage'));
const DataTablesPage = React.lazy(() => import('../pages/data/DataTablesPage'));
const DataSetsPage = React.lazy(() => import('../pages/data/DataSetsPage'));
const DataTemplatesPage = React.lazy(() => import('../pages/data/DataTemplatesPage'));
const MatchingTasksPage = React.lazy(() => import('../pages/MatchingTasksPage'));
const MatchingResultsPage = React.lazy(() => import('../pages/MatchingResultsPage'));
const DataVisualizationPage = React.lazy(() => import('../pages/DataVisualizationPage'));
const MarketplaceBrowsePage = React.lazy(() => import('../pages/MarketplaceBrowsePage'));
const MarketplaceMyProductsPage = React.lazy(() => import('../pages/MarketplaceMyProductsPage'));
const MarketplaceMyPurchasesPage = React.lazy(() => import('../pages/MarketplaceMyPurchasesPage'));
const ProfilePage = React.lazy(() => import('../pages/Profile'));
const UserManagementPage = React.lazy(() => import('../pages/admin/UserManagement'));
const RoleManagementPage = React.lazy(() => import('../pages/admin/RoleManagement'));
const SystemSettingsPage = React.lazy(() => import('../pages/admin/SystemSettings'));
const ProjectsPage = React.lazy(() => import('../pages/Projects'));
const AnalysisToolsPage = React.lazy(() => import('../pages/AnalysisToolsPage'));

// 加载组件
const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    正在加载...
  </div>
);

// 懒加载包装器
const lazyLoad = (Component: React.LazyExoticComponent<any>) => {
  return (
    <React.Suspense fallback={<LoadingComponent />}>
      <Component />
    </React.Suspense>
  );
};

// 公共路由访问守卫 - 如果用户已登录，重定向到首页
const PublicRouteGuard = () => {
  const isLoggedIn = localStorage.getItem(config.storageKeys.TOKEN) !== null;
  
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

// 受保护路由访问守卫 - 如果用户未登录，重定向到登录页
const ProtectedRouteGuard = () => {
  const isLoggedIn = localStorage.getItem(config.storageKeys.TOKEN) !== null;
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// 路由配置
const router = createBrowserRouter([
  // 公共路由 - 未登录可访问
  {
    element: <PublicRouteGuard />,
    children: [
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />
      }
    ]
  },
  
  // 受保护路由 - 需要登录
  {
    element: <ProtectedRouteGuard />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          // 数据管理
          {
            path: 'data',
            element: lazyLoad(DataManagementPage)
          },
          {
            path: 'data/tables',
            element: lazyLoad(DataTablesPage)
          },
          {
            path: 'data/sets',
            element: lazyLoad(DataSetsPage)
          },
          {
            path: 'data/templates',
            element: lazyLoad(DataTemplatesPage)
          },
          // 数据匹配
          {
            path: 'matching/tasks',
            element: lazyLoad(MatchingTasksPage)
          },
          {
            path: 'matching/results',
            element: lazyLoad(MatchingResultsPage)
          },
          {
            path: 'matching/results/:id',
            element: lazyLoad(MatchingResultsPage)
          },
          // 数据分析
          {
            path: 'analysis-tools',
            element: lazyLoad(AnalysisToolsPage)
          },
          {
            path: 'analysis/visualization',
            element: lazyLoad(DataVisualizationPage)
          },
          // 数据集市
          {
            path: 'marketplace/browse',
            element: lazyLoad(MarketplaceBrowsePage)
          },
          {
            path: 'marketplace/my-products',
            element: lazyLoad(MarketplaceMyProductsPage)
          },
          {
            path: 'marketplace/my-purchases',
            element: lazyLoad(MarketplaceMyPurchasesPage)
          },
          // 用户管理
          {
            path: 'profile',
            element: lazyLoad(ProfilePage)
          },
          // 管理员模块
          {
            path: 'admin/users',
            element: lazyLoad(UserManagementPage)
          },
          {
            path: 'admin/roles',
            element: lazyLoad(RoleManagementPage)
          },
          {
            path: 'admin/system',
            element: lazyLoad(SystemSettingsPage)
          },
          {
            path: 'projects',
            element: lazyLoad(ProjectsPage)
          }
        ]
      }
    ]
  },
  
  // 404页面
  {
    path: '/404',
    element: <NotFound />
  },
  
  // 未匹配路由 - 重定向到404
  {
    path: '*',
    element: <Navigate to="/404" replace />
  }
]);

export default router;