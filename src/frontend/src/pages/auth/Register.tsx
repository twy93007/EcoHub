import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const { Title } = Typography;

interface RegisterFormValues {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAppContext();
  
  const onFinish = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      
      // 使用封装好的API客户端调用注册API
      const response: any = await post('/api/auth/register', {
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password
      });
      
      if (response.status === 'success') {
        message.success('注册成功');
        
        // 判断响应中是否包含登录信息，如果有则自动登录
        if (response.data?.access_token && response.data?.refresh_token) {
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
          navigate('/');
        } else {
          navigate('/login');
        }
      } else {
        message.error(response.message || '注册失败，请重试');
      }
    } catch (error: any) {
      console.error('注册请求错误:', error);
      if (error.response) {
        message.error(error.response.data?.message || `注册失败: ${error.response.status}`);
      } else if (error.request) {
        message.error('注册失败: 服务器未响应');
      } else {
        message.error(`注册失败: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-container">
      <Card className="register-form">
        <div className="register-logo">
          <img src="/logo.svg" alt="EcoHub Logo" height="64" />
        </div>
        
        <Title level={2} className="register-title">
          创建新账号
        </Title>
        
        <Form
          name="register"
          initialValues={{ agreeTerms: false }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              autoComplete="username"
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="邮箱" 
              autoComplete="email"
            />
          </Form.Item>
          
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="手机号" 
              autoComplete="tel"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8个字符' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              autoComplete="new-password"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="确认密码" 
              autoComplete="new-password"
            />
          </Form.Item>
          
          <Form.Item
            name="agreeTerms"
            valuePropName="checked"
            rules={[
              { required: true, message: '请同意服务条款和隐私政策', transform: value => value === true }
            ]}
          >
            <Checkbox>
              我已阅读并同意 <a href="/terms">服务条款</a> 和 <a href="/privacy">隐私政策</a>
            </Checkbox>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Button type="link" block>
              <Link to="/login">已有账号? 立即登录</Link>
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register; 