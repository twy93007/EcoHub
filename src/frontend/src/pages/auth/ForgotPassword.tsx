import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Alert, 
  Space, 
  Divider, 
  Spin,
  Row,
  Col
} from 'antd';
import { MailOutlined, SafetyOutlined, KeyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { post } from '../../services/api';

const { Title, Paragraph, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // 验证码倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  
  // 发送验证码
  const sendVerificationCode = async (email: string) => {
    try {
      setVerifyLoading(true);
      
      // 调用发送验证码API
      const response: any = await post('/api/auth/send-verification', {
        email: email,
        type: 'password_reset'
      });
      
      if (response.status === 'success') {
        message.success('验证码已发送到您的邮箱');
        // 开始倒计时
        setCountdown(60);
        return true;
      } else {
        message.error(response.message || '发送验证码失败，请重试');
        return false;
      }
    } catch (error: any) {
      console.error('发送验证码错误:', error);
      message.error(error.response?.data?.message || '发送验证码失败，请检查网络连接');
      return false;
    } finally {
      setVerifyLoading(false);
    }
  };
  
  // 验证邮箱和验证码
  const onVerifyEmail = async (values: { email: string, verificationCode: string }) => {
    try {
      setVerifyLoading(true);
      
      // 调用验证码验证API
      const response: any = await post('/api/auth/verify-code', {
        email: values.email,
        code: values.verificationCode,
        type: 'password_reset'
      });
      
      if (response.status === 'success') {
        message.success('邮箱验证成功');
        setEmailVerified(true);
        setStep(2);
      } else {
        message.error(response.message || '验证失败，请检查验证码是否正确');
      }
    } catch (error: any) {
      console.error('验证错误:', error);
      message.error(error.response?.data?.message || '验证失败，请检查网络连接');
    } finally {
      setVerifyLoading(false);
    }
  };
  
  // 重置密码
  const onResetPassword = async (values: { email: string, verificationCode: string, newPassword: string, confirmPassword: string }) => {
    try {
      setResetLoading(true);
      
      // 调用重置密码API
      const response: any = await post('/api/auth/password/reset', {
        email: values.email,
        code: values.verificationCode,
        password: values.newPassword
      });
      
      if (response.status === 'success') {
        message.success('密码重置成功，请使用新密码登录');
        setSent(true);
      } else {
        message.error(response.message || '密码重置失败，请重试');
      }
    } catch (error: any) {
      console.error('重置密码错误:', error);
      message.error(error.response?.data?.message || '密码重置失败，请检查网络连接');
    } finally {
      setResetLoading(false);
    }
  };
  
  // 发送忘记密码邮件 (旧方法，现在用于备用)
  const onSendResetLink = async (values: { email: string }) => {
    try {
      setLoading(true);
      
      // 调用忘记密码API
      const response: any = await post('/api/auth/password/forgot', {
        email: values.email
      });
      
      if (response.status === 'success') {
        message.success('重置密码链接已发送到您的邮箱');
        setSent(true);
      } else {
        message.error(response.message || '发送失败，请重试');
      }
    } catch (error: any) {
      console.error('重置密码错误:', error);
      message.error(error.response?.data?.message || '发送失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染第一步：邮箱验证
  const renderStep1 = () => {
    return (
      <Form
        name="email-verification"
        onFinish={onVerifyEmail}
        size="large"
      >
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
        
        <Form.Item>
          <Row gutter={8}>
            <Col span={16}>
              <Form.Item
                name="verificationCode"
                noStyle
                rules={[
                  { required: true, message: '请输入验证码' },
                  { pattern: /^\d{6}$/, message: '验证码为6位数字' }
                ]}
              >
                <Input 
                  prefix={<SafetyOutlined />} 
                  placeholder="6位验证码"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Button 
                type="primary" 
                disabled={countdown > 0}
                loading={verifyLoading && countdown === 0}
                onClick={() => {
                  const email = Form.useForm()[0].getFieldValue('email');
                  if (!email) {
                    message.error('请先输入邮箱');
                    return;
                  }
                  if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
                    message.error('请输入有效的邮箱地址');
                    return;
                  }
                  sendVerificationCode(email);
                }}
                block
              >
                {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
              </Button>
            </Col>
          </Row>
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={verifyLoading}>
            验证邮箱
          </Button>
        </Form.Item>
        
        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Divider plain>或者</Divider>
            <Button type="link" block>
              <Link to="/login">返回登录</Link>
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };
  
  // 渲染第二步：重置密码
  const renderStep2 = () => {
    return (
      <Form
        name="reset-password"
        onFinish={onResetPassword}
        size="large"
      >
        <Form.Item name="email" hidden>
          <Input />
        </Form.Item>
        
        <Form.Item name="verificationCode" hidden>
          <Input />
        </Form.Item>
        
        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度不能小于8位' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: '密码必须包含大小写字母和数字'
            }
          ]}
        >
          <Input.Password 
            prefix={<KeyOutlined />} 
            placeholder="新密码" 
            autoComplete="new-password"
          />
        </Form.Item>
        
        <Form.Item
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<KeyOutlined />} 
            placeholder="确认新密码" 
            autoComplete="new-password"
          />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={resetLoading}>
            重置密码
          </Button>
        </Form.Item>
        
        <div className="password-tips">
          <Alert 
            message="密码要求" 
            description={
              <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                <li>密码长度至少为8个字符</li>
                <li>密码必须包含大小写字母和数字</li>
                <li>请勿使用与旧密码相同的密码</li>
                <li>请勿使用常见密码或个人信息作为密码</li>
              </ul>
            } 
            type="info" 
            showIcon 
          />
        </div>
      </Form>
    );
  };
  
  // 渲染成功提示
  const renderSuccess = () => {
    return (
      <>
        <Alert
          message="密码重置成功"
          description="您的密码已成功重置，请使用新密码登录您的账户。"
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Button type="primary" block>
          <Link to="/login">返回登录</Link>
        </Button>
      </>
    );
  };
  
  return (
    <div className="forgot-password-container">
      <Card className="forgot-password-form" style={{ maxWidth: 400, margin: '0 auto' }}>
        <div className="forgot-password-logo" style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo.svg" alt="EcoHub Logo" height="64" />
        </div>
        
        <Title level={2} className="forgot-password-title" style={{ textAlign: 'center', marginBottom: 24 }}>
          找回密码
        </Title>
        
        <Spin spinning={loading}>
          {!sent ? (
            <>
              <Paragraph style={{ marginBottom: 24 }}>
                {step === 1 ? 
                  '请输入您注册时使用的邮箱并获取验证码进行验证。' : 
                  '请设置您的新密码。'
                }
              </Paragraph>
              
              {step === 1 ? renderStep1() : renderStep2()}
            </>
          ) : (
            renderSuccess()
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default ForgotPassword; 