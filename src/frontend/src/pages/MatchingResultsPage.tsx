import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Spin, 
  Tooltip, 
  Tabs, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Divider,
  Modal,
  Select,
  Popconfirm,
  message
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 匹配结果接口
interface MatchingResult {
  id: number;
  taskId: number;
  taskName: string;
  sourceId: string;
  targetId: string;
  sourceValue: string;
  targetValue: string;
  fields: MatchedField[];
  similarity: number;
  status: 'matched' | 'unmatched' | 'pending';
  createdAt: string;
}

// 匹配字段接口
interface MatchedField {
  sourceField: string;
  targetField: string;
  sourceValue: string;
  targetValue: string;
  similarity: number;
}

// 匹配任务接口
interface MatchingTask {
  id: number;
  name: string;
  description: string;
  sourceTable: string;
  targetTable: string;
  totalRecords: number;
  matchedRecords: number;
  unmatchedRecords: number;
  pendingRecords: number;
  status: 'completed' | 'running' | 'failed';
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

// 模拟匹配任务数据
const mockTask: MatchingTask = {
  id: 1,
  name: '企业数据匹配任务',
  description: '将企业基础信息与年度财务数据进行匹配',
  sourceTable: '企业基础信息表',
  targetTable: '企业年度财务数据表',
  totalRecords: 1000,
  matchedRecords: 850,
  unmatchedRecords: 100,
  pendingRecords: 50,
  status: 'completed',
  createdAt: '2023-03-15',
  completedAt: '2023-03-16',
  createdBy: '张三'
};

// 模拟匹配结果
const mockResults: MatchingResult[] = Array(100).fill(null).map((_, index) => ({
  id: index + 1,
  taskId: 1,
  taskName: '企业数据匹配任务',
  sourceId: `SRC-${10000 + index}`,
  targetId: `TGT-${20000 + index}`,
  sourceValue: `公司 ${String.fromCharCode(65 + (index % 26))}${index}`,
  targetValue: index % 10 === 0 
    ? `公司${String.fromCharCode(65 + (index % 26))}${index + 1}` 
    : `公司 ${String.fromCharCode(65 + (index % 26))}${index}`,
  fields: [
    {
      sourceField: '企业名称',
      targetField: '公司名称',
      sourceValue: `公司 ${String.fromCharCode(65 + (index % 26))}${index}`,
      targetValue: index % 10 === 0 
        ? `公司${String.fromCharCode(65 + (index % 26))}${index + 1}` 
        : `公司 ${String.fromCharCode(65 + (index % 26))}${index}`,
      similarity: index % 10 === 0 ? 0.9 : 1
    },
    {
      sourceField: '注册号',
      targetField: '企业注册号',
      sourceValue: `REG${100000 + index}`,
      targetValue: index % 15 === 0 
        ? `REG${100000 + index + 1}`
        : `REG${100000 + index}`,
      similarity: index % 15 === 0 ? 0.8 : 1
    },
    {
      sourceField: '行业',
      targetField: '行业分类',
      sourceValue: `行业-${index % 10 + 1}`,
      targetValue: `行业-${index % 10 + 1}`,
      similarity: 1
    }
  ],
  similarity: index % 10 === 0 ? 0.9 : (index % 15 === 0 ? 0.95 : 1),
  status: index % 10 === 0 
    ? 'pending' 
    : (index % 15 === 0 ? 'unmatched' : 'matched'),
  createdAt: '2023-03-16'
}));

const MatchingResultsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<MatchingTask | null>(null);
  const [results, setResults] = useState<MatchingResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<MatchingResult[]>([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentResult, setCurrentResult] = useState<MatchingResult | null>(null);
  
  // 过滤条件
  const [filters, setFilters] = useState({
    minSimilarity: 0,
    status: 'all',
  });
  
  // 加载数据
  useEffect(() => {
    fetchData();
  }, [id]);
  
  // 监听过滤器和搜索条件变化
  useEffect(() => {
    applyFilters();
  }, [results, searchText, activeTab, filters]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: 从API获取数据
      // const response = await get(`/api/matching/tasks/${id}`);
      // setTask(response.data.task);
      // setResults(response.data.results);
      
      // 模拟数据加载
      setTimeout(() => {
        setTask(mockTask);
        setResults(mockResults);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('获取匹配结果失败:', error);
      setLoading(false);
    }
  };
  
  // 应用过滤器
  const applyFilters = () => {
    let filtered = [...results];
    
    // 应用标签过滤
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => {
        if (activeTab === 'matched') return item.status === 'matched';
        if (activeTab === 'unmatched') return item.status === 'unmatched';
        if (activeTab === 'pending') return item.status === 'pending';
        return true;
      });
    }
    
    // 应用搜索过滤
    if (searchText) {
      filtered = filtered.filter(item => 
        item.sourceValue.toLowerCase().includes(searchText.toLowerCase()) ||
        item.targetValue.toLowerCase().includes(searchText.toLowerCase()) ||
        item.sourceId.toLowerCase().includes(searchText.toLowerCase()) ||
        item.targetId.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 应用相似度过滤
    if (filters.minSimilarity > 0) {
      filtered = filtered.filter(item => item.similarity >= filters.minSimilarity);
    }
    
    // 应用状态过滤
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    setFilteredResults(filtered);
  };
  
  // 重置过滤器
  const handleResetFilters = () => {
    setFilters({
      minSimilarity: 0,
      status: 'all',
    });
    setSearchText('');
  };
  
  // 查看详情
  const handleViewDetail = (record: MatchingResult) => {
    setCurrentResult(record);
    setDetailVisible(true);
  };
  
  // 手动匹配/取消匹配
  const handleStatusChange = (record: MatchingResult, status: 'matched' | 'unmatched') => {
    // TODO: 实际项目中应该调用API进行状态更新
    const updatedResults = results.map(item => {
      if (item.id === record.id) {
        return { ...item, status };
      }
      return item;
    });
    
    setResults(updatedResults);
    message.success(`操作成功`);
  };
  
  // 导出结果
  const handleExport = () => {
    message.success('开始导出匹配结果');
    // TODO: 实际项目中调用导出API
  };
  
  // 刷新数据
  const handleRefresh = () => {
    fetchData();
  };
  
  // 获取状态标签
  const getStatusTag = (status: string) => {
    if (status === 'matched') {
      return <Tag color="success" icon={<CheckCircleOutlined />}>已匹配</Tag>;
    }
    if (status === 'unmatched') {
      return <Tag color="error" icon={<CloseCircleOutlined />}>不匹配</Tag>;
    }
    return <Tag color="warning" icon={<QuestionCircleOutlined />}>待确认</Tag>;
  };
  
  // 获取相似度标签颜色
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return '#52c41a';
    if (similarity >= 0.7) return '#faad14';
    return '#f5222d';
  };
  
  // 表格列定义
  const columns = [
    {
      title: '源记录ID',
      dataIndex: 'sourceId',
      key: 'sourceId',
      width: 120,
    },
    {
      title: '源记录值',
      dataIndex: 'sourceValue',
      key: 'sourceValue',
      ellipsis: true,
    },
    {
      title: '目标记录ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 120,
    },
    {
      title: '目标记录值',
      dataIndex: 'targetValue',
      key: 'targetValue',
      ellipsis: true,
    },
    {
      title: '相似度',
      dataIndex: 'similarity',
      key: 'similarity',
      width: 100,
      sorter: (a: MatchingResult, b: MatchingResult) => a.similarity - b.similarity,
      render: (similarity: number) => (
        <Tooltip title={`${Math.round(similarity * 100)}%`}>
          <Progress 
            percent={Math.round(similarity * 100)} 
            size="small" 
            strokeColor={getSimilarityColor(similarity)}
            format={percent => `${percent}%`}
          />
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: MatchingResult) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status !== 'matched' && (
            <Tooltip title="标记为匹配">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                onClick={() => handleStatusChange(record, 'matched')}
              />
            </Tooltip>
          )}
          {record.status !== 'unmatched' && (
            <Tooltip title="标记为不匹配">
              <Button 
                type="text" 
                icon={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
                onClick={() => handleStatusChange(record, 'unmatched')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  
  return (
    <div className="matching-results-page">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>匹配结果</Title>
          {task && (
            <Paragraph>
              任务: {task.name} - {task.description}
            </Paragraph>
          )}
        </Col>
        {id && (
          <Col>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
            >
              导出结果
            </Button>
          </Col>
        )}
      </Row>
      
      <Divider />
      
      <Spin spinning={loading}>
        {/* 任务统计信息 */}
        {task && (
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="总记录数" 
                  value={task.totalRecords} 
                  suffix="条"
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="已匹配" 
                  value={task.matchedRecords} 
                  suffix={`条 (${Math.round(task.matchedRecords / task.totalRecords * 100)}%)`}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="未匹配" 
                  value={task.unmatchedRecords} 
                  suffix={`条 (${Math.round(task.unmatchedRecords / task.totalRecords * 100)}%)`}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="待确认" 
                  value={task.pendingRecords} 
                  suffix={`条 (${Math.round(task.pendingRecords / task.totalRecords * 100)}%)`}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="匹配状态" 
                  value={task.status === 'completed' ? '已完成' : (task.status === 'running' ? '进行中' : '失败')}
                  valueStyle={{ 
                    color: task.status === 'completed' ? '#52c41a' : (task.status === 'running' ? '#1890ff' : '#f5222d')
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="更新时间" 
                  value={task.completedAt || task.createdAt}
                />
              </Col>
            </Row>
          </Card>
        )}
        
        {/* 结果筛选和工具栏 */}
        <Card style={{ marginBottom: 16 }}>
          <Space wrap style={{ marginBottom: 16 }}>
            <Input.Search
              placeholder="搜索ID或内容" 
              allowClear 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)} 
              style={{ width: 250 }}
            />
            
            <Space>
              <span>最小相似度:</span>
              <Select
                style={{ width: 120 }}
                value={filters.minSimilarity}
                onChange={(value) => setFilters({...filters, minSimilarity: value})}
              >
                <Option value={0}>全部</Option>
                <Option value={0.7}>70%以上</Option>
                <Option value={0.8}>80%以上</Option>
                <Option value={0.9}>90%以上</Option>
                <Option value={0.95}>95%以上</Option>
              </Select>
            </Space>
            
            <Space>
              <span>状态:</span>
              <Select
                style={{ width: 120 }}
                value={filters.status}
                onChange={(value) => setFilters({...filters, status: value})}
              >
                <Option value="all">全部</Option>
                <Option value="matched">已匹配</Option>
                <Option value="unmatched">不匹配</Option>
                <Option value="pending">待确认</Option>
              </Select>
            </Space>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleResetFilters}
            >
              重置过滤器
            </Button>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              刷新数据
            </Button>
          </Space>
          
          {/* 标签页切换 */}
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            tabBarExtraContent={
              <Text type="secondary">
                共 {filteredResults.length} 条记录
              </Text>
            }
          >
            <TabPane tab="全部" key="all" />
            <TabPane 
              tab={
                <span>
                  已匹配 <Tag color="success">{results.filter(r => r.status === 'matched').length}</Tag>
                </span>
              } 
              key="matched" 
            />
            <TabPane 
              tab={
                <span>
                  不匹配 <Tag color="error">{results.filter(r => r.status === 'unmatched').length}</Tag>
                </span>
              } 
              key="unmatched" 
            />
            <TabPane 
              tab={
                <span>
                  待确认 <Tag color="warning">{results.filter(r => r.status === 'pending').length}</Tag>
                </span>
              } 
              key="pending" 
            />
          </Tabs>
        </Card>
        
        {/* 结果表格 */}
        <Table
          columns={columns}
          dataSource={filteredResults}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Spin>
      
      {/* 详情弹窗 */}
      {currentResult && (
        <Modal
          title="匹配详情"
          visible={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
        >
          <Card title="基本信息" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="源记录ID" value={currentResult.sourceId} />
              </Col>
              <Col span={12}>
                <Statistic title="目标记录ID" value={currentResult.targetId} />
              </Col>
              <Col span={24}>
                <Statistic 
                  title="匹配状态" 
                  value={
                    currentResult.status === 'matched' 
                      ? '已匹配' 
                      : (currentResult.status === 'unmatched' ? '不匹配' : '待确认')
                  }
                  valueStyle={{ 
                    color: currentResult.status === 'matched' 
                      ? '#52c41a' 
                      : (currentResult.status === 'unmatched' ? '#f5222d' : '#faad14')
                  }}
                />
              </Col>
              <Col span={24}>
                <Statistic 
                  title="总体相似度" 
                  value={`${Math.round(currentResult.similarity * 100)}%`}
                  valueStyle={{ color: getSimilarityColor(currentResult.similarity) }}
                />
                <Progress 
                  percent={Math.round(currentResult.similarity * 100)}
                  status={currentResult.similarity >= 0.9 ? 'success' : 'normal'}
                  strokeColor={getSimilarityColor(currentResult.similarity)}
                />
              </Col>
            </Row>
          </Card>
          
          <Card title="字段匹配详情">
            <Table
              dataSource={currentResult.fields}
              rowKey={(record) => `${record.sourceField}-${record.targetField}`}
              pagination={false}
              columns={[
                {
                  title: '源字段',
                  dataIndex: 'sourceField',
                  key: 'sourceField',
                  width: 120,
                },
                {
                  title: '源值',
                  dataIndex: 'sourceValue',
                  key: 'sourceValue',
                },
                {
                  title: '目标字段',
                  dataIndex: 'targetField',
                  key: 'targetField',
                  width: 120,
                },
                {
                  title: '目标值',
                  dataIndex: 'targetValue',
                  key: 'targetValue',
                },
                {
                  title: '相似度',
                  dataIndex: 'similarity',
                  key: 'similarity',
                  width: 100,
                  render: (similarity: number) => (
                    <Tooltip title={`${Math.round(similarity * 100)}%`}>
                      <Progress 
                        percent={Math.round(similarity * 100)} 
                        size="small" 
                        strokeColor={getSimilarityColor(similarity)}
                        format={percent => `${percent}%`}
                      />
                    </Tooltip>
                  ),
                }
              ]}
            />
          </Card>
          
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
            {currentResult.status !== 'matched' && (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  handleStatusChange(currentResult, 'matched');
                  setDetailVisible(false);
                }}
              >
                标记为匹配
              </Button>
            )}
            {currentResult.status !== 'unmatched' && (
              <Button 
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  handleStatusChange(currentResult, 'unmatched');
                  setDetailVisible(false);
                }}
              >
                标记为不匹配
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MatchingResultsPage; 