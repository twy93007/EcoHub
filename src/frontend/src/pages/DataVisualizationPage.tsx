import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Select, 
  Button, 
  Form, 
  Divider, 
  Tabs, 
  Space, 
  Spin,
  Radio,
  Empty,
  message,
  Tooltip,
  Modal,
  Input,
  List,
  Descriptions
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DotChartOutlined,
  AreaChartOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  SettingOutlined,
  ExportOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// 模拟数据源
const mockDataSources = [
  { id: 1, name: '中国城市GDP数据表', type: 'table' },
  { id: 2, name: '全球气候变化数据', type: 'table' },
  { id: 3, name: '上市公司财务数据', type: 'table' }
];

// 模拟已保存的可视化图表
const mockSavedCharts = [
  { 
    id: 1, 
    name: '中国主要城市GDP对比', 
    type: 'bar',
    dataSource: '中国城市GDP数据表',
    createdAt: '2023-09-20 15:30:45', 
    createdBy: '张三' 
  },
  { 
    id: 2, 
    name: '全球气温变化趋势', 
    type: 'line',
    dataSource: '全球气候变化数据',
    createdAt: '2023-10-05 09:45:22', 
    createdBy: '李四' 
  },
  { 
    id: 3, 
    name: '各行业公司数量分布', 
    type: 'pie',
    dataSource: '上市公司财务数据',
    createdAt: '2023-10-12 14:23:11', 
    createdBy: '王五' 
  }
];

const DataVisualizationPage: React.FC = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [selectedDataSource, setSelectedDataSource] = useState<number | null>(null);
  const [chartFields, setChartFields] = useState({
    xAxis: '',
    yAxis: '',
    groupBy: ''
  });
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [savedCharts, setSavedCharts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [saveChartModalVisible, setSaveChartModalVisible] = useState(false);
  const [chartForm] = Form.useForm();
  
  // 获取数据源列表
  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        // 实际项目中应该从API获取数据
        // const response = await get('/api/data/sources');
        // if (response.status === 'success') {
        //   setDataSources(response.data);
        // }
        
        // 模拟数据加载
        setTimeout(() => {
          setDataSources(mockDataSources);
        }, 500);
      } catch (error) {
        console.error('获取数据源列表失败:', error);
        message.error('获取数据源列表失败');
      }
    };
    
    fetchDataSources();
  }, []);
  
  // 获取已保存的可视化图表
  useEffect(() => {
    if (activeTab === '2') {
      const fetchSavedCharts = async () => {
        try {
          setLoadingCharts(true);
          // 实际项目中应该从API获取数据
          // const response = await get('/api/visualization/charts');
          // if (response.status === 'success') {
          //   setSavedCharts(response.data);
          // }
          
          // 模拟数据加载
          setTimeout(() => {
            setSavedCharts(mockSavedCharts);
            setLoadingCharts(false);
          }, 700);
        } catch (error) {
          console.error('获取已保存图表失败:', error);
          message.error('获取已保存图表失败');
          setLoadingCharts(false);
        }
      };
      
      fetchSavedCharts();
    }
  }, [activeTab]);
  
  // 根据选择的数据源生成图表
  const generateChart = () => {
    if (!selectedDataSource || !chartFields.xAxis || !chartFields.yAxis) {
      message.warning('请选择数据源和必要的字段后再生成图表');
      return;
    }
    
    setLoadingData(true);
    
    // 实际项目中应该从API获取数据
    // const response = await post('/api/visualization/generate', {
    //   dataSourceId: selectedDataSource,
    //   chartType: selectedChartType,
    //   xAxis: chartFields.xAxis,
    //   yAxis: chartFields.yAxis,
    //   groupBy: chartFields.groupBy
    // });
    
    // 模拟数据生成
    setTimeout(() => {
      // 模拟图表数据
      let mockData;
      
      if (selectedChartType === 'bar') {
        mockData = {
          labels: ['北京', '上海', '广州', '深圳', '杭州', '成都'],
          datasets: [
            {
              label: 'GDP (亿元)',
              data: [35300, 38700, 25000, 27800, 15300, 17200]
            }
          ]
        };
      } else if (selectedChartType === 'line') {
        mockData = {
          labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
          datasets: [
            {
              label: '全球平均气温 (°C)',
              data: [14.8, 14.9, 15.1, 15.2, 15.3, 15.5, 15.7]
            }
          ]
        };
      } else if (selectedChartType === 'pie') {
        mockData = {
          labels: ['科技', '金融', '医疗', '消费', '能源', '其他'],
          datasets: [
            {
              data: [35, 25, 15, 10, 10, 5]
            }
          ]
        };
      } else if (selectedChartType === 'scatter') {
        mockData = {
          datasets: [
            {
              label: 'GDP vs 人口',
              data: [
                { x: 2100, y: 35300 },
                { x: 2400, y: 38700 },
                { x: 1500, y: 25000 },
                { x: 1700, y: 27800 },
                { x: 1100, y: 15300 },
                { x: 1800, y: 17200 }
              ]
            }
          ]
        };
      } else if (selectedChartType === 'area') {
        mockData = {
          labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
          datasets: [
            {
              label: '碳排放量 (百万吨)',
              data: [9800, 10200, 10500, 9700, 10100, 10300, 10400]
            }
          ]
        };
      }
      
      setChartData(mockData);
      setLoadingData(false);
    }, 1000);
  };
  
  // 保存图表
  const saveChart = async () => {
    try {
      const values = await chartForm.validateFields();
      
      // 实际项目中应该调用API保存图表
      // const response = await post('/api/visualization/save', {
      //   name: values.name,
      //   description: values.description,
      //   dataSourceId: selectedDataSource,
      //   chartType: selectedChartType,
      //   config: {
      //     xAxis: chartFields.xAxis,
      //     yAxis: chartFields.yAxis,
      //     groupBy: chartFields.groupBy
      //   }
      // });
      
      // 模拟保存成功
      message.success('图表保存成功');
      setSaveChartModalVisible(false);
      
      // 添加到已保存图表列表
      const newChart = {
        id: Math.max(...savedCharts.map(c => c.id)) + 1,
        name: values.name,
        type: selectedChartType,
        dataSource: dataSources.find(ds => ds.id === selectedDataSource)?.name,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        createdBy: user?.username || 'unknown'
      };
      
      setSavedCharts([newChart, ...savedCharts]);
      
      // 切换到我的图表标签页
      setActiveTab('2');
    } catch (error) {
      console.error('保存图表失败:', error);
      message.error('保存图表失败');
    }
  };
  
  // 处理删除图表
  const handleDeleteChart = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个图表吗？删除后无法恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 实际项目中应该调用API删除图表
          // await delete(`/api/visualization/charts/${id}`);
          
          // 模拟删除成功
          message.success('图表已删除');
          setSavedCharts(savedCharts.filter(chart => chart.id !== id));
        } catch (error) {
          console.error('删除图表失败:', error);
          message.error('删除图表失败');
        }
      }
    });
  };
  
  // 渲染图表类型选择器
  const renderChartTypeSelector = () => {
    return (
      <Radio.Group
        value={selectedChartType}
        onChange={e => setSelectedChartType(e.target.value)}
        buttonStyle="solid"
      >
        <Tooltip title="柱状图">
          <Radio.Button value="bar"><BarChartOutlined /> 柱状图</Radio.Button>
        </Tooltip>
        <Tooltip title="折线图">
          <Radio.Button value="line"><LineChartOutlined /> 折线图</Radio.Button>
        </Tooltip>
        <Tooltip title="饼图">
          <Radio.Button value="pie"><PieChartOutlined /> 饼图</Radio.Button>
        </Tooltip>
        <Tooltip title="散点图">
          <Radio.Button value="scatter"><DotChartOutlined /> 散点图</Radio.Button>
        </Tooltip>
        <Tooltip title="面积图">
          <Radio.Button value="area"><AreaChartOutlined /> 面积图</Radio.Button>
        </Tooltip>
      </Radio.Group>
    );
  };
  
  // 渲染图表配置表单
  const renderChartConfigForm = () => {
    // 获取当前数据源的字段列表（实际项目中应该根据数据源动态获取）
    const dataFields = ['城市名称', '省份', '年份', 'GDP(亿元)', '人口(万人)', '面积(平方公里)'];
    
    return (
      <Form layout="vertical">
        <Form.Item label="X轴字段" required>
          <Select
            placeholder="请选择X轴字段"
            value={chartFields.xAxis || undefined}
            onChange={value => setChartFields({ ...chartFields, xAxis: value })}
          >
            {dataFields.map(field => (
              <Option key={field} value={field}>{field}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item label="Y轴字段" required>
          <Select
            placeholder="请选择Y轴字段"
            value={chartFields.yAxis || undefined}
            onChange={value => setChartFields({ ...chartFields, yAxis: value })}
          >
            {dataFields.map(field => (
              <Option key={field} value={field}>{field}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item 
          label={
            <span>
              分组字段 
              <Tooltip title="用于多系列数据的分组">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          }
        >
          <Select
            placeholder="请选择分组字段（可选）"
            value={chartFields.groupBy || undefined}
            onChange={value => setChartFields({ ...chartFields, groupBy: value })}
            allowClear
          >
            {dataFields.map(field => (
              <Option key={field} value={field}>{field}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" onClick={generateChart}>生成图表</Button>
        </Form.Item>
      </Form>
    );
  };
  
  // 渲染图表预览区域
  const renderChartPreview = () => {
    if (loadingData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="正在生成图表..." />
        </div>
      );
    }
    
    if (!chartData) {
      return (
        <Empty 
          description="请配置图表参数并点击生成图表" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      );
    }
    
    // 实际项目中应根据选择的图表类型和数据渲染相应的图表组件
    // 这里简化处理，只显示模拟的图表数据
    return (
      <div>
        <Card title="图表预览" extra={
          <Space>
            <Button 
              icon={<SaveOutlined />} 
              onClick={() => setSaveChartModalVisible(true)}
            >
              保存图表
            </Button>
            <Button icon={<ExportOutlined />}>导出</Button>
          </Space>
        }>
          <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              {selectedChartType === 'bar' && <BarChartOutlined style={{ fontSize: 100 }} />}
              {selectedChartType === 'line' && <LineChartOutlined style={{ fontSize: 100 }} />}
              {selectedChartType === 'pie' && <PieChartOutlined style={{ fontSize: 100 }} />}
              {selectedChartType === 'scatter' && <DotChartOutlined style={{ fontSize: 100 }} />}
              {selectedChartType === 'area' && <AreaChartOutlined style={{ fontSize: 100 }} />}
              <div>
                <Title level={4}>图表已生成</Title>
                <Paragraph>
                  （注：在实际项目中，这里将显示真实的{
                    selectedChartType === 'bar' ? '柱状图' : 
                    selectedChartType === 'line' ? '折线图' : 
                    selectedChartType === 'pie' ? '饼图' : 
                    selectedChartType === 'scatter' ? '散点图' : '面积图'
                  }）
                </Paragraph>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };
  
  // 渲染已保存的图表列表
  const renderSavedCharts = () => {
    if (loadingCharts) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载图表中..." />
        </div>
      );
    }
    
    if (savedCharts.length === 0) {
      return (
        <Empty description="您还没有保存任何图表" />
      );
    }
    
    return (
      <Row gutter={[16, 16]}>
        {savedCharts.map(chart => (
          <Col key={chart.id} xs={24} sm={12} md={8} lg={8} xl={6}>
            <Card
              hoverable
              cover={
                <div style={{ height: 160, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
                  {chart.type === 'bar' && <BarChartOutlined style={{ fontSize: 60 }} />}
                  {chart.type === 'line' && <LineChartOutlined style={{ fontSize: 60 }} />}
                  {chart.type === 'pie' && <PieChartOutlined style={{ fontSize: 60 }} />}
                  {chart.type === 'scatter' && <DotChartOutlined style={{ fontSize: 60 }} />}
                  {chart.type === 'area' && <AreaChartOutlined style={{ fontSize: 60 }} />}
                </div>
              }
              actions={[
                <Tooltip title="查看"><Button type="text" icon={<EyeOutlined />} /></Tooltip>,
                <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} /></Tooltip>,
                <Tooltip title="删除"><Button type="text" icon={<DeleteOutlined />} onClick={() => handleDeleteChart(chart.id)} /></Tooltip>
              ]}
            >
              <Card.Meta
                title={chart.name}
                description={
                  <Space direction="vertical" size={0}>
                    <span>数据源: {chart.dataSource}</span>
                    <span>创建时间: {chart.createdAt}</span>
                    <span>创建人: {chart.createdBy}</span>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };
  
  return (
    <div className="data-visualization-page">
      <Title level={2}>数据可视化</Title>
      <Paragraph>
        通过直观的图表展示数据，帮助您更好地理解和分析数据。
      </Paragraph>
      
      <Divider />
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="创建图表" key="1">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="选择图表类型">
                {renderChartTypeSelector()}
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card title="配置图表">
                <Form.Item label="选择数据源" required>
                  <Select
                    placeholder="请选择数据源"
                    value={selectedDataSource || undefined}
                    onChange={value => setSelectedDataSource(value)}
                  >
                    {dataSources.map(source => (
                      <Option key={source.id} value={source.id}>{source.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                
                {selectedDataSource && renderChartConfigForm()}
              </Card>
            </Col>
            
            <Col xs={24} md={16}>
              {renderChartPreview()}
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="我的图表" key="2">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card style={{ marginBottom: 16 }}>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setActiveTab('1')}
                  >
                    创建新图表
                  </Button>
                  <Button icon={<SettingOutlined />}>批量管理</Button>
                </Space>
              </Card>
            </Col>
            
            <Col span={24}>
              {renderSavedCharts()}
            </Col>
          </Row>
        </TabPane>
      </Tabs>
      
      {/* 保存图表模态框 */}
      <Modal
        title="保存图表"
        open={saveChartModalVisible}
        onOk={saveChart}
        onCancel={() => setSaveChartModalVisible(false)}
      >
        <Form form={chartForm} layout="vertical">
          <Form.Item
            name="name"
            label="图表名称"
            rules={[{ required: true, message: '请输入图表名称' }]}
          >
            <Input placeholder="请输入图表名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="图表描述"
          >
            <Input.TextArea rows={4} placeholder="请输入图表描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataVisualizationPage; 