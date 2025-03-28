import React, { useState } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Input,
  Tag,
  Tooltip,
  Typography,
  Breadcrumb
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

interface DataTable {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  lastUpdated: string;
  size: string;
  rowCount: number;
}

const mockTables: DataTable[] = [
  {
    id: '1',
    name: '资产负债表',
    description: '企业资产负债数据',
    type: '财务数据',
    status: 'active',
    lastUpdated: '2024-03-15',
    size: '2.5GB',
    rowCount: 10000
  },
  {
    id: '2',
    name: '利润表',
    description: '企业利润数据',
    type: '财务数据',
    status: 'active',
    lastUpdated: '2024-03-15',
    size: '1.8GB',
    rowCount: 8000
  },
  {
    id: '3',
    name: '日个股交易数据',
    description: '每日股票交易数据',
    type: '市场数据',
    status: 'active',
    lastUpdated: '2024-03-15',
    size: '5.2GB',
    rowCount: 50000
  }
];

const DataTablesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '记录数',
      dataIndex: 'rowCount',
      key: 'rowCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: DataTable) => (
        <Space size="middle">
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
          <Tooltip title="下载">
            <Button type="text" icon={<DownloadOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const filteredTables = mockTables.filter(table => 
    table.name.toLowerCase().includes(searchText.toLowerCase()) ||
    table.description.toLowerCase().includes(searchText.toLowerCase()) ||
    table.type.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout style={{ padding: '0 24px 24px' }}>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>数据中心</Breadcrumb.Item>
        <Breadcrumb.Item>数据表管理</Breadcrumb.Item>
      </Breadcrumb>
      <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />}>
                新建数据表
              </Button>
              <Button icon={<UploadOutlined />}>
                导入数据
              </Button>
              <Button icon={<DownloadOutlined />} disabled={selectedRowKeys.length === 0}>
                导出数据
              </Button>
              <Button danger disabled={selectedRowKeys.length === 0}>
                批量删除
              </Button>
              <Input
                placeholder="搜索数据表"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                onChange={e => setSearchText(e.target.value)}
              />
            </Space>

            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredTables}
              rowKey="id"
            />
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default DataTablesPage; 