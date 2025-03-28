import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Progress, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Steps, 
  Divider, 
  Spin, 
  Tabs,
  message,
  Tooltip,
  Badge,
  Row, 
  Col,
  Drawer,
  Radio,
  InputNumber,
  List,
  Descriptions
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  SettingOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { ColumnsType } from 'antd/es/table';
import { get, post, del } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;
const { confirm } = Modal;

// 匹配任务接口定义
interface MatchingTask {
  id: number;
  name: string;
  description: string;
  sourceTable: string;
  targetTable: string;
  matchingFields: MatchingField[];
  algorithm: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  matchedCount: number;
  totalCount: number;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

// 匹配字段接口定义
interface MatchingField {
  sourceField: string;
  targetField: string;
  similarity: number;
}

// 数据表接口定义
interface DataTable {
  id: number;
  name: string;
  fields: string[];
}

// 模拟数据表
const mockDataTables: DataTable[] = [
  {
    id: 1,
    name: '中国城市GDP数据表',
    fields: ['城市名称', '省份', '年份', 'GDP(亿元)', '人口(万人)', '面积(平方公里)']
  },
  {
    id: 2,
    name: '全球气候变化数据',
    fields: ['国家', '地区', '年份', '平均温度', '降水量', '二氧化碳排放量']
  },
  {
    id: 3,
    name: '上市公司财务数据',
    fields: ['公司名称', '股票代码', '行业', '营业收入', '净利润', '总资产', '净资产']
  }
];

// 模拟匹配任务
const mockMatchingTasks: MatchingTask[] = [
  {
    id: 1,
    name: '城市GDP与气候数据匹配',
    description: '将中国城市GDP数据与全球气候变化数据进行匹配',
    sourceTable: '中国城市GDP数据表',
    targetTable: '全球气候变化数据',
    matchingFields: [
      { sourceField: '城市名称', targetField: '地区', similarity: 0.85 },
      { sourceField: '年份', targetField: '年份', similarity: 1.0 }
    ],
    algorithm: 'exactMatch',
    status: 'completed',
    progress: 100,
    matchedCount: 187,
    totalCount: 245,
    createdBy: '张三',
    createdAt: '2023-09-18 14:23:45',
    completedAt: '2023-09-18 14:25:12'
  },
  {
    id: 2,
    name: '公司财务与城市GDP数据匹配',
    description: '将上市公司财务数据与城市GDP数据进行匹配',
    sourceTable: '上市公司财务数据',
    targetTable: '中国城市GDP数据表',
    matchingFields: [
      { sourceField: '公司所在地', targetField: '城市名称', similarity: 0.9 }
    ],
    algorithm: 'fuzzyMatch',
    status: 'running',
    progress: 65,
    matchedCount: 1245,
    totalCount: 1890,
    createdBy: '李四',
    createdAt: '2023-10-05 09:11:34'
  },
  {
    id: 3,
    name: '历史气候数据匹配',
    description: '匹配不同来源的气候历史数据',
    sourceTable: '全球气候变化数据',
    targetTable: '历史气象数据',
    matchingFields: [
      { sourceField: '国家', targetField: '国家', similarity: 0.95 },
      { sourceField: '地区', targetField: '地区', similarity: 0.85 },
      { sourceField: '年份', targetField: '年度', similarity: 0.9 }
    ],
    algorithm: 'semanticMatch',
    status: 'failed',
    progress: 45,
    matchedCount: 567,
    totalCount: 1245,
    createdBy: '王五',
    createdAt: '2023-10-08 16:29:12'
  }
];

const MatchingTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<MatchingTask[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MatchingTask | null>(null);
  const [dataTables, setDataTables] = useState<DataTable[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [taskForm] = Form.useForm();
  const [matchingFieldsForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 获取任务列表
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // TODO: 实际项目中应该从API获取数据
        // const response = await get('/api/matching/tasks', {
        //   params: {
        //     page: pagination.current,
        //     pageSize: pagination.pageSize
        //   }
        // });
        // if (response.status === 'success') {
        //   setTasks(response.data.items);
        //   setPagination({
        //     ...pagination,
        //     total: response.data.total
        //   });
        // }
        
        // 目前使用模拟数据
        setTimeout(() => {
          setTasks(mockMatchingTasks);
          setPagination({
            ...pagination,
            total: mockMatchingTasks.length
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('获取匹配任务列表失败:', error);
        setLoading(false);
      }
    };
    
    const fetchDataTables = async () => {
      try {
        // TODO: 实际项目中应该从API获取数据
        // const response = await get('/api/data/tables');
        // if (response.status === 'success') {
        //   setDataTables(response.data);
        // }
        
        // 目前使用模拟数据
        setDataTables(mockDataTables);
      } catch (error) {
        console.error('获取数据表列表失败:', error);
      }
    };
    
    fetchTasks();
    fetchDataTables();
  }, [pagination.current, pagination.pageSize]);
  
  // 处理查看任务详情
  const handleViewTask = (task: MatchingTask) => {
    setSelectedTask(task);
    setDetailDrawerVisible(true);
  };
  
  // 处理删除任务
  const handleDeleteTask = (id: number) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个匹配任务吗？删除后无法恢复。',
      onOk: async () => {
        try {
          // TODO: 实际项目中应该调用API删除任务
          // await del(`/api/matching/tasks/${id}`);
          message.success('匹配任务已成功删除');
          // 更新列表
          setTasks(tasks.filter(task => task.id !== id));
        } catch (error) {
          console.error('删除匹配任务失败:', error);
          message.error('删除匹配任务失败');
        }
      }
    });
  };
  
  // 处理创建任务下一步
  const handleNextStep = async () => {
    try {
      await taskForm.validateFields();
      if (currentStep === 0) {
        // 选择源表和目标表
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // 配置匹配字段
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // 设置匹配参数
        setCurrentStep(3);
      }
    } catch (errorInfo) {
      console.log('表单验证失败:', errorInfo);
    }
  };
  
  // 处理创建任务上一步
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // 处理创建匹配任务
  const handleCreateTask = async () => {
    try {
      const taskValues = taskForm.getFieldsValue();
      const fieldsValues = matchingFieldsForm.getFieldsValue();
      
      const matchingFields = Object.keys(fieldsValues.fields || {}).map(key => ({
        sourceField: key,
        targetField: fieldsValues.fields[key],
        similarity: 0.9 // 默认相似度
      }));
      
      const taskData = {
        ...taskValues,
        matchingFields,
        status: 'pending',
        progress: 0,
        matchedCount: 0,
        totalCount: 0,
        createdBy: user?.username,
        createdAt: new Date().toISOString()
      };
      
      // TODO: 实际项目中应该调用API创建任务
      // const response = await post('/api/matching/tasks', taskData);
      // if (response.status === 'success') {
      //   message.success('匹配任务创建成功');
      //   // 刷新任务列表
      // }
      
      // 模拟创建成功
      message.success('匹配任务创建成功');
      setCreateModalVisible(false);
      setCurrentStep(0);
      taskForm.resetFields();
      matchingFieldsForm.resetFields();
      
      // 添加到任务列表
      const newTask: MatchingTask = {
        id: Math.max(...tasks.map(t => t.id)) + 1,
        name: taskData.name,
        description: taskData.description,
        sourceTable: taskData.sourceTable,
        targetTable: taskData.targetTable,
        matchingFields,
        algorithm: taskData.algorithm,
        status: 'pending',
        progress: 0,
        matchedCount: 0,
        totalCount: 0,
        createdBy: user?.username || 'unknown',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      
      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error('创建匹配任务失败:', error);
      message.error('创建匹配任务失败');
    }
  };
  
  // 处理取消创建任务
  const handleCancelCreate = () => {
    setCreateModalVisible(false);
    setCurrentStep(0);
    taskForm.resetFields();
    matchingFieldsForm.resetFields();
  };
  
  // 获取源表字段
  const getSourceTableFields = () => {
    const sourceTableId = taskForm.getFieldValue('sourceTable');
    const sourceTable = dataTables.find(table => table.id === sourceTableId);
    return sourceTable ? sourceTable.fields : [];
  };
  
  // 获取目标表字段
  const getTargetTableFields = () => {
    const targetTableId = taskForm.getFieldValue('targetTable');
    const targetTable = dataTables.find(table => table.id === targetTableId);
    return targetTable ? targetTable.fields : [];
  };
  
  // 渲染状态标签
  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="default">待处理</Tag>;
      case 'running':
        return <Tag color="processing">运行中</Tag>;
      case 'completed':
        return <Tag color="success">已完成</Tag>;
      case 'failed':
        return <Tag color="error">失败</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<MatchingTask> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => handleViewTask(record)}>{text}</a>
      )
    },
    {
      title: '源数据表',
      dataIndex: 'sourceTable',
      key: 'sourceTable',
    },
    {
      title: '目标数据表',
      dataIndex: 'targetTable',
      key: 'targetTable',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => renderStatusTag(status)
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress, record) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={record.status === 'failed' ? 'exception' : undefined}
        />
      )
    },
    {
      title: '匹配率',
      key: 'matchRate',
      render: (_, record) => (
        record.totalCount > 0 ? `${Math.round(record.matchedCount / record.totalCount * 100)}%` : '0%'
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewTask(record)} 
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteTask(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // 渲染创建任务表单步骤
  const renderCreateStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={taskForm}
            layout="vertical"
            initialValues={{ algorithm: 'exactMatch' }}
          >
            <Form.Item
              name="name"
              label="任务名称"
              rules={[{ required: true, message: '请输入任务名称' }]}
            >
              <Input placeholder="请输入任务名称" />
            </Form.Item>
            <Form.Item
              name="description"
              label="任务描述"
            >
              <Input.TextArea rows={4} placeholder="请输入任务描述" />
            </Form.Item>
          </Form>
        );
      case 1:
        return (
          <Form
            form={taskForm}
            layout="vertical"
          >
            <Form.Item
              name="sourceTable"
              label="源数据表"
              rules={[{ required: true, message: '请选择源数据表' }]}
            >
              <Select placeholder="请选择源数据表">
                {dataTables.map(table => (
                  <Option key={table.id} value={table.id}>{table.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="targetTable"
              label="目标数据表"
              rules={[{ required: true, message: '请选择目标数据表' }]}
            >
              <Select placeholder="请选择目标数据表">
                {dataTables.map(table => (
                  <Option key={table.id} value={table.id}>{table.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        );
      case 2:
        const sourceFields = getSourceTableFields();
        const targetFields = getTargetTableFields();
        
        return (
          <Form
            form={matchingFieldsForm}
            layout="vertical"
          >
            <Typography.Title level={5}>配置匹配字段</Typography.Title>
            <Typography.Paragraph type="secondary">
              请为源表中的字段选择对应的目标表字段进行匹配
            </Typography.Paragraph>
            
            {sourceFields.map(field => (
              <Form.Item
                key={field}
                name={['fields', field]}
                label={`源表字段: ${field}`}
              >
                <Select placeholder="请选择对应的目标表字段">
                  {targetFields.map(targetField => (
                    <Option key={targetField} value={targetField}>{targetField}</Option>
                  ))}
                </Select>
              </Form.Item>
            ))}
          </Form>
        );
      case 3:
        return (
          <Form
            form={taskForm}
            layout="vertical"
          >
            <Form.Item
              name="algorithm"
              label="匹配算法"
              rules={[{ required: true, message: '请选择匹配算法' }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="exactMatch">精确匹配 (要求字段值完全相同)</Radio>
                  <Radio value="fuzzyMatch">模糊匹配 (允许字段值有一定差异)</Radio>
                  <Radio value="semanticMatch">语义匹配 (基于字段含义进行匹配)</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="similarityThreshold"
              label="相似度阈值"
              tooltip="只有相似度大于或等于此值的记录才会被匹配"
              initialValue={0.8}
            >
              <InputNumber 
                min={0} 
                max={1} 
                step={0.05} 
                style={{ width: 200 }} 
              />
            </Form.Item>
            
            <Typography.Paragraph type="secondary">
              匹配任务创建后将进入队列等待处理，您可以在任务列表中查看进度。
            </Typography.Paragraph>
          </Form>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="matching-tasks-page">
      <Title level={2}>数据匹配任务</Title>
      <Paragraph>
        创建和管理数据匹配任务，将不同数据表中的相关数据进行匹配和关联。
      </Paragraph>
      
      <Divider />
      
      {/* 操作按钮 */}
      <Card style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建匹配任务
        </Button>
      </Card>
      
      {/* 任务列表 */}
      <Card>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={tasks}
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
      
      {/* 创建任务模态框 */}
      <Modal
        title="创建数据匹配任务"
        open={createModalVisible}
        onCancel={handleCancelCreate}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleCancelCreate}>
            取消
          </Button>,
          currentStep > 0 && (
            <Button key="back" onClick={handlePrevStep}>
              上一步
            </Button>
          ),
          currentStep < 3 ? (
            <Button key="next" type="primary" onClick={handleNextStep}>
              下一步
            </Button>
          ) : (
            <Button key="submit" type="primary" onClick={handleCreateTask}>
              创建任务
            </Button>
          )
        ]}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="基本信息" />
          <Step title="选择数据表" />
          <Step title="配置匹配字段" />
          <Step title="设置匹配参数" />
        </Steps>
        
        {renderCreateStepContent()}
      </Modal>
      
      {/* 任务详情抽屉 */}
      <Drawer
        title="匹配任务详情"
        placement="right"
        width={700}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedTask && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="任务名称" span={2}>{selectedTask.name}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{selectedTask.description}</Descriptions.Item>
              <Descriptions.Item label="源数据表">{selectedTask.sourceTable}</Descriptions.Item>
              <Descriptions.Item label="目标数据表">{selectedTask.targetTable}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedTask.createdBy}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedTask.createdAt}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {renderStatusTag(selectedTask.status)}
              </Descriptions.Item>
              <Descriptions.Item label="匹配算法">
                {selectedTask.algorithm === 'exactMatch' && '精确匹配'}
                {selectedTask.algorithm === 'fuzzyMatch' && '模糊匹配'}
                {selectedTask.algorithm === 'semanticMatch' && '语义匹配'}
              </Descriptions.Item>
              <Descriptions.Item label="进度" span={2}>
                <Progress 
                  percent={selectedTask.progress} 
                  status={selectedTask.status === 'failed' ? 'exception' : undefined}
                />
              </Descriptions.Item>
              <Descriptions.Item label="匹配数量">{selectedTask.matchedCount}</Descriptions.Item>
              <Descriptions.Item label="总记录数">{selectedTask.totalCount}</Descriptions.Item>
              {selectedTask.completedAt && (
                <Descriptions.Item label="完成时间" span={2}>{selectedTask.completedAt}</Descriptions.Item>
              )}
            </Descriptions>
            
            <Divider orientation="left">匹配字段</Divider>
            
            <List
              itemLayout="horizontal"
              dataSource={selectedTask.matchingFields}
              renderItem={field => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{field.sourceField}</Text>
                        <ArrowRightOutlined />
                        <Text strong>{field.targetField}</Text>
                      </Space>
                    }
                    description={`相似度阈值: ${field.similarity}`}
                  />
                </List.Item>
              )}
            />
            
            {selectedTask.status === 'completed' && (
              <>
                <Divider orientation="left">匹配结果</Divider>
                
                <Tabs defaultActiveKey="1">
                  <TabPane tab="匹配成功" key="1">
                    <Card>
                      <Space align="center" style={{ marginBottom: 16 }}>
                        <Badge status="success" />
                        <Text strong>匹配成功记录数: {selectedTask.matchedCount}</Text>
                      </Space>
                      
                      <Button 
                        type="primary" 
                        onClick={() => navigate(`/matching/results/${selectedTask.id}`)}
                      >
                        查看详细匹配结果
                      </Button>
                    </Card>
                  </TabPane>
                  <TabPane tab="匹配失败" key="2">
                    <Card>
                      <Space align="center" style={{ marginBottom: 16 }}>
                        <Badge status="error" />
                        <Text strong>
                          匹配失败记录数: {selectedTask.totalCount - selectedTask.matchedCount}
                        </Text>
                      </Space>
                      
                      <Button 
                        type="default" 
                        onClick={() => navigate(`/matching/results/${selectedTask.id}?tab=failed`)}
                      >
                        查看失败记录
                      </Button>
                    </Card>
                  </TabPane>
                </Tabs>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MatchingTasksPage; 