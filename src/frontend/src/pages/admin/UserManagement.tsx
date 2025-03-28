import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Popconfirm, 
  message, 
  Card, 
  Typography, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  Divider,
  Avatar,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  ReloadOutlined,
  FilterOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { get, post, put, del } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const { Title } = Typography;
const { Option } = Select;

// 用户状态标签颜色映射
const statusColors = {
  active: 'success',
  inactive: 'default',
  locked: 'error',
  pending: 'warning'
};

// 角色标签颜色映射
const roleColors = {
  admin: 'red',
  manager: 'blue',
  user: 'green',
  guest: 'orange'
};

interface UserData {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  department?: string;
  created_at: string;
  last_login?: string;
  avatar?: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAppContext();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  
  const formRef = useRef<any>(null);
  
  // 获取用户列表
  const fetchUsers = async (page = 1, limit = 10, search = '', status: string[] = [], role: string[] = []) => {
    try {
      setLoading(true);
      
      // 构建查询参数
      const params: any = {
        page,
        limit,
      };
      
      if (search) params.search = search;
      if (status && status.length > 0) params.status = status.join(',');
      if (role && role.length > 0) params.role = role.join(',');
      
      const response: any = await get('/api/users', params);
      
      if (response.status === 'success' && response.data) {
        setUsers(response.data.users);
        setPagination({
          ...pagination,
          current: page,
          pageSize: limit,
          total: response.data.total
        });
      } else {
        message.error(response.message || '获取用户列表失败');
      }
    } catch (error: any) {
      console.error('获取用户列表失败', error);
      message.error(error.response?.data?.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers(
      pagination.current, 
      pagination.pageSize, 
      searchText,
      statusFilter,
      roleFilter
    );
  }, []);
  
  // 处理表格变化
  const handleTableChange = (pagination: any, filters: any) => {
    fetchUsers(
      pagination.current, 
      pagination.pageSize, 
      searchText,
      filters.status || statusFilter,
      filters.role || roleFilter
    );
    
    if (filters.status) setStatusFilter(filters.status);
    if (filters.role) setRoleFilter(filters.role);
  };
  
  // 处理搜索
  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize, searchText, statusFilter, roleFilter);
  };
  
  // 重置筛选
  const handleReset = () => {
    setSearchText('');
    setStatusFilter([]);
    setRoleFilter([]);
    fetchUsers(1, pagination.pageSize, '', [], []);
  };
  
  // 打开新增用户对话框
  const showAddModal = () => {
    setEditingUser(null);
    setModalTitle('新增用户');
    setModalVisible(true);
    
    // 重置表单
    if (formRef.current) {
      formRef.current.resetFields();
    }
  };
  
  // 打开编辑用户对话框
  const showEditModal = (record: UserData) => {
    setEditingUser(record);
    setModalTitle('编辑用户');
    setModalVisible(true);
    
    // 设置表单初始值
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.setFieldsValue({
          username: record.username,
          email: record.email,
          phone: record.phone,
          role: record.role,
          status: record.status,
          department: record.department
        });
      }
    }, 0);
  };
  
  // 处理模态框确认
  const handleModalOk = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };
  
  // 处理模态框取消
  const handleModalCancel = () => {
    setModalVisible(false);
  };
  
  // 处理表单提交
  const handleFormSubmit = async (values: any) => {
    try {
      setModalLoading(true);
      
      if (editingUser) {
        // 编辑用户
        const response: any = await put(`/api/users/${editingUser.id}`, values);
        
        if (response.status === 'success') {
          message.success('用户更新成功');
          
          // 更新本地列表
          setUsers(users.map(item => 
            item.id === editingUser.id ? { ...item, ...values } : item
          ));
          
          setModalVisible(false);
        } else {
          message.error(response.message || '用户更新失败');
        }
      } else {
        // 新增用户
        const response: any = await post('/api/users', values);
        
        if (response.status === 'success') {
          message.success('用户创建成功');
          
          // 刷新用户列表
          fetchUsers(pagination.current, pagination.pageSize, searchText, statusFilter, roleFilter);
          
          setModalVisible(false);
        } else {
          message.error(response.message || '用户创建失败');
        }
      }
    } catch (error: any) {
      console.error('保存用户失败', error);
      message.error(error.response?.data?.message || '保存用户失败');
    } finally {
      setModalLoading(false);
    }
  };
  
  // 处理删除用户
  const handleDeleteUser = async (id: string) => {
    try {
      setLoading(true);
      
      const response: any = await del(`/api/users/${id}`);
      
      if (response.status === 'success') {
        message.success('用户删除成功');
        
        // 从本地列表中移除
        setUsers(users.filter(item => item.id !== id));
        
        // 如果当前页没有数据了，则回到上一页
        if (users.length === 1 && pagination.current > 1) {
          fetchUsers(pagination.current - 1, pagination.pageSize, searchText, statusFilter, roleFilter);
        }
      } else {
        message.error(response.message || '用户删除失败');
      }
    } catch (error: any) {
      console.error('删除用户失败', error);
      message.error(error.response?.data?.message || '删除用户失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理锁定/解锁用户
  const handleToggleUserStatus = async (record: UserData) => {
    try {
      setLoading(true);
      
      const newStatus = record.status === 'active' ? 'locked' : 'active';
      
      const response: any = await put(`/api/users/${record.id}/status`, {
        status: newStatus
      });
      
      if (response.status === 'success') {
        message.success(`用户${newStatus === 'active' ? '解锁' : '锁定'}成功`);
        
        // 更新本地列表
        setUsers(users.map(item => 
          item.id === record.id ? { ...item, status: newStatus } : item
        ));
      } else {
        message.error(response.message || `用户${newStatus === 'active' ? '解锁' : '锁定'}失败`);
      }
    } catch (error: any) {
      console.error('更新用户状态失败', error);
      message.error(error.response?.data?.message || '更新用户状态失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: UserData) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.avatar} 
            icon={!record.avatar && <UserOutlined />} 
            style={{ marginRight: 8 }} 
          />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: '管理员', value: 'admin' },
        { text: '经理', value: 'manager' },
        { text: '用户', value: 'user' },
        { text: '访客', value: 'guest' }
      ],
      filteredValue: roleFilter,
      render: (role: string) => (
        <Tag color={roleColors[role as keyof typeof roleColors] || 'default'}>
          {role === 'admin' ? '管理员' : 
           role === 'manager' ? '经理' : 
           role === 'user' ? '用户' : 
           role === 'guest' ? '访客' : role}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '活跃', value: 'active' },
        { text: '未激活', value: 'inactive' },
        { text: '锁定', value: 'locked' },
        { text: '待验证', value: 'pending' }
      ],
      filteredValue: statusFilter,
      render: (status: string) => (
        <Badge 
          status={statusColors[status as keyof typeof statusColors] as any} 
          text={
            status === 'active' ? '活跃' : 
            status === 'inactive' ? '未激活' : 
            status === 'locked' ? '锁定' : 
            status === 'pending' ? '待验证' : status
          } 
        />
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => text ? new Date(text).toLocaleString() : '-'
    },
    {
      title: '上次登录',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (text: string) => text ? new Date(text).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserData) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          {record.status === 'active' ? (
            <Button 
              type="text" 
              danger
              icon={<LockOutlined />} 
              onClick={() => handleToggleUserStatus(record)}
              disabled={record.id === user?.id}
              title="锁定用户"
            />
          ) : (
            <Button 
              type="text" 
              icon={<UnlockOutlined />} 
              onClick={() => handleToggleUserStatus(record)}
              title="解锁用户"
            />
          )}
          <Popconfirm
            title="确定要删除这个用户吗?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.id === user?.id}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.id === user?.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div className="user-management-page">
      <Title level={2}>用户管理</Title>
      
      <Card>
        {/* 工具栏 */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="搜索用户名/邮箱/手机"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 240 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
          
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            新增用户
          </Button>
        </div>
        
        {/* 用户表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
      
      {/* 用户编辑对话框 */}
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={modalLoading}
        width={600}
      >
        <Form
          ref={formRef}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ status: 'active', role: 'user' }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号" />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[
                { required: true, message: '请输入初始密码' },
                { min: 8, message: '密码长度不能小于8位' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="初始密码" />
            </Form.Item>
          )}
          
          <Divider style={{ margin: '12px 0' }} />
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="manager">经理</Option>
              <Option value="user">用户</Option>
              <Option value="guest">访客</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">活跃</Option>
              <Option value="inactive">未激活</Option>
              <Option value="locked">锁定</Option>
              <Option value="pending">待验证</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="department"
            label="部门"
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="部门" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 