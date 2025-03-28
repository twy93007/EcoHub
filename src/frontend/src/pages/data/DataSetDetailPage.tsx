import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Table, Button, Space, Tag, message, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useData } from '../../hooks/useData';
import { DataSet, DataTable } from '../../types/data';

const { TabPane } = Tabs;

const DataSetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DataSet | null>(null);
  const [tables, setTables] = useState<DataTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateTableModalVisible, setIsCreateTableModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { fetchDataset, listTables, createTable } = useData();

  useEffect(() => {
    if (id) {
      loadDataset();
      loadTables();
    }
  }, [id]);

  const loadDataset = async () => {
    try {
      setLoading(true);
      const data = await fetchDataset(id!);
      setDataset(data);
    } catch (error) {
      message.error('加载数据集信息失败');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await listTables(parseInt(id!));
      setTables(data.items);
    } catch (error) {
      message.error('加载数据表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (values: any) => {
    try {
      await createTable(parseInt(id!), values);
      message.success('创建数据表成功');
      setIsCreateTableModalVisible(false);
      form.resetFields();
      loadTables();
    } catch (error) {
      message.error('创建数据表失败');
    }
  };

  const columns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataTable) => (
        <a onClick={() => navigate(`/tables/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '行数',
      dataIndex: 'row_count',
      key: 'row_count',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DataTable) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/tables/${record.id}/edit`)}>
            编辑
          </Button>
          <Button type="link" onClick={() => navigate(`/tables/${record.id}/preview`)}>
            预览
          </Button>
        </Space>
      ),
    },
  ];

  if (!dataset) {
    return <div>加载中...</div>;
  }

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{dataset.name}</h2>
              <p className="text-gray-500">{dataset.description}</p>
            </div>
            <Space>
              <Button icon={<UploadOutlined />}>上传数据</Button>
              <Button icon={<ShareAltOutlined />}>共享</Button>
            </Space>
          </div>
        }
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="数据表" key="1">
            <div className="mb-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateTableModalVisible(true)}
              >
                创建数据表
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={tables}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
          <TabPane tab="元数据" key="2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">基本信息</h3>
                <p>数据层级：<Tag color="blue">{dataset.data_level}</Tag></p>
                <p>数据来源：<Tag color="orange">{dataset.source_type}</Tag></p>
                <p>创建时间：{new Date(dataset.created_at).toLocaleString()}</p>
                <p>更新时间：{new Date(dataset.updated_at).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">统计信息</h3>
                <p>数据表数量：{tables.length}</p>
                <p>总行数：{tables.reduce((sum, table) => sum + table.row_count, 0)}</p>
              </div>
            </div>
          </TabPane>
        </Tabs>

        <Modal
          title="创建数据表"
          open={isCreateTableModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsCreateTableModalVisible(false);
            form.resetFields();
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateTable}
          >
            <Form.Item
              name="name"
              label="表名"
              rules={[{ required: true, message: '请输入表名' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="is_public"
              label="是否公开"
              valuePropName="checked"
            >
              <Select>
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default DataSetDetailPage; 