import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Spin,
  Select,
  Tooltip,
  message,
  Popconfirm,
  Avatar,
  Row,
  Col,
  Divider,
  List,
  Radio
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  DownloadOutlined,
  FileTextOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 数据模板接口
interface DataTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  type: 'time-series' | 'cross-section' | 'panel';
  tags: string[];
  fieldCount: number;
  creator: string;
  createdAt: string;
  updatedAt: string;
  downloads: number;
  isOfficial: boolean;
}

// 模拟数据
const mockTemplates: DataTemplate[] = [
  {
    id: 1,
    name: '财务报表标准模板',
    description: '适用于上市公司财务数据收集与分析的标准模板，包含资产负债表、利润表、现金流量表等',
    category: '财务',
    type: 'time-series',
    tags: ['财务', '上市公司', '报表'],
    fieldCount: 120,
    creator: '系统管理员',
    createdAt: '2022-12-10',
    updatedAt: '2023-02-15',
    downloads: 1580,
    isOfficial: true
  },
  {
    id: 2,
    name: '宏观经济指标模板',
    description: '包含GDP、CPI、PPI、货币供应量等宏观经济指标的数据模板',
    category: '经济',
    type: 'time-series',
    tags: ['宏观经济', '指标', '时间序列'],
    fieldCount: 45,
    creator: '系统管理员',
    createdAt: '2023-01-05',
    updatedAt: '2023-03-10',
    downloads: 982,
    isOfficial: true
  },
  {
    id: 3,
    name: '城市基础数据模板',
    description: '包含城市人口、面积、GDP、财政收入等基础数据的模板',
    category: '城市',
    type: 'cross-section',
    tags: ['城市', '基础数据', '横截面'],
    fieldCount: 35,
    creator: '张三',
    createdAt: '2023-01-15',
    updatedAt: '2023-02-20',
    downloads: 756,
    isOfficial: false
  },
  {
    id: 4,
    name: '问卷调查数据模板',
    description: '适用于市场调研和用户行为分析的问卷调查数据模板',
    category: '调研',
    type: 'cross-section',
    tags: ['问卷', '调研', '市场'],
    fieldCount: 50,
    creator: '李四',
    createdAt: '2023-02-01',
    updatedAt: '2023-03-05',
    downloads: 432,
    isOfficial: false
  },
  {
    id: 5,
    name: '企业面板数据模板',
    description: '适用于多时期、多企业的面板数据收集与分析',
    category: '企业',
    type: 'panel',
    tags: ['企业', '面板', '多时期'],
    fieldCount: 68,
    creator: '系统管理员',
    createdAt: '2022-11-20',
    updatedAt: '2023-01-25',
    downloads: 865,
    isOfficial: true
  }
];

// 模板类型选项
const templateTypeOptions = [
  { label: '时间序列', value: 'time-series' },
  { label: '横截面', value: 'cross-section' },
  { label: '面板数据', value: 'panel' }
];

// 模板分类选项
const templateCategoryOptions = [
  { label: '财务', value: '财务' },
  { label: '经济', value: '经济' },
  { label: '城市', value: '城市' },
  { label: '调研', value: '调研' },
  { label: '企业', value: '企业' },
  { label: '其他', value: '其他' }
];

const DataTemplatesPage: React.FC = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<DataTemplate[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<DataTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [form] = Form.useForm();
  
  // 过滤条件
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    official: ''
  });
  
  // 加载数据
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // TODO: 实际项目中应该从API获取数据
      // const response = await get('/api/data/templates');
      // setTemplates(response.data);
      
      // 模拟数据加载
      setTimeout(() => {
        setTemplates(mockTemplates);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('获取数据模板列表失败:', error);
      message.error('获取数据模板列表失败');
      setLoading(false);
    }
  };
  
  // 应用过滤器
  const getFilteredTemplates = () => {
    let filtered = [...templates];
    
    if (searchText) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    if (filters.official) {
      const isOfficial = filters.official === 'official';
      filtered = filtered.filter(item => item.isOfficial === isOfficial);
    }
    
    return filtered;
  };
  
  // 表格列定义
  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataTemplate) => (
        <Space>
          <Avatar 
            icon={<FileTextOutlined />} 
            style={{ backgroundColor: record.isOfficial ? '#1890ff' : '#52c41a' }}
          />
          <span>{text}</span>
          {record.isOfficial && 
            <Tag color="blue">官方</Tag>
          }
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="purple">{category}</Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          'time-series': '时间序列',
          'cross-section': '横截面',
          'panel': '面板数据'
        };
        return <Tag color="cyan">{typeMap[type] || type}</Tag>;
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '字段数',
      dataIndex: 'fieldCount',
      key: 'fieldCount',
      sorter: (a: DataTemplate, b: DataTemplate) => a.fieldCount - b.fieldCount,
    },
    {
      title: '下载量',
      dataIndex: 'downloads',
      key: 'downloads',
      sorter: (a: DataTemplate, b: DataTemplate) => a.downloads - b.downloads,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a: DataTemplate, b: DataTemplate) => 
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DataTemplate) => (
        <Space size="middle">
          <Tooltip title="查看">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewTemplate(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadTemplate(record)}
            />
          </Tooltip>
          {!record.isOfficial && 
            <>
              <Tooltip title="编辑">
                <Button 
                  type="text" 
                  icon={<EditOutlined />}
                  onClick={() => handleEditTemplate(record)}
                  disabled={record.creator !== user?.username && user?.role !== 'admin'}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title="确定要删除此模板吗？"
                  onConfirm={() => handleDeleteTemplate(record.id)}
                  okText="确定"
                  cancelText="取消"
                  disabled={record.creator !== user?.username && user?.role !== 'admin'}
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    disabled={record.creator !== user?.username && user?.role !== 'admin'}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          }
          <Tooltip title="复制">
            <Button 
              type="text" 
              icon={<CopyOutlined />}
              onClick={() => handleCopyTemplate(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchText(value);
  };
  
  // 批量删除处理
  const handleBatchDelete = () => {
    Modal.confirm({
      title: '确定要删除选中的模板吗？',
      content: '此操作不可逆，请谨慎操作',
      onOk: () => {
        // TODO: 实际项目中应该调用API执行批量删除
        // 这里模拟删除操作
        const newList = templates.filter(item => !selectedRowKeys.includes(item.id));
        setTemplates(newList);
        setSelectedRowKeys([]);
        message.success('删除成功');
      }
    });
  };
  
  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record: DataTemplate) => ({
      disabled: record.isOfficial, // 官方模板不允许批量删除
    }),
  };
  
  // 新建/编辑模板
  const showModal = (template?: DataTemplate) => {
    setCurrentTemplate(template || null);
    form.resetFields();
    
    if (template) {
      form.setFieldsValue({
        name: template.name,
        description: template.description,
        category: template.category,
        type: template.type,
        tags: template.tags,
      });
    }
    
    setIsModalVisible(true);
  };
  
  const handleOk = () => {
    form.validateFields().then(values => {
      // TODO: 实际项目中应该调用API保存数据
      if (currentTemplate) {
        // 更新现有模板
        const updatedList = templates.map(item => {
          if (item.id === currentTemplate.id) {
            return {
              ...item,
              name: values.name,
              description: values.description,
              category: values.category,
              type: values.type,
              tags: values.tags,
              updatedAt: new Date().toISOString().split('T')[0]
            };
          }
          return item;
        });
        setTemplates(updatedList);
        message.success('模板更新成功');
      } else {
        // 创建新模板
        const newTemplate: DataTemplate = {
          id: Math.max(...templates.map(item => item.id)) + 1,
          name: values.name,
          description: values.description,
          category: values.category,
          type: values.type,
          tags: values.tags,
          fieldCount: 0,
          creator: user?.username || '当前用户',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          downloads: 0,
          isOfficial: false
        };
        setTemplates([...templates, newTemplate]);
        message.success('模板创建成功');
      }
      
      setIsModalVisible(false);
    });
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // 查看模板
  const handleViewTemplate = (template: DataTemplate) => {
    message.info(`查看模板: ${template.name}`);
    // TODO: 导航到模板详情页面或打开预览弹窗
  };
  
  // 下载模板
  const handleDownloadTemplate = (template: DataTemplate) => {
    message.success(`下载模板: ${template.name}`);
    // TODO: 实际调用下载API
    
    // 模拟下载计数增加
    const updatedList = templates.map(item => {
      if (item.id === template.id) {
        return {
          ...item,
          downloads: item.downloads + 1
        };
      }
      return item;
    });
    setTemplates(updatedList);
  };
  
  // 编辑模板
  const handleEditTemplate = (template: DataTemplate) => {
    showModal(template);
  };
  
  // 删除模板
  const handleDeleteTemplate = (id: number) => {
    // TODO: 实际项目中应该调用API删除数据
    const newList = templates.filter(item => item.id !== id);
    setTemplates(newList);
    message.success('删除成功');
  };
  
  // 复制模板
  const handleCopyTemplate = (template: DataTemplate) => {
    // 创建模板的副本
    const copiedTemplate: DataTemplate = {
      ...template,
      id: Math.max(...templates.map(item => item.id)) + 1,
      name: `${template.name} - 副本`,
      creator: user?.username || '当前用户',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      downloads: 0,
      isOfficial: false
    };
    
    setTemplates([...templates, copiedTemplate]);
    message.success('模板复制成功');
  };
  
  // 过滤器变更处理
  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  // 重置过滤器
  const handleResetFilters = () => {
    setFilters({
      category: '',
      type: '',
      official: ''
    });
    setSearchText('');
  };
  
  // 渲染网格视图
  const renderGridView = () => {
    const filteredData = getFilteredTemplates();
    
    return (
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 3,
          xxl: 4,
        }}
        dataSource={filteredData}
        renderItem={item => (
          <List.Item>
            <Card
              title={
                <Space>
                  {item.name}
                  {item.isOfficial && <Tag color="blue">官方</Tag>}
                </Space>
              }
              actions={[
                <Tooltip title="查看">
                  <EyeOutlined key="view" onClick={() => handleViewTemplate(item)} />
                </Tooltip>,
                <Tooltip title="下载">
                  <DownloadOutlined key="download" onClick={() => handleDownloadTemplate(item)} />
                </Tooltip>,
                <Tooltip title="复制">
                  <CopyOutlined key="copy" onClick={() => handleCopyTemplate(item)} />
                </Tooltip>,
                !item.isOfficial && item.creator === user?.username || user?.role === 'admin' ? (
                  <Tooltip title="编辑">
                    <EditOutlined key="edit" onClick={() => handleEditTemplate(item)} />
                  </Tooltip>
                ) : (
                  <EditOutlined key="edit" style={{ color: '#d9d9d9' }} />
                ),
              ]}
            >
              <div style={{ height: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Paragraph ellipsis={{ rows: 3 }}>{item.description}</Paragraph>
              </div>
              <div style={{ marginTop: 12 }}>
                <Space wrap>
                  <Tag color="purple">{item.category}</Tag>
                  {item.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>字段数: {item.fieldCount}</span>
                <span>下载量: {item.downloads}</span>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );
  };
  
  return (
    <div className="data-templates-page">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>数据模板库</Title>
          <Paragraph>浏览、使用和管理数据模板</Paragraph>
        </Col>
      </Row>
      
      <Divider />
      
      <Card>
        {/* 工具栏 */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            新建模板
          </Button>
          
          <Button 
            danger 
            disabled={selectedRowKeys.length === 0} 
            onClick={handleBatchDelete}
          >
            批量删除
          </Button>
          
          <Input.Search
            placeholder="搜索模板" 
            allowClear 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch} 
            style={{ width: 250 }}
          />
          
          <div style={{ marginLeft: 16 }}>
            <Radio.Group 
              options={[
                { label: '表格视图', value: 'table' },
                { label: '网格视图', value: 'grid' },
              ]}
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              optionType="button"
            />
          </div>
        </Space>
        
        {/* 过滤器 */}
        <Space wrap style={{ marginBottom: 16 }}>
          <span>分类:</span>
          <Select
            style={{ width: 120 }}
            placeholder="全部分类"
            value={filters.category || undefined}
            onChange={(value) => handleFilterChange('category', value)}
            allowClear
          >
            {templateCategoryOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
          
          <span>类型:</span>
          <Select
            style={{ width: 120 }}
            placeholder="全部类型"
            value={filters.type || undefined}
            onChange={(value) => handleFilterChange('type', value)}
            allowClear
          >
            {templateTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
          
          <span>来源:</span>
          <Select
            style={{ width: 120 }}
            placeholder="全部来源"
            value={filters.official || undefined}
            onChange={(value) => handleFilterChange('official', value)}
            allowClear
          >
            <Option value="official">官方模板</Option>
            <Option value="user">用户模板</Option>
          </Select>
          
          <Button onClick={handleResetFilters}>重置过滤器</Button>
        </Space>
        
        <Spin spinning={loading}>
          {viewMode === 'table' ? (
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={getFilteredTemplates()}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 项`,
                defaultPageSize: 10,
                pageSizeOptions: ['10', '20', '50']
              }}
            />
          ) : (
            renderGridView()
          )}
        </Spin>
      </Card>
      
      {/* 创建/编辑模板弹窗 */}
      <Modal
        title={currentTemplate ? '编辑模板' : '创建模板'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <TextArea rows={4} placeholder="请输入模板详细描述" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择模板分类' }]}
          >
            <Select placeholder="请选择模板分类">
              {templateCategoryOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="type"
            label="数据类型"
            rules={[{ required: true, message: '请选择数据类型' }]}
          >
            <Select placeholder="请选择数据类型">
              {templateTypeOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="请选择或输入标签"
              style={{ width: '100%' }}
            >
              <Option value="财务">财务</Option>
              <Option value="经济">经济</Option>
              <Option value="企业">企业</Option>
              <Option value="城市">城市</Option>
              <Option value="调研">调研</Option>
              <Option value="面板">面板</Option>
              <Option value="时间序列">时间序列</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataTemplatesPage; 