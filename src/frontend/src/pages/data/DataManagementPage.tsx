import React, { useState, useEffect } from 'react';
import {
  Typography,
  Layout,
  Menu,
  Tree,
  Card,
  Button,
  Space,
  Input,
  Tabs,
  Breadcrumb,
  message
} from 'antd';
import {
  DatabaseOutlined,
  TableOutlined,
  DownloadOutlined,
  SettingOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import FieldList from '../../components/data/FieldList';

const { Title } = Typography;
const { Header, Sider, Content } = Layout;
const { DirectoryTree } = Tree;
const { TabPane } = Tabs;

// 模拟数据集和数据表数据
interface Field {
  id: string;
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

interface DataTable {
  id: string;
  name: string;
  description: string;
  fields: Field[];
  rows: number;
}

interface DataSet {
  id: string;
  name: string;
  description: string;
  tables: DataTable[];
}

// 模拟数据
const mockDataSets: DataSet[] = [
  {
    id: '1',
    name: '财务报表数据集',
    description: '包含资产负债表、利润表等财务报表数据',
    tables: [
      {
        id: '1-1',
        name: '资产负债表',
        description: '企业资产负债数据',
        fields: [
          {
            id: '1',
            name: '公司代码',
            type: 'string',
            description: '上市公司代码',
            isRequired: true,
            isPrimaryKey: true,
            isForeignKey: false
          },
          {
            id: '2',
            name: '报告期',
            type: 'date',
            description: '财务报告期间',
            isRequired: true,
            isPrimaryKey: true,
            isForeignKey: false
          },
          {
            id: '3',
            name: '总资产',
            type: 'decimal',
            description: '企业总资产金额',
            isRequired: true,
            isPrimaryKey: false,
            isForeignKey: false
          }
        ],
        rows: 10000
      },
      {
        id: '1-2',
        name: '利润表',
        description: '企业利润数据',
        fields: [
          {
            id: '1',
            name: '公司代码',
            type: 'string',
            description: '上市公司代码',
            isRequired: true,
            isPrimaryKey: true,
            isForeignKey: true
          },
          {
            id: '2',
            name: '报告期',
            type: 'date',
            description: '财务报告期间',
            isRequired: true,
            isPrimaryKey: true,
            isForeignKey: false
          },
          {
            id: '3',
            name: '营业收入',
            type: 'decimal',
            description: '企业营业收入金额',
            isRequired: true,
            isPrimaryKey: false,
            isForeignKey: false
          }
        ],
        rows: 8000
      }
    ]
  },
  {
    id: '2',
    name: '股票市场数据集',
    description: '包含股票交易、指数等市场数据',
    tables: [
      {
        id: '2-1',
        name: '日个股交易数据',
        description: '每日股票交易数据',
        fields: [
          {
            id: '1',
            name: '股票代码',
            type: 'string',
            description: '股票代码',
            isRequired: true,
            isPrimaryKey: true,
            isForeignKey: false
          },
          {
            id: '2',
            name: '交易日期',
            type: 'date',
            description: '交易日期',
            isRequired: true,
            isPrimaryKey: true,
            isForeignKey: false
          },
          {
            id: '3',
            name: '交易量',
            type: 'decimal',
            description: '交易量',
            isRequired: true,
            isPrimaryKey: false,
            isForeignKey: false
          }
        ],
        rows: 50000
      }
    ]
  }
];

// 生成树形数据
const generateTreeData = (dataSets: DataSet[]): DataNode[] => {
  return dataSets.map(dataSet => ({
    title: dataSet.name,
    key: dataSet.id,
    icon: <DatabaseOutlined />,
    children: dataSet.tables.map(table => ({
      title: table.name,
      key: `${dataSet.id}-${table.id}`,
      icon: <TableOutlined />,
      isLeaf: true
    }))
  }));
};

const DataManagementPage: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [currentTable, setCurrentTable] = useState<DataTable | null>(null);
  const [activeTab, setActiveTab] = useState('1');

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);
    if (info.node.isLeaf) {
      const [dataSetId, tableId] = String(selectedKeys[0]).split('-');
      const dataSet = mockDataSets.find(ds => ds.id === dataSetId);
      const table = dataSet?.tables.find(t => t.id === tableId);
      setCurrentTable(table || null);
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* 顶部导航 */}
      <Header style={{ background: '#fff', padding: '0 16px', height: '48px', lineHeight: '48px', borderBottom: '1px solid #f0f0f0' }}>
        <Menu mode="horizontal" selectedKeys={[activeTab]} onSelect={({ key }) => setActiveTab(key)}>
          <Menu.Item key="1" icon={<FileTextOutlined />}>数据查询</Menu.Item>
          <Menu.Item key="2" icon={<BarChartOutlined />}>数据分析</Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />}>数据管理</Menu.Item>
        </Menu>
      </Header>

      <Layout>
        {/* 左侧数据集列表 */}
        <Sider width={300} style={{ background: '#fff', padding: '16px', overflowY: 'auto' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Search placeholder="搜索数据集/数据表" />
            <DirectoryTree
              defaultExpandAll
              onSelect={handleSelect}
              treeData={generateTreeData(mockDataSets)}
            />
          </Space>
        </Sider>

        {/* 右侧内容区 */}
        <Content style={{ padding: '16px', background: '#fff', margin: '0 16px' }}>
          <Breadcrumb style={{ marginBottom: '16px' }}>
            <Breadcrumb.Item>数据中心</Breadcrumb.Item>
            <Breadcrumb.Item>单表查询</Breadcrumb.Item>
            {currentTable && (
              <>
                <Breadcrumb.Item>{currentTable.name}</Breadcrumb.Item>
              </>
            )}
          </Breadcrumb>

          {currentTable ? (
            <Card>
              <Tabs defaultActiveKey="1">
                <TabPane tab="字段设置" key="1">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Card title="基本信息" size="small">
                      <p>表名：{currentTable.name}</p>
                      <p>描述：{currentTable.description}</p>
                      <p>字段数：{currentTable.fields.length}</p>
                      <p>记录数：{currentTable.rows}</p>
                    </Card>
                    
                    <Card title="字段列表" size="small" extra={
                      <Space>
                        <Button type="primary">全选</Button>
                        <Button>全部删除</Button>
                        <Button icon={<DownloadOutlined />}>样本数据</Button>
                      </Space>
                    }>
                      <FieldList 
                        fields={currentTable.fields}
                        onFieldSelect={(fields) => console.log('Selected fields:', fields)}
                      />
                    </Card>
                  </Space>
                </TabPane>
                <TabPane tab="数据预览" key="2">
                  {/* 这里可以添加数据预览组件 */}
                </TabPane>
                <TabPane tab="相关论文" key="3">
                  {/* 这里可以添加相关论文组件 */}
                </TabPane>
              </Tabs>
            </Card>
          ) : (
            <Card>
              <Title level={4}>请选择要查看的数据表</Title>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DataManagementPage; 