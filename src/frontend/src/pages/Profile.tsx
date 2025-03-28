import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Divider, 
  List, 
  message, 
  Descriptions,
  Badge,
  Upload,
  Modal,
  Spin,
  Tooltip,
  Space,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined, 
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { get, post, put } from '../services/api';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { debounce } from 'lodash';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// 用户活动记录类型定义
interface UserActivity {
  id: number;
  type: string;
  description: string;
  created_at: string;
  ip_address: string;
  location: string;
  device: string;
  status: string;
  reason?: string;
}

// 模拟用户活动记录数据
const userActivities: UserActivity[] = [
  {
    id: 1,
    action: '登录系统',
    time: '2023-10-15 09:30:45',
    ip: '192.168.1.100',
    device: 'Chrome 117, Windows 10'
  },
  {
    id: 2,
    action: '更新项目信息 "亚马逊雨林保护计划"',
    time: '2023-10-14 14:22:18',
    ip: '192.168.1.100',
    device: 'Chrome 117, Windows 10'
  },
  {
    id: 3,
    action: '上传报告 "第三季度分析报告.pdf"',
    time: '2023-10-12 16:45:30',
    ip: '192.168.1.100',
    device: 'Chrome 117, Windows 10'
  },
  {
    id: 4,
    action: '创建新项目 "湿地生态系统恢复"',
    time: '2023-10-10 11:12:05',
    ip: '192.168.1.150',
    device: 'Safari 16, macOS 13'
  },
  {
    id: 5,
    action: '修改个人资料',
    time: '2023-10-05 10:30:22',
    ip: '192.168.1.100',
    device: 'Chrome 117, Windows 10'
  }
];

interface UserProfile {
  username: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  joinDate?: string;
  lastLogin?: string;
  avatar?: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAppContext();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(user?.avatar);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  // 个人信息表单
  const [form] = Form.useForm();
  
  // 修改密码表单
  const [passwordForm] = Form.useForm();
  
  // 获取用户详细信息
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response: any = await get('/api/user/profile');
      if (response.status === 'success' && response.data) {
        setUserProfile(response.data);
        // 初始化表单
        form.setFieldsValue({
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone,
          department: response.data.department
        });
        setImageUrl(response.data.avatar);
        
        // 初始化邮箱和手机验证状态
        setEmailAvailable(true);
        setPhoneAvailable(true);
      }
    } catch (error) {
      console.error('获取用户资料失败', error);
      message.error('获取用户资料失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取用户活动记录
  const fetchActivities = async () => {
    try {
      const response = await get<ApiResponse<{ activities: UserActivity[] }>>('/api/user/activities');
      if (response.status === 'success') {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error('获取活动记录失败:', error);
      message.error('获取活动记录失败');
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchActivities();
    }
  }, [user]);
  
  // 处理个人信息更新 - 使用防抖处理
  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const response: any = await put('/api/user/profile', values);
      if (response.status === 'success') {
        // 更新全局用户状态
        if (user) {
          const updatedUser = {
            ...user,
            username: values.username,
            avatar: imageUrl
          };
          setUser(updatedUser);
        }
        
        // 更新本地状态
        setUserProfile({
          ...userProfile!,
          ...values
        });
        
        message.success('个人信息已更新');
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error: any) {
      console.error('更新个人信息失败', error);
      message.error(error.response?.data?.message || '更新个人信息失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理密码修改
  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);
      const response: any = await post('/api/user/change-password', {
        current_password: values.currentPassword,
        new_password: values.newPassword
      });
      
      if (response.status === 'success') {
        message.success('密码修改成功');
        passwordForm.resetFields();
        // 切换到账户信息标签页
        setActiveTab('1');
      } else {
        message.error(response.message || '密码修改失败');
      }
    } catch (error: any) {
      console.error('修改密码失败', error);
      message.error(error.response?.data?.message || '修改密码失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 验证邮箱是否可用 - 防抖处理
  const checkEmailAvailability = useCallback(
    debounce(async (email: string) => {
      if (!email || (userProfile && email === userProfile.email)) {
        setEmailAvailable(true);
        setEmailChecking(false);
        return;
      }
      
      try {
        setEmailChecking(true);
        const response: any = await post('/api/user/check-email', { email });
        setEmailAvailable(response.status === 'success' && response.data.available);
      } catch (error) {
        console.error('验证邮箱失败', error);
        setEmailAvailable(null);
      } finally {
        setEmailChecking(false);
      }
    }, 500),
    [userProfile]
  );
  
  // 验证手机号是否可用 - 防抖处理
  const checkPhoneAvailability = useCallback(
    debounce(async (phone: string) => {
      if (!phone || (userProfile && phone === userProfile.phone)) {
        setPhoneAvailable(true);
        setPhoneChecking(false);
        return;
      }
      
      try {
        setPhoneChecking(true);
        const response: any = await post('/api/user/check-phone', { phone });
        setPhoneAvailable(response.status === 'success' && response.data.available);
      } catch (error) {
        console.error('验证手机号失败', error);
        setPhoneAvailable(null);
      } finally {
        setPhoneChecking(false);
      }
    }, 500),
    [userProfile]
  );
  
  // 头像上传前校验
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
    }
    return false; // 阻止自动上传
  };
  
  // 处理头像上传
  const handleAvatarUpload = async (options: any) => {
    const { file } = options;
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;
    
    if (!isJpgOrPng || !isLt2M) {
      return;
    }
    
    try {
      setUploading(true);
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('avatar', file);
      
      // 调用上传API
      const response: any = await post('/api/user/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 'success') {
        const avatarUrl = response.data.url;
        setImageUrl(avatarUrl);
        
        // 更新全局用户状态
        if (user) {
          const updatedUser = {
            ...user,
            avatar: avatarUrl
          };
          setUser(updatedUser);
        }
        
        message.success('头像上传成功');
        setFileList([
          {
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: avatarUrl,
          },
        ]);
      } else {
        message.error(response.message || '头像上传失败');
      }
    } catch (error: any) {
      console.error('上传头像失败', error);
      message.error(error.response?.data?.message || '上传头像失败');
    } finally {
      setUploading(false);
    }
  };
  
  // 头像上传按钮
  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );
  
  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  return (
    <Spin spinning={loading}>
      <div className="profile-page">
        <Title level={2}>个人中心</Title>
        
        <div style={{ display: 'flex', marginBottom: 24 }}>
          <div style={{ marginRight: 24 }}>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={handleAvatarUpload}
              fileList={fileList}
            >
              {imageUrl ? (
                <Avatar 
                  size={100} 
                  src={imageUrl} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setPreviewVisible(true)}
                />
              ) : (
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#1890ff' }} 
                />
              )}
            </Upload>
            <Modal
              open={previewVisible}
              title="预览头像"
              footer={null}
              onCancel={() => setPreviewVisible(false)}
            >
              <img alt="头像" style={{ width: '100%' }} src={imageUrl} />
            </Modal>
          </div>
          <div>
            <Title level={3}>{userProfile?.username || user?.username}</Title>
            <Paragraph>
              <MailOutlined style={{ marginRight: 8 }} /> {userProfile?.email || '未设置邮箱'}
            </Paragraph>
            <Paragraph>
              <PhoneOutlined style={{ marginRight: 8 }} /> {userProfile?.phone || '未设置手机号'}
            </Paragraph>
            <Paragraph>
              <Badge status="processing" text={userProfile?.role === 'admin' ? '管理员' : '普通用户'} />
            </Paragraph>
          </div>
        </div>
        
        <Card>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="账户信息" key="1">
              <Descriptions 
                title="基本信息" 
                bordered 
                column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                style={{ marginBottom: 24 }}
              >
                <Descriptions.Item label="用户名">{userProfile?.username}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{userProfile?.email}</Descriptions.Item>
                <Descriptions.Item label="手机">{userProfile?.phone}</Descriptions.Item>
                <Descriptions.Item label="角色">
                  <Badge status="processing" text={userProfile?.role === 'admin' ? '管理员' : '普通用户'} />
                </Descriptions.Item>
                <Descriptions.Item label="部门">{userProfile?.department || '未设置'}</Descriptions.Item>
                <Descriptions.Item label="加入时间">{userProfile?.joinDate || '未记录'}</Descriptions.Item>
                <Descriptions.Item label="上次登录">{userProfile?.lastLogin || '未记录'}</Descriptions.Item>
              </Descriptions>
              
              <Divider orientation="left">编辑个人资料</Divider>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                style={{ maxWidth: 600 }}
              >
                <Form.Item
                  label="用户名"
                  name="username"
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, message: '用户名至少3个字符' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名" />
                </Form.Item>
                
                <Form.Item
                  label="邮箱"
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                  hasFeedback
                  validateStatus={
                    emailChecking ? 'validating' :
                    emailAvailable === true ? 'success' :
                    emailAvailable === false ? 'error' : undefined
                  }
                  help={
                    emailChecking ? '验证中...' :
                    emailAvailable === false ? '该邮箱已被使用' : undefined
                  }
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="邮箱" 
                    onChange={(e) => checkEmailAvailability(e.target.value)}
                    suffix={
                      emailChecking ? <LoadingOutlined /> :
                      emailAvailable === true ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                      emailAvailable === false ? <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> :
                      <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    }
                  />
                </Form.Item>
                
                <Form.Item
                  label="手机"
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                  ]}
                  hasFeedback
                  validateStatus={
                    phoneChecking ? 'validating' :
                    phoneAvailable === true ? 'success' :
                    phoneAvailable === false ? 'error' : undefined
                  }
                  help={
                    phoneChecking ? '验证中...' :
                    phoneAvailable === false ? '该手机号已被使用' : undefined
                  }
                >
                  <Input 
                    prefix={<PhoneOutlined />} 
                    placeholder="手机号" 
                    onChange={(e) => checkPhoneAvailability(e.target.value)}
                    suffix={
                      phoneChecking ? <LoadingOutlined /> :
                      phoneAvailable === true ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                      phoneAvailable === false ? <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> :
                      <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    }
                  />
                </Form.Item>
                
                <Form.Item
                  label="部门"
                  name="department"
                >
                  <Input prefix={<EnvironmentOutlined />} placeholder="部门" />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存更改
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            <TabPane tab="修改密码" key="2">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
                style={{ maxWidth: 600 }}
              >
                <Form.Item
                  label="当前密码"
                  name="currentPassword"
                  rules={[
                    { required: true, message: '请输入当前密码' },
                    { min: 8, message: '密码长度不能小于8位' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="当前密码" 
                    autoComplete="current-password"
                  />
                </Form.Item>
                
                <Form.Item
                  label="新密码"
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
                    prefix={<LockOutlined />} 
                    placeholder="新密码" 
                    autoComplete="new-password"
                  />
                </Form.Item>
                
                <Form.Item
                  label="确认新密码"
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
                    prefix={<LockOutlined />} 
                    placeholder="确认新密码" 
                    autoComplete="new-password"
                  />
                </Form.Item>
                
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      修改密码
                    </Button>
                    <Button onClick={() => passwordForm.resetFields()}>
                      重置
                    </Button>
                  </Space>
                </Form.Item>
                
                <div className="password-tips">
                  <Divider orientation="left">密码要求</Divider>
                  <ul>
                    <li>密码长度至少为8个字符</li>
                    <li>密码必须包含大小写字母和数字</li>
                    <li>请勿使用与旧密码相同的密码</li>
                    <li>请勿使用常见密码或个人信息作为密码</li>
                  </ul>
                </div>
              </Form>
            </TabPane>
            
            <TabPane tab="登录历史" key="3">
              <List
                itemLayout="horizontal"
                dataSource={activities}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.description}</Text>
                          <Text type="secondary">{new Date(item.created_at).toLocaleString()}</Text>
                          <Badge 
                            status={item.status === 'success' ? 'success' : 'error'} 
                            text={item.status === 'success' ? '成功' : '失败'} 
                          />
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Space>
                            <Tooltip title="IP地址">
                              <Tag color="blue">IP: {item.ip_address}</Tag>
                            </Tooltip>
                            <Tooltip title="登录地点">
                              <Tag color="green">{item.location}</Tag>
                            </Tooltip>
                            <Tooltip title="设备信息">
                              <Tag color="purple">{item.device}</Tag>
                            </Tooltip>
                          </Space>
                          {item.status === 'failed' && item.reason && (
                            <Text type="danger">失败原因: {item.reason}</Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                pagination={{
                  onChange: page => {
                    console.log(page);
                  },
                  pageSize: 5,
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </Spin>
  );
};

export default ProfilePage; 