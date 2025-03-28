import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import AppBreadcrumb from './AppBreadcrumb';
import config from '../../utils/config';

const { Content, Footer } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  // 切换侧边栏收起/展开
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar collapsed={collapsed} />
      
      <Layout className="site-layout">
        <AppHeader 
          collapsed={collapsed} 
          toggle={toggleCollapsed} 
        />
        
        <Content style={{ margin: '24px 16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <AppBreadcrumb />
          </div>
          
          <div style={{ padding: 24, background: '#fff', minHeight: 280 }}>
            <Outlet />
          </div>
        </Content>
        
        <Footer style={{ textAlign: 'center' }}>
          {config.copyright}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout; 