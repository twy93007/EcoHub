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
  Divider
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShareAltOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// 模拟数据
interface DataSet {
  id: number;
  name: string;
  description: string;
  tableCount: number;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  status: 'active' | 'inactive';
  size: string;
}

// 模拟数据
const mockDataSets: DataSet[] = [
  {
    id: 1,
    name: '中国经济发展数据集',
    description: '包含中国GDP、CPI、人均收入等经济发展指标',
    tableCount: 5,
    tags: ['经济', '中国', 'GDP'],
    createdBy: '张三',
    createdAt: '2023-03-15',
    updatedAt: '2023-03-20',
    isPublic: true,
    status: 'active',
    size: '25MB'
  },
  {
    id: 2,
    name: '全球气候变化数据集',
    description: '全球气温、海平面、二氧化碳浓度等数据',
    tableCount: 8,
    tags: ['气候', '环境', '全球'],
    createdBy: '李四',
    createdAt: '2023-02-10',
    updatedAt: '2023-03-15',
    isPublic: true,
    status: 'active',
    size: '42MB'
  },
  {
    id: 3,
    name: '企业财务报表数据集',
    description: '上市公司年度财务报表汇总',
    tableCount: 12,
    tags: ['财务', '企业', '报表'],
    createdBy: '王五',
    createdAt: '2023-01-20',
    updatedAt: '2023-03-10',
    isPublic: false,
    status: 'active',
    size: '38MB'
  },
  {
    id: 4,
    name: '人口普查数据集',
    description: '城市人口分布、年龄结构、职业分布等数据',
    tableCount: 6,
    tags: ['人口', '城市', '统计'],
    createdBy: '张三',
    createdAt: '2022-12-05',
    updatedAt: '2023-02-28',
    isPublic: true,
    status: 'active',
    size: '18MB'
  },
  {
    id: 5,
    name: '消费者行为调研数据集',
    description: '各年龄段消费者购买习惯调研数据',
    tableCount: 4,
    tags: ['消费', '调研', '行为'],
    createdBy: '赵六',
    createdAt: '2023-02-15',
    updatedAt: '2023-03-01',
    isPublic: false,
    status: 'inactive',
    size: '15MB'
  }
];

const DataSetsPage: React.FC = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [dataSetList, setDataSetList] = useState<DataSet[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDataSet, setCurrentDataSet] = useState<DataSet | null>(null);
  const [form] = Form.useForm();
  
  // 加载数据
  useEffect(() => {
    fetchDataSets();
  }, []);
  
  const fetchDataSets = async () => {
    try {
      setLoading(true);
      // TODO: 实际项目中应该从API获取数据
      // const response = await get('/api/data/sets');
      // setDataSetList(response.data);
      
      // 模拟数据加载
      setTimeout(() => {
        setDataSetList(mockDataSets);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('获取数据集列表失败:', error);
      message.error('获取数据集列表失败');
      setLoading(false);
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '数据集名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataSet) => (
        <Space>
          <Avatar 
            icon={<DatabaseOutlined />} 
            style={{ backgroundColor: record.isPublic ? '#1890ff' : '#faad14' }}
          />
          <span>{text}</span>
          {record.isPublic ? 
            <Tooltip title="公开">
              <GlobalOutlined style={{ color: '#1890ff' }} />
            </Tooltip> : 
            <Tooltip title="私有">
              <LockOutlined style={{ color: '#faad14' }} />
            </Tooltip>
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
      title: '数据表数量',
      dataIndex: 'tableCount',
      key: 'tableCount',
      sorter: (a: DataSet, b: DataSet) => a.tableCount - b.tableCount,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[] | undefined) => (
        <>
          {tags?.map(tag => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a: DataSet, b: DataSet) => 
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? '活跃' : '未激活'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DataSet) => (
        <Space size="middle">
          <Tooltip title="查看">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDataSet(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEditDataSet(record)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button 
              type="text" 
              icon={<ShareAltOutlined />}
              onClick={() => handleShareDataSet(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除此数据集吗？"
              onConfirm={() => handleDeleteDataSet(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (value) {
      const filteredData = mockDataSets.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
      );
      setDataSetList(filteredData);
    } else {
      setDataSetList(mockDataSets);
    }
  };
  
  // 批量删除处理
  const handleBatchDelete = () => {
    Modal.confirm({
      title: '确定要删除选中的数据集吗？',
      content: '此操作不可逆，请谨慎操作',
      onOk: () => {
        // TODO: 实际项目中应该调用API执行批量删除
        // 这里模拟删除操作
        const newList = dataSetList.filter(item => !selectedRowKeys.includes(item.id));
        setDataSetList(newList);
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
    }
  };
  
  // 新建/编辑数据集
  const showModal = (dataSet?: DataSet) => {
    setCurrentDataSet(dataSet || null);
    form.resetFields();
    
    if (dataSet) {
      form.setFieldsValue({
        name: dataSet.name,
        description: dataSet.description,
        tags: dataSet.tags,
        isPublic: dataSet.isPublic ? 'public' : 'private',
      });
    }
    
    setIsModalVisible(true);
  };
  
  const handleOk = () => {
    form.validateFields().then(values => {
      // TODO: 实际项目中应该调用API保存数据
      if (currentDataSet) {
        // 更新现有数据集
        const updatedList = dataSetList.map(item => {
          if (item.id === currentDataSet.id) {
            return {
              ...item,
              name: values.name,
              description: values.description,
              tags: values.tags,
              isPublic: values.isPublic === 'public',
              updatedAt: new Date().toISOString().split('T')[0]
            };
          }
          return item;
        });
        setDataSetList(updatedList);
        message.success('数据集更新成功');
      } else {
        // 创建新数据集
        const newDataSet: DataSet = {
          id: Math.max(...dataSetList.map(item => item.id)) + 1,
          name: values.name,
          description: values.description,
          tableCount: 0,
          tags: values.tags,
          createdBy: user?.username || '当前用户',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          isPublic: values.isPublic === 'public',
          status: 'active',
          size: '0MB'
        };
        setDataSetList([...dataSetList, newDataSet]);
        message.success('数据集创建成功');
      }
      
      setIsModalVisible(false);
    });
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // 查看数据集
  const handleViewDataSet = (dataSet: DataSet) => {
    message.info(`查看数据集: ${dataSet.name}`);
    // TODO: 导航到数据集详情页面
  };
  
  // 编辑数据集
  const handleEditDataSet = (dataSet: DataSet) => {
    showModal(dataSet);
  };
  
  // 分享数据集
  const handleShareDataSet = (dataSet: DataSet) => {
    message.info(`分享数据集: ${dataSet.name}`);
    // TODO: 打开分享对话框
  };
  
  // 删除数据集
  const handleDeleteDataSet = (id: number) => {
    // TODO: 实际项目中应该调用API删除数据
    const newList = dataSetList.filter(item => item.id !== id);
    setDataSetList(newList);
    message.success('删除成功');
  };
  
  return (
    <div className="data-sets-page">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>数据集管理</Title>
          <Paragraph>创建和管理数据集，组织和共享相关数据表</Paragraph>
        </Col>
      </Row>
      
      <Divider />
      
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            新建数据集
          </Button>
          
          <Button 
            danger 
            disabled={selectedRowKeys.length === 0} 
            onClick={handleBatchDelete}
          >
            批量删除
          </Button>
          
          <Input.Search
            placeholder="搜索数据集" 
            allowClear 
            onSearch={handleSearch} 
            style={{ width: 250 }}
          />
        </Space>
        
        <Spin spinning={loading}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSetList}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 项`,
              defaultPageSize: 10,
              pageSizeOptions: ['10', '20', '50']
            }}
          />
        </Spin>
      </Card>
      
      {/* 创建/编辑数据集弹窗 */}
      <Modal
        title={currentDataSet ? '编辑数据集' : '创建数据集'}
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
            label="数据集名称"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <Input placeholder="请输入数据集名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入数据集描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入数据集描述" />
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
              <Option value="经济">经济</Option>
              <Option value="环境">环境</Option>
              <Option value="金融">金融</Option>
              <Option value="人口">人口</Option>
              <Option value="教育">教育</Option>
              <Option value="医疗">医疗</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isPublic"
            label="访问权限"
            initialValue="private"
            rules={[{ required: true, message: '请选择访问权限' }]}
          >
            <Select placeholder="请选择访问权限">
              <Option value="public">公开（所有用户可见）</Option>
              <Option value="private">私有（仅创建者可见）</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataSetsPage; 