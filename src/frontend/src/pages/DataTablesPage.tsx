import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Card, 
  Modal, 
  Upload, 
  message, 
  Tooltip, 
  Badge,
  Dropdown,
  Menu,
  Drawer,
  Form,
  Select,
  DatePicker,
  Spin,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  DownloadOutlined,
  ShareAltOutlined,
  MoreOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { get, post, del } from '../services/api';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

// 数据表接口定义
interface DataTable {
  id: number;
  name: string;
  description: string;
  rows: number;
  columns: number;
  format: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  status: 'active' | 'inactive' | 'processing';
}

// 模拟数据
const mockDataTables: DataTable[] = [
  { 
    id: 1, 
    name: '中国城市GDP数据表', 
    description: '中国各城市2010-2023年GDP数据', 
    rows: 287, 
    columns: 15, 
    format: 'xlsx', 
    tags: ['经济', 'GDP', '城市'],
    createdBy: '张三',
    createdAt: '2023-01-15 14:23:45',
    updatedAt: '2023-06-20 09:15:32',
    isPublic: true,
    status: 'active'
  },
  { 
    id: 2, 
    name: '全球气候变化数据', 
    description: '全球不同地区气候变化指标数据', 
    rows: 1503, 
    columns: 24, 
    format: 'csv', 
    tags: ['气候', '环境', '全球'],
    createdBy: '李四',
    createdAt: '2023-03-22 10:11:22',
    updatedAt: '2023-07-15 16:44:21',
    isPublic: true,
    status: 'active'
  },
  { 
    id: 3, 
    name: '上市公司财务数据', 
    description: 'A股上市公司财务报表汇总', 
    rows: 3852, 
    columns: 56, 
    format: 'xlsx', 
    tags: ['金融', '财务', '股票'],
    createdBy: '王五',
    createdAt: '2023-04-10 09:33:15',
    updatedAt: '2023-08-05 11:22:33',
    isPublic: false,
    status: 'active'
  },
  { 
    id: 4, 
    name: '人口普查数据分析', 
    description: '第七次全国人口普查数据分析', 
    rows: 2145, 
    columns: 32, 
    format: 'csv', 
    tags: ['人口', '普查', '统计'],
    createdBy: '赵六',
    createdAt: '2023-05-25 15:46:52',
    updatedAt: '2023-09-12 14:35:41',
    isPublic: true,
    status: 'active'
  },
  { 
    id: 5, 
    name: '消费者行为调研数据', 
    description: '消费者购买行为与偏好调研数据', 
    rows: 976, 
    columns: 28, 
    format: 'xlsx', 
    tags: ['消费', '市场', '调研'],
    createdBy: '张三',
    createdAt: '2023-07-12 11:28:59',
    updatedAt: '2023-10-08 16:17:23',
    isPublic: false,
    status: 'processing'
  }
];

const DataTablesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [dataTables, setDataTables] = useState<DataTable[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [filterForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 获取数据表列表
  useEffect(() => {
    const fetchDataTables = async () => {
      try {
        setLoading(true);
        // TODO: 实际项目中应该从API获取数据
        // const response = await get('/api/data/tables', {
        //   params: {
        //     page: pagination.current,
        //     pageSize: pagination.pageSize,
        //     search: searchText,
        //     ...filterForm.getFieldsValue()
        //   }
        // });
        // if (response.status === 'success') {
        //   setDataTables(response.data.items);
        //   setPagination({
        //     ...pagination,
        //     total: response.data.total
        //   });
        // }
        
        // 目前使用模拟数据
        setTimeout(() => {
          setDataTables(mockDataTables);
          setPagination({
            ...pagination,
            total: mockDataTables.length
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('获取数据表列表失败:', error);
        setLoading(false);
      }
    };
    
    fetchDataTables();
  }, [pagination.current, pagination.pageSize, searchText]);
  
  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      current: 1
    });
  };
  
  // 处理数据表上传
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请选择文件');
      return;
    }
    
    // TODO: 实际项目中应该调用API上传数据表
    message.loading('正在上传...', 1.5)
      .then(() => {
        message.success('数据表上传成功');
        setUploadModalVisible(false);
        setFileList([]);
        // 刷新数据表列表
      });
  };
  
  // 处理文件上传变更
  const handleUploadChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
  };
  
  // 处理数据表预览
  const handlePreview = (record: DataTable) => {
    // TODO: 实际项目中应该从API获取数据表预览数据
    // 这里使用模拟数据
    setPreviewData({
      id: record.id,
      name: record.name,
      headers: ['城市', 'GDP(亿元)', '同比增长(%)', '第一产业', '第二产业', '第三产业'],
      rows: [
        ['北京', 41610.9, 5.1, 298.0, 7681.1, 33631.8],
        ['上海', 43214.9, 4.8, 105.3, 10606.3, 32503.3],
        ['广州', 28231.5, 6.2, 208.6, 7145.8, 20877.1],
        ['深圳', 30664.9, 6.7, 20.3, 11950.3, 18694.3],
        ['重庆', 27894.0, 5.3, 1465.5, 11535.7, 14892.8]
      ]
    });
    setPreviewModalVisible(true);
  };
  
  // 处理数据表删除
  const handleDelete = (id: number) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个数据表吗？删除后无法恢复。',
      onOk: async () => {
        try {
          // TODO: 实际项目中应该调用API删除数据表
          // await del(`/api/data/tables/${id}`);
          message.success('数据表已成功删除');
          // 更新列表
          setDataTables(dataTables.filter(item => item.id !== id));
        } catch (error) {
          console.error('删除数据表失败:', error);
          message.error('删除数据表失败');
        }
      }
    });
  };
  
  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的数据表');
      return;
    }
    
    confirm({
      title: '批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个数据表吗？`,
      onOk: async () => {
        try {
          // TODO: 实际项目中应该调用API批量删除数据表
          // await post('/api/data/tables/batch-delete', { ids: selectedRowKeys });
          message.success(`成功删除 ${selectedRowKeys.length} 个数据表`);
          // 更新列表
          setDataTables(dataTables.filter(item => !selectedRowKeys.includes(item.id)));
          setSelectedRowKeys([]);
        } catch (error) {
          console.error('批量删除数据表失败:', error);
          message.error('批量删除数据表失败');
        }
      }
    });
  };
  
  // 应用过滤条件
  const handleApplyFilter = () => {
    const values = filterForm.getFieldsValue();
    console.log('应用过滤条件:', values);
    setFilterDrawerVisible(false);
    // TODO: 实际项目中应该根据过滤条件刷新数据列表
  };
  
  // 重置过滤条件
  const handleResetFilter = () => {
    filterForm.resetFields();
  };
  
  // 表格列定义
  const columns: ColumnsType<DataTable> = [
    {
      title: '数据表名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => handlePreview(record)}>{text}</a>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '行数',
      dataIndex: 'rows',
      key: 'rows',
      width: 100,
      sorter: (a, b) => a.rows - b.rows,
    },
    {
      title: '列数',
      dataIndex: 'columns',
      key: 'columns',
      width: 100,
      sorter: (a, b) => a.columns - b.columns,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
    {
      title: '最后更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = '';
        let text = '';
        switch (status) {
          case 'active':
            color = 'green';
            text = '活跃';
            break;
          case 'inactive':
            color = 'gray';
            text = '不活跃';
            break;
          case 'processing':
            color = 'blue';
            text = '处理中';
            break;
          default:
            color = 'default';
            text = status;
        }
        return <Badge status={color as any} text={text} />;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handlePreview(record)} 
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/data/tables/edit/${record.id}`)} 
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => message.success('开始下载数据表')} 
            />
          </Tooltip>
          <Dropdown 
            menu={{ 
              items: [
                {
                  key: '1',
                  label: '分享',
                  icon: <ShareAltOutlined />,
                  onClick: () => message.info('分享功能待开发')
                },
                {
                  key: '2',
                  label: '删除',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record.id)
                }
              ]
            }} 
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];
  
  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };
  
  return (
    <div className="data-tables-page">
      <Title level={2}>数据表管理</Title>
      <Paragraph>
        在这里您可以管理您的数据表，包括上传、编辑、删除和共享数据表。
      </Paragraph>
      
      <Divider />
      
      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            上传数据表
          </Button>
          <Button 
            danger 
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchDelete}
          >
            批量删除
          </Button>
          <Button 
            icon={<FilterOutlined />}
            onClick={() => setFilterDrawerVisible(true)}
          >
            筛选
          </Button>
        </Space>
        <Search 
          placeholder="搜索数据表" 
          allowClear 
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 300, float: 'right' }}
        />
      </Card>
      
      {/* 数据表列表 */}
      <Card>
        <Spin spinning={loading}>
          <Table 
            rowKey="id"
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataTables}
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                setPagination({
                  ...pagination,
                  current: page,
                  pageSize: pageSize || pagination.pageSize
                });
              }
            }}
          />
        </Spin>
      </Card>
      
      {/* 上传数据表模态框 */}
      <Modal
        title="上传数据表"
        open={uploadModalVisible}
        onOk={handleUpload}
        onCancel={() => setUploadModalVisible(false)}
        okText="上传"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item 
            label="数据表名称" 
            name="name"
            rules={[{ required: true, message: '请输入数据表名称' }]}
          >
            <Input placeholder="请输入数据表名称" />
          </Form.Item>
          <Form.Item 
            label="描述" 
            name="description"
          >
            <Input.TextArea rows={4} placeholder="请输入数据表描述" />
          </Form.Item>
          <Form.Item 
            label="标签" 
            name="tags"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="请输入标签"
              options={[
                { value: '经济', label: '经济' },
                { value: '金融', label: '金融' },
                { value: '环境', label: '环境' },
                { value: '人口', label: '人口' },
                { value: '市场', label: '市场' }
              ]}
            />
          </Form.Item>
          <Form.Item 
            label="是否公开" 
            name="isPublic"
          >
            <Select defaultValue={false}>
              <Option value={true}>公开</Option>
              <Option value={false}>私有</Option>
            </Select>
          </Form.Item>
          <Form.Item label="上传文件">
            <Upload
              listType="text"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#888' }}>
              支持格式: .csv, .xlsx, .xls, .json, .txt，单文件最大支持50MB
            </div>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 数据表预览模态框 */}
      <Modal
        title={previewData?.name}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {previewData && (
          <div>
            <Table 
              columns={previewData.headers.map((header: string, index: number) => ({ 
                title: header, 
                dataIndex: index, 
                key: index 
              }))}
              dataSource={previewData.rows.map((row: any[], rowIndex: number) => ({
                key: `row-${rowIndex}`,
                ...row.reduce((obj, cell, cellIndex) => {
                  obj[cellIndex] = cell;
                  return obj;
                }, {})
              }))}
              pagination={false}
              scroll={{ x: 'max-content' }}
              size="small"
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Typography.Text type="secondary">
                仅显示前5行数据，共 {previewData.rows.length} 行
              </Typography.Text>
            </div>
          </div>
        )}
      </Modal>
      
      {/* 筛选条件抽屉 */}
      <Drawer
        title="筛选数据表"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={400}
        extra={
          <Space>
            <Button onClick={handleResetFilter}>重置</Button>
            <Button type="primary" onClick={handleApplyFilter}>
              应用
            </Button>
          </Space>
        }
      >
        <Form
          form={filterForm}
          layout="vertical"
        >
          <Form.Item name="format" label="文件格式">
            <Select 
              placeholder="选择文件格式" 
              allowClear
              mode="multiple"
            >
              <Option value="xlsx">Excel (.xlsx)</Option>
              <Option value="csv">CSV (.csv)</Option>
              <Option value="json">JSON (.json)</Option>
              <Option value="txt">文本 (.txt)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              mode="multiple"
              placeholder="选择标签"
              allowClear
              options={[
                { value: '经济', label: '经济' },
                { value: '金融', label: '金融' },
                { value: '环境', label: '环境' },
                { value: '人口', label: '人口' },
                { value: '市场', label: '市场' }
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="选择状态" allowClear>
              <Option value="active">活跃</Option>
              <Option value="inactive">不活跃</Option>
              <Option value="processing">处理中</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isPublic" label="可见性">
            <Select placeholder="选择可见性" allowClear>
              <Option value={true}>公开</Option>
              <Option value={false}>私有</Option>
            </Select>
          </Form.Item>
          <Form.Item name="createdBy" label="创建人">
            <Input placeholder="输入创建人" />
          </Form.Item>
          <Form.Item name="dateRange" label="创建时间范围">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default DataTablesPage; 