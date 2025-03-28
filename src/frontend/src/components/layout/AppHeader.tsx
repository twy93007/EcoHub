import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Button, Switch, Tooltip } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import config from '../../utils/config';

const { Header } = Layout;

interface AppHeaderProps {
  collapsed?: boolean;
  toggle?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, toggle }) => {
  const navigate = useNavigate();
  const { user, logout, theme, toggleTheme } = useAppContext();
  const [notifications] = useState(5); // 示例通知数量
  
  // 处理登出
  const handleLogout = () => {
    logout();
    // 跳转到登录页
    navigate('/login');
  };
  
  // 用户菜单
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人资料
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
        系统设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );
  
  // 通知菜单
  const notificationMenu = (
    <Menu>
      <Menu.Item key="notification1">
        系统更新通知：新版本已发布
      </Menu.Item>
      <Menu.Item key="notification2">
        管理员消息：请及时更新密码
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="allNotifications" onClick={() => navigate('/notifications')}>
        查看全部通知
      </Menu.Item>
    </Menu>
  );
  
  return (
    <Header className="app-header">
      {toggle && (
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggle}
          style={{ fontSize: '16px', marginRight: 16 }}
        />
      )}
      
      <div style={{ flex: 1 }} />
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={theme === 'light' ? '切换到暗黑模式' : '切换到明亮模式'}>
          <Button
            type="text"
            icon={theme === 'light' ? <BulbOutlined /> : <BulbFilled />}
            onClick={toggleTheme}
            style={{ marginRight: 16 }}
          />
        </Tooltip>
        
        <Button
          type="text"
          icon={<QuestionCircleOutlined />}
          onClick={() => navigate('/help')}
          style={{ marginRight: 16 }}
        />
        
        <Dropdown overlay={notificationMenu} placement="bottomRight">
          <Badge count={notifications} overflowCount={99}>
            <Button type="text" icon={<BellOutlined />} style={{ marginRight: 16 }} />
          </Badge>
        </Dropdown>
        
        <Dropdown overlay={userMenu} placement="bottomRight">
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={user?.avatar}
              icon={!user?.avatar && <UserOutlined />} 
              style={{ marginRight: 8, backgroundColor: '#1890ff' }} 
            />
            <span>{user?.username || '游客'}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader; 