import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  FileOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  FileSearchOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  LinkOutlined,
  AreaChartOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const { Sider } = Layout;
const { SubMenu } = Menu;

interface AppSidebarProps {
  collapsed: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  
  // 判断用户是否为管理员
  const isAdmin = user?.role === 'admin';
  
  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const pathname = location.pathname;
    const paths = pathname.split('/').filter((p: string) => p);
    
    // 设置选中的菜单项
    setSelectedKeys([pathname]);
    
    // 设置展开的子菜单
    if (paths.length > 0 && !collapsed) {
      setOpenKeys([`/${paths[0]}`]);
    }
  }, [location.pathname, collapsed]);
  
  // 处理子菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };
  
  return (
    <Sider trigger={null} collapsible collapsed={collapsed} width={256}>
      <div className="logo" style={{ 
        height: '64px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        color: 'white',
        fontSize: collapsed ? '16px' : '20px',
        fontWeight: 'bold'
      }}>
        {collapsed ? 'E' : 'EcoHub 生态平台'}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={({ key }: { key: string }) => navigate(key)}
      >
        <Menu.Item key="/" icon={<DashboardOutlined />}>
          仪表盘
        </Menu.Item>
        
        <SubMenu key="/data" icon={<DatabaseOutlined />} title="数据管理">
          <Menu.Item key="/data/tables">数据表</Menu.Item>
          <Menu.Item key="/data/sets">数据集</Menu.Item>
          <Menu.Item key="/data/templates">数据模板</Menu.Item>
        </SubMenu>
        
        <SubMenu key="/matching" icon={<LinkOutlined />} title="数据匹配">
          <Menu.Item key="/matching/tasks">匹配任务</Menu.Item>
          <Menu.Item key="/matching/results">匹配结果</Menu.Item>
        </SubMenu>
        
        <SubMenu key="/analysis" icon={<AreaChartOutlined />} title="数据分析">
          <Menu.Item key="/analysis/tools">分析工具</Menu.Item>
          <Menu.Item key="/analysis/visualization">数据可视化</Menu.Item>
          <Menu.Item key="/analysis/dashboards">仪表盘</Menu.Item>
        </SubMenu>
        
        <SubMenu key="/marketplace" icon={<ShopOutlined />} title="数据集市">
          <Menu.Item key="/marketplace/browse">浏览数据</Menu.Item>
          <Menu.Item key="/marketplace/my-products">我的发布</Menu.Item>
          <Menu.Item key="/marketplace/my-purchases">我的购买</Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/profile" icon={<UserOutlined />}>
          个人中心
        </Menu.Item>
        
        {isAdmin && (
          <SubMenu key="/admin" icon={<SettingOutlined />} title="系统管理">
            <Menu.Item key="/admin/users">用户管理</Menu.Item>
            <Menu.Item key="/admin/roles">角色权限</Menu.Item>
            <Menu.Item key="/admin/system">系统设置</Menu.Item>
            <Menu.Item key="/admin/logs">系统日志</Menu.Item>
          </SubMenu>
        )}
        
        <SubMenu key="/help" icon={<AppstoreOutlined />} title="帮助支持">
          <Menu.Item key="/help/guide">使用指南</Menu.Item>
          <Menu.Item key="/help/faq">常见问题</Menu.Item>
          <Menu.Item key="/help/contact">联系我们</Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  );
};

export default AppSidebar; 