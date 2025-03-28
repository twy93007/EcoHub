import React, { useState } from 'react';
import {
  Layout,
  Card,
  List,
  Button,
  Space,
  Input,
  Tag,
  Typography,
  Breadcrumb,
  Row,
  Col,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Search } = Input;

interface DataTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  fields: number;
  downloads: number;
  lastUpdated: string;
}

const mockTemplates: DataTemplate[] = [
  {
    id: '1',
    name: '标准财务报表模板',
    description: '包含资产负债表、利润表、现金流量表等标准财务报表结构',
    type: '财务数据',
    category: '金融',
    fields: 50,
    downloads: 1200,
    lastUpdated: '2024-03-15'
  },
  {
    id: '2',
    name: '股票交易数据模板',
    description: '包含股票代码、交易日期、开盘价、收盘价、成交量等字段',
    type: '市场数据',
    category: '金融',
    fields: 15,
    downloads: 850,
    lastUpdated: '2024-03-14'
  },
  {
    id: '3',
    name: '企业ESG数据模板',
    description: '包含环境、社会责任、公司治理等ESG相关指标',
    type: 'ESG数据',
    category: '可持续发展',
    fields: 30,
    downloads: 450,
    lastUpdated: '2024-03-13'
  },
  {
    id: '4',
    name: '宏观经济指标模板',
    description: 'GDP、CPI、PPI等主要宏观经济指标数据结构',
    type: '宏观数据',
    category: '经济',
    fields: 25,
    downloads: 680,
    lastUpdated: '2024-03-12'
  }
];

const DataTemplatesPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const filteredTemplates = mockTemplates.filter(template =>
    template.name.toLowerCase().includes(searchText.toLowerCase()) ||
    template.description.toLowerCase().includes(searchText.toLowerCase()) ||
    template.type.toLowerCase().includes(searchText.toLowerCase()) ||
    template.category.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout style={{ padding: '0 24px 24px' }}>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>数据中心</Breadcrumb.Item>
        <Breadcrumb.Item>数据模板</Breadcrumb.Item>
      </Breadcrumb>
      <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4}>数据模板库</Title>
              <Paragraph type="secondary">
                使用预定义的数据模板快速创建标准化的数据表
              </Paragraph>
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<PlusOutlined />}>
                  新建模板
                </Button>
                <Search
                  placeholder="搜索模板"
                  allowClear
                  style={{ width: 200 }}
                  onChange={e => setSearchText(e.target.value)}
                />
              </Space>
            </Col>
          </Row>

          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 3,
              xxl: 3,
            }}
            dataSource={filteredTemplates}
            renderItem={template => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Tooltip title="编辑模板">
                      <EditOutlined key="edit" />
                    </Tooltip>,
                    <Tooltip title="下载模板">
                      <DownloadOutlined key="download" />
                    </Tooltip>,
                    <Tooltip title="删除模板">
                      <DeleteOutlined key="delete" />
                    </Tooltip>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      template.type === '财务数据' ? (
                        <FileTextOutlined style={{ fontSize: 24 }} />
                      ) : (
                        <DatabaseOutlined style={{ fontSize: 24 }} />
                      )
                    }
                    title={
                      <Space>
                        {template.name}
                        <Tag color="blue">{template.type}</Tag>
                      </Space>
                    }
                    description={
                      <>
                        <Paragraph ellipsis={{ rows: 2 }}>
                          {template.description}
                        </Paragraph>
                        <Space size="large">
                          <span>
                            字段数：{template.fields}
                          </span>
                          <span>
                            下载量：{template.downloads}
                          </span>
                          <span>
                            更新：{template.lastUpdated}
                          </span>
                        </Space>
                      </>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </Space>
      </Content>
    </Layout>
  );
};

export default DataTemplatesPage; 