import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { post } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import config from '../../utils/config';

const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAppContext();
  
  // 获取重定向路径 (如果存在)
  const from = location.state?.from?.pathname || '/';
  
  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      
      // 调用登录API
      const response: any = await post('/api/auth/login', {
        username: values.username,
        password: values.password
      });
      
      if (response.status === 'success' && response.data) {
        console.log('登录成功，即将跳转到:', from);
        
        // 使用context进行登录处理
        login(
          response.data.access_token,
          response.data.refresh_token,
          {
            id: response.data.user.id,
            username: response.data.user.username,
            role: response.data.user.role,
            avatar: response.data.user.avatar
          }
        );
        
        // 显示登录成功消息
        message.success('登录成功，正在跳转...');
        
        // 使用延时确保状态更新完成
        setTimeout(() => {
          // 跳转到来源页面或首页
          navigate(from, { replace: true });
          
          // 强制刷新页面以确保应用状态正确
          // window.location.href = from;
        }, 500);
      } else {
        message.error(response.message || '登录失败，请重试');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      message.error(error.response?.data?.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <Card className="login-form">
        <div className="login-logo">
          <img src="/logo.svg" alt="EcoHub Logo" height="64" />
        </div>
        
        <Title level={2} className="login-title">
          {config.appName}
        </Title>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              autoComplete="username"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              autoComplete="current-password"
            />
          </Form.Item>
          
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            
            <Link to="/forgot-password" style={{ float: 'right' }}>
              忘记密码?
            </Link>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Button type="link" block>
              <Link to="/register">没有账号? 立即注册</Link>
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 